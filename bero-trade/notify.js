// Vérifie les dix marchés et envoie chaque nouveau signal sur ntfy.
// Lancé toutes les 4 heures par GitHub Actions, juste après la clôture des bougies de 4 heures.
const fs = require("fs"), path = require("path"), vm = require("vm");
const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const src = html.slice(html.indexOf("/* ===== MOTEUR"), html.indexOf("/* ===== FIN DU MOTEUR"));
const sb = {}; vm.runInNewContext(src + "\nthis.Engine = Engine;", sb);
const Engine = sb.Engine;
const TOPIC = process.env.NTFY_TOPIC;
const MARKETS = [
  ["EURUSD", "EUR/USD", "fx", 0.0001, 5, 0.00012], ["GBPUSD", "GBP/USD", "fx", 0.0001, 5, 0.00015],
  ["AUDUSD", "AUD/USD", "fx", 0.0001, 5, 0.00018], ["USDCAD", "USD/CAD", "fx", 0.0001, 5, 0.00018],
  ["USDCHF", "USD/CHF", "fx", 0.0001, 5, 0.00018], ["EURGBP", "EUR/GBP", "fx", 0.0001, 5, 0.00018],
  ["PAXGUSD", "XAU/USD", "gold", null, 2, 0.00015], ["XBTUSD", "BTC/USD", "crypto", null, 0, 0.0004],
  ["ETHUSD", "ETH/USD", "crypto", null, 2, 0.0004], ["SOLUSD", "SOL/USD", "crypto", null, 2, 0.0005]
].map(([id, sym, cls, pip, dp, cost]) => ({ id, sym, cls, pip, dp, cost }));
const fmt = (v, dp) => v.toFixed(dp).replace(".", ",");
const dist = (m, d) => m.pip ? Math.round(d / m.pip) + " pips" : fmt(d, m.dp) + " $";

async function ohlc(pair) {
  for (let i = 1; ; i++) {
    try {
      const j = await (await fetch(`https://api.kraken.com/0/public/OHLC?pair=${pair}&interval=240`)).json();
      if (j.error && j.error.length) throw new Error(j.error.join(", "));
      const key = Object.keys(j.result).find(k => k !== "last");
      return j.result[key].map(x => ({ t: +x[0], o: +x[1], h: +x[2], l: +x[3], c: +x[4] })).sort((a, b) => a.t - b.t);
    } catch (e) { if (i >= 3) throw e; await new Promise(r => setTimeout(r, 2000 * i)); }
  }
}

(async () => {
  if (!TOPIC) throw new Error("NTFY_TOPIC manquant");
  const now = Date.now() / 1000, found = [];
  for (const m of MARKETS) {
    try {
      const r = Engine.evaluate(m, await ohlc(m.id), now);
      console.log(m.sym, r.state, r.why || "");
      if (r.state === "signal" && r.plan.age === 0) found.push([m, r]);
    } catch (e) { console.log(m.sym, "erreur", e.message); }
  }
  for (const [m, r] of found) {
    const p = r.plan, until = new Date(p.until * 1000).toLocaleString("fr-FR", { timeZone: "Africa/Porto-Novo", weekday: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
    const body = `Entrée ${fmt(p.entry, m.dp)}\nSL ${fmt(p.sl, m.dp)} (${dist(m, p.dist)})\nTP ${fmt(p.tp, m.dp)} (${dist(m, Math.abs(p.tp - p.entry))})\nFermer au plus tard ${until}\nForce : ${r.score} condition(s) sur 3`;
    const res = await fetch(`https://ntfy.sh/${TOPIC}`, { method: "POST", body, headers: {
      Title: `Bero-Trade : ${p.dir < 0 ? "vendre" : "acheter"} ${m.sym}`, Tags: p.dir < 0 ? "chart_with_downwards_trend" : "chart_with_upwards_trend",
      Click: "https://berodak.github.io/bero-trade/", Priority: r.score >= 2 ? "high" : "default" } });
    console.log("notification", m.sym, res.status);
  }
  console.log(found.length ? `${found.length} signal(aux) envoyé(s)` : "aucun nouveau signal");
})().catch(e => { console.error(e); process.exit(1); });

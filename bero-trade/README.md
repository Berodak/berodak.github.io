# Bero-Trade

Application personnelle de signaux de trading. Elle s'ouvre dans le navigateur, sur téléphone ou sur ordinateur, sans compte ni clé.

## Ce qu'elle affiche

- le marché à trader parmi dix : EUR/USD, GBP/USD, AUD/USD, USD/CAD, USD/CHF, EUR/GBP, or, Bitcoin, Ethereum, Solana ;
- le sens : acheter ou vendre ;
- l'entrée, le stop (SL) et l'objectif (TP), avec les écarts en pips ou en dollars ;
- la durée maximale du trade ;
- le bilan des mêmes règles rejouées sur les dernières semaines.

Quand aucun marché ne remplit les règles, elle l'écrit et donne l'heure du prochain point.

## Les règles

1. Bougies de 4 heures, lues sur l'API publique de Kraken (marché réel).
2. Tendance nette : le prix et ses moyennes (20, 50 et 200 bougies) vont dans le même sens.
3. Entrée après un repli vers la moyenne, ou sur cassure du plus haut ou du plus bas des 4 derniers jours.
4. Stop derrière le dernier creux ou sommet, entre 1 et 2,5 fois l'amplitude moyenne. Objectif à 1,5 fois le stop.
5. Sortie au bout de 2 jours si rien n'est touché.
6. Pas de signal si le marché bouge deux fois plus que d'habitude. Pas d'entrée sur les devises et l'or du vendredi 12 h UTC au dimanche 22 h UTC.

## Limites

- Ces règles n'ont pas montré d'avantage net sur l'historique testé : leur résultat est proche de zéro. L'application l'affiche elle-même à chaque lecture.
- Le prix de l'or est lu sur le jeton PAXG, proche de l'or au comptant sans être identique.
- USD/JPY n'est pas proposé : trop peu d'échanges sur la source de prix.
- Les prix de votre plateforme peuvent différer un peu : gardez les mêmes écarts.

Bero-Trade ne prédit pas l'avenir et ne garantit aucun gain. Commencez en compte démo.

## Installer sur le téléphone

Ouvrez l'adresse dans le navigateur, puis choisissez « Ajouter à l'écran d'accueil ».

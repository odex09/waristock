# WariStock

Application de gestion de stock construite avec React, Vite et Supabase.

## Démarrer

1. Installer les dépendances avec `npm install`.
2. Renseigner `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans un fichier `.env`.
3. Lancer `npm run dev` ou créer une version de production avec `npm run build`.

## Utilisation hors ligne

Après un premier chargement connecté, l’application peut afficher les produits,
fournisseurs et mouvements précédemment chargés, même sans réseau. Les
mouvements de stock (y compris les crédits clients) sont conservés sur
l’appareil et synchronisés à la reconnexion. La bannière en haut indique l’état
du réseau et les mouvements en attente ; une synchronisation peut aussi être
demandée manuellement.

La session doit déjà être ouverte sur cet appareil pour accéder aux données
hors ligne. La création de produits et de fournisseurs, les téléversements de
photos et les modifications du profil nécessitent encore une connexion.
L’application utilise le stockage local du navigateur (IndexedDB) pour son
cache et sa file de synchronisation.
La session Supabase est conservée sur l’appareil : une réouverture de la PWA
ne demande pas une nouvelle connexion tant que la session reste valide. Si la
session expire hors ligne, l’accès hors ligne peut être restauré uniquement
pour un compte déjà connecté sur cet appareil et disposant d’un profil en cache.
À la reconnexion, la session est vérifiée à nouveau auprès de Supabase.
Le service worker hors ligne est activé en production, pas avec `npm run dev`.
Pour le tester localement, lancez `npm run build`, puis `npm run preview`,
ouvrez la PWA en ligne une première fois et attendez son chargement complet
avant de couper le réseau.

## URLs

Les pages utilisent des chemins directs, par exemple `/login`, `/home`,
`/products`, `/products/new` et `/reports`. La configuration Vercel dans
`vercel.json` renvoie les chemins de navigation vers l’application afin que
l’ouverture ou l’actualisation d’un lien profond fonctionne. Sur un autre
hébergeur, configurez le même fallback vers `index.html`.

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

## URLs

Les pages utilisent des chemins directs, par exemple `/login`, `/home`,
`/products`, `/products/new` et `/reports`. En production, configurez
l’hébergement pour renvoyer les chemins inconnus vers `index.html` afin que
l’ouverture ou l’actualisation d’un lien profond charge l’application.

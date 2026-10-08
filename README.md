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

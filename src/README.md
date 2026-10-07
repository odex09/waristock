# WariStock - Configuration Supabase

## Structure du projet

```
src/
├── lib/
│   ├── supabaseClient.js      # Client Supabase configuré
│   ├── constants.js            # Constantes de l'application
│   └── utils.js                # Fonctions utilitaires
├── hooks/
│   └── useAuth.js              # Hook d'authentification
├── services/
│   ├── auth.js                 # Service d'authentification
│   ├── products.js             # Service produits
│   ├── suppliers.js            # Service fournisseurs
│   ├── movements.js            # Service mouvements de stock
│   ├── inventory.js            # Service inventaires
│   └── upload.js               # Service upload d'images
├── context/
│   ├── AppContext.jsx           # Contexte principal de l'app
│   └── AuthContext.jsx          # Contexte d'authentification
└── ...
```

## Configuration

1. Copie `.env.example` vers `.env`
2. Renseigne tes variables Supabase
3. Applique le schéma SQL depuis `supabase/waristockdb.sql`
4. Installe les dépendances : `npm install`
5. Lance le projet : `npm run dev`

## Services disponibles

- `auth.js` : inscription, connexion, déconnexion, profil
- `products.js` : CRUD produits
- `suppliers.js` : CRUD fournisseurs
- `movements.js` : mouvements de stock, crédits clients
- `inventory.js` : inventaires

## Hooks disponibles

- `useAuth()` : état d'authentification + méthodes login/register/logout

## Contexte

- `useApp()` : état global (produits, fournisseurs, mouvements, navigation, thème, toast)

# WariStock - Intégration Supabase

## Configuration rapide

### 1. Variables d'environnement
Crée un fichier `.env` à la racine du projet :
```env
VITE_SUPABASE_URL=https://ton-projet.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxx
```

### 2. Schéma SQL
Applique le contenu de `supabase/waristockdb.sql` dans l'éditeur SQL de Supabase.

### 3. Installation
```bash
npm install
```

### 4. Lancement
```bash
npm run dev
```

## Architecture

```
src/
├── lib/
│   ├── supabaseClient.js   # Client Supabase
│   ├── constants.js         # Constantes
│   └── utils.js            # Utilitaires
├── hooks/
│   └── useAuth.js          # Hook d'authentification
├── services/
│   ├── auth.js             # Authentification
│   ├── products.js         # Produits
│   ├── suppliers.js        # Fournisseurs
│   ├── movements.js        # Mouvements
│   ├── inventory.js        # Inventaires
│   └── upload.js           # Upload
├── context/
│   ├── AppContext.jsx       # Contexte principal
│   └── AuthContext.jsx      # Contexte auth
└── pages/                  # Pages existantes
```

## Utilisation

### Authentification
```jsx
import { useAuthContext } from '../context/AuthContext'

const { user, profile, login, register, logout, loading } = useAuthContext()
```

### Données (exemple produits)
```jsx
import { getProducts, createProduct } from '../services/products'

const { data, error } = await getProducts(shopId)
const { data, error } = await createProduct(shopId, { name: 'Riz', ... })
```

### Contexte global
```jsx
import { useApp } from '../context/AppContext'

const { products, setProducts, navigate, showToast } = useApp()
```

## Sécurité
- RLS activé sur toutes les tables
- Isolation par `shop_id` (profil utilisateur)
- UUID comme clés primaires
- Validation des données (prix >= 0, stock >= 0)

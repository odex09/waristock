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
Pour une base déjà installée, applique également les migrations présentes dans
`supabase/migrations/` dans l'ordre chronologique.

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

## Taille de la base et des images

Les photos de produits sont envoyées dans Supabase Storage, pas dans les lignes
PostgreSQL. Elles sont converties en WebP, redimensionnées à 1280 px maximum et
compressées à 300 Ko maximum avant l’envoi. L’espace Storage utilisé est un
quota séparé de la taille de la base de données.
Applique dans Supabase les migrations
`supabase/migrations/20261009090000_limit_product_image_uploads.sql` et
`supabase/migrations/20261009093000_limit_text_payloads.sql` : elles imposent
les limites aussi côté serveur, y compris aux requêtes directes vers l’API.

La compression des champs texte côté navigateur n’est pas recommandée : les
valeurs doivent rester directement consultables et filtrables, et PostgreSQL
compresse déjà automatiquement les longues valeurs. Les formulaires limitent aussi la longueur des noms, catégories, unités et noms
de clients afin d’éviter les saisies accidentellement énormes.

Les prix, quantités et seuils sont déjà stockés en entiers, et les petites
colonnes texte ne bénéficient pas d’une compression client utile. La taille
affichée pour la base inclut aussi les index et les objets internes de Supabase.
Pour voir les plus grandes tables du projet, exécute cette requête dans
l’éditeur SQL Supabase :

```sql
select
  schemaname,
  relname as table_name,
  pg_size_pretty(pg_total_relation_size(relid)) as total_size,
  n_live_tup as estimated_rows
from pg_stat_user_tables
order by pg_total_relation_size(relid) desc
limit 20;
```

Pour connaître l’espace exact occupé par les objets de Storage (et éviter
l’arrondi en Go du tableau de bord), exécute aussi :

```sql
select
  count(*) as file_count,
  coalesce(sum((metadata->>'size')::bigint), 0) as total_bytes,
  pg_size_pretty(coalesce(sum((metadata->>'size')::bigint), 0)::bigint) as total_size
from storage.objects
where bucket_id = 'product-images';
```

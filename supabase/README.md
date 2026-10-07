# Supabase - Configuration requise

## 1. Créer un projet Supabase
- Va sur https://supabase.com
- Crée un nouveau projet (plan gratuit)
- Récupère l'URL du projet et la clé anonyme (anon key)

## 2. Configurer les variables d'environnement
- Copie `.env.example` vers `.env`
- Remplace les valeurs par celles de ton projet Supabase

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxx
```

## 3. Appliquer le schéma SQL
- Va dans l'éditeur SQL de Supabase (Table Editor → SQL Editor)
- Colle le contenu de `supabase/waristockdb.sql`
- Exécute le script

## 4. Installer les dépendances
```bash
npm install
```

## 5. Lancer le projet
```bash
npm run dev
```

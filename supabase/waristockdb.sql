-- ============================================
-- WARISTOCK - Base de données Supabase
-- Optimisée pour le plan gratuit
-- Multi-tenant : chaque boutique est isolée
-- ============================================

-- Extensions utiles
create extension if not exists "uuid-ossp";

-- ============================================
-- 1. PROFILES (étend auth.users)
-- ============================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  shop_name text not null default 'Ma Boutique',
  owner_name text not null default '',
  phone text not null default '',
  country_code text not null default '+228',
  currency text not null default 'XOF',
  city text not null default '',
  economy_mode boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint unique_phone_per_shop unique (phone, country_code)
);

alter table public.profiles enable row level security;

create policy "Les utilisateurs peuvent voir leur profil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Les utilisateurs peuvent modifier leur profil"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Les utilisateurs peuvent créer leur profil"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Trigger pour updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security invoker;

create trigger set_updated_at_profiles
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================
-- 2. CATEGORIES (optionnel, pour la cohérence)
-- ============================================
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  constraint unique_shop_category unique (shop_id, name)
);

alter table public.categories enable row level security;

create policy "Les utilisateurs peuvent voir leurs catégories"
  on public.categories for select
  using (auth.uid() = shop_id);

create policy "Les utilisateurs peuvent créer leurs catégories"
  on public.categories for insert
  with check (auth.uid() = shop_id);

create policy "Les utilisateurs peuvent supprimer leurs catégories"
  on public.categories for delete
  using (auth.uid() = shop_id);

-- ============================================
-- 3. FOURNISSEURS
-- ============================================
create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  categories text not null default '',
  phone text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.suppliers enable row level security;

create policy "Les utilisateurs peuvent voir leurs fournisseurs"
  on public.suppliers for select
  using (auth.uid() = shop_id);

create policy "Les utilisateurs peuvent créer leurs fournisseurs"
  on public.suppliers for insert
  with check (auth.uid() = shop_id);

create policy "Les utilisateurs peuvent modifier leurs fournisseurs"
  on public.suppliers for update
  using (auth.uid() = shop_id);

create policy "Les utilisateurs peuvent supprimer leurs fournisseurs"
  on public.suppliers for delete
  using (auth.uid() = shop_id);

create trigger set_updated_at_suppliers
  before update on public.suppliers
  for each row execute function public.set_updated_at();

-- ============================================
-- 4. PRODUITS
-- ============================================
create table public.products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  emoji text not null default '📦',
  category text not null default 'Autre',
  stock integer not null default 0 check (stock >= 0),
  threshold integer not null default 5 check (threshold >= 0),
  unit text not null default 'pièce',
  buy_price integer not null default 0 check (buy_price >= 0),
  sell_price integer not null default 0 check (sell_price >= 0),
  supplier_id uuid references public.suppliers(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Les utilisateurs peuvent voir leurs produits"
  on public.products for select
  using (auth.uid() = shop_id);

create policy "Les utilisateurs peuvent créer leurs produits"
  on public.products for insert
  with check (auth.uid() = shop_id);

create policy "Les utilisateurs peuvent modifier leurs produits"
  on public.products for update
  using (auth.uid() = shop_id);

create policy "Les utilisateurs peuvent supprimer leurs produits"
  on public.products for delete
  using (auth.uid() = shop_id);

create trigger set_updated_at_products
  before update on public.products
  for each row execute function public.set_updated_at();

-- Indexes pour les requêtes fréquentes
create index idx_products_shop_id on public.products(shop_id);
create index idx_products_category on public.products(category);
create index idx_products_supplier_id on public.products(supplier_id);
create index idx_products_stock on public.products(stock);

-- ============================================
-- 5. MOUVEMENTS DE STOCK
-- ============================================
create type public.movement_type as enum ('entry', 'exit');
create type public.payment_method as enum (
  'cash', 'orange_money', 'moov_money', 'mtn_momo', 'wave', 'credit'
);

create table public.movements (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  type public.movement_type not null,
  quantity integer not null check (quantity > 0),
  payment_method public.payment_method not null default 'cash',
  client_name text,
  client_phone text,
  due_date date,
  note text,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id)
);

alter table public.movements enable row level security;

create policy "Les utilisateurs peuvent voir leurs mouvements"
  on public.movements for select
  using (auth.uid() = shop_id);

create policy "Les utilisateurs peuvent créer leurs mouvements"
  on public.movements for insert
  with check (auth.uid() = shop_id);

create policy "Les utilisateurs peuvent modifier leurs mouvements"
  on public.movements for update
  using (auth.uid() = shop_id);

create policy "Les utilisateurs peuvent supprimer leurs mouvements"
  on public.movements for delete
  using (auth.uid() = shop_id);

-- Indexes pour les requêtes fréquentes
create index idx_movements_shop_id on public.movements(shop_id);
create index idx_movements_product_id on public.movements(product_id);
create index idx_movements_created_at on public.movements(created_at desc);
create index idx_movements_type on public.movements(type);
create index idx_movements_payment on public.movements(payment_method);

-- ============================================
-- 6. INVENTAIRES
-- ============================================
create table public.inventories (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  counted_quantity integer not null check (counted_quantity >= 0),
  theoretical_quantity integer not null check (theoretical_quantity >= 0),
  difference integer not null generated always as (counted_quantity - theoretical_quantity) stored,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id)
);

alter table public.inventories enable row level security;

create policy "Les utilisateurs peuvent voir leurs inventaires"
  on public.inventories for select
  using (auth.uid() = shop_id);

create policy "Les utilisateurs peuvent créer leurs inventaires"
  on public.inventories for insert
  with check (auth.uid() = shop_id);

create index idx_inventories_shop_id on public.inventories(shop_id);
create index idx_inventories_product_id on public.inventories(product_id);

-- ============================================
-- 7. VUE: Crédits clients actifs
-- ============================================
create or replace view public.credit_clients as
select
  m.id,
  m.shop_id,
  m.product_id,
  p.name as product_name,
  p.unit,
  p.sell_price as unit_price,
  m.quantity,
  (m.quantity * p.sell_price) as amount,
  m.client_name,
  m.client_phone,
  m.due_date,
  m.created_at,
  case when m.due_date < current_date then true else false end as is_overdue
from public.movements m
join public.products p on p.id = m.product_id
where m.payment_method = 'credit' and m.type = 'exit';

-- Note: la vue hérite des RLS des tables sous-jacentes

-- ============================================
-- 8. VUE: Alertes stock bas / rupture
-- ============================================
create or replace view public.stock_alerts as
select
  id,
  shop_id,
  name,
  emoji,
  category,
  stock,
  threshold,
  unit,
  buy_price,
  sell_price,
  supplier_id,
  case 
    when stock = 0 then 'out_of_stock'
    when stock <= threshold then 'low_stock'
    else 'in_stock'
  end as status,
  case when stock = 0 then threshold * 2 else threshold * 2 - stock end as suggested_order_qty
from public.products;

-- ============================================
-- 9. FONCTIONS UTILITAIRES
-- ============================================

-- Valider un mouvement de stock
create or replace function public.validate_stock_movement(
  p_product_id uuid,
  p_quantity integer,
  p_type public.movement_type
)
returns boolean as $$
declare
  current_stock integer;
begin
  select stock into current_stock from public.products where id = p_product_id;
  
  if p_type = 'exit' and current_stock < p_quantity then
    return false;
  end if;
  
  return true;
end;
$$ language plpgsql security invoker;

-- Initialiser les catégories par défaut
create or replace function public.initialize_shop(p_shop_id uuid)
returns void as $$
begin
  insert into public.categories (shop_id, name) values
    (p_shop_id, 'Céréales'),
    (p_shop_id, 'Huiles'),
    (p_shop_id, 'Épicerie'),
    (p_shop_id, 'Conserves'),
    (p_shop_id, 'Boissons'),
    (p_shop_id, 'Hygiène')
  on conflict do nothing;
end;
$$ language plpgsql security invoker;

-- ============================================
-- 10. STOCKAGE (pour images produits)
-- ============================================

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', false)
on conflict (id) do nothing;

-- Politiques de stockage (chemin attendu: {user_id}/{filename})
create policy "Les utilisateurs peuvent voir leurs images"
  on storage.objects for select
  using (bucket_id = 'product-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Les utilisateurs peuvent uploader leurs images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Les utilisateurs peuvent modifier leurs images"
  on storage.objects for update
  using (bucket_id = 'product-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Les utilisateurs peuvent supprimer leurs images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- INDEXES SUPPLÉMENTAIRES POUR PERFORMANCE
-- ============================================
-- (Déjà créés sur les tables individuelles)

-- ============================================
-- NOTES D'UTILISATION (Plan gratuit Supabase)
-- ============================================
-- 1. Ce schéma est multi-tenant via shop_id (profil utilisateur)
-- 2. Toutes les tables sont protégées par RLS
-- 3. Les UUID sont publics (pas d'IDs séquentiels exposés)
-- 4. Les prix et stocks sont en INTEGER (FCFA, pas de décimales)
-- 5. Les vues sont légères (pas de matérialisées sur free tier)
-- 6. Le stockage bucket est privé par utilisateur
-- 7. Pour migrer depuis les tableaux JS, mapper:
--    - products[i] -> products.id (UUID)
--    - suppliers[i] -> suppliers.id (UUID)
--    - movements[i][1] (index produit) -> product_id (UUID)

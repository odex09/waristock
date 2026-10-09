create or replace view public.credit_clients
with (security_invoker = true) as
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

create or replace view public.stock_alerts
with (security_invoker = true) as
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

notify pgrst, 'reload schema';

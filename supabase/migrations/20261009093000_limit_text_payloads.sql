alter table public.profiles
  add constraint profiles_shop_name_size check (octet_length(shop_name) <= 400),
  add constraint profiles_owner_name_size check (octet_length(owner_name) <= 400),
  add constraint profiles_phone_size check (octet_length(phone) <= 32),
  add constraint profiles_country_code_size check (octet_length(country_code) <= 8),
  add constraint profiles_currency_size check (octet_length(currency) <= 8),
  add constraint profiles_city_size check (octet_length(city) <= 400);

alter table public.categories
  add constraint categories_name_size check (octet_length(name) <= 512);

alter table public.suppliers
  add constraint suppliers_name_size check (octet_length(name) <= 512),
  add constraint suppliers_categories_size check (octet_length(categories) <= 1024),
  add constraint suppliers_phone_size check (octet_length(phone) <= 32);

alter table public.products
  add constraint products_name_size check (octet_length(name) <= 512),
  add constraint products_emoji_size check (octet_length(emoji) <= 512),
  add constraint products_category_size check (octet_length(category) <= 320),
  add constraint products_unit_size check (octet_length(unit) <= 128);

alter table public.movements
  add constraint movements_client_name_size
    check (client_name is null or octet_length(client_name) <= 512),
  add constraint movements_client_phone_size
    check (client_phone is null or octet_length(client_phone) <= 32),
  add constraint movements_note_size
    check (note is null or octet_length(note) <= 4096);

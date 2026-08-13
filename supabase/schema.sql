-- ============================================================================
-- LOJA DA JOANINHA — Produtos de limpeza
-- Schema completo: tabelas, segurança (RLS), storage de fotos e gatilhos.
--
-- Como usar: Supabase > SQL Editor > cole este arquivo inteiro > Run.
-- Pode rodar mais de uma vez sem quebrar nada.
--
-- IMPORTANTE: este arquivo NÃO cria nenhum produto nem categoria.
-- O banco nasce vazio de propósito — quem cadastra é a Joaninha, pelo painel.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. Tipos
-- ----------------------------------------------------------------------------
do $$ begin
  create type public.order_status as enum (
    'aguardando',     -- pedido chegou, esperando a Joaninha confirmar
    'aceito',
    'em_preparo',
    'saiu_entrega',
    'entregue',
    'recusado',
    'cancelado'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_method as enum ('dinheiro', 'pix', 'cartao');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- 2. Perfis / quem é admin
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  role       text not null default 'cliente' check (role in ('admin', 'cliente')),
  created_at timestamptz not null default now()
);

-- Dados que o cliente salva na conta dele, para o checkout vir preenchido.
-- Ficam aqui porque criar conta é OPCIONAL: quem compra como visitante nunca
-- passa por esta tabela.
alter table public.profiles
  add column if not exists full_name       text,
  add column if not exists phone           text,
  add column if not exists addr_street     text,
  add column if not exists addr_number     text,
  add column if not exists addr_complement text,
  add column if not exists addr_district   text,
  add column if not exists addr_city       text,
  add column if not exists addr_reference  text,
  add column if not exists addr_zip        text,
  add column if not exists updated_at      timestamptz not null default now();

-- SECURITY DEFINER: roda ignorando o RLS, senão a política da própria tabela
-- profiles chamaria a si mesma em loop infinito.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- O PRIMEIRO usuário criado no projeto vira admin automaticamente.
-- É assim que a conta da Joaninha nasce sem ninguém precisar rodar SQL.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  primeiro boolean;
begin
  select not exists (select 1 from public.profiles) into primeiro;
  insert into public.profiles (id, email, role)
  values (new.id, new.email, case when primeiro then 'admin' else 'cliente' end)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Rede de segurança: se a conta foi criada antes deste schema rodar,
-- use  select public.tornar_admin('email@dela.com');
create or replace function public.tornar_admin(p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  select u.id, u.email, 'admin' from auth.users u where lower(u.email) = lower(p_email)
  on conflict (id) do update set role = 'admin';
end;
$$;

-- TRAVA IMPORTANTE: o cliente pode editar o próprio perfil (nome, telefone,
-- endereço), e sem isto ele conseguiria se promover a admin sozinho — bastaria
-- mandar role='admin' no update. O gatilho simplesmente devolve o valor antigo.
-- auth.uid() nulo = chamada pelo servidor/SQL Editor, aí a troca é permitida.
create or replace function public.congela_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_congela_role on public.profiles;
create trigger profiles_congela_role
  before update on public.profiles
  for each row execute function public.congela_role();

-- ----------------------------------------------------------------------------
-- 3. Categorias (criadas pela Joaninha no painel)
-- ----------------------------------------------------------------------------
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (length(btrim(name)) between 1 and 60),
  position   integer not null default 0,
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists categories_order_idx on public.categories (position, created_at);

-- ----------------------------------------------------------------------------
-- 4. Produtos (criados pela Joaninha no painel)
-- ----------------------------------------------------------------------------
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories (id) on delete set null,
  name        text not null check (length(btrim(name)) between 1 and 120),
  description text,
  size_label  text,                      -- "1 L", "500 ml", "pacote com 4"
  price_cents integer not null check (price_cents > 0),
  image_path  text,                      -- caminho dentro do bucket "produtos"
  active      boolean not null default true,
  position    integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists products_order_idx    on public.products (position, created_at);
create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_active_idx   on public.products (active);

-- ----------------------------------------------------------------------------
-- 5. Configurações da loja (uma linha só)
-- ----------------------------------------------------------------------------
create table if not exists public.store_settings (
  id                 smallint primary key default 1 check (id = 1),
  store_name         text not null default 'Loja da Joaninha',
  whatsapp           text not null default '',
  admin_email        text not null default '',   -- para onde vai o aviso de pedido novo
  delivery_info      text not null default 'A combinar com a loja pelo WhatsApp',
  opening_hours_text text not null default 'Segunda a sábado, das 8h às 18h',
  notice             text not null default '',   -- recado no topo do site (opcional)
  updated_at         timestamptz not null default now()
);

insert into public.store_settings (id) values (1) on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- 6. Pedidos
-- ----------------------------------------------------------------------------
create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  number           bigint generated always as identity,   -- número curto: #1, #2...
  code             text not null unique,                  -- código público: JN-7K3QD9
  status           public.order_status not null default 'aguardando',

  customer_name    text not null,
  customer_phone   text not null,
  customer_email   text,

  addr_street      text not null,
  addr_number      text not null,
  addr_complement  text,
  addr_district    text not null,
  addr_city        text not null,
  addr_reference   text,
  addr_zip         text,

  payment_method   public.payment_method not null,
  change_for_cents integer check (change_for_cents is null or change_for_cents >= 0),
  notes            text,

  total_cents      integer not null check (total_cents >= 0),

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Dono do pedido. NULO quando a compra foi feita sem conta (visitante) —
-- criar conta é opcional, então este campo nunca pode ser obrigatório.
alter table public.orders
  add column if not exists user_id uuid references auth.users (id) on delete set null;

create index if not exists orders_created_idx on public.orders (created_at desc);
create index if not exists orders_status_idx  on public.orders (status);
create index if not exists orders_user_idx    on public.orders (user_id, created_at desc);

create table if not exists public.order_items (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null references public.orders (id) on delete cascade,
  product_id       uuid references public.products (id) on delete set null,
  -- nome e preço ficam CONGELADOS aqui: se a Joaninha mudar o preço amanhã,
  -- o pedido de hoje continua mostrando o valor que o cliente pagou.
  product_name     text not null,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  quantity         integer not null check (quantity > 0 and quantity <= 99),
  line_total_cents integer not null check (line_total_cents >= 0)
);

create index if not exists order_items_order_idx on public.order_items (order_id);

create table if not exists public.order_status_history (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders (id) on delete cascade,
  from_status public.order_status,
  to_status   public.order_status not null,
  note        text,
  changed_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists order_status_history_order_idx
  on public.order_status_history (order_id, created_at);

-- ----------------------------------------------------------------------------
-- 7. Gatilhos: updated_at, código do pedido, histórico de status
-- ----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['categories', 'products', 'store_settings', 'orders'] loop
    execute format('drop trigger if exists touch_%1$s on public.%1$I', t);
    execute format(
      'create trigger touch_%1$s before update on public.%1$I
       for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- Código público do pedido. Alfabeto sem 0/O/1/I para ninguém errar ao ditar.
create or replace function public.generate_order_code()
returns text language plpgsql as $$
declare
  alfabeto constant text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  tentativa text;
  i integer;
begin
  loop
    tentativa := 'JN-';
    for i in 1..6 loop
      tentativa := tentativa || substr(alfabeto, 1 + floor(random() * length(alfabeto))::int, 1);
    end loop;
    exit when not exists (select 1 from public.orders where code = tentativa);
  end loop;
  return tentativa;
end;
$$;

create or replace function public.set_order_code()
returns trigger language plpgsql as $$
begin
  if new.code is null or btrim(new.code) = '' then
    new.code := public.generate_order_code();
  end if;
  return new;
end;
$$;

drop trigger if exists orders_set_code on public.orders;
create trigger orders_set_code before insert on public.orders
  for each row execute function public.set_order_code();

-- O histórico se preenche sozinho: ninguém precisa lembrar de gravar.
create or replace function public.log_order_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into public.order_status_history (order_id, from_status, to_status, changed_by)
    values (new.id, null, new.status, auth.uid());
  elsif new.status is distinct from old.status then
    insert into public.order_status_history (order_id, from_status, to_status, changed_by)
    values (new.id, old.status, new.status, auth.uid());
  end if;
  return new;
end;
$$;

drop trigger if exists orders_log_status_insert on public.orders;
create trigger orders_log_status_insert after insert on public.orders
  for each row execute function public.log_order_status();

drop trigger if exists orders_log_status_update on public.orders;
create trigger orders_log_status_update after update of status on public.orders
  for each row execute function public.log_order_status();

-- ----------------------------------------------------------------------------
-- 8. Segurança (RLS)
--
-- Regra geral:
--   • catálogo (produtos/categorias/config) → leitura pública, escrita só admin
--   • pedidos → NINGUÉM lê pelo navegador. Cliente vê o pedido dele apenas
--     através do servidor do site, informando o código. Isso impede que alguém
--     liste os endereços e telefones de todos os clientes.
-- ----------------------------------------------------------------------------
alter table public.profiles             enable row level security;
alter table public.categories           enable row level security;
alter table public.products             enable row level security;
alter table public.store_settings       enable row level security;
alter table public.orders               enable row level security;
alter table public.order_items          enable row level security;
alter table public.order_status_history enable row level security;

drop policy if exists "perfil proprio"          on public.profiles;
drop policy if exists "admin ve perfis"         on public.profiles;
drop policy if exists "edita proprio perfil"    on public.profiles;
create policy "perfil proprio"  on public.profiles for select using (id = auth.uid());
create policy "admin ve perfis" on public.profiles for select using (public.is_admin());
-- Editar só a própria linha. A troca de "role" continua barrada pelo gatilho
-- congela_role(), então isto não vira porta de entrada para virar admin.
create policy "edita proprio perfil" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "categorias visiveis"  on public.categories;
drop policy if exists "admin gerencia categorias" on public.categories;
create policy "categorias visiveis" on public.categories
  for select using (active or public.is_admin());
create policy "admin gerencia categorias" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "produtos visiveis" on public.products;
drop policy if exists "admin gerencia produtos" on public.products;
create policy "produtos visiveis" on public.products
  for select using (active or public.is_admin());
create policy "admin gerencia produtos" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- A tabela guarda o e-mail da dona, então ela NÃO é pública. O site lê essas
-- configurações pelo servidor (lib/data.ts) e mostra ao cliente só o que é
-- público: nome da loja, WhatsApp, horário, recado e info de entrega.
drop policy if exists "config visivel" on public.store_settings;
drop policy if exists "admin gerencia config" on public.store_settings;
create policy "admin gerencia config" on public.store_settings
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin le pedidos"       on public.orders;
drop policy if exists "admin atualiza pedidos" on public.orders;
drop policy if exists "cliente le proprios pedidos" on public.orders;
create policy "admin le pedidos"       on public.orders for select using (public.is_admin());
create policy "admin atualiza pedidos" on public.orders for update
  using (public.is_admin()) with check (public.is_admin());
-- Cliente logado vê os pedidos que ele mesmo fez. Pedido de visitante tem
-- user_id nulo e por isso não pertence a ninguém — só o servidor o alcança,
-- pelo código do pedido.
create policy "cliente le proprios pedidos" on public.orders
  for select using (user_id is not null and user_id = auth.uid());

drop policy if exists "admin le itens" on public.order_items;
drop policy if exists "cliente le proprios itens" on public.order_items;
create policy "admin le itens" on public.order_items for select using (public.is_admin());
create policy "cliente le proprios itens" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id is not null and o.user_id = auth.uid()
    )
  );

drop policy if exists "admin le historico" on public.order_status_history;
drop policy if exists "cliente le proprio historico" on public.order_status_history;
create policy "admin le historico" on public.order_status_history
  for select using (public.is_admin());
create policy "cliente le proprio historico" on public.order_status_history
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id is not null and o.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- 9. Storage das fotos
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('produtos', 'produtos', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = true,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "fotos publicas"        on storage.objects;
drop policy if exists "admin envia fotos"     on storage.objects;
drop policy if exists "admin atualiza fotos"  on storage.objects;
drop policy if exists "admin apaga fotos"     on storage.objects;

create policy "fotos publicas" on storage.objects
  for select using (bucket_id = 'produtos');
create policy "admin envia fotos" on storage.objects
  for insert with check (bucket_id = 'produtos' and public.is_admin());
create policy "admin atualiza fotos" on storage.objects
  for update using (bucket_id = 'produtos' and public.is_admin());
create policy "admin apaga fotos" on storage.objects
  for delete using (bucket_id = 'produtos' and public.is_admin());

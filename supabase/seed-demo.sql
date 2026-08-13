-- ============================================================================
-- ⚠️  ARQUIVO DESCARTÁVEL — SOMENTE PARA TESTE DO DESENVOLVEDOR ⚠️
--
-- Isto NÃO faz parte da loja. Serve só para você (dev) ver as telas cheias
-- antes de entregar. A Joaninha cadastra os produtos dela pelo painel.
--
-- Se você rodar isso, RODE TAMBÉM o "limpar" no fim do arquivo antes de
-- entregar a loja, senão ela vai encontrar produtos falsos na vitrine.
-- ============================================================================

insert into public.categories (name, position) values
  ('Desinfetantes',   1),
  ('Roupas',          2),
  ('Cozinha',         3),
  ('Papel e descartáveis', 4)
on conflict do nothing;

insert into public.products (category_id, name, description, size_label, price_cents, position)
select c.id, v.name, v.description, v.size_label, v.price_cents, v.position
from (values
  ('Desinfetantes', 'Desinfetante Lavanda',   'Perfuma e limpa pisos e banheiros.',        '2 L',            1290, 1),
  ('Desinfetantes', 'Água sanitária',         'Uso geral, alveja e desinfeta.',            '1 L',             690, 2),
  ('Roupas',        'Sabão em pó',            'Rende bastante, serve para máquina.',       'caixa 1,6 kg',   2450, 1),
  ('Roupas',        'Amaciante concentrado',  'Deixa a roupa macia e cheirosa.',           '500 ml',         1190, 2),
  ('Cozinha',       'Detergente neutro',      'Corta a gordura sem ressecar as mãos.',     '500 ml',          390, 1),
  ('Cozinha',       'Esponja dupla face',     'Pacote com 4 unidades.',                    'pacote c/ 4',     890, 2),
  ('Papel e descartáveis', 'Papel higiênico',  'Folha dupla, macio.',                      'pacote c/ 12',   2790, 1)
) as v(cat, name, description, size_label, price_cents, position)
join public.categories c on c.name = v.cat
on conflict do nothing;

-- ----------------------------------------------------------------------------
-- PARA LIMPAR TUDO (rode antes de entregar para a Joaninha):
--
--   delete from public.order_items;
--   delete from public.order_status_history;
--   delete from public.orders;
--   delete from public.products;
--   delete from public.categories;
-- ----------------------------------------------------------------------------

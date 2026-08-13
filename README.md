# 🐞 Loja da Joaninha — pedidos de produtos de limpeza

Site de pedidos no estilo iFood para uma loja de produtos de limpeza.
O cliente escolhe os produtos, informa o endereço e faz o pedido sem criar conta.
A Joaninha recebe um e-mail, acompanha tudo por um painel e **cadastra os
produtos dela sozinha, pelo celular**.

- **Cliente:** vitrine com busca e filtro, carrinho, checkout sem cadastro e
  acompanhamento do pedido por um código. Criar conta é **opcional** — quem cria
  ganha histórico de pedidos e endereço salvo; quem não quer, compra como
  visitante do mesmo jeito.
- **Joaninha:** painel protegido com produtos, categorias, pedidos e
  configurações da loja.
- **Regra de ouro do projeto:** nenhum produto depende de código, planilha, seed
  ou acesso ao banco. Tudo é cadastrado pela interface.

Stack: **Next.js 16 (App Router) · Supabase (auth + Postgres + storage) ·
Nodemailer/SMTP · Tailwind CSS 4 · Vercel**.

---

# Parte 1 — Para a Joaninha 💛

Esta parte é para você que vai usar a loja no dia a dia. Não precisa entender
nada de programação.

## Como entrar no painel

1. No celular, abra o endereço da sua loja e coloque `/admin` no final.
   Exemplo: `sualoja.com.br/admin`
2. Digite seu e-mail e sua senha.
3. Pronto! Se esquecer a senha, toque em **Esqueci minha senha** e você recebe um
   link por e-mail para criar outra.

> 💡 **Dica:** no celular, use o menu do navegador e toque em
> *"Adicionar à tela de início"*. O painel vira um ícone, igual a um aplicativo.

## Como cadastrar seu primeiro produto

**Antes de tudo, crie uma categoria** (é a "prateleira" onde o produto fica):

1. Na barra de baixo, toque em **Categorias**.
2. Escreva o nome, por exemplo `Cozinha`, e toque em **Criar**.
3. Crie quantas quiser: `Banheiro`, `Roupas`, `Papel e descartáveis`...

**Agora o produto:**

1. Na barra de baixo, toque em **Produtos**.
2. Toque em **+ Novo** (ou no botão grande *Cadastrar meu primeiro produto*).
3. **Foto:** toque em **Adicionar foto**. O celular vai perguntar se você quer
   usar a câmera ou escolher da galeria.
   - Pode tirar a foto na hora, com o produto na mão.
   - Não se preocupe com o tamanho: o site ajusta e diminui a foto sozinho.
   - Dica: fundo claro e liso (uma parede branca ou a pia) deixa a foto bonita.
4. **Nome do produto:** o nome que o cliente vê. Exemplo: `Detergente neutro`.
5. **Preço:** digite só os números. Se você digitar `390`, vira **R$ 3,90**.
   Se digitar `1290`, vira **R$ 12,90**.
6. **Tamanho ou quantidade** (opcional): `1 L`, `500 ml`, `pacote com 4`.
7. **Descrição** (opcional): uma frase curta ajuda a vender.
   Exemplo: *"Corta a gordura sem ressecar as mãos."*
8. **Categoria:** escolha a prateleira que você criou.
9. **Mostrar na loja:** deixe ligado para o produto aparecer para o cliente.
10. Role a tela: em **Como vai aparecer para o cliente** você vê exatamente o
    cartão que ele vai ver. Se ficou bom, toque em **Cadastrar produto**.

Pronto — o produto **já está na loja**, na hora. Toque em **Ver loja** lá em cima
para conferir.

## O que mais dá para fazer com os produtos

| Quero... | Como faço |
|---|---|
| Mudar o preço ou a foto | **Produtos** → toque no produto → altere → **Salvar alterações** |
| Tirar da loja por uns dias | **Produtos** → **Esconder da loja**. Ele some para o cliente, mas continua guardado para você. |
| Cadastrar um parecido | **Produtos** → **Duplicar**. Ele copia tudo, você só troca o que mudou. |
| Apagar de vez | **Produtos** → **Excluir**. Ele pergunta antes de apagar. |
| Mudar a ordem da vitrine | Use as setinhas **▲ ▼** ao lado da foto. A ordem aqui é a ordem que o cliente vê. |

> 🔎 **Esconder × Excluir:** *esconder* é temporário e dá para voltar atrás.
> *Excluir* apaga para sempre. Na dúvida, esconda.

## Como funcionam os pedidos

Quando alguém faz um pedido, **chega um e-mail para você** com os itens, o valor,
a forma de pagamento, o telefone do cliente e o **endereço de entrega**. O e-mail
tem um botão que abre o pedido direto no painel.

No painel, em **Pedidos**:

- **Novos** — pedidos esperando você confirmar (o número na bolinha vermelha é
  quantos estão esperando).
- Toque no pedido para ver tudo. O **endereço aparece em destaque**, com um botão
  para **copiar** e outro para **abrir no mapa**.
- Tem também **Chamar no WhatsApp**, que já abre a conversa com o cliente.
- Botões de ação: **Aceitar pedido** ou **Recusar pedido**. Depois de aceitar,
  vá tocando em **Avançar** conforme o pedido anda:

  `Aguardando confirmação → Aceito → Em preparo → Saiu para entrega → Entregue`

O cliente acompanha isso sozinho pela tela dele, com o código do pedido. Se ele
tiver deixado o e-mail, recebe um aviso a cada mudança.

## Configurações da loja

Em **Ajustes** você muda, quando quiser:

- **Nome da loja** — aparece no topo do site e nos e-mails.
- **WhatsApp da loja** — o número que o cliente usa para falar com você.
- **E-mail para receber os pedidos** — ⚠️ é para cá que chega o aviso de pedido
  novo. Confira se está certo!
- **Como funciona a entrega** — a frase que o cliente lê. Ex: *"A combinar com a
  loja pelo WhatsApp"*.
- **Horário de funcionamento** — escrito do seu jeito, aparece no rodapé.
- **Recado no topo do site** — para avisos rápidos, tipo *"Hoje as entregas saem
  só à tarde"*. Deixe vazio para não aparecer nada.

---

# Parte 2 — Setup técnico (dev)

## Pré-requisitos

- Node.js 20 ou superior
- Uma conta no [Supabase](https://supabase.com) (grátis)
- Uma conta Google para a loja (o e-mail sai dela)
- Uma conta na [Vercel](https://vercel.com) para publicar

## 1. Instalar

```bash
npm install
cp .env.example .env.local
```

## 2. Criar o projeto no Supabase

1. Crie um projeto novo em [supabase.com](https://supabase.com).
2. Abra **SQL Editor** → **New query**.
3. Cole o conteúdo inteiro de [`supabase/schema.sql`](supabase/schema.sql) e
   clique em **Run**.

Isso cria as tabelas, as políticas de segurança (RLS), os gatilhos e o bucket de
imagens. **Não cria nenhum produto** — o banco entrega vazio, de propósito.

O script pode ser rodado de novo sem quebrar nada.

## 3. Criar a conta da Joaninha

1. No Supabase, vá em **Authentication** → **Users** → **Add user** →
   **Create new user**.
2. Preencha o e-mail e a senha dela e marque **Auto Confirm User**.
3. Pronto. **O primeiro usuário criado vira admin automaticamente** (gatilho
   `handle_new_user`), então não é preciso rodar nenhum SQL.

> Se a conta já existia antes de você rodar o schema, promova com:
> ```sql
> select public.tornar_admin('email-dela@exemplo.com');
> ```

**Importante — cadastro de clientes:** em **Authentication → Sign In / Providers**,
deixe **Allow new users to sign up** LIGADO. É o que permite o cliente criar a
conta dele na loja.

Isso não abre brecha no painel: o gatilho só promove a admin o **primeiro**
usuário do projeto (a Joaninha). Todo mundo que se cadastrar depois nasce como
`cliente`, e as telas de `/admin` exigem `role = 'admin'`.

Ainda em **Authentication**, considere desligar **Confirm email**. O envio de
e-mail nativo do Supabase é limitado a poucas mensagens por hora no plano
gratuito, e com ele ligado o cliente fica travado esperando uma confirmação que
pode não chegar. Se quiser manter a confirmação, configure um SMTP próprio em
**Project Settings → Authentication → SMTP Settings**.

## 4. Configurar o e-mail (Gmail da loja)

Os e-mails saem do **Gmail da própria loja**, por SMTP.

**Por que não um serviço transacional (Resend, SendGrid...):** todos eles exigem
um **domínio verificado** para entregar a qualquer destinatário. Sem domínio,
eles só entregam para o dono da conta — o que faria o aviso de status **para o
cliente** nunca chegar. Como esta loja não tem domínio próprio, mandar pelo
Gmail dela resolve os dois casos de graça, com a reputação de entrega do Google.

Na conta Google **da loja**, uma vez só:

1. [myaccount.google.com](https://myaccount.google.com) → **Segurança**
2. Ative a **Verificação em duas etapas** (sem ela o passo 3 não aparece)
3. Procure por **Senhas de app** e crie uma chamada `Loja`
4. O Google mostra **16 letras** — é isso que vai em `SMTP_PASSWORD`

⚠️ É a **senha de app**, nunca a senha normal do Gmail. Ela dá acesso só ao
envio de e-mail e pode ser revogada a qualquer momento nessa mesma tela.

**Limite:** cerca de 500 e-mails por dia — muito acima do que uma loja de bairro
usa. Se um dia a loja crescer e tiver domínio próprio, dá para trocar por um
serviço transacional mexendo só em [`lib/email.ts`](lib/email.ts).

### Passando o e-mail do dev para a dona da loja

Durante o desenvolvimento é normal usar o Gmail do dev. Na entrega, faça esta
troca **junto com ela** (a verificação em duas etapas pede o celular dela):

1. Na conta Google **dela**: ativar a verificação em duas etapas e gerar a senha
   de app (passos acima).
2. Na **Vercel → Settings → Environment Variables**: trocar `SMTP_USER` e
   `SMTP_PASSWORD` pelos dela e **fazer um novo deploy** (variável de ambiente
   só passa a valer no deploy seguinte).
3. No painel, em **Ajustes**, colocar o e-mail dela em *E-mail para receber os
   pedidos*. Este ela troca sozinha quando quiser.
4. Na conta Google **do dev**: revogar a senha de app usada nos testes. Ela
   continua válida para sempre se ninguém revogar.

⚠️ **Este é o único ponto do sistema que não é self-service.** Trocar o
remetente exige variável de ambiente e redeploy — se um dia ela mudar de Gmail,
vai precisar do dev. Produto, preço, foto, categoria e e-mail de destino ela
continua trocando sozinha.

## 5. Preencher o `.env.local`

Todas as variáveis estão documentadas em [`.env.example`](.env.example):

| Variável | Onde achar |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → chave `anon` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → chave `service_role` (**segredo**) |
| `SMTP_USER` | O Gmail da loja (ex: `lojadajoaninha@gmail.com`) |
| `SMTP_PASSWORD` | A **senha de app** de 16 letras gerada no Google |
| `EMAIL_TO_ADMIN` | Reserva, usada só enquanto o painel não tem e-mail preenchido |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` em dev; a URL da Vercel em produção |

## 6. Rodar

```bash
npm run dev
```

- Loja: <http://localhost:3000>
- Painel: <http://localhost:3000/admin>

## 7. Publicar na Vercel

1. Suba o projeto para o GitHub e importe na Vercel.
2. Em **Settings → Environment Variables**, repita todas as variáveis do
   `.env.local`. Ajuste `NEXT_PUBLIC_SITE_URL` para o domínio final — é ele que
   monta os links dos e-mails.
3. No Supabase, em **Authentication → URL Configuration**, coloque a URL do site
   em **Site URL** e adicione `https://SEU-DOMINIO/admin/nova-senha` em
   **Redirect URLs** (para o "esqueci minha senha" funcionar em produção).
4. Deploy.

## Dados de teste (opcional e descartável)

[`supabase/seed-demo.sql`](supabase/seed-demo.sql) cria alguns produtos falsos só
para você ver as telas cheias. **Ele não faz parte da loja.**

⚠️ Se rodar, apague tudo antes de entregar — o final do próprio arquivo tem os
comandos de limpeza. A Joaninha tem que encontrar a loja vazia e cadastrar as
coisas dela.

---

# Como o projeto está organizado

```
app/
  (loja)/                    Área pública
    page.tsx                 Vitrine (busca + filtro por categoria)
    carrinho/                Carrinho
    checkout/                Finalizar pedido
    pedido/[codigo]/         Acompanhamento pelo código
    acompanhar/              Digitar o código do pedido
    entrar/ criar-conta/     Conta do cliente (opcional)
    nova-senha/              Trocar senha pelo link do e-mail
    minha-conta/             Nome, telefone e endereço salvos
    meus-pedidos/            Histórico de quem tem conta
  admin/
    login/                   Entrar
    nova-senha/              Trocar senha pelo link do e-mail
    (painel)/                Tudo que exige ser admin
      pedidos/               Lista, detalhe e ações de status
      produtos/              CRUD + upload de foto
      categorias/            CRUD + ordenação
      configuracoes/         Dados da loja
  api/pedidos/               POST: cria o pedido e dispara o e-mail

components/loja/             Vitrine, carrinho, linha do tempo
components/admin/            Formulários e listas do painel
components/ui/               Peças reutilizáveis (campo, aviso, copiar)

lib/
  supabase/                  Clientes: navegador, servidor e serviço
  imagem.ts                  Redimensiona e comprime a foto no celular
  email.ts                   Modelos e envio de e-mail (SMTP)
  validation.ts              Schemas zod + mensagens em português
  format.ts                  Moeda, telefone, status, endereço

supabase/schema.sql          Banco completo (rodar 1x)
supabase/seed-demo.sql       Dados falsos, descartáveis
proxy.ts                     Renova a sessão e protege /admin
```

## Modelo de dados

| Tabela | Para quê |
|---|---|
| `profiles` | Quem é admin (`role = 'admin'`) e os dados salvos da conta do cliente (nome, telefone, endereço) |
| `categories` | Categorias da vitrine, com ordem e ativo/inativo |
| `products` | Produtos: nome, descrição, tamanho, preço em centavos, foto, ordem, ativo |
| `store_settings` | Linha única com nome, WhatsApp, e-mail, entrega, horário e recado |
| `orders` | Pedido: número, código público, status, cliente, endereço, pagamento, total |
| `order_items` | Itens com **nome e preço congelados** no momento do pedido |
| `order_status_history` | Registro automático de cada mudança de status |

Detalhes que valem saber:

- **Dinheiro em centavos (`integer`)**, nunca em ponto flutuante.
- **Código do pedido** (`JN-7K3QD9`) é gerado por gatilho, com um alfabeto sem
  `0`, `O`, `1` e `I` — para ninguém errar ao ditar por telefone.
- **Preço nunca vem do navegador.** O `POST /api/pedidos` recebe só
  `id do produto + quantidade` e relê os preços no banco, então não dá para
  forjar um pedido de R$ 0,01.
- **Histórico de status é automático**, gravado por gatilho no banco.

## Segurança

- **RLS ligado em todas as tabelas.**
- Catálogo (`products`, `categories`): leitura pública apenas do que está ativo;
  escrita só para admin.
- Pedidos: um visitante **não lê nada** pelo navegador — só enxerga o pedido
  dele através do servidor, informando o código. Cliente logado lê apenas os
  pedidos com `user_id` igual ao dele, pelo RLS. Sem isso, qualquer visitante
  poderia listar o endereço e o telefone de todos os clientes.
- **O cliente não consegue se promover a admin.** Ele pode editar o próprio
  perfil (nome, telefone, endereço), e o gatilho `congela_role()` devolve o
  valor antigo se alguém tentar mandar `role='admin'` no update.
- O dono do pedido (`user_id`) vem **sempre da sessão no servidor**, nunca do
  corpo da requisição — senão daria para dizer que é outra pessoa.
- `store_settings` guarda o e-mail da dona, então também não é pública — o site
  lê pelo servidor e mostra ao cliente só o que é público.
- A chave `service_role` fica **somente no servidor** (`lib/supabase/admin.ts`,
  marcado com `server-only`).
- O `proxy.ts` renova a sessão e barra quem não está logado em `/admin`; cada
  ação do painel confirma de novo se é admin (`exigirAdmin`).

## Detalhes de implementação que importam

- **Foto tratada no aparelho** (`lib/imagem.ts`): corrige a rotação da câmera
  (EXIF), reduz para 1280px no lado maior e comprime em WebP até ~300 KB antes de
  subir. É o que faz o upload ser rápido no 4G.
- **O e-mail nunca derruba o pedido.** Se o envio falhar, o pedido já está salvo
  e aparece no painel do mesmo jeito; a falha só vai para o log.
- **Carrinho no `localStorage`**, sem necessidade de conta.
- **A tela de acompanhamento se atualiza sozinha** enquanto o pedido está aberto.

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| "Variável de ambiente ausente: ..." | Falta preencher o `.env.local` (ou as variáveis na Vercel) |
| O e-mail de pedido novo não chega | `SMTP_USER`/`SMTP_PASSWORD` errados, ou o e-mail em **Ajustes** está vazio. Confira se usou a *senha de app*, e não a senha normal do Gmail |
| Links do e-mail apontam para `localhost` | `NEXT_PUBLIC_SITE_URL` não foi ajustado na Vercel |
| A foto não sobe | O schema não foi rodado (falta o bucket `produtos`) ou a conta não é admin |
| Cai em "Esta conta não tem acesso ao painel" | O usuário não tem `role = 'admin'`; rode `select public.tornar_admin('email');` |
| Ela não consegue entrar e não recebe o link de senha | Confira **Site URL** e **Redirect URLs** no Supabase |

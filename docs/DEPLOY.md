# Deploy em servidor

## Opcao recomendada: Render

1. Suba este projeto para um repositorio GitHub.
2. Acesse Render e escolha **New > Blueprint**.
3. Conecte o repositorio.
4. Confirme o arquivo `render.yaml`.
5. Aguarde a criacao dos quatro servicos.
6. Copie a URL publica do servico `cidade-cuida-gateway`.
7. Atualize o campo "Link de acesso publicado" no `README.md`.

## Variaveis esperadas

| Servico | Variavel |
| --- | --- |
| `catalog` | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| `notifications` | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| `orders` | `NOTIFICATIONS_URL` |
| `gateway` | `CATALOG_URL`, `ORDERS_URL` |

Em outras plataformas, como Railway ou AWS, publique os quatro Dockerfiles e configure as mesmas variaveis usando as URLs internas ou publicas de cada servico.

## Banco Postgres no Supabase

Antes de publicar, crie um projeto no Supabase e execute `docs/supabase-schema.sql` no SQL Editor. Depois configure `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` nos servicos `catalog`, `orders` e `notifications`.

Use a `service_role key` apenas no backend. Ela nao deve ir para frontend, aplicativo mobile ou repositorio publico.

## Como preencher as variaveis do Supabase

Este projeto acessa o Postgres pelo REST API do Supabase. Por isso, `SUPABASE_URL` nao deve ser a URL direta do Postgres com usuario e senha.

Use este formato:

```powershell
$env:SUPABASE_URL="https://SEU-PROJETO.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="SUA_SERVICE_ROLE_KEY"
```

Exemplo de formato correto:

```powershell
$env:SUPABASE_URL="https://ecbrpmcrjxshupydwtzu.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIs..."
```

Nao use este formato em `SUPABASE_URL`:

```text
postgres://usuario:senha@db.projeto.supabase.co:5432/postgres
```

A senha do banco serve para conexao direta Postgres. Para este projeto, copie a chave em **Supabase > Project Settings > API > service_role key**.

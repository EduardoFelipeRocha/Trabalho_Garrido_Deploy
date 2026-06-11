# Cidade Cuida

O **Cidade Cuida** e uma API em microsservicos para registro e priorizacao de chamados urbanos. O exemplo simula uma prefeitura que precisa receber solicitacoes de moradores, classificar a urgencia do problema e registrar uma notificacao de acompanhamento.

Exemplos de chamados:

- buraco em via publica;
- falta de iluminacao;
- descarte irregular de lixo;
- alagamento.

## Problema

Em cidades pequenas, chamados urbanos costumam chegar por telefone, e-mail ou mensagens. Isso dificulta saber quais problemas sao mais urgentes, quais ja foram registrados e se o morador recebeu retorno.

A proposta deste sistema e centralizar o registro dos chamados e calcular uma prioridade automaticamente a partir da categoria e da descricao enviada pelo cidadao.

## Microsservicos

| Servico | Porta | Responsabilidade no sistema |
| --- | --- | --- |
| `catalog` | `3001` | Lista categorias de problemas urbanos e o peso de severidade de cada uma. |
| `orders` | `3002` | Cria chamados, calcula prioridade e salva no banco. |
| `notifications` | `3003` | Recebe evento de chamado criado e registra uma notificacao. |
| `gateway` | `3000` | API de entrada; orquestra catalogo e chamados para o cliente externo. |

O `gateway` tambem entrega o frontend web em `/`, permitindo registrar chamados e acompanhar os dados pelo navegador.

Fluxo principal:

1. O cliente envia `POST /tickets` para o `gateway`.
2. O `gateway` busca a categoria no `catalog`.
3. O `gateway` envia os dados completos para `orders`.
4. `orders` calcula a prioridade, salva o chamado e publica o evento `ticket.created`.
5. `notifications` recebe o evento e salva a notificacao.

## Arquitetura Limpa

Cada servico foi separado em camadas:

```text
domain          regras de negocio e entidades
application     casos de uso
infrastructure  banco, HTTP clients e adaptadores externos
main            composicao e servidor HTTP
```

Exemplo no servico `orders`:

- `domain/ticket.js`: entidade `Ticket` e validacoes principais.
- `domain/severity-priority-strategy.js`: regra de calculo de prioridade.
- `application/create-ticket-use-case.js`: caso de uso para criar chamado.
- `infrastructure/supabase-ticket-repository.js`: persistencia em Supabase/Postgres.
- `main/http-server.js`: entrada HTTP.

A regra de negocio nao depende de HTTP, Docker ou Supabase. Esses detalhes ficam na camada `infrastructure`.

## SOLID aplicado

- **Single Responsibility**: `CreateTicketUseCase` cria chamados; `SeverityPriorityStrategy` calcula prioridade; repositorios cuidam apenas da persistencia.
- **Open/Closed**: a estrategia de prioridade pode ser trocada sem alterar o caso de uso.
- **Liskov Substitution**: `InMemoryTicketRepository` e `SupabaseTicketRepository` podem ser usados pelo mesmo caso de uso.
- **Interface Segregation**: dependencias pequenas, como repositorio, gerador de ID e publicador de evento.
- **Dependency Inversion**: casos de uso recebem dependencias por construtor em vez de criar implementacoes concretas.

## Design Patterns usados

| Padrao | Onde aparece | Motivo |
| --- | --- | --- |
| Repository | `InMemoryTicketRepository`, `SupabaseTicketRepository` | Isolar a persistencia da regra de negocio. |
| Strategy | `SeverityPriorityStrategy` | Separar o algoritmo de prioridade. |
| Factory | `TicketFactory`, `NotificationFactory` | Centralizar a criacao de entidades validas. |
| Observer/PubSub | `HttpEventPublisher` + `/events` | Notificar outro servico quando um chamado e criado. |
| Facade | `GatewayFacade` | Simplificar a comunicacao do cliente com varios servicos. |
| Adapter | `HttpCategoryClient`, `HttpTicketClient` | Adaptar chamadas HTTP para contratos internos. |

## Clean Code

Evidencias no codigo:

- nomes diretos: `CreateTicketUseCase`, `TicketFactory`, `SupabaseTicketRepository`;
- funcoes pequenas e com uma responsabilidade;
- validacoes dentro das entidades de dominio;
- controllers HTTP sem regra de negocio;
- dependencias injetadas nos casos de uso;
- mensagens de erro objetivas.

## Banco de dados

O projeto usa **Supabase/Postgres** para persistencia real. O SQL de criacao das tabelas esta em:

```text
docs/supabase-schema.sql
```

Tabelas criadas:

- `categories`
- `tickets`
- `notifications`

Para teste rapido, se `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` nao forem configuradas, os servicos usam repositorios em memoria.

## Executando localmente

Rode os testes:

```bash
npm test
npm run bdd
```

Para rodar o sistema completo localmente, abra quatro terminais.

Terminal 1:

```powershell
$env:SUPABASE_URL="https://SEU-PROJETO.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="SUA_SERVICE_ROLE_KEY"
npm run start:catalog
```

Terminal 2:

```powershell
$env:SUPABASE_URL="https://SEU-PROJETO.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="SUA_SERVICE_ROLE_KEY"
npm run start:notifications
```

Terminal 3:

```powershell
$env:SUPABASE_URL="https://SEU-PROJETO.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="SUA_SERVICE_ROLE_KEY"
$env:NOTIFICATIONS_URL="http://localhost:3003"
npm run start:orders
```

Terminal 4:

```powershell
$env:CATALOG_URL="http://localhost:3001"
$env:ORDERS_URL="http://localhost:3002"
$env:NOTIFICATIONS_URL="http://localhost:3003"
npm run start:gateway
```

Teste:

```powershell
Start-Process http://localhost:3000
Invoke-RestMethod http://localhost:3000/categories
Invoke-RestMethod http://localhost:3000/diagnostics
```

Criar chamado:

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:3000/tickets" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"categoryId":"pothole","description":"Buraco com risco de acidente perto da escola","citizenEmail":"ana@example.com","district":"Centro"}'
```

## TDD

Os testes unitarios ficam em:

```text
tests/unit
```

Eles cobrem:

- criacao de chamado valido;
- rejeicao de e-mail invalido;
- calculo de prioridade;
- publicacao do evento `ticket.created`;
- orquestracao do `GatewayFacade`.

Execucao:

```bash
npm test
```

## BDD

Os cenarios ficam em:

```text
tests/bdd/features/ticket.feature
```

Cenarios implementados:

- chamado urgente perto de escola deve virar prioridade 5;
- chamado comum de iluminacao deve manter prioridade 3;
- todo chamado criado deve publicar notificacao.

Execucao:

```bash
npm run bdd
```

## Docker

Cada microsservico possui seu proprio `Dockerfile`.

Para subir tudo com Docker Compose:

```bash
docker compose up --build
```

O `docker-compose.yml` configura:

- rede entre os servicos;
- portas locais;
- variaveis de ambiente;
- dependencia entre `orders` e `notifications`;
- dependencia entre `gateway`, `catalog` e `orders`.

## Deploy

O projeto possui `render.yaml` para publicacao no Render usando Docker.

Passos resumidos:

1. Subir o codigo para o GitHub.
2. Criar um Blueprint no Render usando o repositorio.
3. Configurar as variaveis `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`.
4. Publicar os quatro servicos.
5. Copiar a URL publica do `gateway`.

Link de acesso publicado:

```text
preencher apos deploy
```

Mais detalhes em:

```text
docs/DEPLOY.md
```

Se o frontend abrir com "API parcial" ou "API com erro", acesse:

```text
https://URL-DO-GATEWAY/diagnostics
```

Essa rota mostra se o erro esta no `catalog`, `orders` ou `notifications`.

## Justificativa tecnica

Node.js foi usado por permitir APIs HTTP simples e testes nativos com `node:test`. Supabase foi escolhido porque entrega Postgres gerenciado e API REST pronta, mantendo o projeto sem MongoDB e sem dependencia de ORM. Docker Compose foi usado para simular localmente a comunicacao real entre microsservicos.

A separacao por Arquitetura Limpa facilita trocar detalhes externos, como banco em memoria por Supabase/Postgres, sem alterar os casos de uso.

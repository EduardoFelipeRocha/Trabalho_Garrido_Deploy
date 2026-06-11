# Cidade Cuida

Sistema didatico em microsservicos para registrar, priorizar e acompanhar chamados urbanos, como buracos em vias, falta de iluminacao e descarte irregular. A persistencia pode rodar em memoria para teste rapido ou em Supabase/Postgres para uso real.

## Problema

Prefeituras pequenas normalmente recebem solicitacoes por telefone, e-mail e mensagens. Isso dificulta priorizacao, acompanhamento e transparencia. O problema escolhido e centralizar esses chamados, classifica-los por urgencia e encaminhar notificacoes para a equipe responsavel.

## Solucao

A solucao possui quatro servicos:

| Servico | Porta | Responsabilidade |
| --- | --- | --- |
| `catalog` | `3001` | Mantem categorias de problemas urbanos e seus pesos de severidade. |
| `orders` | `3002` | Cria chamados, calcula prioridade e publica evento de criacao. |
| `notifications` | `3003` | Recebe eventos e registra notificacoes enviadas. |
| `gateway` | `3000` | Oferece uma API unica para clientes externos. |

Fluxo principal:

1. O cliente envia `POST /tickets` para o gateway.
2. O gateway consulta `catalog` para validar a categoria.
3. O gateway envia o chamado para `orders`.
4. `orders` usa estrategia de priorizacao, salva no repositorio e publica evento.
5. `notifications` registra a notificacao.

## Executando localmente

```bash
npm test
npm run bdd
npm run start:gateway
```

Para executar todos os servicos com Docker:

```bash
docker compose up --build
```

## Usando Supabase/Postgres

1. Crie um projeto no Supabase.
2. Abra **SQL Editor** e execute o arquivo `docs/supabase-schema.sql`.
3. Copie a `Project URL`.
4. Copie a `service_role key` em **Project Settings > API**.
5. Configure as variaveis antes de subir os servicos.

PowerShell:

```powershell
$env:SUPABASE_URL="https://SEU-PROJETO.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="SUA_SERVICE_ROLE_KEY"
```

Depois rode os servicos normalmente. Se essas variaveis nao forem definidas, o sistema usa repositorios em memoria.

Importante: `SUPABASE_URL` deve ser a URL do projeto, como `https://ecbrpmcrjxshupydwtzu.supabase.co`, e nao a string direta `postgres://...`. A senha do banco nao substitui a `service_role key`.

Exemplo de requisicao:

```bash
curl -X POST http://localhost:3000/tickets ^
  -H "Content-Type: application/json" ^
  -d "{\"categoryId\":\"pothole\",\"description\":\"Buraco grande perto da escola\",\"citizenEmail\":\"ana@example.com\",\"district\":\"Centro\"}"
```

## Deploy

O projeto inclui `Dockerfile` por servico, `docker-compose.yml` para ambiente local e `render.yaml` como blueprint de publicacao no Render.

Link de acesso publicado: **preencher apos deploy**, por exemplo `https://cidade-cuida-gateway.onrender.com`.

> Observacao: o deploy real exige conta/autenticacao em Render, Railway, AWS, Azure, Google Cloud ou similar. O codigo e a configuracao estao prontos para publicacao, mas o link final depende da plataforma usada pelo aluno.

## Arquitetura Limpa

Cada microsservico segue a separacao:

- `domain`: entidades, regras de negocio e contratos.
- `application`: casos de uso.
- `infrastructure`: adaptadores externos, repositorios e HTTP clients.
- `main`: composicao da aplicacao e servidor HTTP.

As dependencias apontam para dentro. Casos de uso conhecem contratos, mas nao dependem de HTTP, banco ou Docker.

## SOLID

- **S - Single Responsibility**: `CreateTicketUseCase` cria chamados; `SeverityPriorityStrategy` calcula prioridade; repositorios apenas persistem.
- **O - Open/Closed**: novas estrategias de prioridade podem implementar a mesma interface sem alterar o caso de uso.
- **L - Liskov Substitution**: repositorios em memoria podem ser substituidos por repositorios reais mantendo os mesmos metodos.
- **I - Interface Segregation**: contratos pequenos, como `TicketRepository`, `CategoryClient` e `EventPublisher`.
- **D - Dependency Inversion**: casos de uso recebem dependencias por construtor, sem criar adaptadores concretos.

## Design Patterns

- **Repository**: `InMemoryTicketRepository` e `InMemoryCategoryRepository` isolam persistencia.
- **Strategy**: `SeverityPriorityStrategy` encapsula o algoritmo de prioridade.
- **Factory**: `TicketFactory` centraliza criacao e validacao da entidade.
- **Observer/PubSub**: `HttpEventPublisher` publica evento para o servico de notificacoes.
- **Facade**: `GatewayFacade` simplifica a orquestracao entre catalogo e chamados.
- **Adapter**: `HttpCategoryClient` e `HttpTicketClient` traduzem chamadas HTTP para contratos internos.

## Clean Code

Evidencias aplicadas:

- nomes explicitos (`CreateTicketUseCase`, `calculatePriority`, `citizenEmail`);
- funcoes curtas e com uma intencao;
- validacoes proximas do dominio;
- erros com mensagens objetivas;
- injecao de dependencias para reduzir acoplamento;
- ausencia de logica de negocio em controllers HTTP.

## TDD

Os testes unitarios em `tests/unit` cobrem primeiro regras centrais:

- criacao de ticket valido;
- rejeicao de entrada invalida;
- calculo de prioridade;
- contrato do caso de uso com repositorio e publicador de evento.

Execucao:

```bash
npm test
```

## BDD

Os cenarios em `tests/bdd/features/ticket.feature` descrevem comportamento em linguagem de negocio.

Execucao:

```bash
npm run bdd
```

## Justificativa Tecnica

Node.js foi escolhido por permitir microsservicos HTTP leves, inicializacao rapida e testes nativos com `node:test`. Supabase foi escolhido por entregar Postgres gerenciado, API REST pronta e deploy simples sem trocar a regra de negocio. A implementacao evita dependencias externas para simplificar a avaliacao e tornar a arquitetura mais facil de inspecionar. Docker Compose foi usado porque reproduz localmente a comunicacao entre servicos, aproximando o ambiente de desenvolvimento do deploy.

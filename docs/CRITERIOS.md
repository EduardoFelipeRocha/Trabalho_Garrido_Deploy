# Mapeamento dos criterios de avaliacao

| Criterio | Onde evidenciar |
| --- | --- |
| Descricao do problema e proposta | `README.md`, secoes "Problema" e "Solucao" |
| Clean Code | nomes expressivos, funcoes pequenas e separacao de responsabilidades nos servicos |
| SOLID | `README.md`, secao "SOLID"; injecao de dependencias nos casos de uso |
| Design Patterns | `README.md`, secao "Design Patterns"; exemplos no codigo |
| Arquitetura Limpa | pastas `domain`, `application`, `infrastructure`, `main` |
| Microsservicos | `services/catalog`, `services/orders`, `services/notifications`, `services/gateway` |
| TDD | `tests/unit/*.test.js` |
| BDD | `tests/bdd/features/ticket.feature` e `tests/bdd/run-bdd.js` |
| Docker/Docker Compose | `services/*/Dockerfile` e `docker-compose.yml` |
| Deploy cloud | `render.yaml` e `docs/DEPLOY.md` |
| Link publicado | Preencher no `README.md` apos publicar o gateway |
| Banco Postgres | `docs/supabase-schema.sql` e repositorios Supabase em `infrastructure` |

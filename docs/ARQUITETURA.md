# Arquitetura modular — totvstec-doc

O **totvstec-doc** é o **motor**: tema Docusaurus, componentes React, tools, CI e publicação.  
Cada **módulo** (repositório satélite) é dono da própria documentação e dos exemplos `.tlpp`.

## Visão geral

```
┌─────────────────────────────────────────────────────────────┐
│  totvstec-doc (motor)                                       │
│  repos.config.json · sync-deps · generate-sidebars · CI      │
│  src/components · tools · docs/index · exemplos-praticos    │
└───────────────────────────┬─────────────────────────────────┘
                            │ sync (build)
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
 tlpp-sample-rest   tlpp-sample-rest-doc   tlpp-probat-samples
```

## Estrutura de um módulo (satélite)

Todo repositório de exemplos segue o mesmo contrato:

```
meu-modulo/
├── src/ ou test/          # código .tlpp
├── docs/
│   ├── sidebar.json       # menu deste módulo (conceito)
│   ├── conceito/          # MDX narrativo (+ ExemploRef simples)
│   │   └── …              # ou metadados/ + doc-generate/ (Doc Generate)
│   └── exemplos/          # gerado: npm run docs:exemplos
├── scripts/
│   └── generate-exemplos-docs.mjs
├── ecosystem.config.json  # gerado: npm run ecosystem:export (no hub)
└── .github/workflows/notify-hub.yml
```

| Pasta | Responsabilidade |
|-------|------------------|
| `docs/conceito/` | Trilha de leitura, conceitos, um exemplo inline por página |
| `docs/exemplos/` | Catálogo GitHub — tabelas de `.tlpp` (gerado do código) |
| `docs/sidebar.json` | Menu lateral do módulo; exemplos são auto-descobertos |

## Fonte única: `repos.config.json`

Cada entrada em `repos` declara:

| Campo | Função |
|-------|--------|
| `id`, `owner`, `name`, `branch` | GitHub + `<RepoLink id="…" />` |
| `sidebar.category`, `order` | Bloco no menu principal |
| `sync.mdxSources` | `from` (no satélite) → `to` (no site) |
| `sync.sidebarFile` | Caminho do `sidebar.json` |
| `notifyHub.eventType` | Dispara rebuild no push |

### Mapeamentos atuais

| Módulo | Conceito (sync) | Exemplos (sync) |
|--------|-----------------|-----------------|
| REST | `docs/conceito` → `docs/tlpp/rest` | `docs/exemplos` → `…/exemplos-repositorio` |
| Doc Generate | `docs/metadados`, `docs/doc-generate` | `docs/exemplos` → `…/exemplos-doc-generate` |
| PROBAT | `docs/conceito` → `docs/tlpp/probat` | `docs/exemplos` → `…/exemplos-repositorio` |

No git do hub, as pastas de destino têm apenas `.gitkeep` — o conteúdo real vem do sync no build.

## Pipeline do motor

```bash
npm run prepare:docs   # sync:deps + generate:sidebars
npm run build          # prepare:docs (prebuild) + docusaurus build
```

1. **`sync-deps.mjs`** — copia `docs/` de cada satélite para o hub  
2. **`generate-sidebars.mjs`** — lê `docs/sidebar.json` de cada satélite, prefixa ids, monta categoria de exemplos a partir de `docs/exemplos/*.mdx`  
3. **Docusaurus** — publica em GitHub Pages  

No CI: `ci-checkout-deps.mjs` clona todos os satélites listados em `repos.config.json` (sem checkout hardcoded).

## Adicionar um novo módulo

1. Criar repositório com estrutura `docs/conceito`, `docs/exemplos`, `docs/sidebar.json`
2. Adicionar entrada em **`repos.config.json`** (`sync`, `sidebar`, `notifyHub`)
3. Registrar submódulo em **`.gitmodules`**
4. Rodar **`npm run ecosystem:export`** e commitar `ecosystem.config.json` no satélite
5. Copiar **`notify-hub.yml`** + secret `HUB_DISPATCH_TOKEN`
6. Adicionar `eventType` em **`.github/workflows/deploy.yml`** (`repository_dispatch`)
7. Rodar **`npm run validate:repos`**

O menu e o sync passam a funcionar sem editar `sidebars.ts` manualmente.

## O que fica só no hub

- `docs/index.mdx` — entrada do site
- `docs/tlpp/rest/exemplos-praticos.mdx` — catálogo de repositórios (`RepoCatalog`)
- `src/components/` — `RepoLink`, `ExemploRef`, etc.
- `src/pages/tools/` — ferramentas no navegador
- `repos.config.json` — catálogo central

## Fluxo de edição (dia a dia)

| Você quer… | Onde editar |
|------------|-------------|
| Conceito de um tópico | `docs/conceito/` no satélite |
| Novo arquivo `.tlpp` | `src/` ou `test/` no satélite → `npm run docs:exemplos` |
| Item no menu (conceito) | `docs/sidebar.json` no satélite |
| Novo módulo inteiro | `repos.config.json` no hub |
| Aparência / componentes | hub (`src/`) |

Push no satélite → `notify-hub` → rebuild automático do site.

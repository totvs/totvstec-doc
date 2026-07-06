# totvstec-doc

**Motor** do site TOTVSTec — integra módulos de documentação e publica em GitHub Pages.

Cada módulo (REST, Doc Generate, PROBAT) é um repositório satélite que **possui** conceito + exemplos `.tlpp`. Este repo fornece tema, componentes, tools e o pipeline de build.

## Site

**https://totvs.github.io/totvstec-doc/**

## Módulos integrados

| Módulo | Repositório | Documentação |
|--------|-------------|--------------|
| **REST** | [tlpp-sample-rest](https://github.com/totvs/tlpp-sample-rest) | [/docs/tlpp/rest](https://totvs.github.io/totvstec-doc/docs/tlpp/rest/) |
| **Doc Generate** | [tlpp-sample-rest-documentation](https://github.com/totvs/tlpp-sample-rest-documentation) | [/docs/tlpp/rest/metadados](https://totvs.github.io/totvstec-doc/docs/tlpp/rest/metadados/) |
| **PROBAT** | [tlpp-probat-samples](https://github.com/totvs/tlpp-probat-samples) | [/docs/tlpp/probat](https://totvs.github.io/totvstec-doc/docs/tlpp/probat/) |

Configuração central: [`repos.config.json`](repos.config.json).  
Como funciona: [Arquitetura modular](docs/ARQUITETURA.md).

## Desenvolvimento local

```bash
npm run setup          # submodules + sync + sidebars
npm start
```

## Adicionar um módulo

Ver [docs/ARQUITETURA.md](docs/ARQUITETURA.md#adicionar-um-novo-módulo).

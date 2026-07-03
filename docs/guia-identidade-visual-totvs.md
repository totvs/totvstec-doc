# Guia de identidade visual TOTVS — TLPP Docs

Referências oficiais:

- [Identidade visual](https://marca.totvs.com/identidade-visual/)
- [Downloads de assets](https://marca.totvs.com/downloads/)
- [Guia de linguagem](https://marca.totvs.com/guia-de-linguagem/) → ver também `docs/guia-linguagem-totvs.md`

Este documento resume as regras que este projeto deve seguir. Em caso de conflito, prevalece o portal oficial da marca.

## Downloads oficiais

| Asset | URL no portal | Uso no projeto |
|-------|---------------|----------------|
| Fonte TOTVS (TTF) | [downloads](https://marca.totvs.com/downloads/) | `static/fonts/totvs/*.ttf` |
| Logo SVG/PNG | idem | `static/img/totvs/` |
| Paleta CSS | idem (`totvscolors-css.zip`) | Referência; tokens em `src/css/totvs-brand.css` seguem a identidade visual institucional |
| Grafismos hexagonais | idem | Somente assets oficiais; não recriar hexágono regular |

## Tipografia

### Institucional

- Fonte exclusiva **TOTVS** para títulos, subtítulos, corpo, legendas e UI.
- **Não combine** com outras fontes (ex.: Inter, Roboto, Nunito).
- Pesos usados no projeto: 400, 500, 600, 700.
- Caracteres alternativos OpenType: apenas em chamadas grandes (títulos), com moderação (3–5 letras por frase).

### Sistema (fallback)

Quando a fonte institucional não estiver disponível (fallback após TTF em `static/fonts/totvs/`):

```text
TOTVS, ui-sans-serif, system-ui, sans-serif
```

### Código

Monoespaçada separada, apenas para paths, URLs e blocos técnicos:

```text
ui-monospace, Cascadia Code, Segoe UI Mono, Consolas
```

### Escala de tamanhos

| Token CSS | Tamanho | Uso |
|-----------|---------|-----|
| `--totvs-text-xs` | 12px | Labels, abas, metadados |
| `--totvs-text-sm` | 14px | Corpo secundário, inputs |
| `--totvs-text-md` | 16px | Corpo padrão |
| `--totvs-text-lg` | 18px | Destaques |
| `--totvs-text-xl` | 20px | Subtítulos |
| `--totvs-text-2xl` | 24px | Títulos de seção |
| `--totvs-text-3xl` | 32px | Títulos de página |
| `--totvs-text-4xl` | 40px | Hero secundário |
| `--totvs-text-5xl` | 48px | Hero principal |

Entrelinha padrão: **1.5** (`--totvs-leading-normal`).

## Cores

### Primárias (uso frequente)

| Token | Hex | Uso |
|-------|-----|-----|
| `--totvs-azul-escuro` | `#001e2d` | Navbar, fundos institucionais, texto sobre claro |
| `--totvs-azul` | `#00a9e0` | Links, CTAs, destaques, método GET |
| `--totvs-azul-claro` | `#00d2ff` | Hover de destaque |

### Secundárias (uso variável)

| Token | Hex | Uso sugerido |
|-------|-----|--------------|
| `--totvs-verde` | `#00ad00` | Sucesso, POST |
| `--totvs-laranja` | `#ff8900` | Avisos, PUT |
| `--totvs-roxo` | `#7b2cbf` | Destaques pontuais, área **Tools** |
| `--totvs-rosa` | `#e91e8c` | Destaques pontuais |
| `--totvs-limao` | `#c4d600` | Destaques pontuais |

### Neutros

| Token | Hex |
|-------|-----|
| `--totvs-texto` | `#151a23` |
| `--totvs-cinza` | `#939bae` |
| `--totvs-cinza-claro` | `#eef3f8` |
| `--totvs-erro` | `#dc343b` |

### Regras de contraste

- Texto sobre fundo colorido: validar contraste (manual — tabela “Use livremente / com cuidado / não use”).
- Logo e ícones: apenas branco, preto ou tons de azul da paleta.
- **Não** aplicar gradiente em texto, ícones ou grafismos — apenas em fundos.

## Logo

- Usar apenas arquivos em `static/img/totvs/`.
- Não distorcer, rotacionar, contornar ou recolorir.
- Área de respiro: respeitar módulo do símbolo hexagonal.

## UI e componentes

### Forma

- Cantos arredondados: 4–8px (`--totvs-radius-sm` a `--totvs-radius-lg`).
- Bordas sutis: `var(--totvs-border-subtle)`.
- Foco acessível: `outline` com `--totvs-focus-ring`.

### Botões

- Primário: fundo `--totvs-azul`, texto `--totvs-azul-escuro` ou branco conforme contraste.
- Secundário: outline `--totvs-azul`, fundo transparente.

### HTTP (Explorador OpenAPI)

| Método | Cor |
|--------|-----|
| GET | `--totvs-azul` |
| POST | `--totvs-verde` |
| PUT | `--totvs-laranja` |
| DELETE | `--totvs-erro` |
| PATCH | `--totvs-roxo` |

## O que evitar

- Fontes de terceiros (Google Fonts) misturadas à TOTVS.
- Cores fora da paleta (ex.: dourado/vermelho fora dos tokens).
- Novos logos ou submarcas sem autorização (`marca@totvs.com.br`).
- Gradientes decorativos em elementos pequenos.
- Hexágono regular ou “colmeia” (não faz parte do universo visual).

## Implementação no código

| Arquivo | Função |
|---------|--------|
| `src/css/totvs-brand.css` | Tokens, superfícies e `@font-face` |
| `src/css/custom.css` | Tema Docusaurus (importa tokens) |
| `docs/guia-linguagem-totvs.md` | Tom de voz e redação |

## Contato marca

Dúvidas ou validação: **marca@totvs.com.br**

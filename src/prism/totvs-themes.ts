import type {PrismTheme} from 'prism-react-renderer';

/** Tema claro — paleta TOTVS com contraste forte nos tokens. */
export const totvsLight: PrismTheme = {
  plain: {
    color: '#1a2332',
    backgroundColor: '#eef4fa',
  },
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata'],
      style: {color: '#64748b', fontStyle: 'italic'},
    },
    {
      types: ['keyword', 'builtin'],
      style: {color: '#005a76', fontWeight: '600'},
    },
    {
      types: ['annotation'],
      style: {color: '#0095c7', fontWeight: '700'},
    },
    {
      types: ['function', 'tag', 'section-name'],
      style: {color: '#0077a3', fontWeight: '600'},
    },
    {
      types: ['string', 'char', 'attr-value'],
      style: {color: '#0d7a62'},
    },
    {
      types: ['number', 'constant', 'symbol'],
      style: {color: '#c2410c'},
    },
    {
      types: ['boolean'],
      style: {color: '#7c3aed', fontWeight: '700'},
    },
    {
      types: ['class-name'],
      style: {color: '#a16207', fontWeight: '600'},
    },
    {
      types: ['property', 'key'],
      style: {color: '#006d8f', fontWeight: '600'},
    },
    {
      types: ['operator', 'punctuation'],
      style: {color: '#475569'},
    },
    {
      types: ['regex', 'important', 'variable'],
      style: {color: '#be123c'},
    },
    {
      types: ['inserted'],
      style: {color: '#15803d'},
    },
    {
      types: ['deleted'],
      style: {color: '#b91c1c'},
    },
  ],
};

/** Tema escuro — cyan e gold com fundo navy profundo. */
export const totvsDark: PrismTheme = {
  plain: {
    color: '#e2eaf2',
    backgroundColor: '#0a121c',
  },
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata'],
      style: {color: '#7a8fa3', fontStyle: 'italic'},
    },
    {
      types: ['keyword', 'builtin'],
      style: {color: '#5dd4ff', fontWeight: '600'},
    },
    {
      types: ['annotation'],
      style: {color: '#00d2ff', fontWeight: '700'},
    },
    {
      types: ['function', 'tag', 'section-name'],
      style: {color: '#67e8f9', fontWeight: '600'},
    },
    {
      types: ['string', 'char', 'attr-value'],
      style: {color: '#6ee7b7'},
    },
    {
      types: ['number', 'constant', 'symbol'],
      style: {color: '#fdba74'},
    },
    {
      types: ['boolean'],
      style: {color: '#c4b5fd', fontWeight: '700'},
    },
    {
      types: ['class-name'],
      style: {color: '#fbbf24', fontWeight: '600'},
    },
    {
      types: ['property', 'key'],
      style: {color: '#7dd3fc', fontWeight: '600'},
    },
    {
      types: ['operator', 'punctuation'],
      style: {color: '#94a3b8'},
    },
    {
      types: ['regex', 'important', 'variable'],
      style: {color: '#fb7185'},
    },
    {
      types: ['inserted'],
      style: {color: '#86efac'},
    },
    {
      types: ['deleted'],
      style: {color: '#fca5a5'},
    },
  ],
};

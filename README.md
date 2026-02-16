# docsjs-markdown

Convert docsjs HTML snapshots to Markdown (Standard, GFM, YAML frontmatter).

[![npm version](https://img.shields.io/npm/v/@fanly/docsjs-markdown)](https://www.npmjs.com/package/@fanly/docsjs-markdown)
[![MIT License](https://img.shields.io/npm/l/@fanly/docsjs-markdown)](LICENSE)

## Features

- Standard Markdown output
- GFM (GitHub Flavored Markdown) support: tables, task lists, strikethrough
- YAML frontmatter generation
- Automatic metadata extraction (title, word count, etc.)
- Preserves docsjs-specific elements (footnotes, revisions)

## Installation

```bash
npm install @fanly/docsjs-markdown
```

## Usage

```typescript
import { htmlToMarkdown, htmlToGfm, htmlToStandardMarkdown } from '@fanly/docsjs-markdown';

const html = '<h1>Hello</h1><p>World</p>';

// GFM (default)
const md = htmlToGfm(html);

// Standard Markdown
const md = htmlToStandardMarkdown(html);

// With options
const result = htmlToMarkdown(html, {
  format: 'gfm',
  frontmatter: true,
  metadata: { author: 'John' }
});
```

## API

### htmlToMarkdown(html, options)

Convert HTML to Markdown.

Options:
- `format`: `'standard' | 'gfm'` - Output format
- `frontmatter`: `boolean` - Include YAML frontmatter
- `metadata`: `Record<string, unknown>` - Custom metadata

### htmlToGfm(html, options)

Shortcut for GFM output.

### htmlToStandardMarkdown(html, options)

Shortcut for standard Markdown output.

### generateFrontmatter(meta)

Generate YAML frontmatter string.

## Demos

- [React Demo](./demos/react/)
- [Vue Demo](./demos/vue/)

## License

MIT

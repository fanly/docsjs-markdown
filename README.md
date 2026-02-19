# @coding01/docsjs-markdown

Markdown toolkit built for docsjs workflows.
Convert docsjs HTML snapshots or DOCX files into Markdown with extensible rules.

[![npm version](https://img.shields.io/npm/v/@coding01/docsjs-markdown)](https://www.npmjs.com/package/@coding01/docsjs-markdown)
[![npm downloads](https://img.shields.io/npm/dm/@coding01/docsjs-markdown)](https://www.npmjs.com/package/@coding01/docsjs-markdown)
[![License](https://img.shields.io/npm/l/@coding01/docsjs-markdown)](./LICENSE)

---

[中文文档](./README.zh-CN.md)

## What You Get

- HTML -> Markdown core entry: `@coding01/docsjs-markdown`
- DOCX -> Markdown adapter entry: `@coding01/docsjs-markdown/docx`
- Rule-based conversion architecture (custom per-tag rules)
- Optional YAML frontmatter generation
- CLI for direct `.docx -> .md` conversion

## Installation

```bash
npm i @coding01/docsjs-markdown
```

## Quick Start

### HTML to Markdown

```ts
import { htmlToGfm, htmlToStandardMarkdown } from "@coding01/docsjs-markdown";

const html = "<h1>Hello</h1><p>World</p>";
const gfm = htmlToGfm(html);
const standard = htmlToStandardMarkdown(html);
```

### DOCX to Markdown

```ts
import { docxToMarkdown, docxToMarkdownWithMeta } from "@coding01/docsjs-markdown/docx";

const file = input.files?.[0] as File;

const markdown = await docxToMarkdown(file, {
  format: "gfm",
  frontmatter: true,
  sanitizationProfile: "fidelity-first"
});

const richResult = await docxToMarkdownWithMeta(file, {
  format: "gfm",
  frontmatter: true,
  includeParseReport: true
});
```

### Custom Rules

```ts
import { htmlToMarkdown } from "@coding01/docsjs-markdown";

const markdown = htmlToMarkdown("<mark>hit</mark>", {
  rules: {
    mark: (el, ctx) => `==${ctx.convertInline(el)}==`
  }
});
```

## API

### Main Entry: `@coding01/docsjs-markdown`

- `htmlToMarkdown(html, options)`
- `htmlToMarkdownWithMeta(html, options)`
- `htmlToGfm(html, options)`
- `htmlToStandardMarkdown(html, options)`
- `generateFrontmatter(meta)`

### Sub Entry: `@coding01/docsjs-markdown/docx`

- `docxToMarkdown(file, options)`
- `docxToMarkdownWithMeta(file, options)`

### Options

- `format`: `"standard" | "gfm"`
- `frontmatter`: boolean
- `metadata`: custom metadata object
- `rules`: custom tag conversion rules
- `includeParseReport`: include docsjs parse report (docx entry)
- `sanitizationProfile`: `"fidelity-first" | "strict"` (docx entry)

## CLI

```bash
docsjs-markdown ./input.docx -o ./output.md --frontmatter --include-parse-report
```

Options:

- `-o, --output <file>`
- `-f, --format <gfm|standard>`
- `--frontmatter`
- `--include-parse-report`
- `--strict`
- `-h, --help`

## Development

```bash
npm install
npm run verify
npm run build
```

## Publishing

### Manual

```bash
npm version patch
git push origin main --follow-tags
npm publish --access public
```

### Suggested CI Rule (same as docsjs)

- Trigger by tag: `v*.*.*`
- Run quality gate: `npm run verify`
- Publish package: `npm publish --access public`

### GitHub Packages (repo sidebar "Packages")

- Workflow: `.github/workflows/publish-github-packages.yml`
- Trigger: tag `v*.*.*` or manual run
- Target registry: `https://npm.pkg.github.com`
- Package name for GitHub Packages: `@fanly/docsjs-markdown`

## License

MIT

## Support This Project

If this project saves your time, a small tip is appreciated.

![Support docsjs](https://image.coding01.cn/Coding01%20%E8%B5%9E%E8%B5%8F%E7%A0%81.png)

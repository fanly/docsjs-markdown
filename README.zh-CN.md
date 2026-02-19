# @coding01/docsjs-markdown

面向 docsjs 生态的 Markdown 工具包。
可将 docsjs HTML 快照或 DOCX 文件转换为 Markdown，并支持可扩展规则。

[![npm version](https://img.shields.io/npm/v/@coding01/docsjs-markdown)](https://www.npmjs.com/package/@coding01/docsjs-markdown)
[![npm downloads](https://img.shields.io/npm/dm/@coding01/docsjs-markdown)](https://www.npmjs.com/package/@coding01/docsjs-markdown)
[![License](https://img.shields.io/npm/l/@coding01/docsjs-markdown)](./LICENSE)

---

[English README](./README.md)

## 能力概览

- HTML -> Markdown 主入口：`@coding01/docsjs-markdown`
- DOCX -> Markdown 适配入口：`@coding01/docsjs-markdown/docx`
- 基于规则的转换架构（支持按标签自定义规则）
- 可选 YAML frontmatter 生成
- CLI 支持直接 `.docx -> .md`

## 重点推荐：@coding01/docsjs

推荐与 `@coding01/docsjs` 配套使用：先用 docsjs 高保真导入 Word/DOCX，再将 HTML 快照交给 `@coding01/docsjs-markdown` 输出 Markdown。

- npm: https://www.npmjs.com/package/@coding01/docsjs
- GitHub: https://github.com/fanly/docsjs
- 产品页: https://docsjs.coding01.cn/

## 单页模板规范

为了让 docsjs 生态插件页保持统一结构，单页遵循同一模板规范：

- 规范文件：`docs/LANDING_TEMPLATE.md`
- 实际页面：`docs/index.html`

## 安装

```bash
npm i @coding01/docsjs-markdown
```

## 快速开始

### HTML 转 Markdown

```ts
import { htmlToGfm, htmlToStandardMarkdown } from "@coding01/docsjs-markdown";

const html = "<h1>Hello</h1><p>World</p>";
const gfm = htmlToGfm(html);
const standard = htmlToStandardMarkdown(html);
```

### DOCX 转 Markdown

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

### 自定义规则

```ts
import { htmlToMarkdown } from "@coding01/docsjs-markdown";

const markdown = htmlToMarkdown("<mark>hit</mark>", {
  rules: {
    mark: (el, ctx) => `==${ctx.convertInline(el)}==`
  }
});
```

## API

### 主入口：`@coding01/docsjs-markdown`

- `htmlToMarkdown(html, options)`
- `htmlToMarkdownWithMeta(html, options)`
- `htmlToGfm(html, options)`
- `htmlToStandardMarkdown(html, options)`
- `generateFrontmatter(meta)`

### 子入口：`@coding01/docsjs-markdown/docx`

- `docxToMarkdown(file, options)`
- `docxToMarkdownWithMeta(file, options)`

### 配置项

- `format`: `"standard" | "gfm"`
- `frontmatter`: boolean
- `metadata`: 自定义元数据
- `rules`: 自定义标签转换规则
- `includeParseReport`: 是否返回 docsjs 解析报告（docx 入口）
- `sanitizationProfile`: `"fidelity-first" | "strict"`（docx 入口）

## CLI

```bash
docsjs-markdown ./input.docx -o ./output.md --frontmatter --include-parse-report
```

可用参数：

- `-o, --output <file>`
- `-f, --format <gfm|standard>`
- `--frontmatter`
- `--include-parse-report`
- `--strict`
- `-h, --help`

## 开发

```bash
npm install
npm run verify
npm run build
```

## 发布规则

### 手动发布

```bash
npm version patch
git push origin main --follow-tags
npm publish --access public
```

### 建议 CI 规则（与 docsjs 一致）

- 触发条件：tag `v*.*.*`
- 质量门：`npm run verify`
- 发包：`npm publish --access public`

### GitHub Packages（仓库侧边栏 Packages）

- 工作流：`.github/workflows/publish-github-packages.yml`
- 触发条件：tag `v*.*.*` 或手动触发
- 目标仓库：`https://npm.pkg.github.com`
- GitHub Packages 包名：`@fanly/docsjs-markdown`

## License

MIT

## 打赏支持

如果这个项目帮你节省了时间，欢迎打赏支持。

![支持 docsjs](https://image.coding01.cn/Coding01%20%E8%B5%9E%E8%B5%8F%E7%A0%81.png)

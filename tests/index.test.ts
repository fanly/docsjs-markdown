import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateFrontmatter, htmlToGfm, htmlToMarkdown, htmlToStandardMarkdown } from "../src/index";
import { docxToMarkdown, docxToMarkdownWithMeta } from "../src/docx";

vi.mock("@coding01/docsjs", () => ({
  parseDocxToHtmlSnapshotWithReport: vi.fn()
}));

import { parseDocxToHtmlSnapshotWithReport } from "@coding01/docsjs";

describe("htmlToMarkdown", () => {
  it("should convert simple paragraph", () => {
    const html = "<p>Hello World</p>";
    const md = htmlToMarkdown(html);
    expect(md).toBe("Hello World\n");
  });

  it("should convert headings", () => {
    const html = "<h1>Title</h1><h2>Subtitle</h2>";
    const md = htmlToMarkdown(html);
    expect(md).toContain("# Title");
    expect(md).toContain("## Subtitle");
  });

  it("should convert bold and italic", () => {
    const html = "<p><strong>bold</strong> and <em>italic</em></p>";
    const md = htmlToMarkdown(html);
    expect(md).toContain("**bold**");
    expect(md).toContain("*italic*");
  });

  it("should convert links", () => {
    const html = '<p><a href="https://example.com">Link</a></p>';
    const md = htmlToMarkdown(html);
    expect(md).toContain("[Link](https://example.com)");
  });

  it("should convert images", () => {
    const html = '<img src="image.png" alt="Alt text" />';
    const md = htmlToMarkdown(html);
    expect(md).toContain("![Alt text](image.png)");
  });

  it("should convert unordered list", () => {
    const html = "<ul><li>Item 1</li><li>Item 2</li></ul>";
    const md = htmlToMarkdown(html);
    expect(md).toContain("- Item 1");
    expect(md).toContain("- Item 2");
  });

  it("should convert ordered list", () => {
    const html = "<ol><li>First</li><li>Second</li></ol>";
    const md = htmlToMarkdown(html);
    expect(md).toContain("1. First");
    expect(md).toContain("2. Second");
  });

  it("should convert blockquote", () => {
    const html = "<blockquote>Quote text</blockquote>";
    const md = htmlToMarkdown(html);
    expect(md).toContain("> Quote text");
  });

  it("should convert code block", () => {
    const html = "<pre><code>const x = 1;</code></pre>";
    const md = htmlToMarkdown(html);
    expect(md).toContain("```");
    expect(md).toContain("const x = 1;");
  });

  it("should convert horizontal rule", () => {
    const html = "<hr/>";
    const md = htmlToMarkdown(html);
    expect(md).toContain("---");
  });
});

describe("htmlToGfm", () => {
  it("should convert task lists", () => {
    const html = '<ul><li><input type="checkbox" checked/> Done</li><li><input type="checkbox"/> Todo</li></ul>';
    const md = htmlToGfm(html);
    expect(md).toContain("- [x] Done");
    expect(md).toContain("- [ ] Todo");
  });

  it("should convert tables", () => {
    const html = "<table><tr><th>Header</th></tr><tr><td>Cell</td></tr></table>";
    const md = htmlToGfm(html);
    expect(md).toContain("|");
    expect(md).toContain("---");
  });

  it("should convert strikethrough", () => {
    const html = "<p><del>Deleted</del></p>";
    const md = htmlToGfm(html);
    expect(md).toContain("~~Deleted~~");
  });
});

describe("htmlToStandardMarkdown", () => {
  it("should not convert GFM-specific elements", () => {
    const html = "<table><tr><td>Cell</td></tr></table>";
    const md = htmlToStandardMarkdown(html);
    expect(md).toContain("```");
    expect(md).not.toContain("| Cell");
  });
});

describe("docxToMarkdown", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("converts docx by calling docsjs parse api", async () => {
    vi.mocked(parseDocxToHtmlSnapshotWithReport).mockResolvedValue({
      htmlSnapshot: "<h1>Hello</h1><p>World</p>",
      report: {
        elapsedMs: 5,
        features: {
          hyperlinkCount: 0,
          anchorImageCount: 0,
          chartCount: 0,
          smartArtCount: 0,
          ommlCount: 0,
          tableCount: 0,
          footnoteRefCount: 0,
          endnoteRefCount: 0,
          commentRefCount: 0,
          revisionCount: 0,
          pageBreakCount: 0,
          bookmarkCount: 0,
          fieldCount: 0,
          crossRefCount: 0,
          sdtCount: 0,
          shapeCount: 0,
          oleCount: 0,
          watermarkCount: 0,
          headerCount: 0,
          footerCount: 0
        }
      }
    });

    const file = { name: "test.docx", arrayBuffer: async () => new ArrayBuffer(0) } as unknown as File;
    const md = await docxToMarkdown(file);

    expect(parseDocxToHtmlSnapshotWithReport).toHaveBeenCalledOnce();
    expect(md).toContain("# Hello");
    expect(md).toContain("World");
  });

  it("returns parse report when includeParseReport is enabled", async () => {
    vi.mocked(parseDocxToHtmlSnapshotWithReport).mockResolvedValue({
      htmlSnapshot: "<h1>Doc</h1><p>Body</p>",
      report: {
        elapsedMs: 12,
        features: {
          hyperlinkCount: 0,
          anchorImageCount: 0,
          chartCount: 0,
          smartArtCount: 0,
          ommlCount: 0,
          tableCount: 0,
          footnoteRefCount: 0,
          endnoteRefCount: 0,
          commentRefCount: 0,
          revisionCount: 0,
          pageBreakCount: 0,
          bookmarkCount: 0,
          fieldCount: 0,
          crossRefCount: 0,
          sdtCount: 0,
          shapeCount: 0,
          oleCount: 0,
          watermarkCount: 0,
          headerCount: 0,
          footerCount: 0
        }
      }
    });

    const file = { name: "test.docx", arrayBuffer: async () => new ArrayBuffer(0) } as unknown as File;
    const result = await docxToMarkdownWithMeta(file, { includeParseReport: true, frontmatter: true });

    expect(parseDocxToHtmlSnapshotWithReport).toHaveBeenCalledOnce();
    expect(result.parseReport?.elapsedMs).toBe(12);
    expect(result.frontmatter?.title).toBe("Doc");
  });
});

describe("generateFrontmatter", () => {
  it("should generate frontmatter with string values", () => {
    const meta = { title: "My Document", author: "John" };
    const fm = generateFrontmatter(meta);
    expect(fm).toContain('title: "My Document"');
    expect(fm).toContain('author: "John"');
  });

  it("should generate frontmatter with number values", () => {
    const meta = { wordCount: 500 };
    const fm = generateFrontmatter(meta);
    expect(fm).toContain("wordCount: 500");
  });

  it("should generate frontmatter with array values", () => {
    const meta = { tags: ["docx", "markdown"] };
    const fm = generateFrontmatter(meta);
    expect(fm).toContain("tags:");
    expect(fm).toContain('- "docx"');
  });

  it("should return empty string for empty metadata", () => {
    const fm = generateFrontmatter({});
    expect(fm).toBe("");
  });
});

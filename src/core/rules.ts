import type { MarkdownTagRuleMap, MarkdownRuleContext } from "../types";

export function createDefaultRules(): MarkdownTagRuleMap {
  return {
    h1: (el, ctx) => `\n# ${ctx.convertInline(el)}\n\n`,
    h2: (el, ctx) => `\n## ${ctx.convertInline(el)}\n\n`,
    h3: (el, ctx) => `\n### ${ctx.convertInline(el)}\n\n`,
    p: (el, ctx) => `${ctx.convertInline(el)}\n\n`,
    br: () => "\n",
    hr: () => "\n---\n\n",
    blockquote: (el, ctx) => {
      const text = ctx.convertChildren(el).trim();
      if (!text) return "";
      const lines = text.split("\n");
      return "\n" + lines.map((line) => `> ${line}`).join("\n") + "\n\n";
    },
    ul: (el, ctx) => convertList(el, ctx, false),
    ol: (el, ctx) => convertList(el, ctx, true),
    table: (el, ctx) => convertTable(el, ctx),
    pre: (el) => {
      const code = el.textContent ?? "";
      const lang = el.getAttribute("data-lang") ?? "";
      return `\n\`\`\`${lang}\n${code}\n\`\`\`\n\n`;
    },
    figure: (el) => {
      const img = el.querySelector("img");
      const caption = el.querySelector("figcaption");

      let result = "";
      if (img) {
        const src = img.getAttribute("src") ?? "";
        const alt = img.getAttribute("alt") ?? "image";
        result += `![${alt}](${src})`;
      }
      if (caption) {
        result += `\n*${caption.textContent?.trim() ?? ""}*`;
      }
      return result + "\n\n";
    },
    img: (el) => {
      const src = el.getAttribute("src") ?? "";
      const alt = el.getAttribute("alt") ?? "image";
      return `![${alt}](${src})\n\n`;
    },
    section: (el, ctx) => {
      if (el.getAttribute("data-word-footnotes")) {
        const items = el.querySelectorAll("li");
        if (items.length === 0) return "";

        let result = "\n## References\n\n";
        for (const item of Array.from(items)) {
          const id = item.getAttribute("data-word-footnote-id") ?? "";
          const text = item.textContent?.trim() ?? "";
          result += `[^${id}]: ${text.replace(/^\[\d+\]\s*/, "")}\n`;
        }
        return result + "\n";
      }
      return ctx.convertChildren(el);
    }
  };
}

export function convertInline(element: Element, context: MarkdownRuleContext): string {
  let result = "";

  for (const child of Array.from(element.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      result += context.escapeMarkdown(child.textContent ?? "");
      continue;
    }

    if (child.nodeType !== Node.ELEMENT_NODE) continue;

    const childEl = child as Element;
    const tagName = childEl.tagName.toLowerCase();

    switch (tagName) {
      case "strong":
      case "b":
        result += `**${convertInline(childEl, context)}**`;
        break;
      case "em":
      case "i":
        result += `*${convertInline(childEl, context)}*`;
        break;
      case "code":
        result += `\`${childEl.textContent ?? ""}\``;
        break;
      case "a": {
        const href = childEl.getAttribute("href") ?? "";
        const text = convertInline(childEl, context) || (childEl.textContent ?? "");
        result += `[${text}](${href})`;
        break;
      }
      case "img": {
        const src = childEl.getAttribute("src") ?? "";
        const alt = childEl.getAttribute("alt") ?? "image";
        result += `![${alt}](${src})`;
        break;
      }
      case "s":
      case "strike":
      case "del":
        if (context.format === "gfm") {
          result += `~~${convertInline(childEl, context)}~~`;
        } else {
          result += convertInline(childEl, context);
        }
        break;
      case "sup":
        result += `^${convertInline(childEl, context)}`;
        break;
      default:
        result += convertInline(childEl, context);
    }
  }

  return result;
}

export function escapeMarkdown(text: string): string {
  if (!text) return "";
  return text
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\*/g, "\\*")
    .replace(/_/g, "\\_")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/#/g, "\\#")
    .replace(/-/g, "\\-");
}

function convertList(element: Element, context: MarkdownRuleContext, ordered: boolean): string {
  const items = Array.from(element.children).filter((child) => child.tagName.toLowerCase() === "li");
  if (items.length === 0) return "\n";

  let startIndex = 1;
  if (ordered) {
    const startAttr = element.getAttribute("start");
    if (startAttr) startIndex = Number.parseInt(startAttr, 10) || 1;
  }

  let result = "\n";
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    const checkbox = item.querySelector('input[type="checkbox"]') as HTMLInputElement | null;

    if (checkbox && context.format === "gfm") {
      const clone = item.cloneNode(true) as Element;
      clone.querySelector('input[type="checkbox"]')?.remove();
      const text = context.convertInline(clone).trim();
      result += `- [${checkbox.checked ? "x" : " "}] ${text}\n`;
      continue;
    }

    const text = context.convertInline(item).trim();
    result += ordered ? `${startIndex + i}. ${text}\n` : `- ${text}\n`;
  }

  return result + "\n";
}

function convertTable(element: Element, context: MarkdownRuleContext): string {
  if (context.format !== "gfm") {
    return `\`\`\`\n${element.textContent ?? ""}\n\`\`\`\n\n`;
  }

  const rows = Array.from(element.querySelectorAll("tr"));
  if (rows.length === 0) return "";

  const cells = rows.map((row) =>
    Array.from(row.querySelectorAll("th, td")).map((cell) => (cell.textContent ?? "").trim().replace(/\n/g, " "))
  );
  if (cells.length === 0) return "";

  const colWidths = cells[0].map((_, colIdx) => Math.max(...cells.map((row) => (row[colIdx] ?? "").length), 3));

  const formatRow = (row: string[]) =>
    "| " +
    row
      .map((cell, i) => {
        const padded = cell.padEnd(colWidths[i], " ");
        return padded.slice(0, colWidths[i]);
      })
      .join(" | ") +
    " |";

  let result = "\n";
  result += formatRow(cells[0]) + "\n";
  result += "| " + colWidths.map((w) => "-".repeat(w)).join(" | ") + " |\n";

  for (let i = 1; i < cells.length; i += 1) {
    result += formatRow(cells[i]) + "\n";
  }

  return result + "\n";
}

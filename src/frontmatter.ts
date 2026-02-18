export function generateFrontmatter(meta: Record<string, unknown>): string {
  const entries = Object.entries(meta).filter(([, value]) => value !== undefined && value !== null);
  if (entries.length === 0) return "";

  const lines: string[] = ["---"];
  for (const [key, value] of entries) {
    if (typeof value === "string") {
      lines.push(`${key}: "${value.replace(/"/g, "\\\"")}"`);
      continue;
    }
    if (typeof value === "number" || typeof value === "boolean") {
      lines.push(`${key}: ${value}`);
      continue;
    }
    if (Array.isArray(value)) {
      lines.push(`${key}:`);
      for (const item of value) {
        if (typeof item === "string") {
          lines.push(`  - "${item.replace(/"/g, "\\\"")}"`);
        } else {
          lines.push(`  - ${JSON.stringify(item)}`);
        }
      }
      continue;
    }
    if (typeof value === "object" && value !== null) {
      lines.push(`${key}:`);
      for (const [subKey, subValue] of Object.entries(value)) {
        if (typeof subValue === "string") {
          lines.push(`  ${subKey}: "${subValue.replace(/"/g, "\\\"")}"`);
        } else {
          lines.push(`  ${subKey}: ${JSON.stringify(subValue)}`);
        }
      }
    }
  }

  lines.push("---", "");
  return lines.join("\n");
}

export function extractMetadata(doc: Document, customMeta?: Record<string, unknown>): Record<string, unknown> {
  const meta: Record<string, unknown> = {};

  const titleEl = doc.querySelector("h1");
  if (titleEl) {
    meta.title = titleEl.textContent?.trim() ?? "";
  }

  const descEl = doc.querySelector("h1 + p, h2 + p, h3 + p");
  if (descEl) {
    const text = descEl.textContent?.trim() ?? "";
    if (text.length > 0 && text.length < 200) {
      meta.description = text;
    }
  }

  const textContent = doc.body?.textContent ?? "";
  const words = textContent.split(/\s+/).filter((word) => word.length > 0).length;
  meta.wordCount = words;

  meta.paragraphCount = doc.querySelectorAll("p").length;

  const tableCount = doc.querySelectorAll("table").length;
  if (tableCount > 0) meta.tableCount = tableCount;

  const imageCount = doc.querySelectorAll("img").length;
  if (imageCount > 0) meta.imageCount = imageCount;

  if (customMeta) Object.assign(meta, customMeta);
  return meta;
}

import { convertHtmlDocument } from "./core/engine";
import { extractMetadata } from "./frontmatter";
import type { MarkdownOptions, MarkdownResult } from "./types";

export function htmlToMarkdown(htmlSnapshot: string, options: MarkdownOptions = {}): string {
  return htmlToMarkdownWithMeta(htmlSnapshot, options).markdown;
}

export function htmlToMarkdownWithMeta(htmlSnapshot: string, options: MarkdownOptions = {}): MarkdownResult {
  const format = options.format ?? "gfm";
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlSnapshot, "text/html");

  const frontmatter = options.frontmatter ? extractMetadata(doc, options.metadata) : undefined;
  const markdown = convertHtmlDocument(doc, format, options.rules);

  return frontmatter ? { markdown, frontmatter } : { markdown };
}

export function htmlToGfm(htmlSnapshot: string, options: Omit<MarkdownOptions, "format"> = {}): string {
  return htmlToMarkdown(htmlSnapshot, { ...options, format: "gfm" });
}

export function htmlToStandardMarkdown(htmlSnapshot: string, options: Omit<MarkdownOptions, "format"> = {}): string {
  return htmlToMarkdown(htmlSnapshot, { ...options, format: "standard" });
}

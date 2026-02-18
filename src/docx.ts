import type { DocxParseReport } from "@coding01/docsjs";
import { htmlToMarkdownWithMeta } from "./html";
import type { MarkdownOptions, MarkdownResult } from "./types";

export interface DocxToMarkdownOptions extends MarkdownOptions {
  includeParseReport?: boolean;
  enablePlugins?: boolean;
  sanitizationProfile?: "fidelity-first" | "strict";
}

export interface DocxMarkdownResult extends MarkdownResult {
  parseReport?: DocxParseReport;
}

export async function docxToMarkdown(file: File, options: DocxToMarkdownOptions = {}): Promise<string> {
  const result = await docxToMarkdownWithMeta(file, options);
  return result.markdown;
}

export async function docxToMarkdownWithMeta(
  file: File,
  options: DocxToMarkdownOptions = {}
): Promise<DocxMarkdownResult> {
  const { parseDocxToHtmlSnapshotWithReport } = await import("@coding01/docsjs");

  const parsed = await parseDocxToHtmlSnapshotWithReport(file, {
    enablePlugins: options.enablePlugins,
    sanitizationProfile: options.sanitizationProfile
  });

  const converted = htmlToMarkdownWithMeta(parsed.htmlSnapshot, options);

  if (options.includeParseReport) {
    return {
      ...converted,
      parseReport: parsed.report
    };
  }

  return converted;
}

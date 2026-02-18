import type { MarkdownFormat, MarkdownTagRuleMap, MarkdownRuleContext } from "../types";
import { convertInline, createDefaultRules, escapeMarkdown } from "./rules";

export function convertHtmlDocument(doc: Document, format: MarkdownFormat, overrides?: Partial<MarkdownTagRuleMap>): string {
  const rules: Partial<MarkdownTagRuleMap> = {
    ...createDefaultRules(),
    ...(overrides ?? {})
  };

  const context: MarkdownRuleContext = {
    format,
    convertNode,
    convertChildren,
    convertInline: (element: Element) => convertInline(element, context),
    escapeMarkdown
  };

  function convertNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return escapeMarkdown(node.textContent ?? "");
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return "";

    const element = node as Element;
    const tagName = element.tagName.toLowerCase();
    const rule = rules[tagName];

    if (rule) return rule(element, context);
    return convertChildren(element);
  }

  function convertChildren(element: Element): string {
    return Array.from(element.childNodes)
      .map((child) => convertNode(child))
      .join("");
  }

  return convertChildren(doc.body).replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}

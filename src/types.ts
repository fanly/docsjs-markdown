export type MarkdownFormat = "standard" | "gfm";

export type MarkdownTagRule = (element: Element, context: MarkdownRuleContext) => string;

export interface MarkdownRuleContext {
  format: MarkdownFormat;
  convertNode: (node: Node) => string;
  convertChildren: (element: Element) => string;
  convertInline: (element: Element) => string;
  escapeMarkdown: (text: string) => string;
}

export type MarkdownTagRuleMap = Record<string, MarkdownTagRule>;

export interface MarkdownOptions {
  format?: MarkdownFormat;
  frontmatter?: boolean;
  metadata?: Record<string, unknown>;
  rules?: Partial<MarkdownTagRuleMap>;
}

export interface MarkdownResult {
  markdown: string;
  frontmatter?: Record<string, unknown>;
}

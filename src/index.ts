export interface MarkdownOptions {
  format?: 'standard' | 'gfm';
  frontmatter?: boolean;
  metadata?: Record<string, unknown>;
}

export interface MarkdownResult {
  markdown: string;
  frontmatter?: Record<string, unknown>;
}

export function htmlToMarkdown(htmlSnapshot: string, options: MarkdownOptions = {}): string {
  const format = options.format ?? 'gfm';
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlSnapshot, 'text/html');
  
  let frontmatter: Record<string, unknown> = {};
  if (options.frontmatter) {
    frontmatter = extractMetadata(doc, options.metadata);
  }
  
  const md = convertNode(doc.body, format);
  return md;
}

export function htmlToMarkdownWithMeta(htmlSnapshot: string, options: MarkdownOptions = {}): MarkdownResult {
  const format = options.format ?? 'gfm';
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlSnapshot, 'text/html');
  
  let frontmatter: Record<string, unknown> = {};
  if (options.frontmatter) {
    frontmatter = extractMetadata(doc, options.metadata);
  }
  
  const md = convertNode(doc.body, format);
  
  return { markdown: md, frontmatter };
}

export function htmlToGfm(htmlSnapshot: string, options: Omit<MarkdownOptions, 'format'> = {}): string {
  return htmlToMarkdown(htmlSnapshot, { ...options, format: 'gfm' });
}

export function htmlToStandardMarkdown(htmlSnapshot: string, options: Omit<MarkdownOptions, 'format'> = {}): string {
  return htmlToMarkdown(htmlSnapshot, { ...options, format: 'standard' });
}

export function generateFrontmatter(meta: Record<string, unknown>): string {
  const entries = Object.entries(meta).filter(([_, v]) => v !== undefined && v !== null);
  if (entries.length === 0) return '';
  
  const lines: string[] = ['---'];
  for (const [key, value] of entries) {
    if (typeof value === 'string') {
      lines.push(`${key}: "${value.replace(/"/g, '\\"')}"`);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      lines.push(`${key}: ${value}`);
    } else if (Array.isArray(value)) {
      lines.push(`${key}:`);
      for (const item of value) {
        if (typeof item === 'string') {
          lines.push(`  - "${item.replace(/"/g, '\\"')}"`);
        } else {
          lines.push(`  - ${JSON.stringify(item)}`);
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      lines.push(`${key}:`);
      for (const [subKey, subVal] of Object.entries(value)) {
        if (typeof subVal === 'string') {
          lines.push(`  ${subKey}: "${subVal.replace(/"/g, '\\"')}"`);
        } else {
          lines.push(`  ${subKey}: ${JSON.stringify(subVal)}`);
        }
      }
    }
  }
  lines.push('---');
  lines.push('');
  
  return lines.join('\n');
}

function extractMetadata(doc: Document, customMeta?: Record<string, unknown>): Record<string, unknown> {
  const meta: Record<string, unknown> = {};
  
  const titleEl = doc.querySelector('h1');
  if (titleEl) {
    meta.title = titleEl.textContent?.trim() ?? '';
  }
  
  const descEl = doc.querySelector('h1 + p, h2 + p, h3 + p');
  if (descEl) {
    const text = descEl.textContent?.trim() ?? '';
    if (text.length > 0 && text.length < 200) {
      meta.description = text;
    }
  }
  
  const textContent = doc.body?.textContent ?? '';
  const words = textContent.split(/\s+/).filter(w => w.length > 0).length;
  meta.wordCount = words;
  
  const pCount = doc.querySelectorAll('p').length;
  meta.paragraphCount = pCount;
  
  const tableCount = doc.querySelectorAll('table').length;
  if (tableCount > 0) {
    meta.tableCount = tableCount;
  }
  
  const imgCount = doc.querySelectorAll('img').length;
  if (imgCount > 0) {
    meta.imageCount = imgCount;
  }
  
  if (customMeta) {
    Object.assign(meta, customMeta);
  }
  
  return meta;
}

function convertNode(node: Node, format: 'standard' | 'gfm'): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return escapeMarkdown(node.textContent ?? '');
  }
  
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }
  
  const el = node as Element;
  const tagName = el.tagName.toLowerCase();
  
  switch (tagName) {
    case 'h1':
      return `\n# ${convertChildren(el, format)}\n\n`;
    case 'h2':
      return `\n## ${convertChildren(el, format)}\n\n`;
    case 'h3':
      return `\n### ${convertChildren(el, format)}\n\n`;
    case 'p':
      return `${convertChildren(el, format)}\n\n`;
    case 'br':
      return '\n';
    case 'hr':
      return '\n---\n\n';
    case 'blockquote':
      return convertBlockquote(el, format);
    case 'ul':
      return convertList(el, format, 'ul');
    case 'ol':
      return convertList(el, format, 'ol');
    case 'table':
      return convertTable(el, format);
    case 'pre':
      return convertPre(el, format);
    case 'figure':
      return convertFigure(el, format);
    case 'img':
      const src = el.getAttribute('src') ?? '';
      const alt = el.getAttribute('alt') ?? 'image';
      return `![${alt}](${src})\n\n`;
    case 'section':
      if (el.getAttribute('data-word-footnotes')) {
        return convertFootnotesSection(el, format);
      }
      return convertChildren(el, format);
    default:
      return convertChildren(el, format);
  }
}

function convertChildren(el: Element, format: 'standard' | 'gfm'): string {
  return Array.from(el.childNodes)
    .map(child => convertNode(child, format))
    .join('');
}

function convertInline(el: Element, format: 'standard' | 'gfm'): string {
  let result = '';
  
  for (const child of Array.from(el.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      result += escapeMarkdown(child.textContent ?? '');
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const childEl = child as Element;
      const tagName = childEl.tagName.toLowerCase();
      
      switch (tagName) {
        case 'strong':
        case 'b':
          result += `**${convertInline(childEl, format)}**`;
          break;
        case 'em':
        case 'i':
          result += `*${convertInline(childEl, format)}*`;
          break;
        case 'code':
          result += `\`${childEl.textContent ?? ''}\``;
          break;
        case 'a':
          const href = childEl.getAttribute('href') ?? '';
          const text = childEl.textContent ?? '';
          result += `[${text}](${href})`;
          break;
        case 'img':
          const src = childEl.getAttribute('src') ?? '';
          const alt = childEl.getAttribute('alt') ?? 'image';
          result += `![${alt}](${src})`;
          break;
        case 's':
        case 'strike':
        case 'del':
          if (format === 'gfm') {
            result += `~~${convertInline(childEl, format)}~~`;
          } else {
            result += convertInline(childEl, format);
          }
          break;
        default:
          result += convertInline(childEl, format);
      }
    }
  }
  
  return result;
}

function convertBlockquote(el: Element, format: 'standard' | 'gfm'): string {
  const text = convertChildren(el, format);
  const lines = text.trim().split('\n');
  return '\n' + lines.map(line => `> ${line}`).join('\n') + '\n\n';
}

function convertList(el: Element, format: 'standard' | 'gfm', listType: 'ul' | 'ol'): string {
  const items = Array.from(el.children).filter(child => (child as Element).tagName.toLowerCase() === 'li');
  let result = '\n';
  
  let startIndex = 1;
  const startAttr = el.getAttribute('start');
  if (startAttr) {
    startIndex = parseInt(startAttr, 10) || 1;
  }
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i] as Element;
    const itemText = convertChildren(item, format).trim();
    
    const checkbox = item.querySelector('input[type="checkbox"]');
    if (checkbox && format === 'gfm') {
      const checked = (checkbox as HTMLInputElement).checked;
      result += `- [${checked ? 'x' : ' '}] ${itemText}\n`;
    } else if (listType === 'ol') {
      result += `${startIndex + i}. ${itemText}\n`;
    } else {
      result += `- ${itemText}\n`;
    }
  }
  
  return result + '\n';
}

function convertTable(el: Element, format: 'standard' | 'gfm'): string {
  if (format !== 'gfm') {
    return `\`\`\`\n${el.textContent ?? ''}\n\`\`\`\n\n`;
  }
  
  const rows = Array.from(el.querySelectorAll('tr'));
  if (rows.length === 0) return '';
  
  const cells = rows.map(row => 
    Array.from(row.querySelectorAll('th, td')).map(cell => 
      (cell.textContent ?? '').trim().replace(/\n/g, ' ')
    )
  );
  
  if (cells.length === 0) return '';
  
  const colWidths = cells[0].map((_, colIdx) => 
    Math.max(...cells.map(row => (row[colIdx] ?? '').length), 3)
  );
  
  const separator = colWidths.map(w => '-'.repeat(w)).join('  ');
  
  const formatRow = (row: string[]) => 
    '| ' + row.map((cell, i) => {
      const padded = cell.padEnd(colWidths[i], ' ');
      return padded.slice(0, colWidths[i]);
    }).join(' | ') + ' |';
  
  let result = '\n';
  result += formatRow(cells[0]) + '\n';
  result += '|' + separator.split('').map(c => c === ' ' ? ' ' : '-').join('') + '|\n';
  
  for (let i = 1; i < cells.length; i++) {
    result += formatRow(cells[i]) + '\n';
  }
  
  return result + '\n';
}

function convertPre(el: Element, format: 'standard' | 'gfm'): string {
  const code = el.textContent ?? '';
  const lang = el.getAttribute('data-lang') ?? '';
  return `\n\`\`\`${lang}\n${code}\n\`\`\`\n\n`;
}

function convertFigure(el: Element, format: 'standard' | 'gfm'): string {
  const img = el.querySelector('img');
  const caption = el.querySelector('figcaption');
  
  let result = '';
  
  if (img) {
    const src = img.getAttribute('src') ?? '';
    const alt = img.getAttribute('alt') ?? 'image';
    result += `![${alt}](${src})`;
  }
  
  if (caption) {
    result += `\n*${caption.textContent?.trim() ?? ''}*`;
  }
  
  return result + '\n\n';
}

function convertFootnotesSection(el: Element, format: 'standard' | 'gfm'): string {
  const items = el.querySelectorAll('li');
  if (items.length === 0) return '';
  
  let result = '\n## References\n\n';
  
  for (const item of Array.from(items)) {
    const id = item.getAttribute('data-word-footnote-id') ?? '';
    const text = item.textContent?.trim() ?? '';
    result += `[^${id}]: ${text.replace(/^\[\d+\]\s*/, '')}\n`;
  }
  
  return result + '\n';
}

function escapeMarkdown(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\*/g, '\\*')
    .replace(/_/g, '\\_')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/#/g, '\\#')
    .replace(/\-/g, '\\-');
}

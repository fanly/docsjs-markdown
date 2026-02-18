#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { JSDOM } from "jsdom";
import { docxToMarkdownWithMeta, type DocxToMarkdownOptions } from "./docx";
import { generateFrontmatter } from "./frontmatter";

type CliFlags = {
  output?: string;
  format?: "standard" | "gfm";
  frontmatter: boolean;
  includeParseReport: boolean;
  strict: boolean;
};

function printHelp(): void {
  process.stdout.write(`docsjs-markdown\n\nUsage:\n  docsjs-markdown <input.docx> [options]\n\nOptions:\n  -o, --output <file>         Output markdown file\n  -f, --format <gfm|standard> Markdown format (default: gfm)\n  --frontmatter               Include YAML frontmatter\n  --include-parse-report      Include docsjs parse report in frontmatter\n  --strict                    Use docsjs strict sanitization profile\n  -h, --help                  Show help\n`);
}

function parseArgs(argv: string[]): { input?: string; flags: CliFlags } {
  const flags: CliFlags = {
    frontmatter: false,
    includeParseReport: false,
    strict: false
  };

  let input: string | undefined;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("-")) {
      input = arg;
      continue;
    }

    if (arg === "-h" || arg === "--help") {
      printHelp();
      process.exit(0);
    }

    if (arg === "--frontmatter") {
      flags.frontmatter = true;
      continue;
    }

    if (arg === "--include-parse-report") {
      flags.includeParseReport = true;
      continue;
    }

    if (arg === "--strict") {
      flags.strict = true;
      continue;
    }

    if (arg === "-o" || arg === "--output") {
      flags.output = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === "-f" || arg === "--format") {
      const next = argv[i + 1];
      if (next === "gfm" || next === "standard") {
        flags.format = next;
      }
      i += 1;
    }
  }

  return { input, flags };
}

async function main(): Promise<void> {
  if (typeof DOMParser === "undefined") {
    const dom = new JSDOM("");
    (globalThis as { DOMParser?: typeof dom.window.DOMParser }).DOMParser = dom.window.DOMParser;
  }

  const { input, flags } = parseArgs(process.argv.slice(2));
  if (!input) {
    printHelp();
    process.exit(1);
  }

  const absInput = resolve(process.cwd(), input);
  const data = await readFile(absInput);

  const file = {
    name: basename(absInput),
    arrayBuffer: async () => data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
  } as unknown as File;

  const options: DocxToMarkdownOptions = {
    format: flags.format,
    frontmatter: flags.frontmatter,
    includeParseReport: flags.includeParseReport,
    sanitizationProfile: flags.strict ? "strict" : "fidelity-first"
  };

  const converted = await docxToMarkdownWithMeta(file, options);

  let output = converted.markdown;
  if (flags.frontmatter && converted.frontmatter) {
    const frontmatter = {
      ...converted.frontmatter,
      ...(converted.parseReport ? { parseReport: converted.parseReport } : {})
    };
    output = `${generateFrontmatter(frontmatter)}${converted.markdown}`;
  }

  if (flags.output) {
    const absOutput = resolve(process.cwd(), flags.output);
    await writeFile(absOutput, output, "utf8");
    process.stdout.write(`Wrote markdown to ${absOutput}\n`);
    return;
  }

  process.stdout.write(output);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`docsjs-markdown error: ${message}\n`);
  process.exit(1);
});

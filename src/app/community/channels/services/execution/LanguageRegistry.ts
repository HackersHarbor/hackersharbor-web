export type SupportedLanguage =
  | "python"
  | "javascript"
  | "typescript"
  | "html"
  | "css"
  | "json"
  | "sql"
  | "java"
  | "c"
  | "cpp";

const aliases: Record<string, SupportedLanguage> = {
  py: "python",
  python: "python",

  js: "javascript",
  javascript: "javascript",

  ts: "typescript",
  typescript: "typescript",

  html: "html",
  htm: "html",

  css: "css",

  json: "json",

  sql: "sql",

  java: "java",

  c: "c",
  h: "c",

  cpp: "cpp",
  "c++": "cpp",
  cxx: "cpp",
  "c plus plus": "cpp",
};

export function normalizeLanguage(
  language: string,
): SupportedLanguage {
  const normalized = language.trim().toLowerCase();

  return aliases[normalized] ?? "javascript";
}
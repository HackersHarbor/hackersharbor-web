export const LANGUAGE_ALIASES: Record<string, string> = {
  js: "javascript",
  jsx: "javascript",

  ts: "typescript",
  tsx: "typescript",

  py: "python",

  sh: "bash",
  shell: "bash",

  "c++": "cpp",
  cc: "cpp",
  hpp: "cpp",

  cs: "csharp",
  "c#": "csharp",

  yml: "yaml",
};

export function normalizeLanguage(language: string): string {
  const normalized = language.trim().toLowerCase();

  return LANGUAGE_ALIASES[normalized] ?? normalized;
}

"use client";

import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  FileCode2,
  Play,
  Plus,
  Terminal,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import type { CodeBlock } from "../types/message";

interface CodeMessageProps {
  code: CodeBlock;
}

type PlaygroundTab = "terminal" | "logs";

export function CodeMessage({
  code,
}: CodeMessageProps) {
  const [copied, setCopied] = useState(false);
  const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] =
    useState<PlaygroundTab>("terminal");

  const [editorCode, setEditorCode] = useState(code.code);

  const [runOutput, setRunOutput] = useState("");
  const [runExitCode, setRunExitCode] = useState<number | null>(null);
  const [hasRun, setHasRun] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [editorFocused, setEditorFocused] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);

  type Suggestion = {
    value: string;
    detail: string;
    kind: string;
  };

  const suggestions = useMemo<Suggestion[]>(() => {
    const language = code.language.toLowerCase();
    const currentLine = editorCode.split("\n").pop() ?? "";
    const trimmed = currentLine.trimStart();
    const match = trimmed.match(/([A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)?\.?)$/);
    const token = match?.[1]?.toLowerCase() ?? "";

    const python: Suggestion[] = [
      { value: "print", detail: "function", kind: "ƒ" },
      { value: "input", detail: "function", kind: "ƒ" },
      { value: "len", detail: "function", kind: "ƒ" },
      { value: "range", detail: "function", kind: "ƒ" },
      { value: "def", detail: "keyword", kind: "~" },
      { value: "for", detail: "keyword", kind: "~" },
      { value: "while", detail: "keyword", kind: "~" },
    ];

    const pythonListMethods: Suggestion[] = [
      { value: "append", detail: "list method", kind: "▸" },
      { value: "extend", detail: "list method", kind: "▸" },
      { value: "insert", detail: "list method", kind: "▸" },
      { value: "pop", detail: "list method", kind: "▸" },
      { value: "remove", detail: "list method", kind: "▸" },
      { value: "sort", detail: "list method", kind: "▸" },
    ];

    const javascript: Suggestion[] = [
      { value: "console.log", detail: "function", kind: "ƒ" },
      { value: "console.error", detail: "function", kind: "ƒ" },
      { value: "console.warn", detail: "function", kind: "ƒ" },
      { value: "const", detail: "keyword", kind: "~" },
      { value: "let", detail: "keyword", kind: "~" },
      { value: "function", detail: "keyword", kind: "~" },
      { value: "map", detail: "array method", kind: "▸" },
      { value: "filter", detail: "array method", kind: "▸" },
    ];

    const typescript: Suggestion[] = [
      ...javascript,
      { value: "interface", detail: "keyword", kind: "~" },
      { value: "type", detail: "keyword", kind: "~" },
      { value: "Promise", detail: "type", kind: "T" },
    ];

    const sql: Suggestion[] = [
      { value: "SELECT", detail: "statement", kind: "▸" },
      { value: "FROM", detail: "clause", kind: "▸" },
      { value: "WHERE", detail: "clause", kind: "▸" },
      { value: "INNER JOIN", detail: "clause", kind: "▸" },
      { value: "LEFT JOIN", detail: "clause", kind: "▸" },
      { value: "GROUP BY", detail: "clause", kind: "▸" },
      { value: "ORDER BY", detail: "clause", kind: "▸" },
      { value: "LIMIT", detail: "clause", kind: "▸" },
    ];

    let pool: Suggestion[] = [];

    if (language === "python" || language === "py") {
      pool = token.includes(".") ? pythonListMethods : python;
    } else if (language === "javascript" || language === "js") {
      pool = javascript;
    } else if (language === "typescript" || language === "ts") {
      pool = typescript;
    } else if (language === "sql") {
      pool = sql;
    }

    if (!token) return [];

    const query = token.split(".").pop() ?? token;
    return pool
      .filter((item) => {
        const candidate = item.value.toLowerCase();
        return candidate.startsWith(query) || candidate.includes(query);
      })
      .slice(0, 6);
  }, [code.language, editorCode]);

  const activeSuggestions = editorFocused ? suggestions : [];

  const insertSuggestion = (suggestion: Suggestion) => {
    setEditorCode((current) => {
      const lines = current.split("\n");
      const last = lines.length - 1;
      const line = lines[last] ?? "";
      const match = line.match(/^(.*?)([A-Za-z_][A-Za-z0-9_]*)$/);

      if (!match) {
        lines[last] = `${line}${suggestion.value}`;
      } else {
        lines[last] = `${match[1]}${suggestion.value}`;
      }

      return lines.join("\n");
    });

    setHasRun(false);
    setRunOutput("");
    setRunExitCode(null);
    setSuggestionIndex(0);
  };

  const evaluateSimpleCode = (source: string) => {
    const language = code.language.toLowerCase();
    const trimmed = source.trim();

    if (!trimmed) {
      return { output: "", exitCode: 0 };
    }

    if (language === "python" || language === "py") {
      const variables = new Map<string, string>();
      const output: string[] = [];

      for (const rawLine of source.split("\n")) {
        const line = rawLine.trim();
        if (!line || line.startsWith("#")) continue;

        const assignment = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/);
        if (assignment) {
          variables.set(assignment[1], assignment[2]);
          continue;
        }

        const printMatch = line.match(/^print\((.*)\)\s*$/);
        if (printMatch) {
          let value = printMatch[1].trim();
          if (variables.has(value)) value = variables.get(value)!;
          value = value.replace(/^(["'])(.*)\1$/, "$2");
          value = value.replace(/\[([^\]]*)\]/g, (_m, inner: string) => `[${inner}]`);
          output.push(value);
          continue;
        }

        const appendMatch = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\.append\((.*)\)$/);
        if (appendMatch && variables.has(appendMatch[1])) {
          const current = variables.get(appendMatch[1])!;
          const inner = current.replace(/^\[(.*)\]$/, "$1");
          variables.set(appendMatch[1], `[${inner}${inner ? ", " : ""}${appendMatch[2]}]`);
          continue;
        }

        return {
          output: `Unsupported local Python statement: ${line}`,
          exitCode: 1,
        };
      }

      return { output: output.join("\n"), exitCode: 0 };
    }

    if (language === "javascript" || language === "js" || language === "typescript" || language === "ts") {
      const output: string[] = [];
      for (const rawLine of source.split("\n")) {
        const line = rawLine.trim();
        if (!line || line.startsWith("//")) continue;
        const logMatch = line.match(/^console\.(?:log|info)\((.*)\);?$/);
        if (logMatch) {
          output.push(logMatch[1].trim().replace(/^(["'])(.*)\1$/, "$2"));
          continue;
        }
        return { output: `Unsupported local ${code.language} statement: ${line}`, exitCode: 1 };
      }
      return { output: output.join("\n"), exitCode: 0 };
    }

    if (language === "sql") {
      const match = trimmed.match(/^SELECT\s+(["'])(.*?)\1\s*;?$/i);
      if (match) return { output: match[2], exitCode: 0 };
      const numberMatch = trimmed.match(/^SELECT\s+([0-9]+)\s*;?$/i);
      if (numberMatch) return { output: numberMatch[1], exitCode: 0 };
      return { output: "Local SQL runner supports simple SELECT literals only.", exitCode: 1 };
    }

    return { output: `No local runner is configured for ${code.language}.`, exitCode: 1 };
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editorCode);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      setCopied(false);
    }
  };

  const handleRun = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setActiveTab("terminal");
    setHasRun(false);
    setRunOutput("");
    setRunExitCode(null);

    const startedAt = new Date().toLocaleTimeString();
    setLogs((current) => [
      ...current,
      `[${startedAt}] Starting ${code.language} playground`,
    ]);

    await new Promise((resolve) => window.setTimeout(resolve, 250));

    const result = editorCode.trim() === code.code.trim() && code.output !== undefined
      ? { output: code.output, exitCode: typeof code.exitCode === "number" ? code.exitCode : 0 }
      : evaluateSimpleCode(editorCode);

    setRunOutput(result.output || "Program finished without output.");
    setRunExitCode(result.exitCode);
    setHasRun(true);

    const finishedAt = new Date().toLocaleTimeString();
    setLogs((current) => [
      ...current,
      `[${finishedAt}] Execution completed`,
      `[${finishedAt}] Exit code: ${result.exitCode}`,
    ]);

    setIsRunning(false);
  };

  const handleClosePlayground = () => {
    setIsPlaygroundOpen(false);
  };

  const togglePlayground = () => {
    setIsPlaygroundOpen((current) => !current);
  };

  return (
    <div
      className="
        relative
        mt-3
        overflow-visible
        rounded-xl
        border
        border-white/[0.10]
        bg-[#080a0d]/70
        shadow-[0_12px_35px_rgba(0,0,0,.22)]
        backdrop-blur-2xl
      "
    >
      {/* =========================================================
          CODE HEADER
          ========================================================= */}

      <div
        className="
          flex
          h-9
          items-center
          justify-between
          border-b
          border-white/[0.07]
          bg-white/[0.025]
          px-3
        "
      >
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="
              flex
              h-5
              w-5
              shrink-0
              items-center
              justify-center
              rounded-md
              bg-white/[0.06]
              text-white/45
            "
          >
            <FileCode2 size={11} />
          </span>

          <span
            className="
              truncate
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.12em]
              text-white/45
            "
          >
            {code.language}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Run */}

          <button
            type="button"
            onClick={handleRun}
            disabled={isRunning}
            className="
              flex
              h-6
              items-center
              gap-1.5
              rounded-md
              px-2
              text-[9px]
              font-medium
              text-white/50
              transition
              hover:bg-white/[0.07]
              hover:text-white/85
              disabled:cursor-wait
              disabled:opacity-50
            "
          >
            <Play
              size={10}
              fill="currentColor"
            />

            {isRunning ? "Running" : "Run"}
          </button>

          {/* Playground */}

          <button
            type="button"
            onClick={togglePlayground}
            aria-expanded={isPlaygroundOpen}
            className={[
              `
                flex
                h-6
                items-center
                gap-1.5
                rounded-md
                px-2
                text-[9px]
                font-medium
                transition
              `,
              isPlaygroundOpen
                ? "bg-white/[0.09] text-white/85"
                : "text-white/50 hover:bg-white/[0.07] hover:text-white/85",
            ].join(" ")}
          >
            <Terminal size={10} />

            Playground

            {isPlaygroundOpen ? (
              <ChevronUp size={9} />
            ) : (
              <ChevronDown size={9} />
            )}
          </button>

          {/* Copy */}

          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy code"
            className="
              flex
              h-6
              items-center
              gap-1.5
              rounded-md
              px-2
              text-[9px]
              text-white/35
              transition
              hover:bg-white/[0.06]
              hover:text-white/70
            "
          >
            {copied ? (
              <>
                <Check size={11} />
                Copied
              </>
            ) : (
              <>
                <Copy size={11} />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* =========================================================
          CODE AREA
          ========================================================= */}

      <div className="relative">
        <pre
          className="
            overflow-x-auto
            px-4
            py-3.5
            text-[11px]
            leading-[1.7]
            text-white/75
          "
        >
          <code>{editorCode}</code>
        </pre>

        {/* Small playground trigger */}

        {!isPlaygroundOpen && (
          <button
            type="button"
            onClick={togglePlayground}
            className="
              absolute
              bottom-2
              right-2
              flex
              h-6
              items-center
              gap-1.5
              rounded-md
              border
              border-white/[0.08]
              bg-white/[0.035]
              px-2
              text-[9px]
              text-white/35
              opacity-0
              transition
              hover:bg-white/[0.07]
              hover:text-white/75
              group-hover:opacity-100
            "
          >
            <Terminal size={10} />
            Open Playground
          </button>
        )}
      </div>

      {/* =========================================================
          ORIGINAL OUTPUT
          ========================================================= */}

      {code.output && (
        <div
          className="
            border-t
            border-white/[0.07]
          "
        >
          <div
            className="
              px-4
              py-2
              text-[8px]
              font-semibold
              uppercase
              tracking-[0.14em]
              text-white/25
            "
          >
            Output
          </div>

          <pre
            className="
              overflow-x-auto
              px-4
              pb-3
              text-[10px]
              leading-[1.6]
              text-white/45
            "
          >
            <code>{code.output}</code>
          </pre>
        </div>
      )}

      {/* =========================================================
          EXIT STATUS
          ========================================================= */}

      {typeof code.exitCode === "number" && (
          <div
            className="
              flex
              h-7
              items-center
              border-t
              border-white/[0.06]
              px-4
            "
          >
            <span
              className={[
                "text-[8px] font-medium",
                runExitCode === 0
                  ? "text-[#71aa82]"
                  : "text-[#c77b7b]",
              ].join(" ")}
            >
              {code.exitCode === 0
                ? "✓ Executed successfully"
                : `✕ Process exited with code ${code.exitCode}`}
            </span>
          </div>
        )}

      {/* =========================================================
          PLAYGROUND
          ========================================================= */}

      {isPlaygroundOpen && (
        <div
          className="
            absolute
            left-[28%]
            right-[-1px]
            top-[118px]
            z-[80]
            overflow-visible
            rounded-xl
            border
            border-[#a88a45]/65
            bg-[#17140d]/[0.98]
            shadow-[0_24px_70px_rgba(0,0,0,.58)]
            backdrop-blur-2xl
          "
        >
          {/* Playground header */}

          <div
            className="
              flex
              h-8
              items-center
              justify-between
              border-b
              border-white/[0.06]
              bg-[#211c11]/[0.88]
              px-3
            "
          >
            <div className="flex items-center gap-2">
              <Terminal
                size={11}
                className="text-white/40"
              />

              <span
                className="
                  text-[8px]
                  font-semibold
                  uppercase
                  tracking-[0.13em]
                  text-white/35
                "
              >
                Harbor Playground
              </span>
            </div>

            <button
              type="button"
              onClick={handleClosePlayground}
              aria-label="Close playground"
              className="
                flex
                h-5
                w-5
                items-center
                justify-center
                rounded-md
                text-white/25
                transition
                hover:bg-white/[0.06]
                hover:text-white/65
              "
            >
              <X size={11} />
            </button>
          </div>

          {/* Editor */}

          <div className="relative min-h-[112px] bg-[#17140d]/[0.72]">
            <div
              className="
                flex
                h-7
                items-center
                justify-between
                border-b
                border-[#a88a45]/[0.28]
                px-3
              "
            >
              <span
                className="
                  text-[8px]
                  font-semibold
                  uppercase
                  tracking-[0.12em]
                  text-white/30
                "
              >
                {code.language}
              </span>

              <button
                type="button"
                onClick={handleRun}
                disabled={isRunning}
                className="
                  flex
                  h-5
                  items-center
                  gap-1
                  rounded-md
                  bg-white/[0.06]
                  px-2
                  text-[8px]
                  text-white/55
                  transition
                  hover:bg-white/[0.10]
                  hover:text-white/85
                  disabled:opacity-40
                "
              >
                <Play
                  size={8}
                  fill="currentColor"
                />

                {isRunning
                  ? "Running..."
                  : "Run"}
              </button>
            </div>

            <textarea
              value={editorCode}
              onChange={(event) => {
                setEditorCode(event.target.value);
                setHasRun(false);
                setRunOutput("");
                setRunExitCode(null);
                setSuggestionIndex(0);
              }}
              onFocus={() => setEditorFocused(true)}
              onBlur={() => window.setTimeout(() => setEditorFocused(false), 120)}
              onKeyDown={(event) => {
                if (activeSuggestions.length > 0 && event.key === "ArrowDown") {
                  event.preventDefault();
                  setSuggestionIndex((current) => (current + 1) % activeSuggestions.length);
                } else if (activeSuggestions.length > 0 && event.key === "ArrowUp") {
                  event.preventDefault();
                  setSuggestionIndex((current) => (current - 1 + activeSuggestions.length) % activeSuggestions.length);
                } else if (activeSuggestions.length > 0 && event.key === "Tab") {
                  event.preventDefault();
                  insertSuggestion(activeSuggestions[suggestionIndex]);
                } else if (event.shiftKey && event.key === "Enter") {
                  event.preventDefault();
                  void handleRun();
                }
              }}
              spellCheck={false}
              aria-label="Code playground editor"
              className="
                block
                min-h-[125px]
                w-full
                resize-y
                border-0
                bg-transparent
                px-4
                py-3
                font-mono
                text-[11px]
                leading-[1.7]
                text-[#e1d0a5]
                outline-none
                placeholder:text-[#cdbb8a]/30
              "
            />

            {/* Contextual suggestions */}

            {activeSuggestions.length > 0 && (
              <div
                className="
                  absolute
                  right-3
                  top-10
                  z-[110]
                  w-60
                  overflow-hidden
                  rounded-lg
                  border
                  border-white/[0.10]
                  bg-[#10151c]/96
                  shadow-[0_18px_45px_rgba(0,0,0,.42)]
                  backdrop-blur-xl
                "
              >
                <div
                  className="
                    flex items-center justify-between
                    border-b border-white/[0.06]
                    px-2.5 py-1.5
                    text-[7px] font-semibold uppercase tracking-[0.12em] text-white/25
                  "
                >
                  <span>Suggestions</span>
                  <span className="normal-case tracking-normal text-white/15">Tab to insert</span>
                </div>

                {activeSuggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.value}-${suggestion.detail}`}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => insertSuggestion(suggestion)}
                    className={[
                      "flex w-full items-center gap-2 px-2.5 py-1.5 text-left font-mono text-[9px] transition",
                      index === suggestionIndex
                        ? "bg-[#123b55]/80 text-white/90"
                        : "text-white/45 hover:bg-white/[0.06] hover:text-white/80",
                    ].join(" ")}
                  >
                    <span className="w-4 text-center text-[8px] text-[#9d7bb8]/90">
                      {suggestion.kind}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{suggestion.value}</span>
                    <span className="text-[8px] text-white/20">{suggestion.detail}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {isPlaygroundOpen && (
        <>
          {/* =========================================================
              FLOATING TERMINAL / LOGS
          This is intentionally a separate floating surface from
          the Playground so the two panels can overlap freely.
          ========================================================= */}

      <div
        className="
          absolute
          left-[58%]
          top-[222px]
          z-[100]
          w-[42%]
          min-w-[300px]
          overflow-hidden
          rounded-xl
          border
          border-white/[0.12]
          bg-[#050608]/[0.98]
          shadow-[0_24px_60px_rgba(0,0,0,.68)]
          backdrop-blur-2xl
        "
      >
            {/* Tabs */}

            <div
              className="
                flex
                h-8
                items-center
                justify-between
                border-b
                border-white/[0.05]
                px-2
              "
            >
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() =>
                    setActiveTab("terminal")
                  }
                  className={[
                    `
                      flex
                      h-7
                      items-center
                      gap-1.5
                      border-b
                      px-2
                      text-[8px]
                      font-medium
                      transition
                    `,
                    activeTab === "terminal"
                      ? "border-white/50 text-white/70"
                      : "border-transparent text-white/25 hover:text-white/55",
                  ].join(" ")}
                >
                  <Terminal size={9} />
                  Terminal
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActiveTab("logs")
                  }
                  className={[
                    `
                      flex
                      h-7
                      items-center
                      gap-1.5
                      border-b
                      px-2
                      text-[8px]
                      font-medium
                      transition
                    `,
                    activeTab === "logs"
                      ? "border-white/50 text-white/70"
                      : "border-transparent text-white/25 hover:text-white/55",
                  ].join(" ")}
                >
                  Logs
                </button>

                <button
                  type="button"
                  aria-label="New terminal"
                  className="
                    ml-1
                    flex
                    h-5
                    w-5
                    items-center
                    justify-center
                    rounded
                    text-white/25
                    transition
                    hover:bg-white/[0.06]
                    hover:text-white/65
                  "
                >
                  <Plus size={10} />
                </button>
              </div>

              <span
                className="
                  px-2
                  text-[7px]
                  uppercase
                  tracking-[0.1em]
                  text-white/20
                "
              >
                {code.language}
              </span>
            </div>

            {/* Terminal */}

            {activeTab === "terminal" && (
              <div
                className="
                  min-h-[125px]
                  bg-black/20
                  px-3
                  py-2.5
                  font-mono
                  text-[9px]
                  leading-[1.7]
                "
              >
                {hasRun ? (
                  <>
                    <div className="whitespace-pre-wrap text-white/55">
                      {runOutput}
                    </div>

                    <div
                      className={[
                        "mt-1",
                        runExitCode === 0
                          ? "text-[#71aa82]/80"
                          : "text-[#c77b7b]/80",
                      ].join(" ")}
                    >
                      Exit Code: {runExitCode ?? 0}
                    </div>
                  </>
                ) : (
                  <div className="text-white/20">
                    Run your code to see the output.
                  </div>
                )}

                <div className="mt-2 flex items-center gap-1">
                  <span className="text-white/25">
                    hackersharbor
                  </span>

                  <span className="text-white/15">
                    $
                  </span>

                  <span className="h-3 w-px animate-pulse bg-white/45" />
                </div>
              </div>
            )}

            {/* Logs */}

            {activeTab === "logs" && (
              <div
                className="
                  min-h-[125px]
                  bg-black/20
                  px-3
                  py-2.5
                  font-mono
                  text-[9px]
                  leading-[1.7]
                "
              >
                {logs.length > 0 ? (
                  logs.map((log, index) => (
                    <div
                      key={`${log}-${index}`}
                      className="text-white/35"
                    >
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="text-white/20">
                    No logs yet.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Playground footer stays visually attached to the Playground only. */}
      <div
        className="
          absolute
          left-[28%]
          right-[-1px]
          top-[290px]
          z-[81]
          flex
          h-7
          items-center
          justify-between
          rounded-b-xl
          border-x
          border-b
          border-[#a88a45]/[0.22]
          bg-[#211c11]/[0.90]
          px-3
          text-[7px]
          text-white/20
        "
      >
        <span>Shift + Enter to run</span>
        <span>Harbor Playground</span>
          </div>
        </>
      )}

      {/* =========================================================
          EXIT STATUS WHEN PLAYGROUND IS OPEN
          ========================================================= */}

      {isPlaygroundOpen &&
        hasRun &&
        runExitCode !== null && (
          <div
            className="
              flex
              h-7
              items-center
              justify-between
              border-t
              border-white/[0.05]
              px-3
            "
          >
            <span
              className={[
                "text-[8px] font-medium",
                code.exitCode === 0
                  ? "text-[#71aa82]"
                  : "text-[#c77b7b]",
              ].join(" ")}
            >
              {runExitCode === 0
                ? "✓ Executed successfully"
                : `✕ Exit code ${runExitCode}`}
            </span>

            <button
              type="button"
              onClick={handleCopy}
              className="
                flex
                items-center
                gap-1
                text-[8px]
                text-white/25
                transition
                hover:text-white/60
              "
            >
              {copied ? (
                <>
                  <Check size={9} />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={9} />
                  Copy
                </>
              )}
            </button>
          </div>
        )}
    </div>
  );
}
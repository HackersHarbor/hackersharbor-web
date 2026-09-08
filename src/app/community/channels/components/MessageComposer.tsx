"use client";

import {
  FormEvent,
  KeyboardEvent,
  useState,
} from "react";

import {
  AtSign,
  Paperclip,
  Send,
  Smile,
} from "lucide-react";

interface MessageComposerProps {
  onSend: (content: string) => Promise<void> | void;
  disabled?: boolean;
}

export function MessageComposer({
  onSend,
  disabled = false,
}: MessageComposerProps) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  const trimmedContent = content.trim();

  const canSend =
    trimmedContent.length > 0 &&
    !disabled &&
    !sending;

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!canSend) {
      return;
    }

    try {
      setSending(true);

      await onSend(trimmedContent);

      setContent("");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      if (canSend) {
        event.currentTarget.form?.requestSubmit();
      }
    }
  };

  return (
    <div className="shrink-0 border-t border-white/[0.07] bg-slate-950/30 px-5 py-3.5 backdrop-blur-2xl">
      <form onSubmit={handleSubmit}>
        <div
          className={[
            "overflow-hidden rounded-xl",
            "border border-white/[0.09]",
            "bg-white/[0.035]",
            "shadow-[0_10px_32px_rgba(0,0,0,.18)]",
            "backdrop-blur-2xl",
            "transition-all duration-200",
            "focus-within:border-white/[0.15]",
            "focus-within:bg-white/[0.045]",
            "focus-within:shadow-[0_10px_36px_rgba(0,0,0,.22)]",
          ].join(" ")}
        >
          {/* =================================================
              TEXT AREA
              ================================================= */}

          <textarea
            value={content}
            onChange={(event) =>
              setContent(event.target.value)
            }
            onKeyDown={handleKeyDown}
            disabled={disabled || sending}
            rows={2}
            placeholder="Message this channel..."
            aria-label="Message"
            className={[
              "block w-full resize-none",
              "min-h-[56px]",
              "bg-transparent",
              "px-3.5 pt-3",
              "text-[11px] leading-[1.65]",
              "text-white/75",
              "outline-none",
              "placeholder:text-white/23",
              "disabled:cursor-not-allowed",
              "disabled:opacity-50",
            ].join(" ")}
          />

          {/* =================================================
              TOOLBAR
              ================================================= */}

          <div className="flex min-h-[38px] items-center justify-between border-t border-white/[0.055] px-2">
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                aria-label="Attach file"
                title="Attach file"
                disabled={disabled || sending}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-white/25 transition-all duration-150 hover:border-white/[0.06] hover:bg-white/[0.055] hover:text-white/60 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Paperclip
                  size={13}
                  strokeWidth={1.8}
                />
              </button>

              <button
                type="button"
                aria-label="Mention someone"
                title="Mention someone"
                disabled={disabled || sending}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-white/25 transition-all duration-150 hover:border-white/[0.06] hover:bg-white/[0.055] hover:text-white/60 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <AtSign
                  size={13}
                  strokeWidth={1.8}
                />
              </button>

              <button
                type="button"
                aria-label="Add emoji"
                title="Add emoji"
                disabled={disabled || sending}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-white/25 transition-all duration-150 hover:border-white/[0.06] hover:bg-white/[0.055] hover:text-white/60 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Smile
                  size={13}
                  strokeWidth={1.8}
                />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Keyboard hint */}

              <span className="hidden text-[8px] text-white/18 sm:inline">
                Enter to send
              </span>

              {/* Send */}

              <button
                type="submit"
                disabled={!canSend}
                aria-label="Send message"
                title="Send message"
                className={[
                  "flex h-7 w-7 items-center justify-center rounded-lg",
                  "border transition-all duration-200",
                  canSend
                    ? "border-white/[0.1] bg-white/[0.09] text-white/70 shadow-[0_4px_14px_rgba(0,0,0,.12)] hover:border-white/[0.15] hover:bg-white/[0.15] hover:text-white"
                    : "cursor-not-allowed border-white/[0.04] bg-white/[0.025] text-white/18",
                ].join(" ")}
              >
                <Send
                  size={12}
                  strokeWidth={1.9}
                  className={
                    sending
                      ? "animate-pulse"
                      : undefined
                  }
                />
              </button>
            </div>
          </div>
        </div>

        {/* Character/status hint */}

        <div className="mt-1.5 flex items-center justify-between px-1">
          <span className="text-[8px] text-white/15">
            Shift + Enter for a new line
          </span>

          {trimmedContent.length > 0 && (
            <span className="text-[8px] text-white/18">
              {trimmedContent.length}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
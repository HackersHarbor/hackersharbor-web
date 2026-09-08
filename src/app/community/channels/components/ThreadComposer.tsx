"use client";

import { Send, Smile } from "lucide-react";
import {
  FormEvent,
  KeyboardEvent,
  useState,
} from "react";

interface ThreadComposerProps {
  onSend: (content: string) => Promise<void> | void;
  disabled?: boolean;
}

export function ThreadComposer({
  onSend,
  disabled = false,
}: ThreadComposerProps) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  const canSend =
    content.trim().length > 0 &&
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

      await onSend(content.trim());

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
    <div className="shrink-0 border-t border-white/[0.08] bg-slate-950/30 p-3 backdrop-blur-2xl">
      <form onSubmit={handleSubmit}>
        <div className="overflow-hidden rounded-xl border border-white/[0.1] bg-white/[0.035] shadow-[0_8px_28px_rgba(0,0,0,.16)] backdrop-blur-2xl focus-within:border-white/[0.16]">
          <textarea
            value={content}
            onChange={(event) =>
              setContent(event.target.value)
            }
            onKeyDown={handleKeyDown}
            disabled={disabled || sending}
            rows={2}
            placeholder="Reply to thread..."
            className="block min-h-[52px] w-full resize-none bg-transparent px-3.5 pt-3 text-[10px] leading-[1.6] text-white/75 outline-none placeholder:text-white/25 disabled:opacity-50"
          />

          <div className="flex h-9 items-center justify-between border-t border-white/[0.06] px-2">
            <button
              type="button"
              aria-label="Add emoji"
              title="Add emoji"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/[0.06] hover:text-white/65"
            >
              <Smile size={13} />
            </button>

            <button
              type="submit"
              disabled={!canSend}
              aria-label="Send reply"
              className={[
                "flex h-7 w-7 items-center justify-center rounded-lg",
                "transition-all duration-200",
                canSend
                  ? "bg-white/[0.1] text-white/70 hover:bg-white/[0.16] hover:text-white"
                  : "cursor-not-allowed bg-white/[0.035] text-white/20",
              ].join(" ")}
            >
              <Send
                size={12}
                className={
                  sending
                    ? "animate-pulse"
                    : undefined
                }
              />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
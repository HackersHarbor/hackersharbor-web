"use client";

import {
  AtSign,
  Bold,
  Code2,
  Italic,
  List,
  ListOrdered,
  Paperclip,
  Send,
  Smile,
  Underline,
} from "lucide-react";

import {
  FormEvent,
  KeyboardEvent,
  useState,
} from "react";

interface ThreadComposerProps {
  onSend: (
    content: string,
  ) => Promise<void> | void;

  disabled?: boolean;
}

export function ThreadComposer({
  onSend,
  disabled = false,
}: ThreadComposerProps) {
  const [content, setContent] =
    useState("");

  const [sending, setSending] =
    useState(false);

  const trimmedContent =
    content.trim();

  const canSend =
    trimmedContent.length > 0 &&
    !disabled &&
    !sending;

  const handleSubmit = async (
    event?: FormEvent<HTMLFormElement>,
  ) => {
    event?.preventDefault();

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
    <div
      className="
        shrink-0
        border-t
        border-white/[0.07]
        bg-slate-950/30
        px-4
        pt-3
        pb-0
        backdrop-blur-2xl
      "
    >
      <form onSubmit={handleSubmit}>
        <div
          className="
            overflow-hidden
            rounded-xl
            border
            border-white/[0.09]
            bg-white/[0.035]
            shadow-[0_10px_32px_rgba(0,0,0,.18)]
            backdrop-blur-2xl
            transition-all
            duration-200
            focus-within:border-white/[0.15]
            focus-within:bg-white/[0.045]
            focus-within:shadow-[0_10px_36px_rgba(0,0,0,.22)]
          "
        >
          {/* =====================================================
              TEXT AREA
              ===================================================== */}

          <textarea
            value={content}
            onChange={(event) =>
              setContent(event.target.value)
            }
            onKeyDown={handleKeyDown}
            disabled={
              disabled || sending
            }
            rows={2}
            placeholder="Reply to thread..."
            aria-label="Reply to thread"
            className="
              block
              min-h-[56px]
              w-full
              resize-none
              bg-transparent
              px-3.5
              pt-3
              text-[11px]
              leading-[1.65]
              text-white/75
              outline-none
              placeholder:text-white/23
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          />

          {/* =====================================================
              TOOLBAR
              ===================================================== */}

          <div
            className="
              flex
              min-h-[38px]
              items-center
              justify-between
              border-t
              border-white/[0.055]
              px-2
            "
          >
            {/* LEFT CONTROLS */}

            <div className="flex items-center gap-0.5">
              <ComposerButton
                label="Bold"
                disabled={
                  disabled || sending
                }
              >
                <Bold
                  size={13}
                  strokeWidth={2}
                />
              </ComposerButton>

              <ComposerButton
                label="Italic"
                disabled={
                  disabled || sending
                }
              >
                <Italic
                  size={13}
                  strokeWidth={1.8}
                />
              </ComposerButton>

              <ComposerButton
                label="Underline"
                disabled={
                  disabled || sending
                }
              >
                <Underline
                  size={13}
                  strokeWidth={1.8}
                />
              </ComposerButton>

              <ComposerButton
                label="Bulleted list"
                disabled={
                  disabled || sending
                }
              >
                <List
                  size={13}
                  strokeWidth={1.8}
                />
              </ComposerButton>

              <ComposerButton
                label="Numbered list"
                disabled={
                  disabled || sending
                }
              >
                <ListOrdered
                  size={13}
                  strokeWidth={1.8}
                />
              </ComposerButton>

              <ComposerButton
                label="Attach file"
                disabled={
                  disabled || sending
                }
              >
                <Paperclip
                  size={13}
                  strokeWidth={1.8}
                />
              </ComposerButton>

              <ComposerButton
                label="Mention someone"
                disabled={
                  disabled || sending
                }
              >
                <AtSign
                  size={13}
                  strokeWidth={1.8}
                />
              </ComposerButton>

              <ComposerButton
                label="Add emoji"
                disabled={
                  disabled || sending
                }
              >
                <Smile
                  size={13}
                  strokeWidth={1.8}
                />
              </ComposerButton>
            </div>

            {/* RIGHT CONTROLS */}

            <div className="flex items-center gap-2">
              <span
                className="
                  hidden
                  text-[8px]
                  text-white/18
                  sm:inline
                "
              >
                Enter to send
              </span>

              {/* CODE */}

              <button
                type="button"
                disabled={
                  disabled || sending
                }
                aria-label="Send code"
                title="Send code"
                className="
                  flex
                  h-7
                  items-center
                  gap-1.5
                  rounded-lg
                  border
                  border-white/[0.08]
                  bg-white/[0.025]
                  px-2
                  text-white/30
                  transition-all
                  duration-150
                  hover:border-white/[0.13]
                  hover:bg-white/[0.06]
                  hover:text-white/65
                  disabled:cursor-not-allowed
                  disabled:opacity-35
                "
              >
                <Code2
                  size={12}
                  strokeWidth={1.8}
                />

                <span className="text-[9px] font-medium">
                  Code
                </span>
              </button>

              {/* SEND */}

              <button
                type="submit"
                disabled={!canSend}
                aria-label="Send reply"
                title="Send reply"
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

        {/* =====================================================
            BOTTOM HINT
            ===================================================== */}

        <div
          className="
            mt-1.5
            flex
            items-center
            justify-between
            px-1
          "
        >
          <span className="text-[8px] text-white/15">
            Enter to send · Shift + Enter for a new line
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

/* ================================================================
   COMPOSER BUTTON
   ================================================================ */

interface ComposerButtonProps {
  label: string;
  disabled?: boolean;
  children: React.ReactNode;
}

function ComposerButton({
  label,
  disabled = false,
  children,
}: ComposerButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      className="
        flex
        h-7
        w-7
        items-center
        justify-center
        rounded-lg
        border
        border-transparent
        text-white/25
        transition-all
        duration-150
        hover:border-white/[0.06]
        hover:bg-white/[0.055]
        hover:text-white/60
        disabled:cursor-not-allowed
        disabled:opacity-40
      "
    >
      {children}
    </button>
  );
}
"use client";

import {
  AtSign,
  Bold,
  Code2,
  ImagePlus,
  Italic,
  List,
  ListOrdered,
  Mic,
  Paperclip,
  Send,
  Smile,
  Underline,
  X,
} from "lucide-react";
import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  useRef,
  useState,
} from "react";

interface MessageComposerProps {
  onSend: (content: string) => Promise<void> | void;
  disabled?: boolean;
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  kind: "file" | "image";
  file: File;
}

const EMOJIS = [
  "😀",
  "😂",
  "😍",
  "😎",
  "🤔",
  "🔥",
  "🚀",
  "💡",
  "❤️",
  "👍",
  "👏",
  "🎯",
];

export function MessageComposer({
  onSend,
  disabled = false,
}: MessageComposerProps) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [codeMode, setCodeMode] = useState(false);
  const [listMode, setListMode] = useState<
    "bullet" | "number" | null
  >(null);
  const [recording, setRecording] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const trimmedContent = content.trim();

  const canSend =
    (trimmedContent.length > 0 || attachments.length > 0) &&
    !disabled &&
    !sending;

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;

    if (!textarea) {
      setContent((current) => current + text);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const next =
      content.slice(0, start) +
      text +
      content.slice(end);

    setContent(next);

    requestAnimationFrame(() => {
      textarea.focus();

      const cursor = start + text.length;

      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const wrapSelection = (
    before: string,
    after = before,
  ) => {
    const textarea = textareaRef.current;

    if (!textarea) {
      insertAtCursor(`${before}${after}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const selected = content.slice(start, end);

    const selectedText = selected || "text";

    const replacement =
      `${before}${selectedText}${after}`;

    setContent(
      content.slice(0, start) +
        replacement +
        content.slice(end),
    );

    requestAnimationFrame(() => {
      textarea.focus();

      const selectionStart =
        start + before.length;

      const selectionEnd =
        selectionStart + selectedText.length;

      textarea.setSelectionRange(
        selectionStart,
        selectionEnd,
      );
    });
  };

  const toggleList = (
    type: "bullet" | "number",
  ) => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const selected = content.slice(start, end);

    const source = selected || "List item";

    const lines = source.split("\n");

    const formatted = lines
      .map((line, index) => {
        if (
          line.startsWith("• ") ||
          /^\d+\.\s/.test(line)
        ) {
          return line;
        }

        return type === "bullet"
          ? `• ${line}`
          : `${index + 1}. ${line}`;
      })
      .join("\n");

    setContent(
      content.slice(0, start) +
        formatted +
        content.slice(end),
    );

    setListMode(type);

    requestAnimationFrame(() => {
      textarea.focus();

      textarea.setSelectionRange(
        start,
        start + formatted.length,
      );
    });
  };

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
    kind: "file" | "image",
  ) => {
    const files = Array.from(
      event.target.files ?? [],
    );

    if (!files.length) {
      return;
    }

    const nextAttachments: Attachment[] =
      files.map((file) => ({
        id:
          typeof crypto !== "undefined" &&
          "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${file.name}-${file.lastModified}`,
        name: file.name,
        type: file.type,
        size: file.size,
        kind,
        file,
      }));

    setAttachments((current) => [
      ...current,
      ...nextAttachments,
    ]);

    event.target.value = "";
  };

  const removeAttachment = (id: string) => {
    setAttachments((current) =>
      current.filter(
        (attachment) =>
          attachment.id !== id,
      ),
    );
  };

  const handleMention = () => {
    insertAtCursor("@");
  };

  const handleEmoji = (emoji: string) => {
    insertAtCursor(emoji);

    setShowEmojiPicker(false);
  };

  const handleCodeToggle = () => {
    setCodeMode((current) => {
      const next = !current;

      if (next && !content.trim()) {
        setContent(
          "```python\n\n```",
        );
      }

      return next;
    });
  };

  const handleMicrophone = () => {
    if (typeof window === "undefined") {
      return;
    }

    type Recognition = {
      lang: string;
      continuous: boolean;
      interimResults: boolean;
      onresult: (
        event: {
          results: ArrayLike<
            ArrayLike<{
              transcript: string;
            }>
          >;
        },
      ) => void;
      onend: () => void;
      start: () => void;
    };

    type RecognitionConstructor =
      new () => Recognition;

    const speechWindow =
      window as Window & {
        SpeechRecognition?: RecognitionConstructor;
        webkitSpeechRecognition?: RecognitionConstructor;
      };

    const SpeechRecognition =
      speechWindow.SpeechRecognition ??
      speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript =
        event.results[0]?.[0]?.transcript ??
        "";

      if (!transcript) {
        return;
      }

      insertAtCursor(
        `${
          content &&
          !content.endsWith(" ")
            ? " "
            : ""
        }${transcript}`,
      );
    };

    recognition.onend = () => {
      setRecording(false);
    };

    setRecording(true);

    try {
      recognition.start();
    } catch {
      setRecording(false);
    }
  };

  const readFileAsDataUrl = (
    file: File,
  ): Promise<string> => {
    return new Promise(
      (resolve, reject) => {
        const reader =
          new FileReader();

        reader.onload = () => {
          if (
            typeof reader.result ===
            "string"
          ) {
            resolve(reader.result);
          } else {
            reject(
              new Error(
                "Unable to read attachment.",
              ),
            );
          }
        };

        reader.onerror = () => {
          reject(
            reader.error ??
              new Error(
                "Unable to read attachment.",
              ),
          );
        };

        reader.readAsDataURL(file);
      },
    );
  };

  const handleSubmit = async (
    event?: FormEvent<HTMLFormElement>,
  ) => {
    event?.preventDefault();

    if (!canSend) {
      return;
    }

    const encodedAttachments =
      await Promise.all(
        attachments.map(
          async (attachment) => ({
            name: attachment.name,
            type: attachment.type,
            size: attachment.size,
            kind: attachment.kind,
            dataUrl:
              await readFileAsDataUrl(
                attachment.file,
              ),
          }),
        ),
      );

    const attachmentPayload =
      encodedAttachments.length > 0
        ? `__HH_ATTACHMENTS__${JSON.stringify(
            encodedAttachments,
          )}`
        : "";

    const finalContent = [
      trimmedContent,
      attachmentPayload,
    ]
      .filter(Boolean)
      .join("\n\n")
      .trim();

    try {
      setSending(true);

      await onSend(finalContent);

      setContent("");
      setAttachments([]);
      setCodeMode(false);
      setListMode(null);
      setShowEmojiPicker(false);
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

      return;
    }

    if (
      event.key === "Tab" &&
      codeMode
    ) {
      event.preventDefault();

      insertAtCursor("  ");
    }
  };

  return (
    <div
      className="
        relative
        z-10
        shrink-0
        border-t
        border-white/[0.07]
        bg-[#080d14]/[0.58]
        px-5
        py-3
        backdrop-blur-2xl
      "
    >
      <form onSubmit={handleSubmit}>
        <div
          className="
            relative
            overflow-visible
            rounded-xl
            border
            border-white/[0.09]
            bg-black/[0.18]
            shadow-[0_12px_35px_rgba(0,0,0,0.16)]
            backdrop-blur-xl
            transition-all
            duration-200
            focus-within:border-white/[0.14]
          "
        >
          {attachments.length > 0 && (
            <div
              className="
                flex
                flex-wrap
                gap-1.5
                border-b
                border-white/[0.055]
                px-3
                py-2
              "
            >
              {attachments.map(
                (attachment) => (
                  <div
                    key={attachment.id}
                    className="
                      flex
                      max-w-[220px]
                      items-center
                      gap-1.5
                      rounded-md
                      border
                      border-white/[0.07]
                      bg-white/[0.035]
                      px-2
                      py-1
                      text-[8px]
                      text-white/45
                    "
                  >
                    {attachment.kind ===
                    "image" ? (
                      <ImagePlus size={10} />
                    ) : (
                      <Paperclip size={10} />
                    )}

                    <span className="truncate">
                      {attachment.name}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        removeAttachment(
                          attachment.id,
                        )
                      }
                      className="
                        ml-0.5
                        rounded
                        text-white/25
                        hover:text-white/70
                      "
                      aria-label={`Remove ${attachment.name}`}
                    >
                      <X size={10} />
                    </button>
                  </div>
                ),
              )}
            </div>
          )}

          {codeMode && (
            <div
              className="
                flex
                h-7
                items-center
                border-b
                border-[#a88a45]/20
                bg-[#a88a45]/[0.045]
                px-3
              "
            >
              <Code2
                size={11}
                className="
                  mr-1.5
                  text-[#c6a966]
                "
              />

              <span
                className="
                  text-[8px]
                  font-semibold
                  uppercase
                  tracking-[0.12em]
                  text-[#c6a966]/70
                "
              >
                Code mode
              </span>

              <button
                type="button"
                onClick={
                  handleCodeToggle
                }
                className="
                  ml-auto
                  text-[8px]
                  text-white/25
                  hover:text-white/60
                "
              >
                Exit
              </button>
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={content}
            onChange={(event) =>
              setContent(
                event.target.value,
              )
            }
            onKeyDown={handleKeyDown}
            disabled={
              disabled || sending
            }
            rows={2}
            placeholder={
              codeMode
                ? "Write code..."
                : "Write a message..."
            }
            aria-label="Message"
            className={`
              block
              w-full
              resize-none
              min-h-[58px]
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
              ${
                codeMode
                  ? "font-mono"
                  : ""
              }
            `}
          />

          <div
            className="
              flex
              min-h-[38px]
              items-center
              border-t
              border-white/[0.055]
              px-2
            "
          >
            <div
              className="
                flex
                items-center
                gap-0.5
              "
            >
              <ComposerButton
                label="Bold"
                disabled={
                  disabled || sending
                }
                onClick={() =>
                  wrapSelection(
                    "**",
                  )
                }
              >
                <Bold size={13} />
              </ComposerButton>

              <ComposerButton
                label="Italic"
                disabled={
                  disabled || sending
                }
                onClick={() =>
                  wrapSelection("*")
                }
              >
                <Italic size={13} />
              </ComposerButton>

              <ComposerButton
                label="Underline"
                disabled={
                  disabled || sending
                }
                onClick={() =>
                  wrapSelection(
                    "__",
                  )
                }
              >
                <Underline size={13} />
              </ComposerButton>

              <ComposerButton
                label="Bulleted list"
                active={
                  listMode === "bullet"
                }
                disabled={
                  disabled || sending
                }
                onClick={() =>
                  toggleList(
                    "bullet",
                  )
                }
              >
                <List size={13} />
              </ComposerButton>

              <ComposerButton
                label="Numbered list"
                active={
                  listMode === "number"
                }
                disabled={
                  disabled || sending
                }
                onClick={() =>
                  toggleList(
                    "number",
                  )
                }
              >
                <ListOrdered
                  size={13}
                />
              </ComposerButton>

              <span
                className="
                  mx-1
                  h-4
                  w-px
                  bg-white/[0.06]
                "
              />

              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(event) =>
                  handleFileChange(
                    event,
                    "file",
                  )
                }
              />

              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) =>
                  handleFileChange(
                    event,
                    "image",
                  )
                }
              />

              <ComposerButton
                label="Attach file"
                disabled={
                  disabled || sending
                }
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >
                <Paperclip size={13} />
              </ComposerButton>

              <ComposerButton
                label="Add image"
                disabled={
                  disabled || sending
                }
                onClick={() =>
                  imageInputRef.current?.click()
                }
              >
                <ImagePlus size={13} />
              </ComposerButton>

              <ComposerButton
                label="Mention someone"
                disabled={
                  disabled || sending
                }
                onClick={
                  handleMention
                }
              >
                <AtSign size={13} />
              </ComposerButton>

              <div className="relative">
                <ComposerButton
                  label="Add emoji"
                  disabled={
                    disabled ||
                    sending
                  }
                  onClick={() =>
                    setShowEmojiPicker(
                      (current) =>
                        !current,
                    )
                  }
                >
                  <Smile size={13} />
                </ComposerButton>

                {showEmojiPicker && (
                  <div
                    className="
                      absolute
                      bottom-9
                      left-0
                      z-[200]
                      grid
                      w-[190px]
                      grid-cols-6
                      gap-1
                      rounded-xl
                      border
                      border-white/[0.09]
                      bg-[#0d1219]
                      p-2
                      shadow-[0_16px_45px_rgba(0,0,0,.45)]
                    "
                  >
                    {EMOJIS.map(
                      (emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() =>
                            handleEmoji(
                              emoji,
                            )
                          }
                          className="
                            flex
                            h-7
                            w-7
                            items-center
                            justify-center
                            rounded-md
                            text-[15px]
                            transition
                            hover:bg-white/[0.07]
                          "
                        >
                          {emoji}
                        </button>
                      ),
                    )}
                  </div>
                )}
              </div>

              <ComposerButton
                label={
                  recording
                    ? "Stop recording"
                    : "Voice input"
                }
                active={recording}
                disabled={
                  disabled || sending
                }
                onClick={
                  handleMicrophone
                }
              >
                <Mic
                  size={13}
                  className={
                    recording
                      ? "animate-pulse"
                      : undefined
                  }
                />
              </ComposerButton>

              <ComposerButton
                label={
                  codeMode
                    ? "Exit code mode"
                    : "Code"
                }
                active={codeMode}
                disabled={
                  disabled || sending
                }
                onClick={
                  handleCodeToggle
                }
              >
                <Code2 size={13} />
              </ComposerButton>
            </div>

            <span
              className="
                ml-auto
                mr-3
                hidden
                text-[8px]
                text-white/20
                sm:block
              "
            >
              Enter to send · Shift + Enter
              for newline
            </span>

            <button
              type="submit"
              disabled={!canSend}
              aria-label="Send message"
              title="Send message"
              className={`
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-lg
                border
                transition-all
                duration-200
                ${
                  canSend
                    ? "border-white/[0.1] bg-white/[0.09] text-white/70 shadow-[0_4px_14px_rgba(0,0,0,.12)] hover:border-white/[0.15] hover:bg-white/[0.15] hover:text-white"
                    : "cursor-not-allowed border-white/[0.04] bg-white/[0.025] text-white/18"
                }
              `}
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

        <div
          className="
            mt-1.5
            flex
            items-center
            justify-between
            px-1
          "
        >
          <span
            className="
              text-[8px]
              text-white/15
            "
          >
            Shift + Enter for a new line
          </span>

          {trimmedContent.length >
            0 && (
            <span
              className="
                text-[8px]
                text-white/18
              "
            >
              {trimmedContent.length}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

interface ComposerButtonProps {
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
}

function ComposerButton({
  label,
  children,
  onClick,
  disabled = false,
  active = false,
}: ComposerButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`
        flex
        h-7
        w-7
        items-center
        justify-center
        rounded-lg
        border
        transition-all
        duration-150
        ${
          active
            ? "border-[#a88a45]/30 bg-[#a88a45]/[0.10] text-[#c6a966]"
            : "border-transparent text-white/30"
        }
        hover:border-white/[0.06]
        hover:bg-white/[0.055]
        hover:text-white/65
        disabled:cursor-not-allowed
        disabled:opacity-35
      `}
    >
      {children}
    </button>
  );
}
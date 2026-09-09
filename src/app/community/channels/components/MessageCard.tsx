"use client";

import {
  Brain,
  Code2,
  Database,
  Download,
  FileText,
  Image as ImageIcon,
  MessageCircle,
  MoreHorizontal,
  Pin,
  Reply,
  UsersRound,
} from "lucide-react";

import type { Message } from "../types/message";

import { CodeMessage } from "./CodeMessage";

interface MessageCardProps {
  message: Message;
  onReply?: (message: Message) => void;
  onMore?: (message: Message) => void;
}

/* =========================================================
   ATTACHMENTS
   ========================================================= */

interface MessageAttachment {
  name: string;
  type: string;
  size: number;
  kind: "file" | "image";
  dataUrl: string;
}

/*
 * MessageComposer stores attachments inside message.content
 * using this marker:
 *
 * __HH_ATTACHMENTS__[JSON]
 *
 * We extract that payload before rendering the message so
 * the marker never appears in the chat.
 */
const ATTACHMENT_MARKER = "__HH_ATTACHMENTS__";

function parseAttachments(content: string): {
  text: string;
  attachments: MessageAttachment[];
} {
  const markerIndex = content.indexOf(
    ATTACHMENT_MARKER,
  );

  if (markerIndex === -1) {
    return {
      text: content,
      attachments: [],
    };
  }

  const text = content
    .slice(0, markerIndex)
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const rawPayload = content
    .slice(
      markerIndex + ATTACHMENT_MARKER.length,
    )
    .trim();

  if (!rawPayload) {
    return {
      text,
      attachments: [],
    };
  }

  try {
    const parsed: unknown = JSON.parse(
      rawPayload,
    );

    if (!Array.isArray(parsed)) {
      return {
        text,
        attachments: [],
      };
    }

    const attachments = parsed.filter(
      (item): item is MessageAttachment => {
        if (
          !item ||
          typeof item !== "object"
        ) {
          return false;
        }

        const value =
          item as Record<string, unknown>;

        return (
          typeof value.name === "string" &&
          typeof value.type === "string" &&
          typeof value.size === "number" &&
          (value.kind === "image" ||
            value.kind === "file") &&
          typeof value.dataUrl === "string"
        );
      },
    );

    return {
      text,
      attachments,
    };
  } catch {
    /*
     * If an older message contains a malformed
     * attachment payload, keep the original message
     * visible instead of crashing the card.
     */
    return {
      text: content,
      attachments: [],
    };
  }
}

/* =========================================================
   FENCED CODE
   ========================================================= */

function parseFencedCode(content: string) {
  const match = content.match(
    /^```([a-zA-Z0-9+#._-]+)?\r?\n([\s\S]*?)\r?\n```$/,
  );

  if (!match) {
    return null;
  }

  return {
    language:
      match[1]?.toLowerCase() || "text",
    code: match[2],
  };
}

/* =========================================================
   TAG ICON
   ========================================================= */

function TagIcon({
  icon,
}: {
  icon?: string;
}) {
  switch (icon) {
    case "pairing":
      return (
        <UsersRound
          size={9}
          strokeWidth={1.8}
        />
      );

    case "python":
      return (
        <Code2
          size={9}
          strokeWidth={1.8}
        />
      );

    case "database":
      return (
        <Database
          size={9}
          strokeWidth={1.8}
        />
      );

    case "brain":
      return (
        <Brain
          size={9}
          strokeWidth={1.8}
        />
      );

    default:
      return null;
  }
}

/* =========================================================
   FILE SIZE
   ========================================================= */

function formatFileSize(
  bytes: number,
) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  return `${(
    bytes /
    (1024 * 1024 * 1024)
  ).toFixed(1)} GB`;
}

/* =========================================================
   ATTACHMENT CARD
   ========================================================= */

function AttachmentPreview({
  attachment,
}: {
  attachment: MessageAttachment;
}) {
  const isImage =
    attachment.kind === "image" ||
    attachment.type.startsWith("image/");

  if (isImage && attachment.dataUrl) {
    return (
      <div className="mt-2 max-w-[720px]">
        <div
          className="
            group/image
            relative
            overflow-hidden
            rounded-xl
            border
            border-white/[0.08]
            bg-[#0b1016]/[0.72]
            shadow-[0_10px_30px_rgba(0,0,0,.20)]
          "
        >
          <img
            src={attachment.dataUrl}
            alt={attachment.name}
            className="
              block
              max-h-[520px]
              max-w-full
              object-contain
            "
          />

          <div
            className="
              flex
              items-center
              gap-2
              border-t
              border-white/[0.06]
              bg-black/[0.24]
              px-3
              py-2
            "
          >
            <ImageIcon
              size={11}
              className="shrink-0 text-white/35"
            />

            <div className="min-w-0 flex-1">
              <p className="truncate text-[9px] text-white/55">
                {attachment.name}
              </p>

              {attachment.size > 0 && (
                <p className="text-[8px] text-white/20">
                  {formatFileSize(
                    attachment.size,
                  )}
                </p>
              )}
            </div>

            <a
              href={attachment.dataUrl}
              download={attachment.name}
              aria-label={`Download ${attachment.name}`}
              title={`Download ${attachment.name}`}
              className="
                flex
                h-7
                w-7
                shrink-0
                items-center
                justify-center
                rounded-lg
                border
                border-white/[0.07]
                bg-white/[0.035]
                text-white/30
                transition
                hover:bg-white/[0.08]
                hover:text-white/70
              "
            >
              <Download size={12} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 max-w-[520px]">
      <a
        href={attachment.dataUrl}
        download={attachment.name}
        className="
          group/file
          flex
          items-center
          gap-3
          rounded-xl
          border
          border-white/[0.08]
          bg-white/[0.025]
          px-3
          py-2.5
          text-white/45
          transition
          hover:border-white/[0.12]
          hover:bg-white/[0.05]
          hover:text-white/70
        "
      >
        <span
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-lg
            border
            border-white/[0.07]
            bg-white/[0.04]
          "
        >
          <FileText
            size={14}
            className="text-white/35"
          />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-[10px] text-white/55">
            {attachment.name}
          </span>

          <span className="mt-0.5 block text-[8px] text-white/20">
            {formatFileSize(
              attachment.size,
            )}
          </span>
        </span>

        <Download
          size={13}
          className="
            shrink-0
            text-white/25
            transition
            group-hover/file:text-white/65
          "
        />
      </a>
    </div>
  );
}

/* =========================================================
   MESSAGE CARD
   ========================================================= */

export function MessageCard({
  message,
  onReply,
  onMore,
}: MessageCardProps) {
  const replyCount =
    typeof message.replyCount === "number"
      ? message.replyCount
      : 0;

  const hasReplies = replyCount > 0;

  /*
   * Extract attachments from the content payload.
   *
   * This is the important part that makes the image
   * actually render instead of appearing only as a filename.
   */
  const {
    text: messageText,
    attachments,
  } = parseAttachments(
    message.content ?? "",
  );

  const fencedCode = message.code
    ? null
    : parseFencedCode(messageText);

  const displayedContent = fencedCode
    ? ""
    : messageText;

  return (
    <article
      className={[
        "group relative",
        "border-b border-white/[0.025]",
        "px-5 py-3.5",
        "transition-colors duration-200",
        message.isHighlighted
          ? "bg-white/[0.035]"
          : "hover:bg-white/[0.018]",
      ].join(" ")}
    >
      {/* =======================================================
          HIGHLIGHT ACCENT
          ======================================================= */}

      {message.isHighlighted && (
        <span
          aria-hidden="true"
          className="
            absolute
            bottom-3
            left-0
            top-3
            w-[2px]
            rounded-full
            bg-[#d5b86d]
            shadow-[0_0_10px_rgba(213,184,109,.3)]
          "
        />
      )}

      <div className="flex gap-3">
        {/* =======================================================
            AVATAR
            ======================================================= */}

        <div className="relative shrink-0">
          {message.author.avatar ? (
            <img
              src={message.author.avatar}
              alt=""
              className="
                h-9
                w-9
                rounded-xl
                object-cover
                ring-1
                ring-white/[0.06]
              "
            />
          ) : (
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                border
                border-white/[0.08]
                bg-white/[0.065]
                text-[10px]
                font-semibold
                text-white/65
                shadow-[0_5px_18px_rgba(0,0,0,.12)]
                transition
                duration-200
                group-hover:border-white/[0.12]
                group-hover:bg-white/[0.085]
                group-hover:text-white/75
              "
            >
              {message.author.initials}
            </div>
          )}
        </div>

        {/* =======================================================
            MESSAGE BODY
            ======================================================= */}

        <div className="min-w-0 flex-1">
          {/* =====================================================
              METADATA
              ===================================================== */}

          <div
            className="
              flex
              min-h-[18px]
              flex-wrap
              items-center
              gap-x-2
              gap-y-1
            "
          >
            <span
              className="
                text-[12px]
                font-semibold
                tracking-[-0.01em]
                text-white/85
                transition-colors
                group-hover:text-white/95
              "
            >
              {message.author.name}
            </span>

            {message.author.role && (
              <span
                className="
                  rounded-md
                  border
                  border-white/[0.08]
                  bg-white/[0.04]
                  px-1.5
                  py-0.5
                  text-[8px]
                  font-medium
                  leading-none
                  text-white/40
                "
              >
                {message.author.role}
              </span>
            )}

            <span className="text-[9px] text-white/25">
              {message.timestamp}
            </span>

            {/* =================================================
                TAGS
                ================================================= */}

            {message.tags &&
              message.tags.length > 0 &&
              message.tags.map((tag) => (
                <span
                  key={`${message.id}-${tag.label}`}
                  className="
                    inline-flex
                    items-center
                    gap-1
                    rounded-md
                    border
                    border-white/[0.08]
                    bg-white/[0.045]
                    px-1.5
                    py-0.5
                    text-[8px]
                    font-medium
                    leading-none
                    text-white/45
                    shadow-[0_2px_10px_rgba(0,0,0,.08)]
                    backdrop-blur-xl
                    transition-all
                    duration-200
                    group-hover:border-white/[0.12]
                    group-hover:bg-white/[0.06]
                    group-hover:text-white/60
                  "
                >
                  <TagIcon icon={tag.icon} />

                  <span>
                    {tag.label}
                  </span>
                </span>
              ))}

            {/* =================================================
                REPLIES
                ================================================= */}

            {hasReplies && (
              <button
                type="button"
                onClick={() =>
                  onReply?.(message)
                }
                aria-label={`Open ${replyCount} ${
                  replyCount === 1
                    ? "reply"
                    : "replies"
                }`}
                className="
                  inline-flex
                  items-center
                  gap-1
                  rounded-md
                  border
                  border-transparent
                  px-1
                  py-0.5
                  text-[8px]
                  font-medium
                  leading-none
                  text-[#8ba7df]
                  transition-all
                  duration-200
                  hover:border-[#8ba7df]/10
                  hover:bg-[#8ba7df]/[0.08]
                  hover:text-[#a9bce8]
                "
              >
                <MessageCircle size={10} />

                <span>
                  {replyCount}{" "}
                  {replyCount === 1
                    ? "reply"
                    : "replies"}
                </span>
              </button>
            )}

            {/* =================================================
                PIN
                ================================================= */}

            {message.isPinned && (
              <span
                title="Pinned message"
                aria-label="Pinned message"
                className="
                  inline-flex
                  items-center
                  justify-center
                  text-[#d5b86d]
                "
              >
                <Pin size={11} />
              </span>
            )}
          </div>

          {/* =====================================================
              NORMAL MESSAGE TEXT
              ===================================================== */}

          {displayedContent && (
            <p
              className="
                mt-1.5
                max-w-[850px]
                whitespace-pre-wrap
                text-[12px]
                leading-[1.65]
                text-white/62
                transition-colors
                group-hover:text-white/68
              "
            >
              {displayedContent}
            </p>
          )}

          {/* =====================================================
              CODE MESSAGE
              ===================================================== */}

          {message.code && (
            <div className="mt-2 max-w-[850px]">
              <CodeMessage
                code={message.code}
              />
            </div>
          )}

          {/* =====================================================
              FENCED CODE
              ===================================================== */}

          {fencedCode && (
            <div className="mt-2 max-w-[850px]">
              <CodeMessage
                code={{
                  language:
                    fencedCode.language,
                  code: fencedCode.code,
                }}
              />
            </div>
          )}

          {/* =====================================================
              ATTACHMENTS
              ===================================================== */}

          {attachments.length > 0 && (
            <div className="mt-1 flex flex-col">
              {attachments.map(
                (attachment, index) => (
                  <AttachmentPreview
                    key={`${message.id}-attachment-${index}`}
                    attachment={attachment}
                  />
                ),
              )}
            </div>
          )}
        </div>

        {/* =======================================================
            HOVER ACTIONS
            ======================================================= */}

        <div
          className="
            flex
            shrink-0
            items-start
            gap-0.5
            rounded-xl
            border
            border-white/[0.07]
            bg-[#11161d]/[0.78]
            p-0.5
            opacity-0
            shadow-[0_8px_24px_rgba(0,0,0,.18)]
            backdrop-blur-xl
            transition-all
            duration-150
            group-hover:opacity-100
          "
        >
          {/* REPLY */}

          <button
            type="button"
            aria-label="Reply"
            title="Reply"
            onClick={() =>
              onReply?.(message)
            }
            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-lg
              text-white/30
              transition
              hover:bg-white/[0.08]
              hover:text-white/75
            "
          >
            <Reply size={13} />
          </button>

          {/* MORE */}

          <button
            type="button"
            aria-label="More options"
            title="More options"
            onClick={() =>
              onMore?.(message)
            }
            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-lg
              text-white/30
              transition
              hover:bg-white/[0.08]
              hover:text-white/75
            "
          >
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}
"use client";

import {
  MessageCircle,
  MoreHorizontal,
  Pin,
  Reply,
} from "lucide-react";

import type { Message } from "../types/message";

import { CodeMessage } from "./CodeMessage";

interface MessageCardProps {
  message: Message;
  onReply?: (message: Message) => void;
  onMore?: (message: Message) => void;
}

export function MessageCard({
  message,
  onReply,
  onMore,
}: MessageCardProps) {
  const hasReplies =
    typeof message.replyCount === "number" &&
    message.replyCount > 0;

  return (
    <article
      className={[
        "group relative",
        "border-b border-white/[0.025]",
        "px-5 py-3.5",
        "transition-all duration-200",
        message.isHighlighted
          ? "bg-white/[0.035]"
          : "hover:bg-white/[0.018]",
      ].join(" ")}
    >
      {/* =========================================================
          MESSAGE ACCENT
          ========================================================= */}

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
              AUTHOR ROW
              ===================================================== */}

          <div className="flex min-h-[18px] items-center gap-2">
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
                  text-white/40
                "
              >
                {message.author.role}
              </span>
            )}

            <span className="text-[9px] text-white/25">
              {message.timestamp}
            </span>

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
              CONTENT
              ===================================================== */}

          {message.content && (
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
              {message.content}
            </p>
          )}

          {/* =====================================================
              CODE
              ===================================================== */}

          {message.code && (
            <div className="max-w-[850px]">
              <CodeMessage code={message.code} />
            </div>
          )}

          {/* =====================================================
              TAGS
              ===================================================== */}

          {message.tags && message.tags.length > 0 && (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              {message.tags.map((tag) => (
                <span
                  key={`${message.id}-${tag.label}`}
                  className="
                    inline-flex
                    items-center
                    gap-1
                    rounded-md
                    border
                    border-white/[0.08]
                    bg-white/[0.035]
                    px-2
                    py-1
                    text-[8px]
                    font-medium
                    text-white/42
                    backdrop-blur-xl
                    transition
                    duration-200
                    group-hover:border-white/[0.1]
                    group-hover:bg-white/[0.045]
                    group-hover:text-white/50
                  "
                >
                  {tag.icon && (
                    <span aria-hidden="true">
                      {tag.icon}
                    </span>
                  )}

                  {tag.label}
                </span>
              ))}
            </div>
          )}

          {/* =====================================================
              REPLY AFFORDANCE
              ===================================================== */}

          {hasReplies && (
            <button
              type="button"
              onClick={() => onReply?.(message)}
              className="
                mt-2.5
                inline-flex
                items-center
                gap-1.5
                rounded-lg
                border
                border-transparent
                px-1.5
                py-1
                text-[9px]
                font-medium
                text-[#8ba7df]
                transition-all
                duration-200
                hover:border-[#8ba7df]/10
                hover:bg-[#8ba7df]/[0.08]
                hover:text-[#a9bce8]
              "
            >
              <MessageCircle size={11} />

              <span>
                {message.replyCount}{" "}
                {message.replyCount === 1
                  ? "reply"
                  : "replies"}
              </span>
            </button>
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
          <button
            type="button"
            aria-label="Reply"
            title="Reply"
            onClick={() => onReply?.(message)}
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

          <button
            type="button"
            aria-label="More options"
            title="More options"
            onClick={() => onMore?.(message)}
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
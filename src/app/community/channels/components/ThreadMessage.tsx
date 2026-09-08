"use client";

import type { Message } from "../types/message";

interface ThreadMessageProps {
  message: Message;
}

export function ThreadMessage({
  message,
}: ThreadMessageProps) {
  return (
    <article className="group relative px-4 py-3.5 transition-colors duration-150 hover:bg-white/[0.018]">
      <div className="flex gap-3">
        {/* =====================================================
            AVATAR
            ===================================================== */}

        <div className="relative shrink-0">
          {message.author.avatar ? (
            <img
              src={message.author.avatar}
              alt=""
              className="h-8 w-8 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.055] text-[9px] font-semibold text-white/55 shadow-[0_4px_14px_rgba(0,0,0,.12)]">
              {message.author.initials}
            </div>
          )}

          {/* Reply timeline */}

          <span
            aria-hidden="true"
            className="absolute left-1/2 top-9 h-[calc(100%+14px)] w-px -translate-x-1/2 bg-white/[0.055] group-last:hidden"
          />
        </div>

        {/* =====================================================
            MESSAGE
            ===================================================== */}

        <div className="min-w-0 flex-1">
          {/* Author row */}

          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-[10px] font-semibold text-white/78">
              {message.author.name}
            </span>

            {message.author.role && (
              <span className="shrink-0 rounded-md border border-white/[0.07] bg-white/[0.035] px-1.5 py-0.5 text-[7px] font-medium text-white/30">
                {message.author.role}
              </span>
            )}

            <span className="shrink-0 text-[8px] text-white/23">
              {message.timestamp}
            </span>
          </div>

          {/* Content */}

          {message.content && (
            <p className="mt-1.5 whitespace-pre-wrap break-words text-[10px] leading-[1.65] text-white/52">
              {message.content}
            </p>
          )}

          {/* Code */}

          {message.code && (
            <div className="mt-2 overflow-hidden rounded-lg border border-white/[0.07] bg-black/[0.18]">
              <pre className="overflow-x-auto p-3 text-[9px] leading-[1.6] text-white/55">
                <code>{message.code.code}</code>
              </pre>
            </div>
          )}

          {/* Tags */}

          {message.tags &&
            message.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {message.tags.map((tag) => (
                  <span
                    key={`${message.id}-${tag.label}`}
                    className="inline-flex items-center gap-1 rounded-md border border-white/[0.07] bg-white/[0.03] px-1.5 py-0.5 text-[7px] font-medium text-white/30"
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
        </div>
      </div>
    </article>
  );
}
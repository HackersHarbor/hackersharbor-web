"use client";

import type { Channel } from "../types/channel";

interface ChannelListItemProps {
  channel: Channel;
  active: boolean;
  onClick: () => void;
}

export function ChannelListItem({
  channel,
  active,
  onClick,
}: ChannelListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group relative mb-1.5 flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left",
        "border transition-all duration-200",
        active
          ? [
              "border-white/[0.105]",
              "bg-white/[0.075]",
              "shadow-[inset_0_1px_0_rgba(255,255,255,.045),0_8px_25px_rgba(0,0,0,.12)]",
            ].join(" ")
          : [
              "border-transparent",
              "bg-white/[0.012]",
              "hover:border-white/[0.055]",
              "hover:bg-white/[0.045]",
            ].join(" "),
      ].join(" ")}
    >
      {/* Active indicator */}

      {active && (
        <span
          aria-hidden="true"
          className="
            absolute
            bottom-2
            left-0
            top-2
            w-[2px]
            rounded-full
            bg-[#d5b86d]
            shadow-[0_0_9px_rgba(213,184,109,.35)]
          "
        />
      )}

      {/* Channel icon */}

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
          border-white/[0.075]
          bg-white/[0.035]
          text-[12px]
          text-white/45
          shadow-[inset_0_1px_0_rgba(255,255,255,.035)]
          transition
          group-hover:border-white/[0.11]
          group-hover:bg-white/[0.055]
        "
      >
        #
      </span>

      {/* Information */}

      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-center gap-1.5">
          <span
            className={[
              "truncate text-[11px] font-semibold",
              active ? "text-white/85" : "text-white/65",
            ].join(" ")}
          >
            {channel.name}
          </span>

          {channel.online && (
            <span
              className="
                h-1.5
                w-1.5
                shrink-0
                rounded-full
                bg-[#67a77b]
                shadow-[0_0_7px_rgba(103,167,123,.4)]
              "
            />
          )}
        </span>

        <span
          className="
            mt-0.5
            block
            truncate
            text-[9px]
            text-white/28
          "
        >
          {channel.description}
        </span>
      </span>

      {/* Reply/unread count */}

      {typeof channel.unreadCount === "number" &&
        channel.unreadCount > 0 && (
          <span
            className="
              flex
              h-5
              min-w-5
              shrink-0
              items-center
              justify-center
              rounded-md
              border
              border-[#8ba7df]/20
              bg-[#8ba7df]/[0.12]
              px-1.5
              text-[8px]
              font-semibold
              text-[#a9bce8]
            "
          >
            {channel.unreadCount}
          </span>
        )}
    </button>
  );
}
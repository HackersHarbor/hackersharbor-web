"use client";

import {
  LogOut,
  MoreHorizontal,
  Volume2,
} from "lucide-react";

interface ProfileCardProps {
  name: string;
  initials: string;
  status?: "online" | "offline";
  onSignOut?: () => void;
}

export function ProfileCard({
  name,
  initials,
  status = "online",
  onSignOut,
}: ProfileCardProps) {
  const isOnline = status === "online";

  return (
    <div
      className="
        border-t
        border-white/[0.08]
        px-3
        pb-0
        pt-3
      "
    >
      <div
        className="
          rounded-xl
          border
          border-white/[0.1]
          bg-white/[0.045]
          p-3
          shadow-[0_10px_30px_rgba(0,0,0,.12)]
          backdrop-blur-2xl
        "
      >
        <div className="flex items-center gap-3">
          {/* Avatar */}

          <div className="relative shrink-0">
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                bg-[#5039a3]
                text-[11px]
                font-semibold
                text-white
                shadow-[0_5px_18px_rgba(80,57,163,.22)]
              "
            >
              {initials}
            </div>

            <span
              className={[
                "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#252a32]",
                isOnline
                  ? "bg-[#65a97a]"
                  : "bg-white/25",
              ].join(" ")}
            />
          </div>

          {/* User information */}

          <div className="min-w-0 flex-1">
            <div className="truncate text-[12px] font-medium text-white">
              {name}
            </div>

            <div
              className="
                mt-0.5
                flex
                items-center
                gap-1.5
                text-[10px]
                text-white/45
              "
            >
              <span
                className={[
                  "h-1.5 w-1.5 rounded-full",
                  isOnline
                    ? "bg-[#65a97a] shadow-[0_0_6px_rgba(101,169,122,.45)]"
                    : "bg-white/25",
                ].join(" ")}
              />

              {isOnline ? "Online" : "Offline"}
            </div>
          </div>

          {/* More */}

          <button
            type="button"
            aria-label="Profile options"
            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-lg
              text-white/35
              transition
              hover:bg-white/[0.07]
              hover:text-white/70
            "
          >
            <MoreHorizontal size={15} />
          </button>
        </div>

        {/* Voice / sign out bar */}

        <div className="mt-3 flex items-center gap-2">
          <div
            className="
              flex
              h-8
              flex-1
              items-center
              gap-2
              rounded-lg
              border
              border-white/[0.08]
              bg-black/15
              px-2.5
              text-[10px]
              text-white/50
            "
          >
            <Volume2 size={13} />

            <span>Voice connected</span>

            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#65a97a]" />
          </div>

          <button
            type="button"
            onClick={onSignOut}
            className="
              flex
              h-8
              items-center
              justify-center
              gap-1.5
              rounded-lg
              border
              border-white/[0.08]
              bg-black/15
              px-2.5
              text-[10px]
              text-white/50
              transition
              hover:bg-white/[0.06]
              hover:text-white/75
            "
          >
            <LogOut size={12} />

            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
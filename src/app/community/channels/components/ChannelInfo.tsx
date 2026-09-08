"use client";

import type { Channel } from "../types/channel";

interface ChannelInfoProps {
  channel: Channel;
}

export function ChannelInfo({
  channel,
}: ChannelInfoProps) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.045] text-[13px] font-medium text-white/50">
          #
        </span>

        <div className="min-w-0">
          <h1 className="truncate text-[14px] font-semibold text-white/90">
            {channel.name}
          </h1>

          <div className="mt-0.5 flex items-center gap-2">
            {channel.online && (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-[#67a77b] shadow-[0_0_7px_rgba(103,167,123,.45)]" />

                <span className="text-[9px] text-white/30">
                  Active
                </span>
              </>
            )}

            {!channel.online && (
              <span className="text-[9px] text-white/25">
                Community channel
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="mt-2 max-w-[720px] truncate text-[10px] leading-5 text-white/35">
        {channel.description}
      </p>
    </div>
  );
}
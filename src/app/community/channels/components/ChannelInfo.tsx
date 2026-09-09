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
      <div className="flex items-center gap-2.5">
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
            border-white/[0.085]
            bg-white/[0.045]
            text-[13px]
            font-medium
            text-white/50
            shadow-[0_5px_18px_rgba(0,0,0,.12)]
            backdrop-blur-xl
          "
        >
          #
        </span>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1
              className="
                truncate
                text-[14px]
                font-semibold
                tracking-[-0.015em]
                text-white/90
              "
            >
              {channel.name}
            </h1>

            {channel.online && (
              <span
                className="
                  h-1.5
                  w-1.5
                  shrink-0
                  rounded-full
                  bg-[#67a77b]
                  shadow-[0_0_8px_rgba(103,167,123,.5)]
                "
              />
            )}
          </div>

          <div className="mt-0.5">
            {channel.online ? (
              <span className="text-[9px] text-white/30">
                Active
              </span>
            ) : (
              <span className="text-[9px] text-white/25">
                Community channel
              </span>
            )}
          </div>
        </div>
      </div>

      <p
        className="
          mt-2
          max-w-[720px]
          truncate
          text-[10px]
          leading-5
          text-white/32
        "
      >
        {channel.description}
      </p>
    </div>
  );
}
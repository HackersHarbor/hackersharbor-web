"use client";

import type { Channel } from "../types/channel";

import { ChannelActions } from "./ChannelActions";
import { ChannelInfo } from "./ChannelInfo";

interface ChannelToolbarProps {
  channel: Channel;
  onSearch?: () => void;
  onPinned?: () => void;
  onNotifications?: () => void;
  onMore?: () => void;
}

export function ChannelToolbar({
  channel,
  onSearch,
  onPinned,
  onNotifications,
  onMore,
}: ChannelToolbarProps) {
  return (
    <header className="shrink-0 border-b border-white/[0.07] bg-white/[0.012] px-5 py-3">
      <div className="flex min-w-0 items-center justify-between gap-4">
        <ChannelInfo channel={channel} />

        <ChannelActions
          onSearch={onSearch}
          onPinned={onPinned}
          onNotifications={onNotifications}
          onMore={onMore}
        />
      </div>
    </header>
  );
}
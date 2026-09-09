"use client";

import type { Channel } from "../types/channel";

import { ChannelListItem } from "./ChannelListItem";

interface ChannelListProps {
  channels: Channel[];
  activeChannelId: string;
  onChannelSelect: (channelId: string) => void;
}

export function ChannelList({
  channels,
  activeChannelId,
  onChannelSelect,
}: ChannelListProps) {
  return (
    <div className="space-y-1">
      {channels.map((channel) => (
        <ChannelListItem
          key={channel.id}
          channel={channel}
          active={channel.id === activeChannelId}
          onClick={() => onChannelSelect(channel.id)}
        />
      ))}
    </div>
  );
}
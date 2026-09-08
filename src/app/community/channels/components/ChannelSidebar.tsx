"use client";

import { useMemo, useState } from "react";

import type { Channel } from "../types/channel";

import { ChannelSearch } from "./ChannelSearch";
import { ChannelList } from "./ChannelList";
import { ProfileCard } from "./ProfileCard";

interface ChannelSidebarProps {
  channels: Channel[];
  activeChannelId: string;
  onChannelSelect: (channelId: string) => void;
}

export function ChannelSidebar({
  channels,
  activeChannelId,
  onChannelSelect,
}: ChannelSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChannels = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return channels;
    }

    return channels.filter((channel) => {
      return (
        channel.name.toLowerCase().includes(query) ||
        channel.description.toLowerCase().includes(query)
      );
    });
  }, [channels, searchQuery]);

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      {/* =========================================================
          SIDEBAR HEADER
          ========================================================= */}

      <div className="shrink-0 border-b border-white/[0.07] px-4 py-4">
        <div className="min-w-0">
          <h2 className="truncate text-[14px] font-semibold tracking-[-0.01em] text-white/90">
            Discussions
          </h2>

          <p className="mt-1 truncate text-[10px] text-white/35">
            Learn together. Build together.
          </p>
        </div>

        <div className="mt-3">
          <ChannelSearch
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
      </div>

      {/* =========================================================
          CHANNEL CONTENT
          ========================================================= */}

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        <div className="px-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
          Community
        </div>

        {filteredChannels.length > 0 ? (
          <ChannelList
            channels={filteredChannels}
            activeChannelId={activeChannelId}
            onChannelSelect={onChannelSelect}
          />
        ) : (
          <div className="px-2 py-8 text-center">
            <p className="text-[11px] text-white/35">
              No channels found
            </p>

            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="mt-2 text-[10px] text-white/50 underline underline-offset-2 transition hover:text-white/80"
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* =========================================================
          PROFILE / USER AREA
          ========================================================= */}

      <div className="shrink-0">
        <ProfileCard
          name="Punith"
          initials="PK"
          status="online"
        />
      </div>
    </div>
  );
}
"use client";

import { useMemo, useState } from "react";

import type {
  Channel,
  ChannelCategory,
} from "../types/channel";

import { ChannelSearch } from "./ChannelSearch";
import { ChannelList } from "./ChannelList";
import { ProfileCard } from "./ProfileCard";

interface ChannelSidebarProps {
  channels: Channel[];
  activeChannelId: string;
  onChannelSelect: (channelId: string) => void;
}

/* =========================================================
   CATEGORY CONFIGURATION
   ========================================================= */

const CATEGORY_ORDER: ChannelCategory[] = [
  "community",
  "development",
  "data-ai",
  "computing",
  "career",
];

const CATEGORY_LABELS: Record<
  ChannelCategory,
  string
> = {
  community: "Community",
  development: "Development",
  "data-ai": "Data & AI",
  computing: "Computing",
  career: "Career",
};

/* =========================================================
   SIDEBAR
   ========================================================= */

export function ChannelSidebar({
  channels,
  activeChannelId,
  onChannelSelect,
}: ChannelSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  /* =======================================================
     FILTER CHANNELS
     ======================================================= */

  const filteredChannels = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return channels;
    }

    return channels.filter((channel) => {
      return (
        channel.name.toLowerCase().includes(query) ||
        channel.description
          .toLowerCase()
          .includes(query)
      );
    });
  }, [channels, searchQuery]);

  /* =======================================================
     GROUP CHANNELS
     ======================================================= */

  const groupedChannels = useMemo(() => {
    return CATEGORY_ORDER.map((category) => ({
      category,
      label: CATEGORY_LABELS[category],
      channels: filteredChannels.filter(
        (channel) =>
          channel.category === category,
      ),
    })).filter(
      (group) => group.channels.length > 0,
    );
  }, [filteredChannels]);

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div
      className="
        flex
        h-full
        min-h-0
        w-full
        flex-col
        bg-transparent
      "
    >
      {/* =====================================================
          HEADER
          ===================================================== */}

      <div
        className="
          shrink-0
          border-b
          border-white/[0.045]
          bg-[#0a1016]/[0.22]
          px-4
          py-3
        "
      >
        <div className="min-w-0">
          <h2
            className="
              truncate
              text-[14px]
              font-semibold
              tracking-[-0.01em]
              text-white/88
            "
          >
            Discussions
          </h2>

          <p
            className="
              mt-0.5
              truncate
              text-[10px]
              text-white/30
            "
          >
            Learn together. Build together.
          </p>
        </div>

        <div className="mt-2.5">
          <ChannelSearch
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
      </div>

      {/* =====================================================
          CHANNEL CONTENT
          ===================================================== */}

      <div
        className="
          min-h-0
          flex-1
          overflow-y-auto
          px-3
          py-3
          scrollbar-thin
          scrollbar-track-transparent
          scrollbar-thumb-white/10
        "
      >
        {groupedChannels.length > 0 ? (
          <div className="space-y-4">
            {groupedChannels.map(
              ({
                category,
                label,
                channels: categoryChannels,
              }) => (
                <section
                  key={category}
                  aria-labelledby={`channel-category-${category}`}
                >
                  {/* CATEGORY TITLE */}

                  <div
                    id={`channel-category-${category}`}
                    className="
                      px-2
                      pb-1.5
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-[0.16em]
                      text-white/26
                    "
                  >
                    {label}
                  </div>

                  {/* CHANNELS */}

                  <ChannelList
                    channels={categoryChannels}
                    activeChannelId={
                      activeChannelId
                    }
                    onChannelSelect={
                      onChannelSelect
                    }
                  />
                </section>
              ),
            )}
          </div>
        ) : (
          /* =================================================
             EMPTY SEARCH STATE
             ================================================= */

          <div className="px-2 py-8 text-center">
            <p className="text-[11px] text-white/30">
              No channels found
            </p>

            <button
              type="button"
              onClick={() =>
                setSearchQuery("")
              }
              className="
                mt-2
                text-[10px]
                text-white/42
                underline
                underline-offset-2
                transition
                hover:text-white/72
              "
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* =====================================================
          PROFILE
          ===================================================== */}

      <div
        className="
          shrink-0
          border-t
          border-white/[0.045]
          bg-[#0a1016]/[0.18]
          backdrop-blur-2xl
        "
      >
        <ProfileCard
          name="Punith"
          initials="PK"
          status="online"
        />
      </div>
    </div>
  );
}
"use client";

import {
  Bell,
  Hash,
  MoreHorizontal,
  Pin,
  Search,
  Users,
} from "lucide-react";

import type { Channel } from "../types/channel";

interface ChannelHeaderProps {
  channel: Channel;
  onSearch?: () => void;
  onPinned?: () => void;
  onMembers?: () => void;
  onMore?: () => void;
}

export function ChannelHeader({
  channel,
  onSearch,
  onPinned,
  onMembers,
  onMore,
}: ChannelHeaderProps) {
  return (
    <header className="flex h-[64px] shrink-0 items-center justify-between border-b border-white/[0.08] bg-slate-950/25 px-5 backdrop-blur-2xl">
      {/* Channel identity */}

      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.055] text-white/55 shadow-[0_6px_20px_rgba(0,0,0,.12)] backdrop-blur-xl">
          <Hash size={17} strokeWidth={1.7} />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-[13px] font-semibold text-white/90">
              {channel.name}
            </h1>

            {channel.online && (
              <span className="flex items-center gap-1 text-[9px] text-[#71aa82]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#71aa82] shadow-[0_0_7px_rgba(113,170,130,.45)]" />
                Active
              </span>
            )}
          </div>

          <p className="mt-0.5 truncate text-[10px] text-white/35">
            {channel.description}
          </p>
        </div>
      </div>

      {/* Actions */}

      <div className="ml-4 flex shrink-0 items-center gap-1">
        <HeaderAction
          label="Search"
          onClick={onSearch}
        >
          <Search size={15} />
        </HeaderAction>

        <HeaderAction
          label="Pinned messages"
          onClick={onPinned}
        >
          <Pin size={15} />
        </HeaderAction>

        <HeaderAction
          label="Notifications"
        >
          <Bell size={15} />
        </HeaderAction>

        <HeaderAction
          label="Members"
          onClick={onMembers}
        >
          <Users size={15} />
        </HeaderAction>

        <HeaderAction
          label="More options"
          onClick={onMore}
        >
          <MoreHorizontal size={16} />
        </HeaderAction>
      </div>
    </header>
  );
}

interface HeaderActionProps {
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
}

function HeaderAction({
  label,
  children,
  onClick,
}: HeaderActionProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-white/35 transition-all duration-200 hover:border-white/[0.08] hover:bg-white/[0.055] hover:text-white/75"
    >
      {children}
    </button>
  );
}
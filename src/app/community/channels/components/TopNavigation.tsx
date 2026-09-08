"use client";

import type { ReactNode } from "react";

import {
  Bell,
  ChevronDown,
  CircleUserRound,
  Compass,
  LayoutDashboard,
  Search,
  Settings,
  Ship,
  Users,
} from "lucide-react";

interface TopNavigationProps {
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  onNotifications?: () => void;
  onSettings?: () => void;
  onWorkspaceMenu?: () => void;
}

export function TopNavigation({
  searchQuery = "",
  onSearchChange,
  onNotifications,
  onSettings,
  onWorkspaceMenu,
}: TopNavigationProps) {
  return (
    <header
      className="
        relative
        flex
        h-[78px]
        shrink-0
        items-center
        border-b
        border-white/[0.075]
        bg-[#0d1117]/[0.52]
        px-5
        backdrop-blur-2xl
      "
    >
      {/* =========================================================
          LEFT — WORKSPACE BRAND
          ========================================================= */}

      <div className="flex min-w-[250px] items-center">
        <button
          type="button"
          onClick={onWorkspaceMenu}
          className="
            group
            flex
            items-center
            gap-3
            rounded-xl
            px-2
            py-1.5
            text-left
            transition
            duration-200
            hover:bg-white/[0.035]
          "
        >
          {/* Harbor mark */}

          <span
            className="
              relative
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              overflow-hidden
              rounded-xl
              border
              border-white/[0.10]
              bg-white/[0.045]
              shadow-[inset_0_1px_0_rgba(255,255,255,0.045)]
              backdrop-blur-xl
            "
          >
            <span
              aria-hidden="true"
              className="
                absolute
                inset-0
                bg-[radial-gradient(
                  circle_at_50%_25%,
                  rgba(255,255,255,0.08),
                  transparent_62%
                )]
              "
            />

            <Ship
              size={19}
              strokeWidth={1.45}
              className="
                relative
                text-white/65
                transition
                duration-200
                group-hover:text-white/80
              "
            />
          </span>

          {/* Brand text */}

          <span className="hidden sm:block">
            <span
              className="
                block
                text-[16px]
                font-semibold
                leading-none
                tracking-[-0.035em]
                text-white/90
              "
            >
              Hackers<span className="text-[#6385b7]">Harbor</span>
            </span>

            <span
              className="
                mt-1
                block
                text-[9px]
                font-medium
                tracking-[0.015em]
                text-white/32
              "
            >
              Channels / Discussions
            </span>
          </span>

          <ChevronDown
            size={13}
            strokeWidth={1.7}
            className="
              ml-0.5
              text-white/25
              transition
              duration-200
              group-hover:text-white/50
            "
          />
        </button>
      </div>

      {/* =========================================================
          CENTER — PRIMARY NAVIGATION
          ========================================================= */}

      <nav
        aria-label="Primary navigation"
        className="
          absolute
          left-1/2
          hidden
          -translate-x-1/2
          items-center
          gap-1
          lg:flex
        "
      >
        <NavigationItem label="Dashboard" />

        <NavigationItem
          label="Practice"
          indicator
        />

        <NavigationItem
          label="The Voyage"
          challenge
        />

        <NavigationItem label="The Dock" />

        <NavigationItem
          label="Community"
          active
        />
      </nav>

      {/* =========================================================
          RIGHT — SEARCH + ACTIONS + PROFILE
          ========================================================= */}

      <div className="ml-auto flex items-center gap-1.5">
        {/* Search */}

        <div className="hidden items-center md:flex">
          <label
            className="
              flex
              h-9
              w-[270px]
              items-center
              gap-2.5
              rounded-xl
              border
              border-white/[0.075]
              bg-white/[0.035]
              px-3
              text-white/25
              shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]
              backdrop-blur-xl
              transition
              duration-200
              focus-within:border-white/[0.14]
              focus-within:bg-white/[0.05]
            "
          >
            <Search
              size={14}
              strokeWidth={1.7}
              className="shrink-0 text-white/32"
            />

            <input
              type="search"
              value={searchQuery}
              onChange={(event) =>
                onSearchChange?.(event.target.value)
              }
              placeholder="Search"
              aria-label="Search"
              className="
                min-w-0
                flex-1
                bg-transparent
                text-[11px]
                font-medium
                text-white/70
                outline-none
                placeholder:text-white/25
              "
            />

            <kbd
              className="
                rounded-md
                border
                border-white/[0.075]
                bg-black/[0.10]
                px-2
                py-1
                text-[8px]
                font-medium
                tracking-[0.02em]
                text-white/25
              "
            >
              S6K
            </kbd>
          </label>
        </div>

        {/* User icon */}

        <TopBarIconButton
          label="Profile"
          onClick={undefined}
        >
          <CircleUserRound
            size={17}
            strokeWidth={1.55}
          />
        </TopBarIconButton>

        {/* Notifications */}

        <TopBarIconButton
          label="Notifications"
          onClick={onNotifications}
        >
          <Bell
            size={15}
            strokeWidth={1.6}
          />
        </TopBarIconButton>

        {/* Settings */}

        <TopBarIconButton
          label="Settings"
          onClick={onSettings}
        >
          <Settings
            size={15}
            strokeWidth={1.6}
          />
        </TopBarIconButton>

        {/* Theme / appearance button */}

        <button
          type="button"
          aria-label="Change appearance"
          title="Change appearance"
          className="
            ml-1
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-xl
            border
            border-white/[0.075]
            bg-white/[0.035]
            shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]
            backdrop-blur-xl
            transition
            duration-200
            hover:bg-white/[0.065]
          "
        >
          <span
            className="
              h-5
              w-5
              rounded-full
              border
              border-white/[0.18]
              bg-[#c8b990]
              shadow-[0_0_12px_rgba(200,185,144,0.12)]
            "
          />
        </button>
      </div>
    </header>
  );
}

/* ===============================================================
   NAVIGATION ITEM
   =============================================================== */

interface NavigationItemProps {
  label: string;
  active?: boolean;
  indicator?: boolean;
  challenge?: boolean;
}

function NavigationItem({
  label,
  active = false,
  indicator = false,
  challenge = false,
}: NavigationItemProps) {
  return (
    <div className="relative">
      {/* New Challenge badge */}

      {challenge && (
        <span
          className="
            absolute
            -top-[17px]
            left-1/2
            -translate-x-1/2
            whitespace-nowrap
            rounded-md
            border
            border-[#7190c2]/[0.45]
            bg-[#34527f]/[0.65]
            px-1.5
            py-0.5
            text-[7px]
            font-medium
            leading-none
            text-[#dce7ff]/[0.90]
            shadow-[0_3px_10px_rgba(40,65,105,0.22)]
          "
        >
          New Challenge
        </span>
      )}

      <button
        type="button"
        className={[
          "relative flex h-10 items-center gap-1.5 rounded-xl px-4",
          "text-[12px] font-medium",
          "transition duration-200",
          active
            ? [
                "border border-white/[0.075]",
                "bg-white/[0.075]",
                "text-white/80",
                "shadow-[inset_0_1px_0_rgba(255,255,255,0.045)]",
                "backdrop-blur-xl",
              ].join(" ")
            : [
                "border border-transparent",
                "text-white/42",
                "hover:bg-white/[0.035]",
                "hover:text-white/68",
              ].join(" "),
        ].join(" ")}
      >
        {label}

        {/* Small activity indicator */}

        {indicator && (
          <span
            aria-hidden="true"
            className="
              h-1.5
              w-1.5
              rounded-full
              bg-[#bd6b6b]
              shadow-[0_0_7px_rgba(189,107,107,0.38)]
            "
          />
        )}

        {/* Voyage indicator */}

        {challenge && (
          <span
            aria-hidden="true"
            className="
              h-1.5
              w-1.5
              rounded-full
              bg-[#6b9a7b]
              shadow-[0_0_7px_rgba(107,154,123,0.32)]
            "
          />
        )}
      </button>
    </div>
  );
}

/* ===============================================================
   TOP BAR ICON BUTTON
   =============================================================== */

interface TopBarIconButtonProps {
  label: string;
  children: ReactNode;
  onClick?: () => void;
}

function TopBarIconButton({
  label,
  children,
  onClick,
}: TopBarIconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="
        flex
        h-9
        w-9
        items-center
        justify-center
        rounded-xl
        border
        border-transparent
        text-white/32
        transition
        duration-200
        hover:border-white/[0.055]
        hover:bg-white/[0.045]
        hover:text-white/70
      "
    >
      {children}
    </button>
  );
}
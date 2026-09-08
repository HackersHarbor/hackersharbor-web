"use client";

import type { ReactNode } from "react";

interface ChannelsShellProps {
  topNavigation: ReactNode;
  sidebar: ReactNode;
  main: ReactNode;
  thread?: ReactNode;
}

export function ChannelsShell({
  topNavigation,
  sidebar,
  main,
  thread,
}: ChannelsShellProps) {
  return (
    <main className="relative h-screen overflow-hidden bg-[#080b10] text-white antialiased">
      {/* =========================================================
          AMBIENT DESKTOP / WALLPAPER LAYER
          ========================================================= */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {/* Deep base atmosphere */}

        <div className="absolute inset-0 bg-[#080b10]" />

        {/* Large cold glow — upper left */}

        <div
          className="
            absolute
            -left-[16vw]
            -top-[18vh]
            h-[72vh]
            w-[62vw]
            rounded-full
            bg-[#526a7c]/[0.15]
            blur-[170px]
          "
        />

        {/* Steel-blue glow — left center */}

        <div
          className="
            absolute
            -left-[8vw]
            top-[22vh]
            h-[58vh]
            w-[38vw]
            rounded-full
            bg-[#34566e]/[0.12]
            blur-[145px]
          "
        />

        {/* Muted warm glow — upper right */}

        <div
          className="
            absolute
            -right-[13vw]
            -top-[8vh]
            h-[62vh]
            w-[48vw]
            rounded-full
            bg-[#75684e]/[0.095]
            blur-[165px]
          "
        />

        {/* Right-middle atmospheric glow */}

        <div
          className="
            absolute
            right-[2vw]
            top-[38vh]
            h-[45vh]
            w-[32vw]
            rounded-full
            bg-[#455d70]/[0.075]
            blur-[150px]
          "
        />

        {/* Bottom atmospheric glow */}

        <div
          className="
            absolute
            -bottom-[30vh]
            left-[20vw]
            h-[70vh]
            w-[65vw]
            rounded-full
            bg-[#344b61]/[0.105]
            blur-[180px]
          "
        />

        {/* Very subtle central illumination */}

        <div
          className="
            absolute
            left-1/2
            top-[5vh]
            h-[55vh]
            w-[38vw]
            -translate-x-1/2
            rounded-full
            bg-white/[0.018]
            blur-[150px]
          "
        />

        {/* Top atmospheric wash */}

        <div
          className="
            absolute
            inset-x-0
            top-0
            h-[32vh]
            bg-[radial-gradient(
              ellipse_at_50%_0%,
              rgba(255,255,255,0.045),
              transparent_68%
            )]
          "
        />

        {/* Bottom darkness */}

        <div
          className="
            absolute
            inset-x-0
            bottom-0
            h-[35vh]
            bg-[linear-gradient(
              180deg,
              transparent,
              rgba(0,0,0,0.22)
            )]
          "
        />

        {/* Fine wallpaper texture */}

        <div
          className="
            absolute
            inset-0
            opacity-[0.10]
            bg-[linear-gradient(
              rgba(255,255,255,0.016)_1px,
              transparent_1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,0.016)_1px,
              transparent_1px
            )]
            bg-[size:84px_84px]
          "
        />

        {/* Global atmospheric gradient */}

        <div
          className="
            absolute
            inset-0
            bg-[linear-gradient(
              110deg,
              rgba(255,255,255,0.012),
              transparent_35%,
              rgba(255,255,255,0.008)
            )]
          "
        />
      </div>

      {/* =========================================================
          APPLICATION
          ========================================================= */}

      <div className="relative z-10 flex h-full min-h-0 flex-col">
        {/* =======================================================
            TOP NAVIGATION
            ======================================================= */}

        <div className="relative z-30 shrink-0">
          {topNavigation}
        </div>

        {/* =======================================================
            FLOATING GLASS WORKSPACE
            ======================================================= */}

        <div className="min-h-0 flex-1 p-2 sm:p-3">
          <div
            className="
              relative
              flex
              h-full
              min-h-0
              min-w-0
              overflow-hidden
              rounded-[18px]
              border
              border-white/[0.085]
              bg-[#11151b]/[0.30]
              shadow-[0_28px_90px_rgba(0,0,0,0.34),0_8px_30px_rgba(0,0,0,0.18)]
              backdrop-blur-2xl
            "
          >
            {/* Workspace glass highlight */}

            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-0
                z-30
                rounded-[18px]
                bg-[linear-gradient(
                  180deg,
                  rgba(255,255,255,0.018),
                  transparent_18%,
                  transparent_82%,
                  rgba(0,0,0,0.045)
                )]
              "
            />

            {/* =================================================
                SIDEBAR
                ================================================= */}

            <aside
              className="
                relative
                z-10
                flex
                w-[274px]
                shrink-0
                flex-col
                overflow-hidden
                border-r
                border-white/[0.075]
                bg-[#11161d]/[0.39]
                backdrop-blur-2xl
              "
            >
              {/* Sidebar light reflection */}

              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  inset-y-0
                  right-0
                  w-px
                  bg-gradient-to-b
                  from-white/[0.09]
                  via-white/[0.025]
                  to-transparent
                "
              />

              {sidebar}
            </aside>

            {/* =================================================
                MAIN CHANNEL
                ================================================= */}

            <section
              className="
                relative
                z-10
                min-w-0
                flex-1
                overflow-hidden
                bg-[#0d1218]/[0.28]
                backdrop-blur-xl
              "
            >
              {/* Main glass reflection */}

              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  inset-x-0
                  top-0
                  z-30
                  h-px
                  bg-white/[0.065]
                "
              />

              {main}
            </section>

            {/* =================================================
                THREAD PANEL
                ================================================= */}

            {thread && (
              <aside
                className="
                  relative
                  z-10
                  flex
                  w-[395px]
                  shrink-0
                  flex-col
                  overflow-hidden
                  border-l
                  border-white/[0.075]
                  bg-[#11161c]/[0.40]
                  backdrop-blur-2xl
                "
              >
                {/* Thread glass reflection */}

                <div
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    inset-y-0
                    left-0
                    w-px
                    bg-gradient-to-b
                    from-white/[0.09]
                    via-white/[0.025]
                    to-transparent
                  "
                />

                {thread}
              </aside>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================
          EDGE VIGNETTE
          ========================================================= */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-40
          shadow-[inset_0_0_150px_rgba(0,0,0,0.38)]
        "
      />
    </main>
  );
}
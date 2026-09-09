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
    <main
      className="
        relative
        h-screen
        min-h-0
        overflow-hidden
        bg-[#070a0e]
        text-white
        antialiased
      "
    >
      {/* =========================================================
          GLOBAL GLASS ATMOSPHERE
          ========================================================= */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          overflow-hidden
        "
      >
        {/* Base */}

        <div className="absolute inset-0 bg-[#070a0e]" />

        {/* -------------------------------------------------------
            LEFT COLD GLASS LIGHT
            ------------------------------------------------------- */}

        <div
          className="
            absolute
            -left-[18vw]
            -top-[18vh]
            h-[75vh]
            w-[58vw]
            rounded-full
            bg-[#607789]/[0.15]
            blur-[170px]
          "
        />

        <div
          className="
            absolute
            -left-[12vw]
            top-[18vh]
            h-[58vh]
            w-[38vw]
            rounded-full
            bg-[#31566f]/[0.11]
            blur-[150px]
          "
        />

        {/* -------------------------------------------------------
            CENTER LIGHT
            ------------------------------------------------------- */}

        <div
          className="
            absolute
            left-[35%]
            top-[8vh]
            h-[58vh]
            w-[40vw]
            -translate-x-1/2
            rounded-full
            bg-[#536a7a]/[0.045]
            blur-[180px]
          "
        />

        {/* -------------------------------------------------------
            RIGHT WARM GLASS LIGHT
            ------------------------------------------------------- */}

        <div
          className="
            absolute
            -right-[15vw]
            -top-[10vh]
            h-[65vh]
            w-[48vw]
            rounded-full
            bg-[#75694f]/[0.085]
            blur-[175px]
          "
        />

        <div
          className="
            absolute
            right-0
            top-[34vh]
            h-[45vh]
            w-[32vw]
            rounded-full
            bg-[#4c6576]/[0.065]
            blur-[160px]
          "
        />

        {/* -------------------------------------------------------
            LOWER ATMOSPHERE
            ------------------------------------------------------- */}

        <div
          className="
            absolute
            -bottom-[30vh]
            left-[20vw]
            h-[65vh]
            w-[65vw]
            rounded-full
            bg-[#40576a]/[0.085]
            blur-[190px]
          "
        />

        {/* -------------------------------------------------------
            TOP GLASS WASH
            ------------------------------------------------------- */}

        <div
          className="
            absolute
            inset-x-0
            top-0
            h-[38vh]
            bg-[radial-gradient(
              ellipse_at_50%_0%,
              rgba(255,255,255,0.045),
              transparent_68%
            )]
          "
        />

        {/* -------------------------------------------------------
            CENTERED GLASS SHEEN
            ------------------------------------------------------- */}

        <div
          className="
            absolute
            inset-0
            bg-[linear-gradient(
              112deg,
              rgba(255,255,255,0.012),
              transparent_28%,
              rgba(255,255,255,0.008)_65%,
              transparent
            )]
          "
        />

        {/* -------------------------------------------------------
            VERY SUBTLE GRID
            ------------------------------------------------------- */}

        <div
          className="
            absolute
            inset-0
            opacity-[0.055]
            bg-[linear-gradient(
              rgba(255,255,255,0.018)_1px,
              transparent_1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,0.018)_1px,
              transparent_1px
            )]
            bg-[size:84px_84px]
          "
        />

        {/* -------------------------------------------------------
            BOTTOM VIGNETTE
            ------------------------------------------------------- */}

        <div
          className="
            absolute
            inset-x-0
            bottom-0
            h-[42vh]
            bg-[linear-gradient(
              180deg,
              transparent,
              rgba(0,0,0,0.30)
            )]
          "
        />
      </div>

      {/* =========================================================
          APPLICATION
          ========================================================= */}

      <div
        className="
          relative
          z-10
          flex
          h-full
          min-h-0
          flex-col
        "
      >
        {/* =======================================================
            TOP NAVIGATION
            ======================================================= */}

        <div
          className="
            relative
            z-50
            shrink-0
          "
        >
          {topNavigation}
        </div>

        {/* =======================================================
            WORKSPACE

            IMPORTANT:
            This is the shared height container for all three
            columns.

            Sidebar
            Main
            Thread

            must all stretch from the same top edge to the same
            bottom edge.
            ======================================================= */}

        <div
          className="
            relative
            min-h-0
            flex-1
            overflow-hidden
            px-0
            pt-0
            pb-0
          "
        >
          {/* =====================================================
              SHARED COLUMN BASELINE

              items-stretch is important here.

              It guarantees that sidebar, main and thread occupy
              the exact same vertical height.
              ===================================================== */}

          <div
            className="
              relative
              flex
              h-full
              min-h-0
              min-w-0
              items-stretch
              overflow-hidden
              rounded-none
              border
              border-white/[0.105]
              bg-white/[0.018]
              shadow-[0_35px_120px_rgba(0,0,0,0.42),0_12px_40px_rgba(0,0,0,0.22)]
              backdrop-blur-[28px]
            "
          >
            {/* ===================================================
                OUTER GLASS REFLECTION
                =================================================== */}

            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-0
                z-[50]
                rounded-none
                border
                border-white/[0.035]
              "
            />

            {/* ===================================================
                TOP GLASS REFLECTION
                =================================================== */}

            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-x-0
                top-0
                z-[51]
                h-px
                bg-white/[0.11]
              "
            />

            {/* ===================================================
                INNER GLASS LIGHT
                =================================================== */}

            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-0
                z-[49]
                rounded-none
                bg-[linear-gradient(
                  180deg,
                  rgba(255,255,255,0.020),
                  transparent_15%,
                  transparent_82%,
                  rgba(0,0,0,0.06)
                )]
              "
            />

            {/* ===================================================
                SIDEBAR
                =================================================== */}

            <aside
              className="
                relative
                z-10
                flex
                h-full
                min-h-0
                w-[274px]
                shrink-0
                flex-col
                overflow-hidden
                border-r
                border-white/[0.085]
                bg-white/[0.018]
                backdrop-blur-[30px]
              "
            >
              {/* Sidebar glass highlight */}

              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  inset-y-0
                  right-0
                  z-30
                  w-px
                  bg-gradient-to-b
                  from-white/[0.13]
                  via-white/[0.035]
                  to-transparent
                "
              />

              {/* Sidebar ambient highlight */}

              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  left-0
                  top-0
                  h-[250px]
                  w-full
                  bg-[radial-gradient(
                    ellipse_at_18%_0%,
                    rgba(255,255,255,0.035),
                    transparent_70%
                  )]
                "
              />

              {/* Sidebar vertical wash */}

              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  bg-[linear-gradient(
                    180deg,
                    rgba(255,255,255,0.012),
                    transparent_35%
                  )]
                "
              />

              {/* =================================================
                  SIDEBAR CONTENT

                  flex-1 + min-h-0 means the sidebar footer can
                  stay pinned to the exact bottom.
                  ================================================= */}

              <div
                className="
                  relative
                  z-10
                  flex
                  h-full
                  min-h-0
                  flex-1
                  flex-col
                "
              >
                {sidebar}
              </div>
            </aside>

            {/* ===================================================
                MAIN CHANNEL
                =================================================== */}

            <section
              className="
                relative
                z-10
                flex
                h-full
                min-h-0
                min-w-0
                flex-1
                flex-col
                overflow-hidden
                border-r
                border-white/[0.055]
                bg-white/[0.010]
                backdrop-blur-[24px]
              "
            >
              {/* Main left glass edge */}

              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  inset-y-0
                  left-0
                  z-30
                  w-px
                  bg-gradient-to-b
                  from-white/[0.055]
                  via-white/[0.018]
                  to-transparent
                "
              />

              {/* Main top reflection */}

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

              {/* =================================================
                  MAIN CONTENT

                  Explicit h-full ensures MainChannel receives the
                  entire shared workspace height.
                  ================================================= */}

              <div
                className="
                  relative
                  z-10
                  flex
                  h-full
                  min-h-0
                  min-w-0
                  flex-1
                  flex-col
                  overflow-hidden
                "
              >
                {main}
              </div>
            </section>

            {/* ===================================================
                THREAD PANEL
                =================================================== */}

            {thread && (
              <aside
                className="
                  relative
                  z-10
                  flex
                  h-full
                  min-h-0
                  w-[380px]
                  shrink-0
                  flex-col
                  overflow-hidden
                  bg-white/[0.018]
                  backdrop-blur-[30px]
                "
              >
                {/* Thread glass edge */}

                <div
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    inset-y-0
                    left-0
                    z-30
                    w-px
                    bg-gradient-to-b
                    from-white/[0.13]
                    via-white/[0.035]
                    to-transparent
                  "
                />

                {/* Thread atmospheric reflection */}

                <div
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    right-0
                    top-0
                    h-[260px]
                    w-[280px]
                    translate-x-[38%]
                    -translate-y-[18%]
                    rounded-full
                    bg-[#728394]/[0.055]
                    blur-[90px]
                  "
                />

                {/* Thread top reflection */}

                <div
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    inset-x-0
                    top-0
                    z-20
                    h-px
                    bg-white/[0.07]
                  "
                />

                {/* =================================================
                    THREAD CONTENT

                    Explicit h-full + flex column makes the
                    ThreadComposer remain attached to the bottom.
                    ================================================= */}

                <div
                  className="
                    relative
                    z-10
                    flex
                    h-full
                    min-h-0
                    flex-1
                    flex-col
                    overflow-hidden
                  "
                >
                  {thread}
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================
          GLOBAL VIGNETTE
          ========================================================= */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-[60]
          shadow-[inset_0_0_150px_rgba(0,0,0,0.40)]
        "
      />
    </main>
  );
}
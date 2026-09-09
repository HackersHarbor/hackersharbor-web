"use client";

import { useEffect, useState } from "react";
import { Check, Users, X } from "lucide-react";

import type { Message } from "../types/message";

interface StartCrewDialogProps {
  message: Message | null;
  open: boolean;
  onClose: () => void;
  onCreate: (data: {
    name: string;
    goal: string;
    memberIds: string[];
  }) => void;
}

export function StartCrewDialog({
  message,
  open,
  onClose,
  onCreate,
}: StartCrewDialogProps) {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");

  useEffect(() => {
    if (!open || !message) {
      return;
    }

    setName(
      `${message.author.name.replace(/\s+/g, " ").trim()}'s Crew`,
    );

    setGoal(
      message.content.length > 100
        ? `${message.content.slice(0, 100)}...`
        : message.content,
    );
  }, [open, message]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open || !message) {
    return null;
  }

  const handleCreate = () => {
    const trimmedName = name.trim();
    const trimmedGoal = goal.trim();

    if (!trimmedName) {
      return;
    }

    onCreate({
      name: trimmedName,
      goal: trimmedGoal,
      memberIds: ["you", message.author.id],
    });
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/45
        px-4
        backdrop-blur-md
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="start-crew-title"
        className="
          relative
          w-full
          max-w-[460px]
          overflow-hidden
          rounded-2xl
          border
          border-white/[0.10]
          bg-[#10161d]/[0.86]
          shadow-[0_30px_100px_rgba(0,0,0,.45)]
          backdrop-blur-[35px]
        "
      >
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-x-0
            top-0
            h-px
            bg-white/[0.12]
          "
        />

        {/* Header */}
        <div
          className="
            flex
            items-start
            justify-between
            border-b
            border-white/[0.06]
            px-5
            py-4
          "
        >
          <div className="flex items-center gap-2">
            <div
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-xl
                border
                border-white/[0.08]
                bg-white/[0.055]
                text-white/60
              "
            >
              <Users size={15} />
            </div>

            <div>
              <h2
                id="start-crew-title"
                className="
                  text-[13px]
                  font-semibold
                  tracking-[-0.01em]
                  text-white/90
                "
              >
                Start a Crew
              </h2>

              <p className="mt-0.5 text-[9px] text-white/30">
                Turn a conversation into a focused group.
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-lg
              text-white/30
              transition
              hover:bg-white/[0.07]
              hover:text-white/70
            "
          >
            <X size={15} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          {/* Source message */}
          <div
            className="
              rounded-xl
              border
              border-white/[0.065]
              bg-white/[0.025]
              px-3.5
              py-3
            "
          >
            <div className="flex items-center gap-2">
              <div
                className="
                  flex
                  h-7
                  w-7
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-white/[0.07]
                  bg-white/[0.05]
                  text-[9px]
                  font-semibold
                  text-white/55
                "
              >
                {message.author.initials}
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-medium text-white/65">
                  {message.author.name}
                </p>

                <p className="truncate text-[8px] text-white/25">
                  Starting from this conversation
                </p>
              </div>
            </div>

            <p className="mt-2 text-[10px] leading-[1.6] text-white/45">
              {message.content}
            </p>
          </div>

          {/* Crew name */}
          <div>
            <label
              htmlFor="crew-name"
              className="
                mb-1.5
                block
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.14em]
                text-white/35
              "
            >
              Crew name
            </label>

            <input
              id="crew-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Python Interview Crew"
              className="
                h-10
                w-full
                rounded-xl
                border
                border-white/[0.08]
                bg-white/[0.035]
                px-3
                text-[11px]
                text-white/75
                outline-none
                placeholder:text-white/20
                transition
                focus:border-white/[0.15]
                focus:bg-white/[0.05]
              "
            />
          </div>

          {/* Goal */}
          <div>
            <label
              htmlFor="crew-goal"
              className="
                mb-1.5
                block
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.14em]
                text-white/35
              "
            >
              What are you working on?
            </label>

            <textarea
              id="crew-goal"
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
              rows={3}
              placeholder="Describe the goal of your crew..."
              className="
                w-full
                resize-none
                rounded-xl
                border
                border-white/[0.08]
                bg-white/[0.035]
                px-3
                py-2.5
                text-[11px]
                leading-[1.6]
                text-white/75
                outline-none
                placeholder:text-white/20
                transition
                focus:border-white/[0.15]
                focus:bg-white/[0.05]
              "
            />
          </div>

          {/* Members */}
          <div>
            <p
              className="
                mb-1.5
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.14em]
                text-white/35
              "
            >
              Initial members
            </p>

            <div
              className="
                flex
                items-center
                gap-2
                rounded-xl
                border
                border-white/[0.06]
                bg-white/[0.02]
                px-3
                py-2.5
              "
            >
              <div className="flex -space-x-1.5">
                <div
                  className="
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-[#10161d]
                    bg-white/[0.08]
                    text-[8px]
                    font-semibold
                    text-white/60
                  "
                >
                  YO
                </div>

                <div
                  className="
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-[#10161d]
                    bg-white/[0.08]
                    text-[8px]
                    font-semibold
                    text-white/60
                  "
                >
                  {message.author.initials}
                </div>
              </div>

              <span className="text-[10px] text-white/40">
                You + {message.author.name}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="
            flex
            items-center
            justify-end
            gap-2
            border-t
            border-white/[0.06]
            bg-white/[0.012]
            px-5
            py-3.5
          "
        >
          <button
            type="button"
            onClick={onClose}
            className="
              rounded-xl
              border
              border-transparent
              px-3.5
              py-2
              text-[10px]
              font-medium
              text-white/35
              transition
              hover:bg-white/[0.05]
              hover:text-white/65
            "
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!name.trim()}
            onClick={handleCreate}
            className="
              inline-flex
              items-center
              gap-1.5
              rounded-xl
              border
              border-white/[0.10]
              bg-white/[0.075]
              px-3.5
              py-2
              text-[10px]
              font-semibold
              text-white/75
              shadow-[0_8px_25px_rgba(0,0,0,.15)]
              backdrop-blur-xl
              transition
              hover:border-white/[0.16]
              hover:bg-white/[0.11]
              hover:text-white/90
              disabled:cursor-not-allowed
              disabled:opacity-30
            "
          >
            <Check size={12} />
            Create Crew
          </button>
        </div>
      </div>
    </div>
  );
}
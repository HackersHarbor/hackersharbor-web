'use client'

import { COLORS } from '../constants'

import type { Reaction } from '../types'

type MessageReactionsProps = {
  reactions?: Reaction[]
  onToggle: (reaction: string) => void
}

const REACTION_LABELS: Record<
  string,
  string
> = {
  agree: 'Agree',
  appreciate: 'Appreciate',
  useful: 'Useful',
  wellDone: 'Well done',

  '👍': 'Agree',
  '❤️': 'Appreciate',
  '🔥': 'Useful',
  '🎉': 'Well done',
  '💯': 'Agree',
  '👏': 'Well done',
  '😂': 'Appreciate',
}

export function MessageReactions({
  reactions = [],
  onToggle,
}: MessageReactionsProps) {
  if (reactions.length === 0) {
    return null
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        flexWrap: 'wrap',
        marginTop: '8px',
      }}
    >
      {reactions.map(reaction => {
        const label =
          REACTION_LABELS[
            reaction.emoji
          ] ?? reaction.emoji

        return (
          <button
            key={reaction.emoji}
            type="button"
            aria-label={`${label} reaction, ${reaction.count}`}
            aria-pressed={
              reaction.reacted ?? false
            }
            onClick={event => {
              event.stopPropagation()
              onToggle(reaction.emoji)
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              minHeight: '25px',
              padding: '3px 9px',
              border: `1px solid ${
                reaction.reacted
                  ? COLORS.blue
                  : COLORS.border
              }`,
              borderRadius: '6px',
              background:
                reaction.reacted
                  ? COLORS.blueSoft
                  : COLORS.surfaceSoft,
              color:
                reaction.reacted
                  ? COLORS.blueDark
                  : COLORS.textMuted,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '9px',
              lineHeight: '14px',
              fontWeight: 600,
              boxSizing: 'border-box',
              transition:
                'background 120ms ease, border-color 120ms ease',
            }}
            onMouseEnter={event => {
              event.currentTarget.style.borderColor =
                COLORS.blue

              event.currentTarget.style.background =
                COLORS.blueSoft
            }}
            onMouseLeave={event => {
              event.currentTarget.style.borderColor =
                reaction.reacted
                  ? COLORS.blue
                  : COLORS.border

              event.currentTarget.style.background =
                reaction.reacted
                  ? COLORS.blueSoft
                  : COLORS.surfaceSoft
            }}
          >
            <span>{label}</span>

            <span
              style={{
                color: COLORS.textDim,
                fontWeight: 700,
              }}
            >
              {reaction.count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
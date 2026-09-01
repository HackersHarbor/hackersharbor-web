'use client'

import type { Channel } from '../types'
import { COLORS } from '../constants'

type ChannelItemProps = {
  channel: Channel
  active: boolean
  onSelect: (channelId: string) => void
}

export function ChannelItem({
  channel,
  active,
  onSelect,
}: ChannelItemProps) {
  const hasUnread = channel.unread > 0

  return (
    <button
      type="button"
      onClick={() => onSelect(channel.id)}
      aria-current={active ? 'page' : undefined}
      style={{
        width: '100%',
        minHeight: '52px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '7px 9px',
        margin: '2px 0',
        border: active
          ? `1px solid ${COLORS.border}`
          : '1px solid transparent',
        borderRadius: '7px',
        background: active
          ? COLORS.surfaceActive
          : COLORS.surface,
        color: COLORS.text,
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
        transition:
          'background 0.15s ease, border-color 0.15s ease',
      }}
    >
      {/* Channel marker */}
      <span
        aria-hidden="true"
        style={{
          width: '24px',
          height: '24px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          borderRadius: '6px',
          background: active
            ? COLORS.white
            : COLORS.surfaceSoft,
          border: `1px solid ${
            active
              ? COLORS.borderStrong
              : COLORS.border
          }`,
          color: active
            ? COLORS.blueDark
            : COLORS.textDim,
          fontSize: '12px',
          lineHeight: 1,
          fontWeight: 600,
          boxSizing: 'border-box',
        }}
      >
        #
      </span>

      {/* Channel information */}
      <span
        style={{
          minWidth: 0,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            minWidth: 0,
          }}
        >
          <span
            style={{
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: active
                ? COLORS.text
                : hasUnread
                  ? COLORS.text
                  : COLORS.textMuted,
              fontSize: '11px',
              lineHeight: '15px',
              fontWeight:
                active || hasUnread ? 600 : 500,
            }}
          >
            {channel.name.replace(/^#/, '')}
          </span>

          {/* Unread count */}
          {hasUnread && (
            <span
              aria-label={`${channel.unread} unread`}
              style={{
                minWidth: '18px',
                height: '18px',
                padding: '0 5px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                borderRadius: '5px',
                background: active
                  ? COLORS.blue
                  : COLORS.blueSoft,
                color: active
                  ? COLORS.white
                  : COLORS.blueDark,
                border: active
                  ? `1px solid ${COLORS.blue}`
                  : `1px solid ${COLORS.border}`,
                fontSize: '8px',
                lineHeight: '10px',
                fontWeight: 700,
                boxSizing: 'border-box',
              }}
            >
              {channel.unread > 99
                ? '99+'
                : channel.unread}
            </span>
          )}
        </span>

        {/* Description */}
        <span
          style={{
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: COLORS.textDim,
            fontSize: '9px',
            lineHeight: '12px',
            fontWeight: 400,
          }}
        >
          {channel.description}
        </span>
      </span>
    </button>
  )
}
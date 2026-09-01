'use client'

import { useEffect, useRef, useState } from 'react'
import { COLORS } from '../constants'

type ChannelHeaderProps = {
  channel: {
    id: string
    name: string
    description: string
    online: number
    unread: number
  }
}

export function ChannelHeader({
  channel,
}: ChannelHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node,
        )
      ) {
        setMenuOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handlePointerDown,
    )

    document.addEventListener(
      'keydown',
      handleKeyDown,
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handlePointerDown,
      )

      document.removeEventListener(
        'keydown',
        handleKeyDown,
      )
    }
  }, [menuOpen])

  const copyChannelName = async () => {
    try {
      await navigator.clipboard.writeText(
        `#${channel.name.replace(/^#/, '')}`,
      )
    } catch {
      // Clipboard access can be unavailable.
    }

    setMenuOpen(false)
  }

  const markAsRead = () => {
    setMenuOpen(false)
  }

  const muteChannel = () => {
    setMenuOpen(false)
  }

  const channelName = channel.name.replace(
    /^#/,
    '',
  )

  return (
    <header
      style={{
        position: 'relative',
        minHeight: '66px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        padding: '0 20px',
        background: COLORS.surface,
        borderBottom: `1px solid ${COLORS.border}`,
        boxSizing: 'border-box',
        zIndex: 20,
      }}
    >
      <div
        style={{
          minWidth: 0,
          flex: 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              color: COLORS.blue,
              fontSize: '18px',
              lineHeight: '18px',
              fontWeight: 500,
            }}
          >
            #
          </span>

          <span
            style={{
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: COLORS.text,
              fontSize: '15px',
              lineHeight: '20px',
              fontWeight: 600,
              letterSpacing: '-0.01em',
            }}
          >
            {channelName}
          </span>

          <span
            aria-label="Channel online"
            title="Channel active"
            style={{
              width: '6px',
              height: '6px',
              flexShrink: 0,
              borderRadius: '50%',
              background: COLORS.green,
            }}
          />
        </div>

        <div
          style={{
            marginTop: '3px',
            color: COLORS.textMuted,
            fontSize: '10px',
            lineHeight: '14px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {channel.description}
        </div>
      </div>

      <div
        style={{
          position: 'relative',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div
          style={{
            height: '32px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0 11px',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '7px',
            background: COLORS.surface,
            color: COLORS.textMuted,
            fontSize: '10px',
            lineHeight: '14px',
            whiteSpace: 'nowrap',
            boxSizing: 'border-box',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: COLORS.green,
            }}
          />

          {channel.online} active
        </div>

        <button
          type="button"
          aria-label="Channel discussions"
          style={{
            height: '32px',
            padding: '0 12px',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '7px',
            background: COLORS.blueSoft,
            color: COLORS.blue,
            fontFamily: 'inherit',
            fontSize: '10px',
            lineHeight: '14px',
            fontWeight: 600,
            cursor: 'default',
            boxSizing: 'border-box',
          }}
        >
          Channels / Discussions
        </button>

        <div
          ref={menuRef}
          style={{
            position: 'relative',
          }}
        >
          <button
            type="button"
            aria-label="More channel options"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() =>
              setMenuOpen(previous => !previous)
            }
            style={{
              width: '32px',
              height: '32px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              border: `1px solid ${
                menuOpen
                  ? COLORS.blue
                  : COLORS.border
              }`,
              borderRadius: '7px',
              background: menuOpen
                ? COLORS.blueSoft
                : COLORS.surface,
              color: menuOpen
                ? COLORS.blue
                : COLORS.textMuted,
              fontFamily: 'inherit',
              fontSize: '15px',
              lineHeight: '15px',
              fontWeight: 700,
              letterSpacing: '2px',
              cursor: 'pointer',
              boxSizing: 'border-box',
              transition:
                'border-color .15s ease, background .15s ease, color .15s ease',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                position: 'relative',
                top: '-1px',
              }}
            >
              ···
            </span>
          </button>

          {menuOpen && (
            <div
              role="menu"
              aria-label="Channel options"
              style={{
                position: 'absolute',
                top: 'calc(100% + 7px)',
                right: 0,
                width: '188px',
                padding: '5px',
                border: `1px solid ${COLORS.border}`,
                borderRadius: '8px',
                background: COLORS.surface,
                boxShadow:
                  '0 10px 28px rgba(20, 35, 55, 0.12)',
                boxSizing: 'border-box',
              }}
            >
              <button
                type="button"
                role="menuitem"
                onClick={markAsRead}
                style={{
                  width: '100%',
                  display: 'block',
                  padding: '9px 10px',
                  border: 0,
                  borderRadius: '5px',
                  background: 'transparent',
                  color: COLORS.text,
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  fontSize: '10px',
                  lineHeight: '14px',
                  cursor: 'pointer',
                }}
                onMouseEnter={event => {
                  event.currentTarget.style.background =
                    COLORS.surfaceSoft
                }}
                onMouseLeave={event => {
                  event.currentTarget.style.background =
                    'transparent'
                }}
              >
                Mark channel as read
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={muteChannel}
                style={{
                  width: '100%',
                  display: 'block',
                  padding: '9px 10px',
                  border: 0,
                  borderRadius: '5px',
                  background: 'transparent',
                  color: COLORS.text,
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  fontSize: '10px',
                  lineHeight: '14px',
                  cursor: 'pointer',
                }}
                onMouseEnter={event => {
                  event.currentTarget.style.background =
                    COLORS.surfaceSoft
                }}
                onMouseLeave={event => {
                  event.currentTarget.style.background =
                    'transparent'
                }}
              >
                Mute channel
              </button>

              <div
                aria-hidden="true"
                style={{
                  height: '1px',
                  margin: '4px 5px',
                  background: COLORS.border,
                }}
              />

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  void copyChannelName()
                }}
                style={{
                  width: '100%',
                  display: 'block',
                  padding: '9px 10px',
                  border: 0,
                  borderRadius: '5px',
                  background: 'transparent',
                  color: COLORS.text,
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  fontSize: '10px',
                  lineHeight: '14px',
                  cursor: 'pointer',
                }}
                onMouseEnter={event => {
                  event.currentTarget.style.background =
                    COLORS.surfaceSoft
                }}
                onMouseLeave={event => {
                  event.currentTarget.style.background =
                    'transparent'
                }}
              >
                Copy channel name
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}


'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import { COLORS } from '../constants'

import type { Message } from '../types'

type PinnedMessagesProps = {
  channelId: string
  channelName: string
  messages: Message[]
}

const STORAGE_KEY =
  'hackersharbor-pinned-messages'

const PIN_EVENT =
  'hackersharbor-pins-changed'

function getStoredPins(
  channelId: string,
): string[] {
  if (
    typeof window === 'undefined'
  ) {
    return []
  }

  try {
    const stored =
      localStorage.getItem(
        STORAGE_KEY,
      )

    if (!stored) {
      return []
    }

    const parsed =
      JSON.parse(stored)

    if (
      !parsed ||
      typeof parsed !== 'object'
    ) {
      return []
    }

    if (Array.isArray(parsed)) {
      return parsed
        .filter(item =>
          typeof item === 'string' ||
          (item &&
            typeof item === 'object' &&
            item.channelId === channelId &&
            item.message &&
            typeof item.message === 'object' &&
            typeof item.message.id === 'string'),
        )
        .map(item =>
          typeof item === 'string'
            ? item
            : item.message.id,
        )
    }

    const pins = parsed[channelId]

    return Array.isArray(pins)
      ? pins.filter(
          (id): id is string =>
            typeof id === 'string',
        )
      : []
  } catch {
    return []
  }
}

function savePins(
  channelId: string,
  pins: string[],
) {
  if (
    typeof window === 'undefined'
  ) {
    return
  }

  try {
    const stored =
      localStorage.getItem(
        STORAGE_KEY,
      )

    const parsed = stored
      ? JSON.parse(stored)
      : null

    if (Array.isArray(parsed)) {
      const next = parsed.filter(item =>
        !(
          item &&
          typeof item === 'object' &&
          item.channelId === channelId &&
          item.message &&
          typeof item.message === 'object' &&
          typeof item.message.id === 'string'
        )
      )

      const existingForChannel = parsed.filter(item =>
        item &&
        typeof item === 'object' &&
        item.channelId === channelId &&
        item.message &&
        typeof item.message === 'object' &&
        typeof item.message.id === 'string' &&
        pins.includes(item.message.id)
      )

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([
          ...next,
          ...existingForChannel,
        ]),
      )
    } else {
      const data: Record<
        string,
        string[]
      > =
        parsed &&
        typeof parsed === 'object'
          ? parsed as Record<string, string[]>
          : {}

      data[channelId] = pins

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data),
      )
    }

    window.dispatchEvent(
      new Event(PIN_EVENT),
    )
  } catch {
    // Ignore localStorage errors.
  }
}

export function isMessagePinned(
  channelId: string,
  messageId: string,
) {
  return getStoredPins(
    channelId,
  ).includes(messageId)
}

export function pinMessage(
  channelId: string,
  messageId: string,
) {
  const existing =
    getStoredPins(channelId)

  if (
    existing.includes(messageId)
  ) {
    return
  }

  savePins(
    channelId,
    [
      ...existing,
      messageId,
    ],
  )
}

export function unpinMessage(
  channelId: string,
  messageId: string,
) {
  const existing =
    getStoredPins(channelId)

  savePins(
    channelId,
    existing.filter(
      id => id !== messageId,
    ),
  )
}

function formatTime(
  value: string,
) {
  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return ''
  }

  return date.toLocaleTimeString(
    [],
    {
      hour: 'numeric',
      minute: '2-digit',
    },
  )
}

function previewContent(
  content: string,
) {
  const clean =
    content
      .replace(
        /```[\s\S]*?```/g,
        '[Code block]',
      )
      .replace(
        /\s+/g,
        ' ',
      )
      .trim()

  if (
    clean.length <= 120
  ) {
    return clean
  }

  return `${clean.slice(
    0,
    117,
  )}...`
}

export function PinnedMessages({
  channelId,
  channelName,
  messages,
}: PinnedMessagesProps) {
  const [
    pinnedIds,
    setPinnedIds,
  ] = useState<string[]>([])

  const [
    open,
    setOpen,
  ] = useState(false)

  useEffect(() => {
    setPinnedIds(
      getStoredPins(channelId),
    )

    const handlePinsChanged =
      () => {
        setPinnedIds(
          getStoredPins(
            channelId,
          ),
        )
      }

    window.addEventListener(
      PIN_EVENT,
      handlePinsChanged,
    )

    return () => {
      window.removeEventListener(
        PIN_EVENT,
        handlePinsChanged,
      )
    }
  }, [channelId])

  useEffect(() => {
    if (!open) {
      return
    }

    const handleEscape =
      (event: KeyboardEvent) => {
        if (
          event.key === 'Escape'
        ) {
          setOpen(false)
        }
      }

    document.addEventListener(
      'keydown',
      handleEscape,
    )

    return () => {
      document.removeEventListener(
        'keydown',
        handleEscape,
      )
    }
  }, [open])

  const pinnedMessages =
    useMemo(() => {
      const messageMap =
        new Map(
          messages.map(
            message => [
              message.id,
              message,
            ],
          ),
        )

      return pinnedIds
        .map(id =>
          messageMap.get(id),
        )
        .filter(
          (
            message,
          ): message is Message =>
            Boolean(message),
        )
    }, [
      messages,
      pinnedIds,
    ])

  const count =
    pinnedMessages.length

  const cleanChannelName =
    channelName.replace(
      /^#/,
      '',
    )

  const jumpToMessage = (
    messageId: string,
  ) => {
    setOpen(false)

    window.setTimeout(() => {
      const element =
        document.getElementById(
          `message-${messageId}`,
        )

      if (!element) {
        return
      }

      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })

      element.animate(
        [
          {
            backgroundColor:
              '#EAF1FF',
          },
          {
            backgroundColor:
              'transparent',
          },
        ],
        {
          duration: 900,
          easing: 'ease-out',
        },
      )
    }, 60)
  }

  const handleUnpin = (
    messageId: string,
  ) => {
    unpinMessage(
      channelId,
      messageId,
    )
  }

  return (
    <div
      style={{
        position: 'relative',
        flexShrink: 0,
        padding: '7px 20px',
        borderBottom:
          `1px solid ${COLORS.border}`,
        background:
          COLORS.surface,
        boxSizing:
          'border-box',
        zIndex: 10,
      }}
    >
      <button
        type="button"
        onClick={() =>
          setOpen(
            current => !current,
          )
        }
        aria-expanded={open}
        aria-haspopup="dialog"
        style={{
          display:
            'inline-flex',
          alignItems:
            'center',
          gap: '7px',
          minHeight: '29px',
          padding: '0 10px',
          border:
            `1px solid ${
              open
                ? COLORS.blue
                : COLORS.border
            }`,
          borderRadius: '6px',
          background:
            open
              ? COLORS.blueSoft
              : COLORS.surfaceSoft,
          color:
            open
              ? COLORS.blueDark
              : COLORS.textMuted,
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: '9px',
          lineHeight: '13px',
          fontWeight: 600,
        }}
      >
        <span
          style={{
            width: '16px',
            height: '16px',
            display:
              'inline-flex',
            alignItems:
              'center',
            justifyContent:
              'center',
            border:
              `1px solid ${COLORS.border}`,
            borderRadius: '4px',
            background:
              COLORS.surface,
            color:
              count > 0
                ? COLORS.blue
                : COLORS.textDim,
            fontSize: '8px',
            fontWeight: 700,
          }}
        >
          P
        </span>

        <span>
          {count > 0
            ? `Pinned in #${cleanChannelName}`
            : `No pinned messages`}
        </span>

        {count > 0 && (
          <span
            style={{
              minWidth: '18px',
              height: '18px',
              display:
                'inline-flex',
              alignItems:
                'center',
              justifyContent:
                'center',
              padding: '0 4px',
              border:
                `1px solid ${COLORS.border}`,
              borderRadius: '5px',
              background:
                COLORS.surface,
              color:
                COLORS.textDim,
              fontSize: '8px',
              lineHeight: '10px',
              fontWeight: 700,
              boxSizing:
                'border-box',
            }}
          >
            {count}
          </span>
        )}

        <span
          aria-hidden="true"
          style={{
            color:
              COLORS.textDim,
            fontSize: '10px',
            lineHeight: '10px',
          }}
        >
          {open ? '▴' : '▾'}
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Pinned messages"
          style={{
            position:
              'absolute',
            top:
              'calc(100% + 6px)',
            left: '20px',
            width: '400px',
            maxWidth:
              'calc(100% - 40px)',
            maxHeight: '430px',
            overflowY: 'auto',
            padding: '7px',
            border:
              `1px solid ${COLORS.border}`,
            borderRadius: '8px',
            background:
              COLORS.surface,
            boxShadow:
              '0 10px 28px rgba(20,35,55,0.14)',
            boxSizing:
              'border-box',
          }}
        >
          <div
            style={{
              padding:
                '8px 9px',
              borderBottom:
                `1px solid ${COLORS.border}`,
            }}
          >
            <div
              style={{
                color:
                  COLORS.text,
                fontSize: '12px',
                lineHeight:
                  '16px',
                fontWeight: 700,
              }}
            >
              Pinned messages
            </div>

            <div
              style={{
                marginTop: '2px',
                color:
                  COLORS.textDim,
                fontSize: '9px',
                lineHeight:
                  '13px',
              }}
            >
              Important messages
              for this channel.
            </div>
          </div>

          {pinnedMessages.length ===
          0 ? (
            <div
              style={{
                padding:
                  '24px 14px',
                textAlign:
                  'center',
              }}
            >
              <div
                style={{
                  marginBottom:
                    '5px',
                  color:
                    COLORS.text,
                  fontSize:
                    '11px',
                  lineHeight:
                    '16px',
                  fontWeight:
                    600,
                }}
              >
                No pinned messages yet
              </div>

              <div
                style={{
                  color:
                    COLORS.textMuted,
                  fontSize:
                    '9px',
                  lineHeight:
                    '14px',
                }}
              >
                Pin an important
                message from its
                actions menu and it
                will appear here.
              </div>
            </div>
          ) : (
            pinnedMessages.map(
              message => (
                <div
                  key={message.id}
                  style={{
                    display:
                      'flex',
                    alignItems:
                      'flex-start',
                    gap: '9px',
                    marginTop: '3px',
                    padding: '9px',
                    border:
                      '1px solid transparent',
                    borderRadius: '6px',
                    boxSizing:
                      'border-box',
                  }}
                  onMouseEnter={event => {
                    event.currentTarget.style.background =
                      COLORS.surfaceSoft

                    event.currentTarget.style.borderColor =
                      COLORS.border
                  }}
                  onMouseLeave={event => {
                    event.currentTarget.style.background =
                      'transparent'

                    event.currentTarget.style.borderColor =
                      'transparent'
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      jumpToMessage(
                        message.id,
                      )
                    }
                    style={{
                      flex: 1,
                      minWidth: 0,
                      padding: 0,
                      border: 0,
                      background:
                        'transparent',
                      textAlign: 'left',
                      cursor:
                        'pointer',
                      fontFamily:
                        'inherit',
                    }}
                  >
                    <div
                      style={{
                        display:
                          'flex',
                        alignItems:
                          'baseline',
                        gap: '7px',
                      }}
                    >
                      <span
                        style={{
                          color:
                            message.nameColor ??
                            COLORS.text,
                          fontSize:
                            '9px',
                          lineHeight:
                            '13px',
                          fontWeight:
                            700,
                        }}
                      >
                        {
                          message.username
                        }
                      </span>

                      <span
                        style={{
                          color:
                            COLORS.textDim,
                          fontSize:
                            '8px',
                          lineHeight:
                            '12px',
                        }}
                      >
                        {formatTime(
                          message.createdAt,
                        )}
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop:
                          '4px',
                        color:
                          COLORS.textMuted,
                        fontSize:
                          '10px',
                        lineHeight:
                          '15px',
                        overflowWrap:
                          'anywhere',
                      }}
                    >
                      {previewContent(
                        message.content,
                      )}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleUnpin(
                        message.id,
                      )
                    }
                    style={{
                      flexShrink: 0,
                      padding:
                        '5px 7px',
                      border:
                        `1px solid ${COLORS.border}`,
                      borderRadius: '5px',
                      background:
                        COLORS.surface,
                      color:
                        COLORS.textMuted,
                      cursor:
                        'pointer',
                      fontFamily:
                        'inherit',
                      fontSize:
                        '8px',
                      lineHeight:
                        '12px',
                      fontWeight:
                        600,
                    }}
                  >
                    Unpin
                  </button>
                </div>
              ),
            )
          )}
        </div>
      )}
    </div>
  )
}
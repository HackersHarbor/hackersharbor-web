'use client'

import {
  useEffect,
  useState,
} from 'react'

import type {
  MouseEvent,
} from 'react'

import { COLORS } from '../constants'

import type {
  Message,
  Reaction,
} from '../types'

import { MessageAvatar } from './MessageAvatar'
import { MessageContent } from './MessageContent'
import { MessageReactions } from './MessageReactions'


const PINNED_MESSAGES_KEY =
  'hackersharbor-pinned-messages'

type StoredPinnedMessage = {
  channelId: string
  message: Message
}

function getPinnedMessages(): StoredPinnedMessage[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const stored =
      window.localStorage.getItem(
        PINNED_MESSAGES_KEY,
      )

    if (!stored) {
      return []
    }

    const parsed = JSON.parse(stored)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
  } catch {
    return []
  }
}

function setPinnedMessages(
  messages: StoredPinnedMessage[],
) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(
      PINNED_MESSAGES_KEY,
      JSON.stringify(messages),
    )

    window.dispatchEvent(
      new CustomEvent(
        'hackersharbor-pins-changed',
      ),
    )
  } catch {
    // Ignore localStorage failures.
  }
}

function isPinned(
  channelId: string,
  messageId: string,
) {
  return getPinnedMessages().some(
    item =>
      item.channelId === channelId &&
      item.message.id === messageId,
  )
}

function togglePinnedMessage(
  message: Message,
) {
  const current =
    getPinnedMessages()

  const alreadyPinned =
    current.some(
      item =>
        item.channelId ===
          message.channelId &&
        item.message.id === message.id,
    )

  if (alreadyPinned) {
    setPinnedMessages(
      current.filter(
        item =>
          !(
            item.channelId ===
              message.channelId &&
            item.message.id ===
              message.id
          ),
      ),
    )

    return false
  }

  setPinnedMessages([
    ...current,
    {
      channelId: message.channelId,
      message,
    },
  ])

  return true
}

type MessageItemProps = {
  message: Message

  onToggleReaction: (
    messageId: string,
    reaction: string,
  ) => void

  onMessageClick: (
    message: Message,
  ) => void

  selected?: boolean

  replyCount?: number
}

const REACTION_OPTIONS = [
  {
    value: 'agree',
    label: 'Agree',
  },
  {
    value: 'appreciate',
    label: 'Appreciate',
  },
  {
    value: 'useful',
    label: 'Useful',
  },
  {
    value: 'wellDone',
    label: 'Well done',
  },
]

const REACTION_ALIASES: Record<
  string,
  string
> = {
  '👍': 'agree',
  '❤️': 'appreciate',
  '🔥': 'useful',
  '🎉': 'wellDone',
  '💯': 'agree',
  '👏': 'wellDone',
  '😂': 'appreciate',
}

const actionButtonStyle = {
  height: '28px',
  padding: '0 9px',
  border: '0',
  borderRadius: '5px',
  background: 'transparent',
  color: COLORS.textMuted,
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: '8px',
  fontWeight: 600,
  lineHeight: '28px',
  whiteSpace: 'nowrap' as const,
}

export function MessageItem({
  message,
  onToggleReaction,
  onMessageClick,
  selected = false,
  replyCount = 0,
}: MessageItemProps) {
  const [hovered, setHovered] =
    useState(false)

  const [moreOpen, setMoreOpen] =
    useState(false)

  const [reactionOpen, setReactionOpen] =
    useState(false)

  const [copied, setCopied] =
    useState(false)

  const [pinned, setPinned] =
    useState(false)

  /*
   * Keep a local reaction state so the reaction
   * interaction responds immediately in the UI.
   */
  const [localReactions, setLocalReactions] =
    useState<Reaction[]>(
      message.reactions ?? [],
    )

  useEffect(() => {
    setLocalReactions(
      message.reactions ?? [],
    )
  }, [message.reactions])

  const handleThreadClick = () => {
    setMoreOpen(false)
    setReactionOpen(false)

    onMessageClick(message)
  }

  const handleReactButton = (
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation()

    setMoreOpen(false)

    setReactionOpen(
      previous => !previous,
    )
  }

  const handleReactionSelect = (
    reaction: string,
  ) => {
    setLocalReactions(previous => {
      const existingIndex =
        previous.findIndex(item => {
          const normalized =
            REACTION_ALIASES[
              item.emoji
            ] ?? item.emoji

          return normalized === reaction
        })

      /*
       * If this reaction already exists,
       * toggle the user's reaction.
       */
      if (existingIndex !== -1) {
        return previous.map(
          (item, index) => {
            if (
              index !==
              existingIndex
            ) {
              return item
            }

            const reacted =
              item.reacted ?? false

            return {
              ...item,
              reacted: !reacted,
              count: reacted
                ? Math.max(
                    0,
                    item.count - 1,
                  )
                : item.count + 1,
            }
          },
        )
      }

      /*
       * Otherwise create the reaction
       * immediately in the UI.
       */
      return [
        ...previous,
        {
          emoji: reaction,
          count: 1,
          reacted: true,
        },
      ]
    })

    /*
     * Notify the parent as well so any existing
     * persistence/state logic continues to run.
     */
    onToggleReaction(
      message.id,
      reaction,
    )

    setReactionOpen(false)
  }

  const handleExistingReaction = (
    reaction: string,
  ) => {
    setLocalReactions(previous => {
      return previous.map(item => {
        if (item.emoji !== reaction) {
          return item
        }

        const reacted =
          item.reacted ?? false

        return {
          ...item,
          reacted: !reacted,
          count: reacted
            ? Math.max(
                0,
                item.count - 1,
              )
            : item.count + 1,
        }
      })
    })

    onToggleReaction(
      message.id,
      reaction,
    )
  }

  useEffect(() => {
    setPinned(
      isPinned(
        message.channelId,
        message.id,
      ),
    )
  }, [
    message.channelId,
    message.id,
  ])

  const handlePinToggle = () => {
    const nextPinned =
      togglePinnedMessage(message)

    setPinned(nextPinned)
    setMoreOpen(false)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        message.content,
      )

      setCopied(true)

      window.setTimeout(() => {
        setCopied(false)
      }, 1400)
    } catch {
      setCopied(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      const url = new URL(
        window.location.href,
      )

      url.hash =
        `message-${message.id}`

      await navigator.clipboard.writeText(
        url.toString(),
      )

      setCopied(true)

      window.setTimeout(() => {
        setCopied(false)
      }, 1400)
    } catch {
      setCopied(false)
    }

    setMoreOpen(false)
  }

  const handleMoreToggle = (
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation()

    setReactionOpen(false)

    setMoreOpen(
      previous => !previous,
    )
  }

  return (
    <article
      id={`message-${message.id}`}
      onClick={handleThreadClick}
      onMouseEnter={() =>
        setHovered(true)
      }
      onMouseLeave={() => {
        setHovered(false)
        setMoreOpen(false)
        setReactionOpen(false)
      }}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '11px',
        padding: '14px 24px',
        borderBottom:
          `1px solid ${COLORS.border}`,
        borderLeft: selected
          ? `2px solid ${COLORS.blue}`
          : '2px solid transparent',
        background: selected
          ? COLORS.blueSoft
          : hovered
            ? COLORS.surfaceSoft
            : 'transparent',
        cursor: 'pointer',
        transition:
          'background 120ms ease, border-color 120ms ease',
      }}
    >
      {/* Avatar */}
      <MessageAvatar
        username={message.username}
        initials={message.initials}
        avatarUrl={message.avatarUrl}
        avatarColor={
          message.avatarColor
        }
      />

      {/* Message content area */}
      <div
        style={{
          minWidth: 0,
          flex: 1,
          position: 'relative',
        }}
      >
        {/*
         * MessageContent already renders:
         * username
         * timestamp
         * message body
         *
         * Do NOT render another header here.
         */}
        <MessageContent
          message={message}
        />

        {/* Reactions */}
        <MessageReactions
          reactions={localReactions}
          onToggle={
            handleExistingReaction
          }
        />

        {/* Thread replies */}
        {replyCount > 0 && (
          <button
            type="button"
            onClick={event => {
              event.stopPropagation()

              onMessageClick(
                message,
              )
            }}
            style={{
              display: 'block',
              marginTop: '7px',
              padding: 0,
              border: 0,
              background:
                'transparent',
              color: COLORS.blue,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '8px',
              lineHeight: '12px',
              fontWeight: 600,
            }}
          >
            {replyCount}{' '}
            {replyCount === 1
              ? 'reply'
              : 'replies'}{' '}
            · View thread
          </button>
        )}

        {/* Hover action bar */}
        {hovered && (
          <div
            role="toolbar"
            aria-label="Message actions"
            onClick={event =>
              event.stopPropagation()
            }
            style={{
              position: 'absolute',
              top: '-2px',
              right: '0',
              display: 'flex',
              alignItems: 'center',
              height: '30px',
              padding: '1px 3px',
              border:
                `1px solid ${COLORS.border}`,
              borderRadius: '7px',
              background:
                COLORS.surface,
              boxShadow:
                '0 3px 10px rgba(31,45,67,0.10)',
              whiteSpace: 'nowrap',
              zIndex: 20,
            }}
          >
            {/* Thread */}
            <button
              type="button"
              onClick={
                handleThreadClick
              }
              style={
                actionButtonStyle
              }
              onMouseEnter={event => {
                event.currentTarget.style.background =
                  COLORS.blueSoft

                event.currentTarget.style.color =
                  COLORS.blueDark
              }}
              onMouseLeave={event => {
                event.currentTarget.style.background =
                  'transparent'

                event.currentTarget.style.color =
                  COLORS.textMuted
              }}
            >
              Thread
            </button>

            <span
              aria-hidden="true"
              style={{
                width: '1px',
                height: '14px',
                background:
                  COLORS.border,
              }}
            />

            {/* React */}
            <div
              style={{
                position: 'relative',
              }}
            >
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={
                  reactionOpen
                }
                onClick={
                  handleReactButton
                }
                style={{
                  ...actionButtonStyle,
                  background:
                    reactionOpen
                      ? COLORS.blueSoft
                      : 'transparent',
                  color:
                    reactionOpen
                      ? COLORS.blueDark
                      : COLORS.textMuted,
                }}
                onMouseEnter={event => {
                  event.currentTarget.style.background =
                    COLORS.blueSoft

                  event.currentTarget.style.color =
                    COLORS.blueDark
                }}
                onMouseLeave={event => {
                  event.currentTarget.style.background =
                    reactionOpen
                      ? COLORS.blueSoft
                      : 'transparent'

                  event.currentTarget.style.color =
                    reactionOpen
                      ? COLORS.blueDark
                      : COLORS.textMuted
                }}
              >
                React
              </button>

              {reactionOpen && (
                <div
                  role="menu"
                  aria-label="Choose a reaction"
                  onClick={event =>
                    event.stopPropagation()
                  }
                  style={{
                    position:
                      'absolute',
                    top: '34px',
                    left: '0',
                    width: '140px',
                    padding: '4px',
                    border:
                      `1px solid ${COLORS.border}`,
                    borderRadius: '7px',
                    background:
                      COLORS.surface,
                    boxShadow:
                      '0 8px 20px rgba(31,45,67,0.12)',
                    zIndex: 60,
                  }}
                >
                  {REACTION_OPTIONS.map(
                    option => (
                      <button
                        key={
                          option.value
                        }
                        type="button"
                        role="menuitem"
                        onClick={() =>
                          handleReactionSelect(
                            option.value,
                          )
                        }
                        style={{
                          display:
                            'flex',
                          alignItems:
                            'center',
                          width:
                            '100%',
                          minHeight:
                            '32px',
                          padding:
                            '0 10px',
                          border: 0,
                          borderRadius:
                            '5px',
                          background:
                            'transparent',
                          color:
                            COLORS.text,
                          cursor:
                            'pointer',
                          fontFamily:
                            'inherit',
                          fontSize:
                            '9px',
                          lineHeight:
                            '14px',
                          fontWeight:
                            500,
                          textAlign:
                            'left',
                        }}
                        onMouseEnter={event => {
                          event.currentTarget.style.background =
                            COLORS.blueSoft

                          event.currentTarget.style.color =
                            COLORS.blueDark
                        }}
                        onMouseLeave={event => {
                          event.currentTarget.style.background =
                            'transparent'

                          event.currentTarget.style.color =
                            COLORS.text
                        }}
                      >
                        {option.label}
                      </button>
                    ),
                  )}
                </div>
              )}
            </div>

            <span
              aria-hidden="true"
              style={{
                width: '1px',
                height: '14px',
                background:
                  COLORS.border,
              }}
            />

            {/* Copy */}
            <button
              type="button"
              onClick={() => {
                void handleCopy()
              }}
              style={
                actionButtonStyle
              }
              onMouseEnter={event => {
                event.currentTarget.style.background =
                  COLORS.blueSoft

                event.currentTarget.style.color =
                  COLORS.blueDark
              }}
              onMouseLeave={event => {
                event.currentTarget.style.background =
                  'transparent'

                event.currentTarget.style.color =
                  COLORS.textMuted
              }}
            >
              {copied
                ? 'Copied'
                : 'Copy'}
            </button>

            <span
              aria-hidden="true"
              style={{
                width: '1px',
                height: '14px',
                background:
                  COLORS.border,
              }}
            />

            {/* More */}
            <div
              style={{
                position:
                  'relative',
              }}
            >
              <button
                type="button"
                aria-label="More message actions"
                aria-haspopup="menu"
                aria-expanded={
                  moreOpen
                }
                onClick={
                  handleMoreToggle
                }
                style={{
                  ...actionButtonStyle,
                  width: '28px',
                  padding: 0,
                  fontSize: '12px',
                  lineHeight: '26px',
                  background:
                    moreOpen
                      ? COLORS.blueSoft
                      : 'transparent',
                  color:
                    moreOpen
                      ? COLORS.blueDark
                      : COLORS.textMuted,
                }}
                onMouseEnter={event => {
                  event.currentTarget.style.background =
                    COLORS.blueSoft

                  event.currentTarget.style.color =
                    COLORS.blueDark
                }}
                onMouseLeave={event => {
                  event.currentTarget.style.background =
                    moreOpen
                      ? COLORS.blueSoft
                      : 'transparent'

                  event.currentTarget.style.color =
                    moreOpen
                      ? COLORS.blueDark
                      : COLORS.textMuted
                }}
              >
                ···
              </button>

              {moreOpen && (
                <div
                  role="menu"
                  aria-label="More message actions"
                  onClick={event =>
                    event.stopPropagation()
                  }
                  style={{
                    position:
                      'absolute',
                    top: '34px',
                    right: '0',
                    width: '155px',
                    padding: '4px',
                    border:
                      `1px solid ${COLORS.border}`,
                    borderRadius: '7px',
                    background:
                      COLORS.surface,
                    boxShadow:
                      '0 8px 20px rgba(31,45,67,0.12)',
                    zIndex: 50,
                  }}
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      void handleCopy()
                      setMoreOpen(false)
                    }}
                    style={{
                      width:
                        '100%',
                      height:
                        '30px',
                      padding:
                        '0 9px',
                      border: 0,
                      borderRadius:
                        '5px',
                      background:
                        'transparent',
                      color:
                        COLORS.text,
                      cursor:
                        'pointer',
                      fontFamily:
                        'inherit',
                      fontSize:
                        '9px',
                      textAlign:
                        'left',
                    }}
                  >
                    Copy message
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      void handleCopyLink()
                    }}
                    style={{
                      width:
                        '100%',
                      height:
                        '30px',
                      padding:
                        '0 9px',
                      border: 0,
                      borderRadius:
                        '5px',
                      background:
                        'transparent',
                      color:
                        COLORS.text,
                      cursor:
                        'pointer',
                      fontFamily:
                        'inherit',
                      fontSize:
                        '9px',
                      textAlign:
                        'left',
                    }}
                  >
                    Copy message link
                  </button>

                  <div
                    aria-hidden="true"
                    style={{
                      height:
                        '1px',
                      margin:
                        '4px 5px',
                      background:
                        COLORS.border,
                    }}
                  />

                  <button
                    type="button"
                    role="menuitem"
                    onClick={
                      handlePinToggle
                    }
                    style={{
                      width:
                        '100%',
                      height:
                        '30px',
                      padding:
                        '0 9px',
                      border: 0,
                      borderRadius:
                        '5px',
                      background:
                        pinned
                          ? COLORS.blueSoft
                          : 'transparent',
                      color:
                        pinned
                          ? COLORS.blueDark
                          : COLORS.text,
                      cursor:
                        'pointer',
                      fontFamily:
                        'inherit',
                      fontSize:
                        '9px',
                      fontWeight:
                        pinned
                          ? 600
                          : 400,
                      textAlign:
                        'left',
                    }}
                  >
                    {pinned
                      ? 'Unpin message'
                      : 'Pin message'}
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMoreOpen(
                        false,
                      )

                      onMessageClick(
                        message,
                      )
                    }}
                    style={{
                      width:
                        '100%',
                      height:
                        '30px',
                      padding:
                        '0 9px',
                      border: 0,
                      borderRadius:
                        '5px',
                      background:
                        'transparent',
                      color:
                        COLORS.text,
                      cursor:
                        'pointer',
                      fontFamily:
                        'inherit',
                      fontSize:
                        '9px',
                      textAlign:
                        'left',
                    }}
                  >
                    Open thread
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() =>
                      setMoreOpen(
                        false,
                      )
                    }
                    style={{
                      width:
                        '100%',
                      height:
                        '30px',
                      padding:
                        '0 9px',
                      border: 0,
                      borderRadius:
                        '5px',
                      background:
                        'transparent',
                      color:
                        COLORS.text,
                      cursor:
                        'pointer',
                      fontFamily:
                        'inherit',
                      fontSize:
                        '9px',
                      textAlign:
                        'left',
                    }}
                  >
                    Close menu
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
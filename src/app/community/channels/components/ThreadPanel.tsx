'use client'

import { useEffect, useId, useRef } from 'react'

import type {
  FormEvent,
  KeyboardEvent,
} from 'react'

import { COLORS } from '../constants'

import type { Message } from '../types'

export type ThreadReply = {
  id: string
  messageId: string
  username: string
  initials: string
  avatarColor?: string
  nameColor?: string
  content: string
  createdAt: string
}

type ThreadPanelProps = {
  channelName: string
  message: Message | null
  replies: ThreadReply[]
  input: string
  sending?: boolean
  onInputChange: (value: string) => void
  onSend: () => void
  onClose: () => void
}

function formatTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function ThreadPanel({
  channelName,
  message,
  replies,
  input,
  sending = false,
  onInputChange,
  onSend,
  onClose,
}: ThreadPanelProps) {
  const inputId = useId()

  const listRef =
    useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [replies.length, message?.id])

  if (!message) {
    return null
  }

  const submit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (input.trim() && !sending) {
      onSend()
    }
  }

  const keyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey
    ) {
      event.preventDefault()

      if (input.trim() && !sending) {
        onSend()
      }
    }
  }

  return (
    <aside
      aria-label="Message thread"
      style={{
        width: '360px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        background: COLORS.surface,
        borderLeft: `1px solid ${COLORS.border}`,
        boxSizing: 'border-box',
      }}
    >
      {/* Thread header */}
      <header
        style={{
          height: '66px',
          minHeight: '66px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          borderBottom: `1px solid ${COLORS.border}`,
          flexShrink: 0,
          boxSizing: 'border-box',
        }}
      >
        <div>
          <div
            style={{
              color: COLORS.text,
              fontSize: '14px',
              lineHeight: '19px',
              fontWeight: 700,
            }}
          >
            Thread
          </div>

          <div
            style={{
              marginTop: '2px',
              color: COLORS.textDim,
              fontSize: '10px',
              lineHeight: '14px',
            }}
          >
            #{channelName} · {replies.length}{' '}
            {replies.length === 1
              ? 'reply'
              : 'replies'}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close thread"
          style={{
            width: '30px',
            height: '30px',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '7px',
            background: COLORS.surface,
            color: COLORS.textMuted,
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          ×
        </button>
      </header>

      {/* Thread content */}
      <div
        ref={listRef}
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '16px',
          boxSizing: 'border-box',
        }}
      >
        {/* Original message */}
        <section
          style={{
            paddingBottom: '16px',
            borderBottom: `1px solid ${COLORS.border}`,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '9px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                borderRadius: '7px',
                background:
                  message.avatarColor ??
                  COLORS.blueSoft,
                color:
                  message.nameColor ??
                  COLORS.blueDark,
                fontSize: '9px',
                fontWeight: 700,
              }}
            >
              {message.initials}
            </div>

            <div
              style={{
                minWidth: 0,
                flex: 1,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '7px',
                }}
              >
                <span
                  style={{
                    color:
                      message.nameColor ??
                      COLORS.text,
                    fontSize: '11px',
                    lineHeight: '15px',
                    fontWeight: 700,
                  }}
                >
                  {message.username}
                </span>

                <span
                  style={{
                    color: COLORS.textDim,
                    fontSize: '9px',
                    lineHeight: '13px',
                  }}
                >
                  {formatTime(
                    message.createdAt,
                  )}
                </span>
              </div>

              <div
                style={{
                  marginTop: '5px',
                  color: COLORS.text,
                  fontSize: '11px',
                  lineHeight: '17px',
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'anywhere',
                }}
              >
                {message.content}
              </div>
            </div>
          </div>
        </section>

        {/* Replies */}
        <section
          style={{
            paddingTop: '16px',
          }}
        >
          <div
            style={{
              marginBottom: '12px',
              color: COLORS.textDim,
              fontSize: '9px',
              lineHeight: '13px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            Discussion
          </div>

          {replies.length === 0 ? (
            <div
              style={{
                padding: '22px 8px',
                textAlign: 'center',
                color: COLORS.textMuted,
                fontSize: '10px',
                lineHeight: '16px',
              }}
            >
              No replies yet.
              <br />
              Start the discussion by replying to
              this message.
            </div>
          ) : (
            replies.map(reply => (
              <article
                key={reply.id}
                style={{
                  display: 'flex',
                  gap: '9px',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    borderRadius: '7px',
                    background:
                      reply.avatarColor ??
                      COLORS.surfaceSoft,
                    color:
                      reply.nameColor ??
                      COLORS.blueDark,
                    fontSize: '9px',
                    fontWeight: 700,
                  }}
                >
                  {reply.initials}
                </div>

                <div
                  style={{
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '7px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      style={{
                        color:
                          reply.nameColor ??
                          COLORS.text,
                        fontSize: '10px',
                        lineHeight: '14px',
                        fontWeight: 700,
                      }}
                    >
                      {reply.username}
                    </span>

                    <span
                      style={{
                        color: COLORS.textDim,
                        fontSize: '9px',
                        lineHeight: '13px',
                      }}
                    >
                      {formatTime(
                        reply.createdAt,
                      )}
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: '3px',
                      color: COLORS.textMuted,
                      fontSize: '10px',
                      lineHeight: '16px',
                      whiteSpace: 'pre-wrap',
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {reply.content}
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </div>

      {/* Reply composer */}
      <form
        onSubmit={submit}
        style={{
          padding: '11px 14px 13px',
          borderTop: `1px solid ${COLORS.border}`,
          background: COLORS.surface,
          flexShrink: 0,
        }}
      >
        <label
          htmlFor={inputId}
          style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
            clip: 'rect(0,0,0,0)',
          }}
        >
          Reply to thread
        </label>

        <textarea
          id={inputId}
          value={input}
          onChange={event =>
            onInputChange(
              event.target.value,
            )
          }
          onKeyDown={keyDown}
          disabled={sending}
          placeholder={`Reply to ${message.username}...`}
          rows={2}
          style={{
            width: '100%',
            minHeight: '54px',
            maxHeight: '140px',
            resize: 'vertical',
            padding: '9px 10px',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '7px',
            outline: 'none',
            background: COLORS.surfaceSoft,
            color: COLORS.text,
            fontFamily: 'inherit',
            fontSize: '10px',
            lineHeight: '15px',
            boxSizing: 'border-box',
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '6px',
          }}
        >
          <span
            style={{
              color: COLORS.textDim,
              fontSize: '9px',
              lineHeight: '13px',
            }}
          >
            Enter to send · Shift + Enter for a
            new line
          </span>

          <button
            type="submit"
            disabled={!input.trim() || sending}
            style={{
              padding: '6px 12px',
              border: `1px solid ${
                input.trim() && !sending
                  ? COLORS.blue
                  : COLORS.border
              }`,
              borderRadius: '6px',
              background:
                input.trim() && !sending
                  ? COLORS.blue
                  : COLORS.surfaceActive,
              color:
                input.trim() && !sending
                  ? COLORS.white
                  : COLORS.textDim,
              cursor:
                input.trim() && !sending
                  ? 'pointer'
                  : 'not-allowed',
              fontFamily: 'inherit',
              fontSize: '10px',
              lineHeight: '14px',
              fontWeight: 700,
            }}
          >
            {sending ? 'Sending' : 'Reply'}
          </button>
        </div>
      </form>
    </aside>
  )
}
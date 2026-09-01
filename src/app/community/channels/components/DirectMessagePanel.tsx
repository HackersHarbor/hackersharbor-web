'use client'

import { useEffect, useRef, useState } from 'react'

import { COLORS } from '../constants'

type DirectMessageUser = {
  id: string
  username: string
  initials: string
  online: boolean
  unread: number
  avatarColor: string
  nameColor: string
}

type DirectMessage = {
  id: string
  senderId: string
  content: string
  createdAt: string
}

type DirectMessagePanelProps = {
  user: DirectMessageUser
  messages: DirectMessage[]
  onSend: (content: string) => void
  onBack: () => void
}

function formatTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function DirectMessagePanel({
  user,
  messages,
  onSend,
  onBack,
}: DirectMessagePanelProps) {
  const [input, setInput] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages.length])

  const submit = () => {
    const content = input.trim()
    if (!content) return
    onSend(content)
    setInput('')
  }

  return (
    <main
      style={{
        height: '100%',
        minWidth: 0,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        background: COLORS.background,
      }}
    >
      <header
        style={{
          minHeight: '66px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          padding: '0 20px',
          background: COLORS.surface,
          borderBottom: `1px solid ${COLORS.border}`,
          boxSizing: 'border-box',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              borderRadius: '8px',
              background: user.avatarColor,
              color: user.nameColor,
              fontSize: '10px',
              fontWeight: 700,
            }}
          >
            {user.initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: COLORS.text,
                  fontSize: '14px',
                  lineHeight: '18px',
                  fontWeight: 600,
                }}
              >
                {user.username}
              </span>
              <span
                aria-hidden="true"
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: user.online ? COLORS.green : COLORS.textDim,
                  flexShrink: 0,
                }}
              />
            </div>
            <div
              style={{
                marginTop: '2px',
                color: COLORS.textDim,
                fontSize: '9px',
                lineHeight: '13px',
              }}
            >
              {user.online ? 'Online' : 'Offline'} · Private conversation
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          style={{
            minHeight: '32px',
            padding: '0 11px',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '7px',
            background: COLORS.surfaceSoft,
            color: COLORS.textMuted,
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: '9px',
            fontWeight: 600,
          }}
        >
          Discussions
        </button>
      </header>

      <div
        ref={listRef}
        role="log"
        aria-label={`Messages with ${user.username}`}
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '14px 0',
          boxSizing: 'border-box',
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '30px',
              textAlign: 'center',
              color: COLORS.textMuted,
              fontSize: '10px',
              lineHeight: '15px',
              boxSizing: 'border-box',
            }}
          >
            Start a private conversation with {user.username}.
          </div>
        ) : (
          messages.map(message => {
            const mine = message.senderId === 'me'
            return (
              <article
                key={message.id}
                style={{
                  display: 'flex',
                  justifyContent: mine ? 'flex-end' : 'flex-start',
                  padding: '6px 24px',
                }}
              >
                <div
                  style={{
                    maxWidth: '68%',
                    padding: '9px 11px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '8px',
                    background: mine ? COLORS.blueSoft : COLORS.surface,
                    color: COLORS.text,
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    style={{
                      color: COLORS.text,
                      fontSize: '10px',
                      lineHeight: '15px',
                      whiteSpace: 'pre-wrap',
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {message.content}
                  </div>
                  <time
                    dateTime={message.createdAt}
                    style={{
                      display: 'block',
                      marginTop: '4px',
                      color: COLORS.textDim,
                      fontSize: '8px',
                      lineHeight: '11px',
                      textAlign: 'right',
                    }}
                  >
                    {formatTime(message.createdAt)}
                  </time>
                </div>
              </article>
            )
          })
        )}
      </div>

      <form
        onSubmit={event => {
          event.preventDefault()
          submit()
        }}
        style={{
          padding: '12px 24px 15px',
          borderTop: `1px solid ${COLORS.border}`,
          background: COLORS.surface,
          flexShrink: 0,
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <textarea
            value={input}
            onChange={event => setInput(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                submit()
              }
            }}
            placeholder={`Message ${user.username}...`}
            rows={2}
            style={{
              flex: 1,
              minHeight: '58px',
              maxHeight: '150px',
              resize: 'vertical',
              padding: '10px 11px',
              border: `1px solid ${COLORS.border}`,
              borderRadius: '8px',
              outline: 'none',
              background: COLORS.surfaceSoft,
              color: COLORS.text,
              fontFamily: 'inherit',
              fontSize: '10px',
              lineHeight: '15px',
              boxSizing: 'border-box',
            }}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            style={{
              minHeight: '32px',
              padding: '0 12px',
              border: `1px solid ${input.trim() ? COLORS.blue : COLORS.border}`,
              borderRadius: '6px',
              background: input.trim() ? COLORS.blue : COLORS.surfaceActive,
              color: input.trim() ? COLORS.white : COLORS.textDim,
              cursor: input.trim() ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit',
              fontSize: '9px',
              fontWeight: 700,
            }}
          >
            Send
          </button>
        </div>
        <div
          style={{
            marginTop: '5px',
            color: COLORS.textDim,
            fontSize: '8px',
            lineHeight: '12px',
          }}
        >
          Enter to send · Shift + Enter for a new line
        </div>
      </form>
    </main>
  )
}

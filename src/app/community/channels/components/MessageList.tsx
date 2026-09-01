'use client'

import { COLORS } from '../constants'
import type { Message } from '../types'
import { MessageItem } from './MessageItem'

type MessageListProps = {
  messages: Message[]
  loading?: boolean
  onToggleReaction: (
    messageId: string,
    emoji: string,
  ) => void
  onMessageClick: (
    message: Message,
  ) => void
  selectedMessageId?: string | null
}

export function MessageList({
  messages,
  loading = false,
  onToggleReaction,
  onMessageClick,
  selectedMessageId = null,
}: MessageListProps) {
  if (loading) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '30px',
          background: COLORS.background,
          color: COLORS.textMuted,
          fontSize: '11px',
        }}
      >
        Loading messages...
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '30px',
          textAlign: 'center',
          background: COLORS.background,
        }}
      >
        <div
          style={{
            width: '42px',
            height: '42px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            borderRadius: '10px',
            background: COLORS.blueSoft,
            color: COLORS.blue,
            fontSize: '18px',
            fontWeight: 600,
          }}
        >
          #
        </div>

        <div
          style={{
            marginBottom: '5px',
            color: COLORS.text,
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          No messages yet
        </div>

        <div
          style={{
            maxWidth: '320px',
            color: COLORS.textMuted,
            fontSize: '10px',
            lineHeight: '15px',
          }}
        >
          Start the conversation by sending the first
          message in this channel.
        </div>
      </div>
    )
  }

  return (
    <div
      role="log"
      aria-label="Channel messages"
      style={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        background: COLORS.background,
        padding: '8px 0',
      }}
    >
      {messages.map(message => (
        <MessageItem
          key={message.id}
          message={message}
          selected={
            selectedMessageId === message.id
          }
          onToggleReaction={
            onToggleReaction
          }
          onMessageClick={
            onMessageClick
          }
        />
      ))}
    </div>
  )
}
'use client'

import type {
  Message,
  MessageAttachment,
} from '../types'

import { ChannelHeader } from './ChannelHeader'
import { PinnedMessages } from './PinnedMessages'
import { MessageList } from './MessageList'
import { MessageComposer } from './MessageComposer'

type ChannelContentProps = {
  channel: {
    id: string
    name: string
    description: string
    online: number
    unread: number
  }

  messages: Message[]

  messageInput: string

  loading?: boolean

  sending?: boolean

  selectedMessageId?: string | null

  threadReplyCounts?: Record<
    string,
    number
  >

  typingUser?: string | null

  onMessageInputChange: (
    value: string,
  ) => void

  onSendMessage: (
    attachments?: MessageAttachment[],
  ) => void

  onToggleReaction: (
    messageId: string,
    emoji: string,
  ) => void

  onMessageClick: (
    message: Message,
  ) => void
}

export function ChannelContent({
  channel,
  messages,
  messageInput,
  loading = false,
  sending = false,
  selectedMessageId = null,
  threadReplyCounts = {},
  typingUser = null,
  onMessageInputChange,
  onSendMessage,
  onToggleReaction,
  onMessageClick,
}: ChannelContentProps) {
  return (
    <main
      style={{
        height: '100%',
        minWidth: 0,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        background: '#F7F9FC',
      }}
    >
      <ChannelHeader
        channel={channel}
      />

      <PinnedMessages
        channelId={channel.id}
        channelName={channel.name}
        messages={messages}
      />

      <MessageList
        messages={messages}
        loading={loading}
        selectedMessageId={
          selectedMessageId
        }
        onToggleReaction={
          onToggleReaction
        }
        onMessageClick={
          onMessageClick
        }
      />

      {typingUser && (
        <div
          aria-live="polite"
          style={{
            flexShrink: 0,
            minHeight: '30px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            borderTop:
              '1px solid #E2E8F0',
            background: '#F7F9FC',
            color: '#667085',
            fontSize: '9px',
            lineHeight: '14px',
            boxSizing: 'border-box',
          }}
        >
          <span
            style={{
              fontWeight: 600,
              color: '#344054',
            }}
          >
            {typingUser}
          </span>

          <span
            style={{
              marginLeft: '4px',
            }}
          >
            is typing
          </span>

          <span
            aria-hidden="true"
            style={{
              marginLeft: '2px',
              letterSpacing: '2px',
            }}
          >
            ...
          </span>
        </div>
      )}

      <MessageComposer
        value={messageInput}
        onChange={
          onMessageInputChange
        }
        onSend={onSendMessage}
        disabled={sending}
      />
    </main>
  )
}


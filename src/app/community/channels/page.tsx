'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  CHANNELS,
  DEFAULT_CHANNEL_ID,
} from './data/channelData'

import {
  LocalMessageService,
} from './services/messageService'

import type {
  Message,
  MessageAttachment,
} from './types'

import {
  TopNavigation,
} from './components/TopNavigation'

import {
  ChannelSidebar,
} from './components/ChannelSidebar'

import {
  ChannelContent,
} from './components/ChannelContent'

import { ThreadPanel } from './components/ThreadPanel'

const messageService =
  new LocalMessageService()

const initialMessages: Record<
  string,
  Message[]
> = {
  general: [
    {
      id: 'general-1',
      channelId: 'general',
      userId: 'arjun',
      username: 'Arjun K.',
      initials: 'AK',
      avatarColor: '#EEF4FF',
      nameColor: '#3F7CFF',
      content:
        'Good morning everyone! Just solved my first Hard problem on HackersHarbor.',
      createdAt:
        '2026-08-31T10:24:00',
      reactions: [],
    },
    {
      id: 'general-2',
      channelId: 'general',
      userId: 'meera',
      username: 'Meera S.',
      initials: 'MS',
      avatarColor: '#EEF9F1',
      nameColor: '#2F8F46',
      content:
        "That's amazing Arjun! Which problem was it?",
      createdAt:
        '2026-08-31T10:26:00',
      reactions: [],
    },
    {
      id: 'general-3',
      channelId: 'general',
      userId: 'arjun',
      username: 'Arjun K.',
      initials: 'AK',
      avatarColor: '#EEF4FF',
      nameColor: '#3F7CFF',
      content:
        'Trapping Rain Water! Took me 3 days but finally got it.',
      createdAt:
        '2026-08-31T10:27:00',
      reactions: [],
    },
    {
      id: 'general-4',
      channelId: 'general',
      userId: 'rahul',
      username: 'Rahul P.',
      initials: 'RP',
      avatarColor: '#F5F0FF',
      nameColor: '#7657B8',
      content:
        'That problem is brutal. Congrats! The two pointer approach is key.',
      createdAt:
        '2026-08-31T10:31:00',
      reactions: [],
    },
    {
      id: 'general-5',
      channelId: 'general',
      userId: 'meera',
      username: 'Meera S.',
      initials: 'MS',
      avatarColor: '#EEF9F1',
      nameColor: '#2F8F46',
      content:
        'Anyone else preparing for TCS NQT this month?',
      createdAt:
        '2026-08-31T10:33:00',
      reactions: [],
    },
    {
      id: 'general-6',
      channelId: 'general',
      userId: 'karan',
      username: 'Karan M.',
      initials: 'KM',
      avatarColor: '#FFF8E8',
      nameColor: '#A56A00',
      content:
        "Yes! I'm using the TCS NQT voyage on here. 3 weeks in and feeling confident.",
      createdAt:
        '2026-08-31T10:35:00',
      reactions: [],
    },
    {
      id: 'general-7',
      channelId: 'general',
      userId: 'neha',
      username: 'Neha R.',
      initials: 'NR',
      avatarColor: '#ECFBFD',
      nameColor: '#16899A',
      content:
        'The Navigator AI is so helpful for explaining concepts I get stuck on.',
      createdAt:
        '2026-08-31T10:38:00',
      reactions: [],
    },
  ],

  python: [
    {
      id: 'python-1',
      channelId: 'python',
      userId: 'rahul',
      username: 'Rahul P.',
      initials: 'RP',
      avatarColor: '#F5F0FF',
      nameColor: '#7657B8',
      content:
        'Anyone know how to use decorators with async functions in Python?',
      createdAt:
        '2026-08-31T09:15:00',
      reactions: [],
    },
    {
      id: 'python-2',
      channelId: 'python',
      userId: 'meera',
      username: 'Meera S.',
      initials: 'MS',
      avatarColor: '#EEF9F1',
      nameColor: '#2F8F46',
      content:
        'Yes! You need to use functools.wraps and make the wrapper async too.',
      createdAt:
        '2026-08-31T09:18:00',
      reactions: [],
    },
    {
      id: 'python-3',
      channelId: 'python',
      userId: 'meera',
      username: 'Meera S.',
      initials: 'MS',
      avatarColor: '#EEF9F1',
      nameColor: '#2F8F46',
      content:
        '```python\nimport functools\n\ndef my_decorator(func):\n    @functools.wraps(func)\n    async def wrapper(*args, **kwargs):\n        return await func(*args, **kwargs)\n    return wrapper\n```',
      createdAt:
        '2026-08-31T09:19:00',
      reactions: [],
    },
    {
      id: 'python-4',
      channelId: 'python',
      userId: 'rahul',
      username: 'Rahul P.',
      initials: 'RP',
      avatarColor: '#F5F0FF',
      nameColor: '#7657B8',
      content:
        'Perfect! That worked. Thank you.',
      createdAt:
        '2026-08-31T09:22:00',
      reactions: [],
    },
  ],

  jobs: [
    {
      id: 'jobs-1',
      channelId: 'jobs',
      userId: 'karan',
      username: 'Karan M.',
      initials: 'KM',
      avatarColor: '#FFF8E8',
      nameColor: '#A56A00',
      content:
        'Amazon is hiring for SDE-1 in Bangalore. 3+ years experience.',
      createdAt:
        '2026-08-31T08:00:00',
      reactions: [],
    },
    {
      id: 'jobs-2',
      channelId: 'jobs',
      userId: 'neha',
      username: 'Neha R.',
      initials: 'NR',
      avatarColor: '#ECFBFD',
      nameColor: '#16899A',
      content:
        'Razorpay is also hiring for their data engineering team. DM me for referral.',
      createdAt:
        '2026-08-31T08:45:00',
      reactions: [],
    },
    {
      id: 'jobs-3',
      channelId: 'jobs',
      userId: 'arjun',
      username: 'Arjun K.',
      initials: 'AK',
      avatarColor: '#EEF4FF',
      nameColor: '#3F7CFF',
      content:
        'Just got an offer from Flipkart! HackersHarbor practice really helped.',
      createdAt:
        '2026-08-31T09:30:00',
      reactions: [],
    },
  ],
}

type ThreadReply = {
  id: string
  messageId: string
  username: string
  initials: string
  avatarColor: string
  content: string
  createdAt: string
}

const initialThreadReplies: Record<
  string,
  ThreadReply[]
> = {
  'general-3': [
    {
      id: 'reply-1',
      messageId: 'general-3',
      username: 'Meera S.',
      initials: 'MS',
      avatarColor: '#EEF9F1',
      content:
        'Which approach did you finally use?',
      createdAt:
        '2026-08-31T10:40:00',
    },
    {
      id: 'reply-2',
      messageId: 'general-3',
      username: 'Rahul P.',
      initials: 'RP',
      avatarColor: '#F5F0FF',
      content:
        'Two pointer is usually the cleanest approach.',
      createdAt:
        '2026-08-31T10:42:00',
    },
    {
      id: 'reply-3',
      messageId: 'general-3',
      username: 'Arjun K.',
      initials: 'AK',
      avatarColor: '#EEF4FF',
      content:
        'Yes, exactly. Once I understood the left and right max values it clicked.',
      createdAt:
        '2026-08-31T10:44:00',
    },
  ],
}

export default function Channels() {
  const [
    activeChannelId,
    setActiveChannelId,
  ] = useState<string>(
    DEFAULT_CHANNEL_ID,
  )

  const [
    searchQuery,
    setSearchQuery,
  ] = useState('')

  const [
    messageInput,
    setMessageInput,
  ] = useState('')

  const [
    messages,
    setMessages,
  ] = useState<
    Record<string, Message[]>
  >(initialMessages)

  const [
    sendingMessage,
    setSendingMessage,
  ] = useState(false)

  const [
    loadingMessages,
    setLoadingMessages,
  ] = useState(false)

  const [
    selectedThreadMessage,
    setSelectedThreadMessage,
  ] = useState<Message | null>(null)

  const [
    threadReplies,
    setThreadReplies,
  ] = useState<
    Record<string, ThreadReply[]>
  >(initialThreadReplies)

  const [
    threadInput,
    setThreadInput,
  ] = useState('')

  const [
    sendingReply,
    setSendingReply,
  ] = useState(false)

  const messagesEndRef =
    useRef<HTMLDivElement>(null)

  const activeChannel =
    useMemo(
      () =>
        CHANNELS.find(
          channel =>
            channel.id ===
            activeChannelId,
        ) ?? CHANNELS[0],
      [activeChannelId],
    )

  const currentMessages =
    messages[activeChannelId] ?? []

  const selectedReplies =
    selectedThreadMessage
      ? threadReplies[
          selectedThreadMessage.id
        ] ?? []
      : []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [
    activeChannelId,
    currentMessages.length,
  ])

  useEffect(() => {
    let cancelled = false

    async function loadMessages() {
      setLoadingMessages(true)

      try {
        const localMessages =
          await messageService.getMessages(
            activeChannelId,
          )

        if (
          !cancelled &&
          localMessages.length > 0
        ) {
          setMessages(previous => ({
            ...previous,
            [activeChannelId]:
              localMessages,
          }))
        }
      } finally {
        if (!cancelled) {
          setLoadingMessages(false)
        }
      }
    }

    void loadMessages()

    return () => {
      cancelled = true
    }
  }, [activeChannelId])

  const selectChannel = (
    channelId: string,
  ) => {
    setActiveChannelId(channelId)
    setMessageInput('')
    setSelectedThreadMessage(null)
    setThreadInput('')
  }

  const sendMessage = async (
    attachments: MessageAttachment[] = [],
  ) => {
    const content =
      messageInput.trim()

    if (
      (!content &&
        attachments.length === 0) ||
      sendingMessage
    ) {
      return
    }

    setSendingMessage(true)

    try {
      const message =
        await messageService.sendMessage(
          activeChannelId,
          content,
          attachments,
        )

      setMessages(previous => ({
        ...previous,
        [activeChannelId]: [
          ...(previous[
            activeChannelId
          ] ?? []),
          message,
        ],
      }))

      setMessageInput('')
    } finally {
      setSendingMessage(false)
    }
  }
  const toggleReaction = async (
    messageId: string,
    emoji: string,
  ) => {
    try {
      const updated =
        await messageService.toggleReaction(
          messageId,
          emoji,
        )

      setMessages(previous => ({
        ...previous,
        [activeChannelId]: (
          previous[
            activeChannelId
          ] ?? []
        ).map(message =>
          message.id === messageId
            ? updated
            : message,
        ),
      }))
    } catch {
      // Reaction failure is isolated.
    }
  }

  const openThread = (
    message: Message,
  ) => {
    setSelectedThreadMessage(message)
    setThreadInput('')
  }

  const closeThread = () => {
    setSelectedThreadMessage(null)
    setThreadInput('')
  }

  const sendThreadReply = () => {
    const content =
      threadInput.trim()

    if (
      !content ||
      !selectedThreadMessage ||
      sendingReply
    ) {
      return
    }

    const message =
      selectedThreadMessage

    setSendingReply(true)

    const reply: ThreadReply = {
      id:
        `${message.id}-reply-${Date.now()}`,
      messageId:
        message.id,
      username: 'Punith K.',
      initials: 'PK',
      avatarColor: '#EEF4FF',
      content,
      createdAt:
        new Date().toISOString(),
    }

    setThreadReplies(previous => ({
      ...previous,
      [message.id]: [
        ...(previous[
          message.id
        ] ?? []),
        reply,
      ],
    }))

    setThreadInput('')
    setSendingReply(false)
  }
  return (
    <div
      className="channels-page"
      style={{
        width: '100%',
        height: '100vh',
        minHeight: '600px',
        display: 'flex',
        flexDirection: 'column',
        background: '#FFFFFF',
        color: '#172033',
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        overflow: 'hidden',
      }}
    >
      <TopNavigation />

      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        <ChannelSidebar
          activeChannelId={
            activeChannelId
          }
          searchQuery={
            searchQuery
          }
          onSearchChange={
            setSearchQuery
          }
          onChannelSelect={
            selectChannel
          }
          username="Punith K."
          initials="PK"
          online
        />

        <ChannelContent
          channel={
            activeChannel
          }
          messages={
            currentMessages
          }
          messageInput={
            messageInput
          }
          loading={
            loadingMessages
          }
          sending={
            sendingMessage
          }
          selectedMessageId={
            selectedThreadMessage?.id ??
            null
          }
          threadReplyCounts={
            Object.fromEntries(
              Object.entries(threadReplies).map(
                ([messageId, replies]) => [
                  messageId,
                  replies.length,
                ],
              ),
            )
          }
          onMessageInputChange={
            setMessageInput
          }
          onSendMessage={attachments => {
            void sendMessage(
              attachments,
            )
          }}
          onToggleReaction={(
            messageId,
            emoji,
          ) => {
            void toggleReaction(
              messageId,
              emoji,
            )
          }}
          onMessageClick={
            openThread
          }
        />

        <ThreadPanel
          channelName={activeChannel.name}
          message={selectedThreadMessage}
          replies={selectedReplies}
          input={threadInput}
          sending={sendingReply}
          onInputChange={setThreadInput}
          onSend={sendThreadReply}
          onClose={closeThread}
        />
      </div>

      <div
        ref={messagesEndRef}
        style={{
          display: 'none',
        }}
      />
    </div>
  )
}



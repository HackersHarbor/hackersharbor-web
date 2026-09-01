export type MessageAttachment = {
    id: string
    name: string
    url: string
    type: string
    size: number
    isImage: boolean
  }
  
  export type Channel = {
    id: string
    name: string
    description: string
    online: number
    unread: number
  }
  
  export type Reaction = {
    emoji: string
    count: number
    reacted?: boolean
  }
  
  export type Message = {
    id: string
    channelId: string
    userId: string
    username: string
    initials: string
    avatarUrl?: string | null
    avatarColor?: string
    nameColor?: string
    content: string
    createdAt: string
    reactions: Reaction[]
  
    // File and image sharing
    attachments?: MessageAttachment[]
  }
  
  export type ChannelMember = {
    id: string
    username: string
    initials: string
    avatarUrl?: string | null
    online: boolean
  }
  
  export type ChannelState = {
    activeChannelId: string
    searchQuery: string
    messageInput: string
  }
  
  export type MessageService = {
    getMessages: (
      channelId: string,
    ) => Promise<Message[]>
  
    sendMessage: (
      channelId: string,
      content: string,
      attachments?: MessageAttachment[],
    ) => Promise<Message>
  
    toggleReaction: (
      messageId: string,
      emoji: string,
    ) => Promise<Message>
  }
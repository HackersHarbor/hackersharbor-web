export interface MessageAuthor {
  id: string;
  name: string;
  initials: string;
  role?: string;
  avatar?: string;
}

export interface MessageTag {
  label: string;
  icon?: string;
}

export interface CodeBlock {
  language: string;
  code: string;
  output?: string;
  exitCode?: number;
}

export interface Message {
  id: string;
  channelId: string;

  /**
   * If present, this message is a reply to another message.
   * Root channel messages do not have a parentMessageId.
   */
  parentMessageId?: string;

  author: MessageAuthor;
  content: string;
  timestamp: string;

  tags?: MessageTag[];

  code?: CodeBlock;

  replyCount?: number;
  isPinned?: boolean;
  isHighlighted?: boolean;
}
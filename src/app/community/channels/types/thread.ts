import type { Message } from "./message";

export interface Thread {
  id: string;
  channelId: string;
  parentMessageId: string;

  title: string;
  replyCount: number;

  messages: Message[];

  isOpen: boolean;
}
import type { Message } from "../types/message";

export interface IMessageService {
  getMessages(channelId: string): Promise<Message[]>;

  getMessage(messageId: string): Promise<Message | null>;

  sendMessage(
    channelId: string,
    content: string,
  ): Promise<Message>;
}
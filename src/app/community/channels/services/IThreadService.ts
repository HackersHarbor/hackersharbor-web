import type { Message } from "../types/message";

export interface IThreadService {
  getReplies(
    parentMessageId: string,
  ): Promise<Message[]>;

  getReplyCount(
    parentMessageId: string,
  ): Promise<number>;

  sendReply(
    parentMessageId: string,
    content: string,
  ): Promise<Message>;
}
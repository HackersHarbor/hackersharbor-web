import type {
  Message,
  MessageAttachment,
  MessageService,
} from '../types'

export class LocalMessageService
  implements MessageService
{
  private messages: Message[] = []

  async getMessages(
    channelId: string,
  ): Promise<Message[]> {
    return this.messages.filter(
      message =>
        message.channelId ===
        channelId,
    )
  }

  async sendMessage(
    channelId: string,
    content: string,
    attachments: MessageAttachment[] = [],
  ): Promise<Message> {
    const trimmedContent =
      content.trim()

    if (
      !trimmedContent &&
      attachments.length === 0
    ) {
      throw new Error(
        'Message cannot be empty.',
      )
    }

    const message: Message = {
      id:
        typeof crypto !==
        'undefined'
          ? crypto.randomUUID()
          : `${Date.now()}`,

      channelId,

      userId:
        'current-user',

      username:
        'You',

      initials:
        'YO',

      content:
        trimmedContent,

      createdAt:
        new Date().toISOString(),

      reactions: [],

      attachments:
        attachments.length > 0
          ? attachments
          : undefined,
    }

    this.messages.push(
      message,
    )

    return message
  }

  async toggleReaction(
    messageId: string,
    emoji: string,
  ): Promise<Message> {
    const message =
      this.messages.find(
        item =>
          item.id ===
          messageId,
      )

    if (!message) {
      throw new Error(
        'Message not found.',
      )
    }

    const existingReaction =
      message.reactions.find(
        reaction =>
          reaction.emoji ===
          emoji,
      )

    if (existingReaction) {
      existingReaction.reacted =
        !existingReaction.reacted

      existingReaction.count =
        existingReaction.reacted
          ? existingReaction.count + 1
          : Math.max(
              0,
              existingReaction.count - 1,
            )
    } else {
      message.reactions.push({
        emoji,
        count: 1,
        reacted: true,
      })
    }

    return {
      ...message,

      reactions:
        message.reactions.filter(
          reaction =>
            reaction.count > 0,
        ),
    }
  }
}
import type { Message } from "../types/message";

import type { IThreadService } from "./IThreadService";

const INITIAL_THREAD_REPLIES: Record<
  string,
  Message[]
> = {
  "message-1": [
    {
      id: "message-1-reply-1",
      channelId: "general",
      author: {
        id: "rahul",
        name: "Rahul P.",
        initials: "RP",
        role: "Member",
      },
      content:
        "Yes, I am preparing for it too. I have been focusing on aptitude and coding questions.",
      timestamp: "10:41 AM",
    },
    {
      id: "message-1-reply-2",
      channelId: "general",
      author: {
        id: "ananya",
        name: "Ananya R.",
        initials: "AR",
        role: "Member",
      },
      content:
        "Same here. The reasoning section has been taking most of my practice time.",
      timestamp: "10:45 AM",
    },
    {
      id: "message-1-reply-3",
      channelId: "general",
      author: {
        id: "kiran",
        name: "Kiran T.",
        initials: "KT",
        role: "Member",
      },
      content:
        "I have been solving previous NQT questions every evening.",
      timestamp: "10:49 AM",
    },
  ],

  "message-4": [
    {
      id: "message-4-reply-1",
      channelId: "general",
      author: {
        id: "meera",
        name: "Meera S.",
        initials: "MS",
        role: "Member",
      },
      content:
        "The output makes sense, but I was confused about why append changes the original list.",
      timestamp: "11:08 AM",
    },
    {
      id: "message-4-reply-2",
      channelId: "general",
      author: {
        id: "ananya",
        name: "Ananya R.",
        initials: "AR",
        role: "Member",
      },
      content:
        "Lists are mutable in Python, so append modifies the existing list.",
      timestamp: "11:11 AM",
    },
  ],

  "message-5": [
    {
      id: "message-5-reply-1",
      channelId: "python",
      author: {
        id: "rahul",
        name: "Rahul P.",
        initials: "RP",
        role: "Member",
      },
      content:
        "Start with very small functions. For example, write a function that adds two numbers.",
      timestamp: "9:22 AM",
    },
    {
      id: "message-5-reply-2",
      channelId: "python",
      author: {
        id: "meera",
        name: "Meera S.",
        initials: "MS",
        role: "Member",
      },
      content:
        "Testing each function immediately helped me avoid feeling overwhelmed.",
      timestamp: "9:25 AM",
    },
    {
      id: "message-5-reply-3",
      channelId: "python",
      author: {
        id: "kiran",
        name: "Kiran T.",
        initials: "KT",
        role: "Member",
      },
      content:
        "You can also practice one concept at a time instead of trying to build a complete project.",
      timestamp: "9:29 AM",
    },
  ],

  "message-6": [
    {
      id: "message-6-reply-1",
      channelId: "python",
      author: {
        id: "ananya",
        name: "Ananya R.",
        initials: "AR",
        role: "Member",
      },
      content:
        "That's a good approach. Testing small inputs makes debugging much easier.",
      timestamp: "9:32 AM",
    },
  ],

  "message-7": [
    {
      id: "message-7-reply-1",
      channelId: "sql",
      author: {
        id: "rahul",
        name: "Rahul P.",
        initials: "RP",
        role: "Member",
      },
      content:
        "INNER JOIN only returns rows that have matching values in both tables.",
      timestamp: "8:56 AM",
    },
    {
      id: "message-7-reply-2",
      channelId: "sql",
      author: {
        id: "meera",
        name: "Meera S.",
        initials: "MS",
        role: "Member",
      },
      content:
        "LEFT JOIN keeps every row from the left table even when there is no match.",
      timestamp: "8:59 AM",
    },
    {
      id: "message-7-reply-3",
      channelId: "sql",
      author: {
        id: "kiran",
        name: "Kiran T.",
        initials: "KT",
        role: "Member",
      },
      content:
        "A simple way to remember it is: INNER means matching rows, LEFT means keep the left side.",
      timestamp: "9:03 AM",
    },
  ],

  "message-8": [
    {
      id: "message-8-reply-1",
      channelId: "dsa",
      author: {
        id: "vijay",
        name: "Vijay M.",
        initials: "VM",
        role: "Member",
      },
      content:
        "Sliding window finally clicked for me after practicing fixed-size windows.",
      timestamp: "7:49 AM",
    },
    {
      id: "message-8-reply-2",
      channelId: "dsa",
      author: {
        id: "rahul",
        name: "Rahul P.",
        initials: "RP",
        role: "Member",
      },
      content:
        "The variable-size problems are where the technique gets really interesting.",
      timestamp: "7:53 AM",
    },
  ],
};

export class LocalThreadService
  implements IThreadService
{
  private readonly replies: Record<
    string,
    Message[]
  >;

  constructor() {
    this.replies = Object.fromEntries(
      Object.entries(
        INITIAL_THREAD_REPLIES,
      ).map(([messageId, messages]) => [
        messageId,
        [...messages],
      ]),
    );
  }

  async getReplies(
    parentMessageId: string,
  ): Promise<Message[]> {
    await this.simulateLatency();

    return [
      ...(this.replies[parentMessageId] ?? []),
    ];
  }

  async getReplyCount(
    parentMessageId: string,
  ): Promise<number> {
    await this.simulateLatency();
  
    return (
      this.replies[parentMessageId]?.length ?? 0
    );
  }

  async sendReply(
    parentMessageId: string,
    content: string,
  ): Promise<Message> {
    await this.simulateLatency();

    const trimmedContent =
      content.trim();

    if (!trimmedContent) {
      throw new Error(
        "Reply content cannot be empty.",
      );
    }

    const existingReplies =
      this.replies[parentMessageId];

    const channelId =
      existingReplies?.[0]?.channelId ??
      "general";

    const reply: Message = {
      id: `${parentMessageId}-reply-${Date.now()}`,
      channelId,
      parentMessageId,
      author: {
        id: "you",
        name: "You",
        initials: "YO",
        role: "You",
      },
      content: trimmedContent,
      timestamp: "Now",
    };

    if (!this.replies[parentMessageId]) {
      this.replies[parentMessageId] = [];
    }

    this.replies[parentMessageId].push(reply);

    return reply;
  }

  private async simulateLatency(): Promise<void> {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 150);
    });
  }
}
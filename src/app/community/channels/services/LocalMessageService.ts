import type { IMessageService } from "./IMessageService";
import type { Message } from "../types/message";

const INITIAL_MESSAGES: Message[] = [
  {
    id: "message-1",
    channelId: "general",
    author: {
      id: "meera",
      name: "Meera S.",
      initials: "MS",
      role: "Member",
    },
    content:
      "Anyone else preparing for TCS NQT this month?",
    timestamp: "10:35 AM",
    tags: [
      {
        label: "Pairing",
        icon: "pairing",
      },
    ],
    replyCount: 6,
  },

  {
    id: "message-4",
    channelId: "general",
    author: {
      id: "rahul",
      name: "Rahul P.",
      initials: "RP",
      role: "Member",
    },
    content:
      "This helped me understand the difference between a list and a tuple:",
    timestamp: "11:02 AM",
    code: {
      language: "python",
      code: `numbers = [1, 2, 3]

numbers.append(4)

print(numbers)`,
      output: "[1, 2, 3, 4]",
      exitCode: 0,
    },
    replyCount: 3,
  },

  {
    id: "message-5",
    channelId: "python",
    author: {
      id: "ananya",
      name: "Ananya R.",
      initials: "AR",
      role: "Member",
    },
    content:
      "What's the best way to practice Python functions without getting overwhelmed?",
    timestamp: "9:18 AM",
    tags: [
      {
        label: "Python",
        icon: "python",
      },
    ],
    replyCount: 5,
  },

  {
    id: "message-6",
    channelId: "python",
    author: {
      id: "you",
      name: "You",
      initials: "YO",
      role: "You",
    },
    content:
      "Start small: write one function, test it with a few inputs, then improve it.",
    timestamp: "9:27 AM",
    replyCount: 1,
  },

  {
    id: "message-7",
    channelId: "sql",
    author: {
      id: "vijay",
      name: "Vijay M.",
      initials: "VM",
      role: "Member",
    },
    content:
      "Does anyone have a good explanation of INNER JOIN vs LEFT JOIN?",
    timestamp: "8:51 AM",
    tags: [
      {
        label: "SQL",
        icon: "database",
      },
    ],
    replyCount: 7,
  },

  {
    id: "message-8",
    channelId: "dsa",
    author: {
      id: "kiran",
      name: "Kiran T.",
      initials: "KT",
      role: "Member",
    },
    content:
      "Finally understood sliding window today. It makes so much more sense after solving a few examples.",
    timestamp: "7:44 AM",
    tags: [
      {
        label: "DSA",
        icon: "brain",
      },
    ],
    replyCount: 2,
  },
];

export class LocalMessageService
  implements IMessageService
{
  private readonly messages: Message[];

  constructor() {
    this.messages = [...INITIAL_MESSAGES];
  }

  async getMessages(
    channelId: string,
  ): Promise<Message[]> {
    return this.messages.filter(
      (message) =>
        message.channelId === channelId,
    );
  }

  async getMessage(
    messageId: string,
  ): Promise<Message | null> {
    return (
      this.messages.find(
        (message) =>
          message.id === messageId,
      ) ?? null
    );
  }

  async sendMessage(
    channelId: string,
    content: string,
  ): Promise<Message> {
    const message: Message = {
      id: `message-${Date.now()}`,
      channelId,
      author: {
        id: "you",
        name: "You",
        initials: "YO",
        role: "You",
      },
      content,
      timestamp: "Now",
    };

    this.messages.push(message);

    return message;
  }
}
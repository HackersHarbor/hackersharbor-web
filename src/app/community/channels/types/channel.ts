export type ChannelIcon =
  | "code"
  | "database"
  | "git-fork"
  | "hash";

export interface Channel {
  id: string;
  name: string;
  description: string;
  icon: ChannelIcon;
  online: boolean;
  unreadCount: number;
}
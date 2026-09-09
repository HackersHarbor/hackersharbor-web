export type ChannelCategory =
  | "community"
  | "development"
  | "data-ai"
  | "computing"
  | "career";

export type ChannelIcon =
  | "hash"
  | "code"
  | "database"
  | "git-fork"
  | "brain"
  | "users"
  | "briefcase"
  | "terminal"
  | "network"
  | "server"
  | "cpu";

export interface Channel {
  id: string;
  name: string;
  description: string;
  icon: ChannelIcon;
  category: ChannelCategory;
  online: boolean;
  unreadCount: number;
}

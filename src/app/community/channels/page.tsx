"use client";

import { useMemo, useState } from "react";

import { CHANNELS } from "./constants/channels";

import { ChannelsShell } from "./components/ChannelsShell";
import { ChannelSidebar } from "./components/ChannelSidebar";
import { MainChannel } from "./components/MainChannel";
import { ThreadPanel } from "./components/ThreadPanel";
import { TopNavigation } from "./components/TopNavigation";

import { LocalMessageService } from "./services/LocalMessageService";
import { LocalThreadService } from "./services/LocalThreadService";

import { useMessages } from "./hooks/useMessages";
import { useThreadMessages } from "./hooks/useThreadMessages";

import type { Message } from "./types/message";

/* =========================================================
   SERVICES
   ========================================================= */

const messageService = new LocalMessageService();
const threadService = new LocalThreadService();

/* =========================================================
   PAGE
   ========================================================= */

export default function ChannelsPage() {
  /* =======================================================
     CHANNEL STATE
     ======================================================= */

  const [activeChannelId, setActiveChannelId] = useState(
    CHANNELS[0]?.id ?? "",
  );

  const [searchQuery, setSearchQuery] = useState("");

  /* =======================================================
     THREAD STATE
     ======================================================= */

  const [threadMessage, setThreadMessage] =
    useState<Message | null>(null);

  /* =======================================================
     ACTIVE CHANNEL
     ======================================================= */

  const activeChannel = useMemo(() => {
    return (
      CHANNELS.find(
        (channel) =>
          channel.id === activeChannelId,
      ) ?? CHANNELS[0]
    );
  }, [activeChannelId]);

  /* =======================================================
     CHANNEL MESSAGES
     ======================================================= */

  const {
    messages,
    loading,
    error,
    sendMessage,
  } = useMessages(
    activeChannel?.id ?? "",
    messageService,
  );

  /* =======================================================
     THREAD MESSAGES
     ======================================================= */

  const {
    messages: threadMessages,
    loading: threadLoading,
    error: threadError,
    sendReply,
  } = useThreadMessages(
    threadMessage?.id ?? null,
    threadService,
  );

  /* =======================================================
     OPEN THREAD
     ======================================================= */

  const handleOpenThread = (
    message: Message,
  ) => {
    setThreadMessage(message);
  };

  /* =======================================================
     CLOSE THREAD
     ======================================================= */

  const handleCloseThread = () => {
    setThreadMessage(null);
  };

  /* =======================================================
     SEND THREAD REPLY
     ======================================================= */

  const handleSendReply = async (
    content: string,
  ) => {
    await sendReply(content);
  };

  /* =======================================================
     NO CHANNELS
     ======================================================= */

  if (!activeChannel) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080a0e] text-white">
        <p className="text-sm text-white/40">
          No channels available.
        </p>
      </main>
    );
  }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <ChannelsShell
      /* ===================================================
         TOP NAVIGATION
         =================================================== */

      topNavigation={
        <TopNavigation
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      }

      /* ===================================================
         SIDEBAR
         =================================================== */

      sidebar={
        <ChannelSidebar
          channels={CHANNELS}
          activeChannelId={activeChannel.id}
          onChannelSelect={(channelId) => {
            setActiveChannelId(channelId);
            setThreadMessage(null);
          }}
        />
      }

      /* ===================================================
         MAIN CHANNEL
         =================================================== */

      main={
        <MainChannel
          channel={activeChannel}
          messages={messages}
          loading={loading}
          error={error}
          onSendMessage={sendMessage}
          onReply={handleOpenThread}
        />
      }

      /* ===================================================
         THREAD
         =================================================== */

      thread={
        threadMessage ? (
          <ThreadPanel
            parentMessage={threadMessage}
            title={`Reply to ${threadMessage.author.name}`}
            messages={threadMessages}
            loading={threadLoading}
            error={threadError}
            onClose={handleCloseThread}
            onSendReply={handleSendReply}
            onMore={() => {
              /*
               * Reserved for future thread actions.
               */
            }}
          />
        ) : undefined
      }
    />
  );
}
'use client'

import { useMemo } from 'react'

import { COLORS } from '../constants'
import { CHANNELS } from '../data/channelData'

import type { Channel } from '../types'

import { ChannelSearch } from './ChannelSearch'
import { ChannelItem } from './ChannelItem'
import { CurrentUserPanel } from './CurrentUserPanel'

type ChannelSidebarProps = {
  activeChannelId: string
  searchQuery: string
  onSearchChange: (value: string) => void
  onChannelSelect: (channelId: string) => void
  activeDirectMessageUserId?: string | null
  onDirectMessageSelect?: (userId: string) => void
  username?: string
  initials?: string
  avatarUrl?: string | null
  online?: boolean
}

const COMMUNITY_CHANNEL_IDS = [
  'general',
  'python',
  'sql',
  'dsa',
  'jobs',
  'data-science',
  'webdev',
  'random',
] as const

const TRENDING_CHANNEL_IDS = [
  'ai-ml',
  'typescript',
  'react',
  'devops',
  'cybersecurity',
  'cloud',
  'opensource',
  'projects',
] as const

const DIRECT_MESSAGE_USERS = [
  { id: 'arjun', username: 'Arjun K.', initials: 'AK', online: true, unread: 0, avatarColor: '#EEF4FF', nameColor: '#3F7CFF' },
  { id: 'meera', username: 'Meera S.', initials: 'MS', online: true, unread: 3, avatarColor: '#EEF9F1', nameColor: '#2F8F46' },
  { id: 'rahul', username: 'Rahul P.', initials: 'RP', online: true, unread: 0, avatarColor: '#F5F0FF', nameColor: '#7657B8' },
  { id: 'karan', username: 'Karan M.', initials: 'KM', online: false, unread: 0, avatarColor: '#FFF8E8', nameColor: '#A56A00' },
  { id: 'neha', username: 'Neha R.', initials: 'NR', online: true, unread: 0, avatarColor: '#ECFBFD', nameColor: '#16899A' },
] as const

function SectionLabel({
  children,
  count,
}: {
  children: React.ReactNode
  count: number
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '4px 8px 8px',
        color: COLORS.textDim,
        fontSize: '9px',
        lineHeight: '12px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.11em',
        boxSizing: 'border-box',
      }}
    >
      <span>{children}</span>

      <span
        style={{
          minWidth: '18px',
          height: '18px',
          padding: '0 5px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '5px',
          background: COLORS.surfaceSoft,
          border: `1px solid ${COLORS.border}`,
          color: COLORS.textDim,
          fontSize: '8px',
          lineHeight: '10px',
          fontWeight: 700,
          letterSpacing: 0,
          boxSizing: 'border-box',
        }}
      >
        {count}
      </span>
    </div>
  )
}

function TrendingChannelItem({
  channel,
  active,
  onSelect,
}: {
  channel: Channel
  active: boolean
  onSelect: (channelId: string) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(channel.id)}
      aria-current={active ? 'page' : undefined}
      style={{
        width: '100%',
        minHeight: '52px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px',
        padding: '7px 10px',
        margin: '2px 0',
        border: active
          ? `1px solid ${COLORS.border}`
          : '1px solid transparent',
        borderRadius: '7px',
        background: active
          ? COLORS.surfaceActive
          : 'transparent',
        color: COLORS.text,
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
      }}
    >
      <span
        style={{
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '9px',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: '22px',
            height: '22px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            borderRadius: '6px',
            background: active
              ? COLORS.white
              : COLORS.surfaceSoft,
            border: `1px solid ${COLORS.border}`,
            color: active
              ? COLORS.blueDark
              : COLORS.textDim,
            fontSize: '11px',
            fontWeight: 700,
            lineHeight: 1,
            boxSizing: 'border-box',
          }}
        >
          #
        </span>

        <span
          style={{
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              minWidth: 0,
            }}
          >
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: active
                  ? COLORS.text
                  : COLORS.textMuted,
                fontSize: '11px',
                lineHeight: '15px',
                fontWeight: active ? 600 : 500,
              }}
            >
              {channel.name.replace(/^#/, '')}
            </span>

            <span
              aria-hidden="true"
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: COLORS.green,
                flexShrink: 0,
              }}
            />
          </span>

          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: COLORS.textDim,
              fontSize: '9px',
              lineHeight: '12px',
              fontWeight: 400,
            }}
          >
            {channel.description}
          </span>
        </span>
      </span>

      <span
        style={{
          minWidth: '24px',
          height: '20px',
          padding: '0 5px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          borderRadius: '6px',
          background: active
            ? COLORS.white
            : COLORS.surfaceSoft,
          border: `1px solid ${COLORS.border}`,
          color: COLORS.textMuted,
          fontSize: '9px',
          lineHeight: '12px',
          fontWeight: 600,
          boxSizing: 'border-box',
        }}
      >
        {channel.online}
      </span>
    </button>
  )
}

export function ChannelSidebar({
  activeChannelId,
  searchQuery,
  onSearchChange,
  onChannelSelect,
  activeDirectMessageUserId = null,
  onDirectMessageSelect,
  username,
  initials,
  avatarUrl,
  online,
}: ChannelSidebarProps) {
  const filteredChannels = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    if (!query) {
      return CHANNELS
    }

    return CHANNELS.filter(
      (channel: Channel) =>
        channel.name.toLowerCase().includes(query) ||
        channel.description.toLowerCase().includes(query),
    )
  }, [searchQuery])

  const communityChannels = useMemo(
    () =>
      COMMUNITY_CHANNEL_IDS
        .map(id =>
          filteredChannels.find(
            channel => channel.id === id,
          ),
        )
        .filter(
          (channel): channel is Channel =>
            Boolean(channel),
        ),
    [filteredChannels],
  )

  const trendingChannels = useMemo(
    () =>
      TRENDING_CHANNEL_IDS
        .map(id =>
          filteredChannels.find(
            channel => channel.id === id,
          ),
        )
        .filter(
          (channel): channel is Channel =>
            Boolean(channel),
        ),
    [filteredChannels],
  )

  const hasResults =
    communityChannels.length > 0 ||
    trendingChannels.length > 0

  return (
    <aside
      aria-label="Community channels"
      style={{
        width: '250px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: COLORS.surface,
        borderRight: `1px solid ${COLORS.border}`,
        flexShrink: 0,
        boxSizing: 'border-box',
      }}
    >
      {/* Sidebar heading */}
      <div
        style={{
          height: '66px',
          minHeight: '66px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 14px',
          borderBottom: `1px solid ${COLORS.border}`,
          background: COLORS.surface,
          boxSizing: 'border-box',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            color: COLORS.text,
            fontSize: '13px',
            lineHeight: '17px',
            fontWeight: 700,
            letterSpacing: '-0.01em',
          }}
        >
          Discussions
        </div>

        <div
          style={{
            marginTop: '3px',
            color: COLORS.textDim,
            fontSize: '9px',
            lineHeight: '13px',
            fontWeight: 500,
          }}
        >
          Find your community
        </div>
      </div>

      <ChannelSearch
        value={searchQuery}
        onChange={onSearchChange}
      />

      {/* Channel list */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '11px 8px 14px',
          boxSizing: 'border-box',
        }}
      >
        {hasResults ? (
          <>
            {/* COMMUNITY */}
            {communityChannels.length > 0 && (
              <section>
                <SectionLabel
                  count={communityChannels.length}
                >
                  Community
                </SectionLabel>

                {communityChannels.map(channel => (
                  <ChannelItem
                    key={channel.id}
                    channel={channel}
                    active={
                      channel.id === activeChannelId
                    }
                    onSelect={onChannelSelect}
                  />
                ))}
              </section>
            )}

            {/* Divider */}
            {communityChannels.length > 0 &&
              trendingChannels.length > 0 && (
                <div
                  aria-hidden="true"
                  style={{
                    height: '1px',
                    margin: '12px 8px 11px',
                    background: COLORS.border,
                  }}
                />
              )}

            {/* TRENDING */}
            {trendingChannels.length > 0 && (
              <section>
                <SectionLabel
                  count={trendingChannels.length}
                >
                  Trending — Active
                </SectionLabel>

                {trendingChannels.map(channel => (
                  <TrendingChannelItem
                    key={channel.id}
                    channel={channel}
                    active={
                      channel.id === activeChannelId
                    }
                    onSelect={onChannelSelect}
                  />
                ))}
              </section>
            )}

            <div
              aria-hidden="true"
              style={{
                height: '1px',
                margin: '12px 8px 11px',
                background: COLORS.border,
              }}
            />

            <section>
              <SectionLabel
                count={DIRECT_MESSAGE_USERS.length}
              >
                Direct Messages
              </SectionLabel>

              {DIRECT_MESSAGE_USERS.map(user => {
                const active =
                  user.id === activeDirectMessageUserId

                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() =>
                      onDirectMessageSelect?.(user.id)
                    }
                    aria-current={active ? 'page' : undefined}
                    style={{
                      width: '100%',
                      minHeight: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '9px',
                      padding: '6px 10px',
                      margin: '2px 0',
                      border: active
                        ? `1px solid ${COLORS.border}`
                        : '1px solid transparent',
                      borderRadius: '7px',
                      background: active
                        ? COLORS.surfaceActive
                        : 'transparent',
                      color: COLORS.text,
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                  >
                    <span
                      style={{
                        position: 'relative',
                        width: '27px',
                        height: '27px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        borderRadius: '7px',
                        background: user.avatarColor,
                        color: user.nameColor,
                        fontSize: '8px',
                        fontWeight: 700,
                        boxSizing: 'border-box',
                      }}
                    >
                      {user.initials}
                      <span
                        aria-hidden="true"
                        style={{
                          position: 'absolute',
                          right: '-2px',
                          bottom: '-2px',
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          background: user.online ? COLORS.green : COLORS.textDim,
                          border: `2px solid ${COLORS.surface}`,
                          boxSizing: 'border-box',
                        }}
                      />
                    </span>

                    <span
                      style={{
                        minWidth: 0,
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: active ? COLORS.text : COLORS.textMuted,
                        fontSize: '11px',
                        lineHeight: '15px',
                        fontWeight: active ? 600 : 500,
                      }}
                    >
                      {user.username}
                    </span>

                    {user.unread > 0 && (
                      <span
                        style={{
                          minWidth: '18px',
                          height: '18px',
                          padding: '0 5px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          borderRadius: '5px',
                          background: COLORS.blueSoft,
                          border: `1px solid ${COLORS.border}`,
                          color: COLORS.blueDark,
                          fontSize: '8px',
                          lineHeight: '10px',
                          fontWeight: 700,
                          boxSizing: 'border-box',
                        }}
                      >
                        {user.unread}
                      </span>
                    )}
                  </button>
                )
              })}
            </section>
          </>
        ) : (
          <div
            style={{
              margin: '8px 4px',
              padding: '20px 10px',
              border: `1px solid ${COLORS.border}`,
              borderRadius: '7px',
              background: COLORS.surfaceSoft,
              textAlign: 'center',
              color: COLORS.textMuted,
              fontSize: '10px',
              lineHeight: '15px',
            }}
          >
            No channels found.
          </div>
        )}
      </div>

      <CurrentUserPanel
        username={username}
        initials={initials}
        avatarUrl={avatarUrl}
        online={online}
      />
    </aside>
  )
}
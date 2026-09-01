'use client'

import {
  COLORS,
} from '../constants'

type MessageAvatarProps = {
  username: string
  initials: string
  avatarUrl?: string | null
  avatarColor?: string
  online?: boolean
}

export function MessageAvatar({
  username,
  initials,
  avatarUrl,
  avatarColor = COLORS.blueSoft,
  online = false,
}: MessageAvatarProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: '34px',
        height: '34px',
        flexShrink: 0,
      }}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={`${username}'s avatar`}
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : (
        <div
          aria-hidden="true"
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background:
              avatarColor,
            border:
              `1px solid ${COLORS.border}`,
            color: COLORS.text,
            fontSize: '9px',
            fontWeight: 700,
            boxSizing: 'border-box',
          }}
        >
          {initials}
        </div>
      )}

      {online && (
        <span
          aria-label="Online"
          style={{
            position: 'absolute',
            right: '-1px',
            bottom: '-1px',
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background:
              COLORS.green,
            border:
              `2px solid ${COLORS.surface}`,
          }}
        />
      )}
    </div>
  )
}
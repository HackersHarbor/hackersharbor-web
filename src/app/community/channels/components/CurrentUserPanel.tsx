'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type CurrentUserPanelProps = {
  username?: string
  initials?: string
  avatarUrl?: string | null
  online?: boolean
}

type Profile = {
  display_name: string | null
  avatar_url: string | null
}

export function CurrentUserPanel({
  username: fallbackUsername = 'You',
  initials: fallbackInitials = 'YO',
  avatarUrl: fallbackAvatarUrl = null,
}: CurrentUserPanelProps) {
  const router = useRouter()

  const [username, setUsername] = useState(fallbackUsername)
  const [initials, setInitials] = useState(fallbackInitials)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    fallbackAvatarUrl,
  )
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    let mounted = true

    const loadUser = async () => {
      const { data: authData, error: authError } =
        await supabase.auth.getUser()

      if (authError || !authData.user) {
        if (!mounted) return

        setUsername('You')
        setInitials('YO')
        setAvatarUrl(null)

        return
      }

      const user = authData.user

      let displayName =
        user.user_metadata?.display_name ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        'You'

      let profileAvatar =
        user.user_metadata?.avatar_url ||
        user.user_metadata?.picture ||
        null

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', user.id)
        .maybeSingle()

      if (profile) {
        const typedProfile = profile as Profile

        if (typedProfile.display_name?.trim()) {
          displayName = typedProfile.display_name.trim()
        }

        if (typedProfile.avatar_url) {
          profileAvatar = typedProfile.avatar_url
        }
      }

      const parts = displayName
        .trim()
        .split(/\s+/)
        .filter(Boolean)

      let calculatedInitials = displayName.slice(0, 2)

      if (parts.length >= 2) {
        calculatedInitials =
          parts[0][0] + parts[parts.length - 1][0]
      }

      if (!mounted) return

      setUsername(displayName)
      setInitials(calculatedInitials.toUpperCase())
      setAvatarUrl(profileAvatar)
    }

    void loadUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadUser()
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    if (loggingOut) return

    setLoggingOut(true)

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Sign out failed:', error)
      setLoggingOut(false)
      return
    }

    window.location.href = '/login'
  }

  return (
    <div
      style={{
        padding: '8px 14px 14px',
        background: '#FFFFFF',
        boxSizing: 'border-box',
        flexShrink: 0,
      }}
    >
      {/* Dashboard-style account card */}
      <div
        style={{
          width: '100%',
          border: '1px solid #DDE4EF',
          borderRadius: '8px',
          background: '#F8FAFD',
          padding: '12px',
          boxSizing: 'border-box',
        }}
      >
        {/* User row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            minWidth: 0,
          }}
        >
          {/* Avatar */}
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                objectFit: 'cover',
                display: 'block',
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              aria-hidden="true"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background:
                  'linear-gradient(135deg, #4F46E5, #6366F1)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                lineHeight: '14px',
                fontWeight: 700,
                flexShrink: 0,
                boxSizing: 'border-box',
              }}
            >
              {initials}
            </div>
          )}

          {/* Name */}
          <div
            style={{
              minWidth: 0,
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: '#172033',
              fontSize: '11px',
              lineHeight: '15px',
              fontWeight: 600,
            }}
          >
            {username}
          </div>
        </div>

        {/* Sign out */}
        <button
          type="button"
          onClick={handleSignOut}
          disabled={loggingOut}
          style={{
            width: '100%',
            height: '34px',
            marginTop: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '7px',
            border: '1px solid #D7E0EC',
            borderRadius: '7px',
            background: '#FFFFFF',
            color: '#5D6B80',
            fontSize: '10px',
            lineHeight: '14px',
            fontWeight: 500,
            cursor: loggingOut ? 'wait' : 'pointer',
            opacity: loggingOut ? 0.6 : 1,
            boxSizing: 'border-box',
          }}
          onMouseEnter={event => {
            if (loggingOut) return

            event.currentTarget.style.background = '#F5F7FB'
          }}
          onMouseLeave={event => {
            event.currentTarget.style.background = '#FFFFFF'
          }}
        >
          {/* Logout icon */}
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 5H5.5A1.5 1.5 0 0 0 4 6.5v11A1.5 1.5 0 0 0 5.5 19H9" />
            <path d="M14 8l4 4-4 4" />
            <path d="M18 12H9" />
          </svg>

          {loggingOut ? 'Signing out...' : 'Sign out'}
        </button>
      </div>
    </div>
  )
}
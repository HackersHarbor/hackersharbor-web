'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'

type IconName =
  | 'dashboard'
  | 'voyage'
  | 'practice'
  | 'dock'
  | 'navigator'
  | 'community'
  | 'certificate'
  | 'progress'
  | 'search'
  | 'bell'
  | 'calendar'
  | 'arrow'
  | 'check'
  | 'target'
  | 'book'
  | 'users'
  | 'code'
  | 'crown'
  | 'map'
  | 'chart'
  | 'globe'
  | 'python'
  | 'java'
  | 'javascript'
  | 'cpp'
  | 'csharp'
  | 'typescript'
  | 'go'
  | 'rust'

function Icon({
  name,
  size = 20,
  strokeWidth = 1.8,
}: {
  name: IconName
  size?: number
  strokeWidth?: number
}) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  switch (name) {
    case 'dashboard':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      )

    case 'voyage':
      return (
        <svg {...common}>
          <path d="M12 3v18" />
          <path d="M5 8l7-5 7 5" />
          <path d="M5 8l3 4 4-2 4 2 3-4" />
          <path d="M7 17l5 4 5-4" />
        </svg>
      )

    case 'practice':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M7 8l3 3-3 3" />
          <path d="M12 15h5" />
        </svg>
      )

    case 'dock':
      return (
        <svg {...common}>
          <path d="M4 19h16" />
          <path d="M6 19V7h12v12" />
          <path d="M9 7V4h6v3" />
          <path d="M9 11h6" />
          <path d="M9 15h4" />
        </svg>
      )

    case 'navigator':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M15.5 8.5l-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2z" />
        </svg>
      )

    case 'community':
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M3.5 19c.7-3 2.5-4.5 5.5-4.5s4.8 1.5 5.5 4.5" />
          <path d="M14.5 15.5c2.8-.2 4.8.9 5.5 3.5" />
        </svg>
      )

    case 'certificate':
      return (
        <svg {...common}>
          <path d="M12 3l2.5 2 3.2-.1.9 3 2.1 2-1.1 2.9.6 3.1-2.8 1.5-1.3 2.8-3.1-.6-3.1.6-1.3-2.8-2.8-1.5.6-3.1L3.3 10l2.1-2 .9-3 3.2.1L12 3z" />
          <path d="M9.5 11.5l1.7 1.7 3.5-3.5" />
        </svg>
      )

    case 'progress':
      return (
        <svg {...common}>
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <path d="M7 15l4-4 3 2 5-6" />
        </svg>
      )

    case 'search':
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="6.5" />
          <path d="M16 16l4.5 4.5" />
        </svg>
      )

    case 'bell':
      return (
        <svg {...common}>
          <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
      )

    case 'calendar':
      return (
        <svg {...common}>
          <rect x="3" y="4.5" width="18" height="16" rx="2" />
          <path d="M7 3v3M17 3v3M3 9h18" />
          <path d="M8 13h3M13 13h3M8 17h3" />
        </svg>
      )

    case 'arrow':
      return (
        <svg {...common}>
          <path d="M5 12h13" />
          <path d="M13 6l6 6-6 6" />
        </svg>
      )

    case 'check':
      return (
        <svg {...common}>
          <path d="M5 12l4 4L19 6" />
        </svg>
      )

    case 'target':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <circle cx="12" cy="12" r="4.5" />
          <circle cx="12" cy="12" r="1.5" />
        </svg>
      )

    case 'book':
      return (
        <svg {...common}>
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5z" />
          <path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20" />
        </svg>
      )

    case 'users':
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M3.5 19c.7-3 2.5-4.5 5.5-4.5s4.8 1.5 5.5 4.5" />
          <path d="M14.5 15.5c2.8-.2 4.8.9 5.5 3.5" />
        </svg>
      )

    case 'code':
      return (
        <svg {...common}>
          <path d="M8 7l-5 5 5 5" />
          <path d="M16 7l5 5-5 5" />
          <path d="M14 4l-4 16" />
        </svg>
      )

    case 'crown':
      return (
        <svg {...common}>
          <path d="M4 7l4 4 4-7 4 7 4-4-2 11H6L4 7z" />
          <path d="M6 21h12" />
        </svg>
      )

    case 'map':
      return (
        <svg {...common}>
          <path d="M4 5l5-2 6 2 5-2v16l-5 2-6-2-5 2V5z" />
          <path d="M9 3v16M15 5v16" />
        </svg>
      )

    case 'chart':
      return (
        <svg {...common}>
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <path d="M7 15l3-3 3 2 5-6" />
        </svg>
      )

    case 'globe':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3c3 3 4.2 6 4.2 9S15 18 12 21" />
          <path d="M12 3c-3 3-4.2 6-4.2 9S9 18 12 21" />
        </svg>
      )

    default:
      return null
  }
}

const languages = [
  {
    name: 'JavaScript',
    short: 'JS',
    description: 'Web & applications',
    color: '#F0DB4F',
    image:
      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
  },
  {
    name: 'TypeScript',
    short: 'TS',
    description: 'Typed JavaScript',
    color: '#3178C6',
    image:
      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
  },
  {
    name: 'Python',
    short: 'PY',
    description: 'Data & AI',
    color: '#3776AB',
    image:
      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
  },
  {
    name: 'Java',
    short: 'JAVA',
    description: 'Enterprise & backend',
    color: '#ED8B00',
    image:
      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
  },
  {
    name: 'C++',
    short: 'C++',
    description: 'Systems & performance',
    color: '#00599C',
    image:
      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg',
  },
  {
    name: 'C#',
    short: 'C#',
    description: '.NET development',
    color: '#68217A',
    image:
      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg',
  },
  {
    name: 'R',
    short: 'R',
    description: 'Statistical computing',
    color: '#276DC3',
    image:
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/r/r-original.svg',
  },
  {
    name: 'Go',
    short: 'GO',
    description: 'Cloud & backend',
    color: '#00ADD8',
    image:
      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg',
  },
  {
    name: 'Rust',
    short: 'RS',
    description: 'Safe systems',
    color: '#CE422B',
    image:
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/rust/rust-original.svg',
  },
  
]

const sidebarItems: {
  label: string
  icon: IconName
  active?: boolean
}[] = [
  { label: 'Dashboard', icon: 'dashboard', active: true },
  { label: 'The Voyage', icon: 'voyage' },
  { label: 'Practice', icon: 'practice' },
  { label: 'The Dock', icon: 'dock' },
  { label: 'The Navigator', icon: 'navigator' },
  { label: 'Community', icon: 'community' },
  { label: 'Certificates', icon: 'certificate' },
  { label: 'Progress', icon: 'progress' },
]

const missionDefinitions = [
  {
    key: 'solve_3_problems',
    title: 'Solve 3 Problems',
    subtitle: 'Any difficulty',
    xp: '+150 XP',
    icon: 'code' as IconName,
    accent: '#19D3AE',
  },
  {
    key: 'study_30_minutes',
    title: 'Study for 30 Minutes',
    subtitle: 'Keep learning',
    xp: '+100 XP',
    icon: 'book' as IconName,
    accent: '#3E8BFF',
  },
  {
    key: 'share_in_community',
    title: 'Share in Community',
    subtitle: 'Help others grow',
    xp: '+80 XP',
    icon: 'users' as IconName,
    accent: '#8B5CF6',
  },
]

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = '/login'
      } else {
        setUser(user)
      }

      setLoading(false)
    }

    getUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#F8FAFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Google Sans, Helvetica Neue, sans-serif',
        }}
      >
        <p
          style={{
            color: '#6B7C93',
            fontSize: '14px',
            fontFamily: 'Google Sans, Helvetica Neue, sans-serif',
          }}
        >
          Loading...
        </p>
      </div>
    )
  }

  const firstName =
    user?.user_metadata?.full_name?.split(' ')[0] || 'Captain'

  const missionProgress = user?.user_metadata?.mission_progress || {}

  const missions = missionDefinitions
    .map((mission) => {
      const progressData = missionProgress[mission.key] || {}
      return {
        ...mission,
        progress: Number(progressData.progress || 0),
        current: progressData.current || '',
      }
    })
    .filter((mission) => mission.progress > 0)

  const recentActivity = Array.isArray(user?.user_metadata?.recent_activity)
    ? user.user_metadata.recent_activity
    : []

  const completedStreakDays = Math.max(
    0,
    Math.min(28, Number(user?.user_metadata?.streak_days || 0)),
  )

  const theme = darkMode
    ? {
        page: '#050A14',
        sidebar: '#07101E',
        panel: '#0A1424',
        panelStrong: '#0C182B',
        border: '#17253B',
        borderLight: '#1B2C47',
        heading: '#F5F8FF',
        text: '#C5D0E2',
        muted: '#7F8EA7',
        faint: '#596A84',
        blue: '#3978FF',
        blueSoft: '#102858',
        blueGlow: 'rgba(57, 120, 255, 0.22)',
      }
    : {
        page: '#F8FAFF',
        sidebar: '#FFFFFF',
        panel: '#FFFFFF',
        panelStrong: '#FFFFFF',
        border: '#E8EDF2',
        borderLight: '#DDE4EC',
        heading: '#0F1923',
        text: '#42536A',
        muted: '#6B7C93',
        faint: '#9AA8B8',
        blue: '#1549C2',
        blueSoft: '#F1F5FF',
        blueGlow: 'rgba(21, 73, 194, 0.12)',
      }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: theme.page,
        color: theme.heading,
        fontFamily: 'Google Sans, Helvetica Neue, sans-serif',
        display: 'flex',
      }}
    >
      {/* SIDEBAR */}
      <aside
        style={{
          width: '250px',
          minWidth: '250px',
          minHeight: '100vh',
          background: theme.sidebar,
          borderRight: `1px solid ${theme.border}`,
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          boxSizing: 'border-box',
        }}
      >
        {/* BRAND */}
        <div
          style={{
            height: '88px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 26px',
            borderBottom: `1px solid ${theme.border}`,
            boxSizing: 'border-box',
          }}
        >
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
            }}
          >
            <Image
              src="/logo.png"
              alt="HackersHarbor"
              width={46}
              height={46}
              priority
            />

            <div>
              <div
                style={{
                  fontSize: '17px',
                  lineHeight: 1.1,
                  fontWeight: 700,
                  letterSpacing: '-0.35px',
                  color: theme.heading,
                  fontFamily: 'Google Sans, Helvetica Neue, sans-serif',
                }}
              >
                Hackers
                <span style={{ color: '#3E7BFF' }}>Harbor</span>
              </div>

              <div
                style={{
                  marginTop: '4px',
                  fontSize: '10px',
                  color: theme.muted,
                  letterSpacing: '0.15px',
                  fontFamily: 'Google Sans, Helvetica Neue, sans-serif',
                }}
              >
            
              </div>
            </div>
          </Link>
        </div>

        {/* NAVIGATION */}
        <div
          style={{
            padding: '28px 14px 16px',
            flex: 1,
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              padding: '0 16px',
              marginBottom: '12px',
              fontSize: '10px',
              fontWeight: 600,
              color: theme.faint,
              letterSpacing: '0.9px',
              textTransform: 'uppercase',
              fontFamily: 'Google Sans, Helvetica Neue, sans-serif',
            }}
          >
            Navigate
          </div>

          {sidebarItems.map((item) => (
            <Link
              key={item.label}
              href={
                item.label === 'Dashboard'
                  ? '/dashboard'
                  : item.label === 'The Voyage'
                    ? '/voyage'
                    : item.label === 'Practice'
                      ? '/practice'
                      : item.label === 'The Dock'
                        ? '/dock'
                        : item.label === 'The Navigator'
                          ? '/navigator'
                          : item.label === 'Community'
                            ? '/community'
                            : item.label === 'Certificates'
                              ? '/certificates'
                              : '/progress'
              }
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '13px',
                minHeight: '48px',
                padding: '0 15px',
                marginBottom: '4px',
                borderRadius: '9px',
                borderLeft: item.active
                  ? `2px solid ${theme.blue}`
                  : '2px solid transparent',
                background: item.active
                  ? darkMode
                    ? 'linear-gradient(90deg, rgba(43, 91, 190, 0.34), rgba(43, 91, 190, 0.10))'
                    : '#F1F5FF'
                  : 'transparent',
                color: item.active ? theme.heading : theme.text,
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: item.active ? 600 : 500,
                fontFamily: 'Google Sans, Helvetica Neue, sans-serif',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease',
              }}
            >
              <span
                style={{
                  color: item.active ? '#4E8BFF' : theme.muted,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Icon name={item.icon} size={19} />
              </span>

              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* PROFILE */}
        <div
          style={{
            margin: '10px',
            padding: '13px',
            background: darkMode
              ? 'linear-gradient(145deg, #0C192C, #081221)'
              : '#F8FAFF',
            border: `1px solid ${theme.border}`,
            borderRadius: '11px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              marginBottom: '13px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background:
                  'linear-gradient(135deg, #3978FF 0%, #7C3AED 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              {firstName.charAt(0).toUpperCase()}
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: theme.heading,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.user_metadata?.full_name || 'Captain'}
              </div>

              <div
                style={{
                  fontSize: '10px',
                  color: theme.muted,
                  marginTop: '2px',
                }}
              >
                Explorer
              </div>
            </div>

            <span
              style={{
                marginLeft: 'auto',
                padding: '3px 6px',
                borderRadius: '5px',
                background: darkMode ? '#17316C' : '#EAF0FF',
                color: darkMode ? '#8EB4FF' : '#1549C2',
                fontSize: '8px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              Level 12
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '10px',
              color: theme.muted,
              marginBottom: '7px',
            }}
          >
            <span>Harbor XP</span>
            <span>2,840 / 5,000</span>
          </div>

          <div
            style={{
              height: '5px',
              background: darkMode ? '#15243B' : '#E7ECF4',
              borderRadius: '10px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '57%',
                height: '100%',
                background: 'linear-gradient(90deg, #3E8BFF, #5B9BFF)',
                borderRadius: '10px',
              }}
            />
          </div>

          <button
            style={{
              width: '100%',
              marginTop: '13px',
              height: '34px',
              borderRadius: '8px',
              border: `1px solid ${theme.borderLight}`,
              background: darkMode ? '#101D31' : '#FFFFFF',
              color: theme.heading,
              fontFamily: 'Google Sans, Helvetica Neue, sans-serif',
              fontSize: '10px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                color: '#EAB308',
                marginRight: '7px',
              }}
            >
              <Icon name="crown" size={14} />
            </span>
            Upgrade to Pro
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: '100vh',
        }}
      >
        {/* TOP BAR */}
        <header
          style={{
            height: '88px',
            padding: '0 28px 0 34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${theme.border}`,
            background: theme.page,
            boxSizing: 'border-box',
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '25px',
                lineHeight: 1.15,
                fontWeight: 700,
                letterSpacing: '-0.6px',
                color: theme.heading,
                fontFamily: 'Google Sans, Helvetica Neue, sans-serif',
              }}
            >
              Welcome back, {firstName}!
            </h1>

            <p
              style={{
                margin: '5px 0 0',
                fontSize: '13px',
                color: theme.muted,
                fontFamily: 'Google Sans, Helvetica Neue, sans-serif',
              }}
            >
              Your journey of a thousand commits continues.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
            }}
          >
            <button
              aria-label="Search"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                border: `1px solid ${theme.border}`,
                background: theme.panel,
                color: theme.text,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Icon name="search" size={18} />
            </button>

            <button
              aria-label="Notifications"
              style={{
                position: 'relative',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                border: `1px solid ${theme.border}`,
                background: theme.panel,
                color: theme.text,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Icon name="bell" size={18} />

              <span
                style={{
                  position: 'absolute',
                  right: '4px',
                  top: '3px',
                  minWidth: '15px',
                  height: '15px',
                  borderRadius: '50%',
                  background: '#7C4DFF',
                  color: '#FFFFFF',
                  fontSize: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                }}
              >
                3
              </span>
            </button>

            <button
              aria-label="Calendar"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                border: `1px solid ${theme.border}`,
                background: theme.panel,
                color: theme.text,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Icon name="calendar" size={18} />
            </button>

            {/* PLAIN THEME SWITCH */}
            <button
              type="button"
              className={`theme-switch ${darkMode ? "active" : ""}`}
              onClick={() => setDarkMode((value) => !value)}
              aria-label="Toggle color theme"
              aria-pressed={darkMode}
            >
              <span
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: darkMode ? '#2458C9' : '#FFFFFF',
                  border: `1px solid ${
                    darkMode ? '#3978FF' : '#D3DAE5'
                  }`,
                  display: 'block',
                  transition: 'all 0.25s ease',
                  boxShadow: darkMode
                    ? '0 3px 10px rgba(57,120,255,0.3)'
                    : '0 2px 6px rgba(15,25,35,0.12)',
                }}
              />
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <main
          style={{
            padding: '28px 28px 40px 34px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) 272px',
              gap: '22px',
              alignItems: 'start',
            }}
          >
            {/* LEFT */}
            <div style={{ minWidth: 0 }}>
              {/* CURRENT VOYAGE */}
              <section
                style={{
                  position: 'relative',
                  minHeight: '348px',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  border: `1px solid ${theme.borderLight}`,
                  background:
                    'radial-gradient(circle at 72% 25%, rgba(47,107,255,0.30), transparent 30%), linear-gradient(135deg, #071A40 0%, #071B46 38%, #081225 100%)',
                  boxShadow: `0 12px 40px ${theme.blueGlow}`,
                  marginBottom: '16px',
                }}
              >
                {/* Horizon */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: '62px',
                    height: '75px',
                    background:
                      'linear-gradient(to bottom, rgba(53,119,255,0.08), rgba(29,80,170,0.25))',
                  }}
                />

                {/* Voyage content */}
                <div
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    padding: '30px',
                    width: '55%',
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#AFC9FF',
                      marginBottom: '12px',
                      fontWeight: 500,
                    }}
                  >
                    Current Voyage
                  </div>

                  <h2
                    style={{
                      margin: 0,
                      fontSize: '27px',
                      lineHeight: 1.16,
                      fontWeight: 700,
                      letterSpacing: '-0.7px',
                      color: '#FFFFFF',
                    }}
                  >
                    JavaScript: The
                    <br />
                    Infinite Depths
                  </h2>

                  <p
                    style={{
                      margin: '14px 0 18px',
                      maxWidth: '360px',
                      fontSize: '13px',
                      lineHeight: 1.65,
                      color: '#B9C8E3',
                    }}
                  >
                    Master the language of the web and build extraordinary
                    experiences.
                  </p>

                  <Link
                    href="/voyage"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '10px',
                      background:
                        'linear-gradient(135deg, #2366E8 0%, #526EFF 100%)',
                      color: '#FFFFFF',
                      padding: '11px 17px',
                      borderRadius: '7px',
                      fontSize: '13px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      boxShadow: '0 8px 20px rgba(38,101,232,0.30)',
                    }}
                  >
                    Continue Voyage
                    <Icon name="arrow" size={16} />
                  </Link>
                </div>

                {/* VOYAGE MAP */}
                <div
                  style={{
                    position: 'absolute',
                    right: '20px',
                    bottom: '80px',
                    width: '150px',
                    height: '150px',
                    zIndex: 3,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      border: '1px solid rgba(76,143,255,0.65)',
                      borderRadius: '50%',
                    }}
                  />

                  <div
                    style={{
                      position: 'absolute',
                      inset: '14px',
                      border: '1px solid rgba(76,143,255,0.55)',
                      borderRadius: '50%',
                    }}
                  />

                  <div
                    style={{
                      position: 'absolute',
                      inset: '29px',
                      border: '1px solid rgba(76,143,255,0.50)',
                      borderRadius: '50%',
                    }}
                  />

                  <div
                    style={{
                      position: 'absolute',
                      inset: '45px',
                      border: '1px solid rgba(76,143,255,0.45)',
                      borderRadius: '50%',
                    }}
                  />

                  <div
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: 0,
                      width: '1px',
                      height: '100%',
                      background: 'rgba(76,143,255,0.18)',
                    }}
                  />

                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: 0,
                      width: '100%',
                      height: '1px',
                      background: 'rgba(76,143,255,0.18)',
                    }}
                  />

                  {[
                    { top: -3, left: '50%' },
                    { top: '50%', left: -3 },
                    { top: '50%', right: -3 },
                    { bottom: -3, left: '50%' },
                  ].map((point, index) => (
                    <span
                      key={index}
                      style={{
                        position: 'absolute',
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: '#76B2FF',
                        boxShadow: '0 0 10px #4A91FF',
                        ...point,
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                  ))}

                  <div
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'rgba(52,119,255,0.28)',
                      border: '1px solid #66A1FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      boxShadow: '0 0 22px rgba(65,132,255,0.45)',
                    }}
                  >
                    <Icon name="navigator" size={13} />
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      top: '-34px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#FFFFFF',
                      }}
                    >
                      Voyage Map
                    </div>
                    <div
                      style={{
                        fontSize: '10px',
                        color: '#9DB3D6',
                        marginTop: '3px',
                      }}
                    >
                      You are here
                    </div>
                  </div>
                </div>

                {/* PROGRESS FOOTER */}
                <div
                  style={{
                    position: 'absolute',
                    left: '30px',
                    right: '30px',
                    bottom: '18px',
                    zIndex: 4,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '7px',
                      fontSize: '10px',
                      color: '#C6D3E9',
                    }}
                  >
                    <span>Voyage Progress</span>
                    <span style={{ color: '#FFFFFF', fontWeight: 600 }}>
                      68%
                    </span>
                  </div>

                  <div
                    style={{
                      height: '5px',
                      background: 'rgba(255,255,255,0.10)',
                      borderRadius: '10px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: '68%',
                        height: '100%',
                        background:
                          'linear-gradient(90deg, #4390FF, #5E70FF)',
                        borderRadius: '10px',
                      }}
                    />
                  </div>

                  <div
                    style={{
                      marginTop: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '9px',
                      fontSize: '11px',
                      color: '#C6D3E9',
                    }}
                  >
                    <span>Next Milestone:</span>
                    <strong style={{ color: '#FFFFFF', fontWeight: 600 }}>
                      Async Await
                    </strong>

                    <span
                      style={{
                        marginLeft: 'auto',
                        padding: '4px 9px',
                        borderRadius: '12px',
                        background: 'rgba(103,147,230,0.25)',
                        color: '#D8E5FF',
                      }}
                    >
                      3/5
                    </span>
                  </div>
                </div>
              </section>

              {/* STATS */}
              <section
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                  gap: '12px',
                  marginBottom: '16px',
                }}
              >
                {[
                  {
                    label: 'Day Streak',
                    value: '12',
                    suffix: ' days',
                    change: 'Keep it going!',
                    color: '#F59E0B',
                    icon: 'progress' as IconName,
                  },
                  {
                    label: 'Problems Solved',
                    value: '247',
                    suffix: '',
                    change: '+18 this week',
                    color: '#19D3AE',
                    icon: 'check' as IconName,
                  },
                  {
                    label: 'Harbor XP',
                    value: '2,840',
                    suffix: '',
                    change: '+320 this week',
                    color: '#3E8BFF',
                    icon: 'chart' as IconName,
                  },
                  {
                    label: 'Certificates',
                    value: '7',
                    suffix: '',
                    change: 'View all',
                    color: '#8B5CF6',
                    icon: 'certificate' as IconName,
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      minWidth: 0,
                      background: theme.panel,
                      border: `1px solid ${theme.border}`,
                      borderRadius: '12px',
                      padding: '17px',
                      boxSizing: 'border-box',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: `${stat.color}18`,
                        color: stat.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '13px',
                      }}
                    >
                      <Icon name={stat.icon} size={20} />
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '5px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '26px',
                          lineHeight: 1,
                          fontWeight: 700,
                          letterSpacing: '-0.5px',
                          color: theme.heading,
                        }}
                      >
                        {stat.value}
                      </span>

                      {stat.suffix && (
                        <span
                          style={{
                            fontSize: '10px',
                            color: theme.muted,
                          }}
                        >
                          {stat.suffix}
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        marginTop: '5px',
                        fontSize: '10px',
                        color: stat.color,
                      }}
                    >
                      {stat.change}
                    </div>

                    <div
                      style={{
                        position: 'absolute',
                        left: '17px',
                        right: '17px',
                        bottom: 0,
                        height: '26px',
                        opacity: 0.7,
                      }}
                    >
                      <svg
                        viewBox="0 0 200 40"
                        width="100%"
                        height="100%"
                        preserveAspectRatio="none"
                      >
                        <path
                          d={
                            stat.label === 'Day Streak'
                              ? 'M0 37 C30 36 40 30 55 34 S78 23 90 31 S115 14 126 25 S150 7 165 20 S185 9 200 4'
                              : stat.label === 'Problems Solved'
                                ? 'M0 37 C20 38 28 30 43 34 S68 22 84 28 S105 11 123 23 S146 26 159 12 S183 20 200 3'
                                : stat.label === 'Harbor XP'
                                  ? 'M0 38 C20 30 30 36 48 29 S70 25 83 31 S102 19 118 25 S140 14 153 20 S177 8 190 13 S197 5 200 3'
                                  : 'M0 36 C22 39 30 25 47 31 S68 27 83 34 S108 14 121 26 S146 18 158 22 S180 9 200 3'
                          }
                          fill="none"
                          stroke={stat.color}
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  </div>
                ))}
              </section>

              {/* MISSION */}
              <section
                style={{
                  background: theme.panel,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '13px',
                  padding: '20px',
                  marginBottom: '18px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <h2
                        style={{
                          margin: 0,
                          fontSize: '16px',
                          fontWeight: 600,
                          color: theme.heading,
                        }}
                      >
                        Today's Mission
                      </h2>
                    </div>

                    <p
                      style={{
                        margin: '4px 0 0',
                        fontSize: '11px',
                        color: theme.muted,
                      }}
                    >
                      Complete these missions to earn XP and keep your streak
                      alive.
                    </p>
                  </div>

                  <Link
                    href="/practice"
                    style={{
                      color: '#4B8BFF',
                      fontSize: '11px',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    View All Missions
                    <Icon name="arrow" size={14} />
                  </Link>
                </div>

                {missions.length > 0 ? (
                  missions.map((mission) => (
                  <div
                    key={mission.title}
                    style={{
                      minHeight: '70px',
                      display: 'grid',
                      gridTemplateColumns: '42px minmax(160px, 1fr) minmax(170px, 1fr) 70px 38px',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '11px 13px',
                      marginBottom:
                        mission.title === 'Share in Community' ? 0 : '8px',
                      background: darkMode ? '#0B1729' : '#FAFBFD',
                      border: `1px solid ${theme.border}`,
                      borderRadius: '9px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: `${mission.accent}18`,
                        color: mission.accent,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon name={mission.icon} size={18} />
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: theme.heading,
                        }}
                      >
                        {mission.title}
                      </div>

                      <div
                        style={{
                          fontSize: '10px',
                          color: theme.muted,
                          marginTop: '3px',
                        }}
                      >
                        {mission.subtitle}
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          height: '5px',
                          background: darkMode ? '#16263E' : '#E8EDF5',
                          borderRadius: '10px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${mission.progress}%`,
                            height: '100%',
                            background:
                              'linear-gradient(90deg, #3C75FF, #5D9BFF)',
                            borderRadius: '10px',
                          }}
                        />
                      </div>

                      <span
                        style={{
                          minWidth: '55px',
                          textAlign: 'right',
                          fontSize: '10px',
                          color: theme.text,
                        }}
                      >
                        {mission.current}
                      </span>
                    </div>

                    <span
                      style={{
                        textAlign: 'right',
                        fontSize: '11px',
                        color: '#1DD6B0',
                        fontWeight: 600,
                      }}
                    >
                      {mission.xp}
                    </span>

                    <button
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        border: `1px solid ${theme.borderLight}`,
                        background: darkMode ? '#10284C' : '#EEF4FF',
                        color: '#5C99FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <Icon name="arrow" size={16} />
                    </button>
                  </div>
                  ))
                ) : (
                  <div
                    style={{
                      padding: '18px 4px 4px',
                      color: theme.muted,
                      fontSize: '11px',
                      lineHeight: 1.6,
                    }}
                  >
                    Complete a mission to see your progress here.
                  </div>
                )}
              </section>

              {/* LANGUAGE LIBRARY */}
              <section
                style={{
                  background: theme.panel,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '13px',
                  padding: '20px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <span style={{ color: '#4B8BFF' }}>
                        <Icon name="globe" size={20} />
                      </span>

                      <h2
                        style={{
                          margin: 0,
                          fontSize: '16px',
                          fontWeight: 600,
                          color: theme.heading,
                        }}
                      >
                        Language Library
                      </h2>
                    </div>

                    <p
                      style={{
                        margin: '5px 0 0 28px',
                        fontSize: '11px',
                        color: theme.muted,
                      }}
                    >
                      Choose your next technical voyage.
                    </p>
                  </div>

                  <Link
                    href="/voyage"
                    style={{
                      color: '#4B8BFF',
                      fontSize: '11px',
                      textDecoration: 'none',
                    }}
                  >
                    Explore all
                  </Link>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(4, minmax(0, 1fr))',
                    gap: '10px',
                  }}
                >
                  {languages.map((language) => (
                    <Link
                      key={language.name}
                      href={`/voyage/${language.name
                        .toLowerCase()
                        .replace('+', 'plus')
                        .replace('#', 'sharp')
                        .replace(/\s+/g, '-')}`}
                      style={{
                        minHeight: '104px',
                        padding: '13px',
                        borderRadius: '9px',
                        border: `1px solid ${theme.border}`,
                        background: darkMode ? '#0B1728' : '#FBFCFE',
                        textDecoration: 'none',
                        boxSizing: 'border-box',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: `${language.color}16`,
                            border: `1px solid ${language.color}30`,
                          }}
                        >
                          <img
                            src={language.image}
                            alt={language.name}
                            width={22}
                            height={22}
                            style={{
                              display: 'block',
                              objectFit: 'contain',
                            }}
                          />
                        </div>

                        <span
                          style={{
                            fontSize: '9px',
                            color: theme.faint,
                            fontWeight: 600,
                          }}
                        >
                          {language.short}
                        </span>
                      </div>

                      <div>
                        <div
                          style={{
                            fontSize: '12px',
                            color: theme.heading,
                            fontWeight: 600,
                          }}
                        >
                          {language.name}
                        </div>

                        <div
                          style={{
                            marginTop: '3px',
                            fontSize: '9px',
                            color: theme.muted,
                          }}
                        >
                          {language.description}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN */}
            <aside
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {/* STREAK CALENDAR */}
              <section
                style={{
                  background: theme.panel,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '12px',
                  padding: '18px',
                }}
              >
                <h2
                  style={{
                    margin: '0 0 16px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: theme.heading,
                  }}
                >
                  Streak Calendar
                </h2>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '9px 7px',
                  }}
                >
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(
                    (day, index) => (
                      <div
                        key={`${day}-${index}`}
                        style={{
                          textAlign: 'center',
                          fontSize: '9px',
                          color: theme.muted,
                          marginBottom: '1px',
                        }}
                      >
                        {day}
                      </div>
                    ),
                  )}

                  {Array.from({ length: 28 }).map((_, index) => {
                    const active = index < completedStreakDays
                    const current = index === 27

                    return (
                      <div
                        key={index}
                        style={{
                          height: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <span
                          style={{
                            width: current ? '13px' : '10px',
                            height: current ? '13px' : '10px',
                            borderRadius: '50%',
                            background: active
                              ? '#3E8BFF'
                              : 'transparent',
                            border: active
                              ? 'none'
                              : `1px solid ${current ? '#FFFFFF' : theme.borderLight}`,
                            boxShadow: active
                              ? '0 0 8px rgba(62,139,255,0.35)'
                              : 'none',
                            outline: current
                              ? '1px solid #8BA8D7'
                              : 'none',
                            outlineOffset: current ? '3px' : 0,
                          }}
                        />
                      </div>
                    )
                  })}
                </div>
              </section>

              {/* XP THIS WEEK */}
              <section
                style={{
                  background: theme.panel,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '12px',
                  padding: '18px',
                  overflow: 'hidden',
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: '14px',
                    fontWeight: 600,
                    color: theme.heading,
                  }}
                >
                  XP This Week
                </h2>

                <div
                  style={{
                    marginTop: '15px',
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '5px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '25px',
                      fontWeight: 600,
                      color: theme.heading,
                    }}
                  >
                    +320
                  </span>

                  <span
                    style={{
                      fontSize: '10px',
                      color: theme.muted,
                    }}
                  >
                    XP
                  </span>

                  <span
                    style={{
                      marginLeft: 'auto',
                      padding: '5px 7px',
                      borderRadius: '12px',
                      background: darkMode ? '#073C39' : '#E5FAF6',
                      color: '#19D3AE',
                      fontSize: '9px',
                      fontWeight: 600,
                    }}
                  >
                    +24%
                  </span>
                </div>

                <div
                  style={{
                    marginTop: '3px',
                    fontSize: '10px',
                    color: theme.muted,
                  }}
                >
                  vs last week
                </div>

                <div
                  style={{
                    marginTop: '13px',
                    height: '45px',
                  }}
                >
                  <svg
                    viewBox="0 0 250 60"
                    width="100%"
                    height="100%"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient
                        id="xpGradient"
                        x1="0"
                        x2="0"
                        y1="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#3987FF"
                          stopOpacity="0.25"
                        />
                        <stop
                          offset="100%"
                          stopColor="#3987FF"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>

                    <path
                      d="M0 48 C20 44 25 27 45 34 S72 54 93 35 S123 18 141 34 S164 53 180 25 S207 21 222 32 S239 23 250 10 V60 H0 Z"
                      fill="url(#xpGradient)"
                    />

                    <path
                      d="M0 48 C20 44 25 27 45 34 S72 54 93 35 S123 18 141 34 S164 53 180 25 S207 21 222 32 S239 23 250 10"
                      fill="none"
                      stroke="#3987FF"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </section>

              {/* LEADERBOARD */}
              <section
                style={{
                  background: theme.panel,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '12px',
                  padding: '18px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '13px',
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontSize: '14px',
                      fontWeight: 600,
                      color: theme.heading,
                    }}
                  >
                    Leaderboard
                  </h2>

                  <button
                    style={{
                      border: `1px solid ${theme.borderLight}`,
                      borderRadius: '7px',
                      background: 'transparent',
                      color: theme.text,
                      fontFamily: 'Google Sans, Helvetica Neue, sans-serif',
                      fontSize: '9px',
                      padding: '6px 8px',
                      cursor: 'pointer',
                    }}
                  >
                    This Week
                  </button>
                </div>

                {[
                  ['1', 'Riya Sharma', '5,680 XP'],
                  ['2', 'Arjun Dev', '2,840 XP'],
                  ['3', 'Karan Mehta', '2,450 XP'],
                  ['4', 'Neha Singh', '2,120 XP'],
                  ['5', 'You', '2,840 XP'],
                ].map((row, index) => (
                  <div
                    key={row[1]}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '20px 1fr auto',
                      alignItems: 'center',
                      gap: '7px',
                      minHeight: '34px',
                      padding: '0 4px',
                      borderRadius: '7px',
                      background:
                        row[1] === 'Arjun Dev'
                          ? darkMode
                            ? 'linear-gradient(90deg, #102F6D, #0C1C36)'
                            : '#F1F5FF'
                          : 'transparent',
                      border:
                        row[1] === 'Arjun Dev'
                          ? `1px solid ${darkMode ? '#214B9A' : '#D4E1FF'}`
                          : '1px solid transparent',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '10px',
                        color:
                          index === 0
                            ? '#FBBF24'
                            : index === 1
                              ? '#AEB9C9'
                              : index === 2
                                ? '#C77B48'
                                : theme.muted,
                        fontWeight: 600,
                        textAlign: 'center',
                      }}
                    >
                      {row[0]}
                    </span>

                    <span
                      style={{
                        fontSize: '10px',
                        color: theme.text,
                        fontWeight:
                          row[1] === 'Arjun Dev' ? 600 : 500,
                      }}
                    >
                      {row[1]}
                    </span>

                    <span
                      style={{
                        fontSize: '9px',
                        color: theme.text,
                      }}
                    >
                      {row[2]}
                    </span>
                  </div>
                ))}
              </section>

              {/* RECENT ACTIVITY */}
              <section
                style={{
                  background: theme.panel,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '12px',
                  padding: '18px',
                }}
              >
                <h2
                  style={{
                    margin: '0 0 13px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: theme.heading,
                  }}
                >
                  Recent Activity
                </h2>

                {recentActivity.map((activity, index) => (
                  <div
                    key={activity.title}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 0',
                      borderBottom:
                        index !== recentActivity.length - 1
                          ? `1px solid ${theme.border}`
                          : 'none',
                    }}
                  >
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        flexShrink: 0,
                        borderRadius: '9px',
                        background: `${activity.color}17`,
                        color: activity.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon name={activity.icon} size={15} />
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontSize: '10px',
                          color: theme.heading,
                          fontWeight: 500,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {activity.title}
                      </div>

                      <div
                        style={{
                          fontSize: '9px',
                          color: theme.muted,
                          marginTop: '3px',
                        }}
                      >
                        {activity.time}
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '9px',
                        color: theme.text,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {activity.xp}
                    </span>
                  </div>
                ))}
              </section>

              {/* SIGN OUT */}
              <button
                onClick={handleSignOut}
                style={{
                  width: '100%',
                  height: '40px',
                  background: theme.panel,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  color: theme.muted,
                  fontFamily: 'Google Sans, Helvetica Neue, sans-serif',
                  fontSize: '11px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Sign out
              </button>
            </aside>
          </div>
        </main>
      </div>
    </div>
  )
}
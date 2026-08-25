'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type IconName =
  | 'grid'
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
  | 'chart'
  | 'logout'
  | 'settings'
  | 'menu'
  | 'chevron'

function Icon({
  name,
  size = 18,
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
    case 'grid':
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
          <path d="M12 3v18M5 8l7-5 7 5M5 8l3 4 4-2 4 2 3-4M7 17l5 4 5-4" />
        </svg>
      )
    case 'practice':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M7 8l3 3-3 3M12 15h5" />
        </svg>
      )
    case 'dock':
      return (
        <svg {...common}>
          <path d="M4 19h16M6 19V7h12v12M9 7V4h6v3M9 11h6M9 15h4" />
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
          <path d="M3.5 19c.7-3 2.5-4.5 5.5-4.5s4.8 1.5 5.5 4.5M14.5 15.5c2.8-.2 4.8.9 5.5 3.5" />
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
    case 'chart':
      return (
        <svg {...common}>
          <path d="M4 19V5M4 19h16M7 15l4-4 3 2 5-6" />
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
          <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
        </svg>
      )
    case 'calendar':
      return (
        <svg {...common}>
          <rect x="3" y="4.5" width="18" height="16" rx="2" />
          <path d="M7 3v3M17 3v3M3 9h18M8 13h3M13 13h3M8 17h3" />
        </svg>
      )
    case 'arrow':
      return (
        <svg {...common}>
          <path d="M5 12h13M13 6l6 6-6 6" />
        </svg>
      )
    case 'chevron':
      return (
        <svg {...common}>
          <path d="M9 6l6 6-6 6" />
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
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5zM4 18.5A2.5 2.5 0 0 1 6.5 16H20" />
        </svg>
      )
    case 'users':
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M3.5 19c.7-3 2.5-4.5 5.5-4.5s4.8 1.5 5.5 4.5M14.5 15.5c2.8-.2 4.8.9 5.5 3.5" />
        </svg>
      )
    case 'code':
      return (
        <svg {...common}>
          <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" />
        </svg>
      )
    case 'crown':
      return (
        <svg {...common}>
          <path d="M4 7l4 4 4-7 4 7 4-4-2 11H6L4 7zM6 21h12" />
        </svg>
      )
    case 'logout':
      return (
        <svg {...common}>
          <path d="M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-6" />
        </svg>
      )
    case 'settings':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.7 1.7-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V20h-2.4v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1L8 17l.1-.1A1.7 1.7 0 0 0 8.4 15a1.7 1.7 0 0 0-1.5-1H6v-2.4h.9a1.7 1.7 0 0 0 1.5-1A1.7 1.7 0 0 0 8.1 9L8 8.9 9.7 7.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V6h2.4v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 9l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1v2.4h-.1a1.7 1.7 0 0 0-1.5.6z" />
        </svg>
      )
    case 'menu':
      return (
        <svg {...common}>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      )
    default:
      return null
  }
}

const navItems: { label: string; icon: IconName; href: string }[] = [
  { label: 'Dashboard', icon: 'grid', href: '/dashboard' },
  { label: 'The Voyage', icon: 'voyage', href: '/voyage' },
  { label: 'Practice', icon: 'practice', href: '/practice' },
  { label: 'The Dock', icon: 'dock', href: '/dock' },
  { label: 'The Navigator', icon: 'navigator', href: '/navigator' },
  { label: 'Community', icon: 'community', href: '/community' },
  { label: 'Certificates', icon: 'certificate', href: '/certificates' },
  { label: 'Progress', icon: 'progress', href: '/progress' },
]

const languages = [
  ['JavaScript', 'JS', '#F0DB4F', 'Web & applications', 'javascript'],
  ['TypeScript', 'TS', '#3178C6', 'Typed JavaScript', 'typescript'],
  ['Python', 'PY', '#3776AB', 'Data & AI', 'python'],
  ['Java', 'JAVA', '#ED8B00', 'Enterprise & backend', 'java'],
  ['C++', 'C++', '#00599C', 'Systems & performance', 'cpp'],
  ['C#', 'C#', '#68217A', '.NET development', 'csharp'],
  ['Go', 'GO', '#00ADD8', 'Cloud & backend', 'go'],
  ['Rust', 'RS', '#CE422B', 'Safe systems', 'rust'],
]

const missions = [
  {
    title: 'Solve 3 Problems',
    subtitle: 'Any difficulty',
    xp: '+150 XP',
    icon: 'code' as IconName,
    color: '#20D6B3',
    key: 'solve_3_problems',
  },
  {
    title: 'Study for 30 Minutes',
    subtitle: 'Keep learning',
    xp: '+100 XP',
    icon: 'book' as IconName,
    color: '#4D8DFF',
    key: 'study_30_minutes',
  },
  {
    title: 'Share in Community',
    subtitle: 'Help others grow',
    xp: '+80 XP',
    icon: 'users' as IconName,
    color: '#9B72FF',
    key: 'share_in_community',
  },
]

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = '/login'
        return
      }

      setUser(user)
      setLoading(false)
    }

    loadUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const firstName =
    user?.user_metadata?.full_name?.split(' ')[0] || 'Captain'

  const missionProgress = user?.user_metadata?.mission_progress || {}
  const recentActivity = Array.isArray(user?.user_metadata?.recent_activity)
    ? user.user_metadata.recent_activity
    : []

  const userMetadata = user?.user_metadata || {}

  const completedStreakDays = Math.max(
    0,
    Math.min(28, Number(userMetadata.streak_days || 0)),
  )

  const problemsSolved = Math.max(
    0,
    Number(userMetadata.problems_solved || userMetadata.problem_count || 0),
  )

  const harborXp = Math.max(
    0,
    Number(userMetadata.harbor_xp || userMetadata.xp || 0),
  )

  const certificates = Math.max(
    0,
    Number(userMetadata.certificates || userMetadata.certificate_count || 0),
  )

  const userLevel = Math.max(
    0,
    Number(
      userMetadata.level ||
        userMetadata.user_level ||
        userMetadata.current_level ||
        0,
    ),
  )

  const weeklyXp = Math.max(
    0,
    Number(userMetadata.weekly_xp || userMetadata.weeklyXP || 0),
  )

  const weeklyXpChange = Math.max(
    0,
    Number(userMetadata.weekly_xp_change || userMetadata.weeklyXPChange || 0),
  )

  const completedMissions = useMemo(
    () =>
      missions.map((mission) => ({
        ...mission,
        progress: Number(missionProgress[mission.key]?.progress || 0),
        current: missionProgress[mission.key]?.current || '',
      })),
    [missionProgress],
  )

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-mark">
          <Image src="/logo.png" alt="HackersHarbor" width={42} height={42} />
        </div>
        <span>Loading your Harbor...</span>
      </div>
    )
  }

  return (
    <>
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: ${darkMode ? '#071016' : '#F8FAFF'};
          color: ${darkMode ? '#E8F2EE' : '#111827'};
          font-family:
            Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
            "Segoe UI", sans-serif;
        }

        a {
          color: inherit;
        }

        button {
          font: inherit;
        }

        .dashboard-loading {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          background: ${darkMode ? '#071016' : '#ffffff'};
          color: ${darkMode ? '#8FA9A0' : '#667085'};
          font-size: 12px;
        }

        .loading-mark {
          width: 58px;
          height: 58px;
          display: grid;
          place-items: center;
          border: 1px solid ${darkMode ? '#20304a' : '#dfe5ee'};
          background: ${darkMode ? '#0B171D' : '#fff'};
          border-radius: 16px;
        }

        .dashboard-shell {
          min-height: 100vh;
          display: flex;
          background: ${darkMode ? '#071016' : '#F8FAFF'};
        }

        .sidebar {
          position: fixed;
          inset: 0 auto 0 0;
          width: 252px;
          z-index: 50;
          display: flex;
          flex-direction: column;
          background: ${darkMode ? '#0B171D' : '#ffffff'};
          border-right: 1px solid ${darkMode ? '#203A35' : '#e5e9f0'};
        }

        .brand {
          height: 72px;
          padding: 0 24px;
          display: flex;
          align-items: center;
          gap: 11px;
          border-bottom: 1px solid ${darkMode ? '#203A35' : '#e5e9f0'};
          text-decoration: none;
        }

        .brand-name {
          font-size: 15px;
          font-weight: 700;
          letter-spacing: -0.25px;
        }

        .brand-name span {
          color: ${darkMode ? '#0E7564' : '#4d8dff'};
        }

        .brand-sub {
          margin-top: 3px;
          color: ${darkMode ? '#6F8F85' : '#98a2b3'};
          font-size: 9px;
          letter-spacing: 1.3px;
          text-transform: uppercase;
        }

        .nav-wrap {
          flex: 1;
          padding: 22px 12px;
          overflow-y: auto;
        }

        .nav-label {
          padding: 0 12px 9px;
          color: ${darkMode ? '#5E7A72' : '#98a2b3'};
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.4px;
          text-transform: uppercase;
        }

        .nav-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          min-height: 42px;
          margin: 3px 0;
          padding: 0 13px;
          border-radius: 6px;
          color: ${darkMode ? '#8FA9A0' : '#667085'};
          text-decoration: none;
          font-size: 11px;
          font-weight: 550;
          transition: 160ms ease;
        }

        .nav-item:hover {
          background: ${darkMode ? '#102A24' : '#f4f6fa'};
          color: ${darkMode ? '#E8F2EE' : '#101828'};
        }

        .nav-item.active {
          background: ${darkMode ? '#102A24' : '#eef4ff'};
          color: ${darkMode ? '#E8F2EE' : '#174ea6'};
        }

        .nav-item.active::before {
          content: "";
          position: absolute;
          left: 0;
          top: 9px;
          bottom: 9px;
          width: 2px;
          border-radius: 2px;
          background: ${darkMode ? '#0E7564' : '#4d8dff'};
        }

        .sidebar-bottom {
          padding: 14px;
          border-top: 1px solid ${darkMode ? '#203A35' : '#e5e9f0'};
        }

        .profile-mini {
          padding: 13px;
          border: 1px solid ${darkMode ? '#203A35' : '#e4e9f1'};
          background: ${darkMode ? '#0B171D' : '#f8fafc'};
          border-radius: 8px;
        }

        .profile-row {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .avatar {
          width: 34px;
          height: 34px;
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: ${darkMode ? '#0E7564' : 'linear-gradient(135deg, #2563eb, #6d5dfc)'};
          color: white;
          font-size: 11px;
          font-weight: 800;
        }

        .profile-name {
          min-width: 0;
          flex: 1;
        }

        .profile-name strong {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: ${darkMode ? '#eef4ff' : '#101828'};
          font-size: 11px;
        }

        .profile-name span {
          display: block;
          margin-top: 2px;
          color: ${darkMode ? '#6F8F85' : '#98a2b3'};
          font-size: 9px;
        }

        .logout-btn {
          width: 100%;
          height: 34px;
          margin-top: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border: 1px solid ${darkMode ? '#2A4941' : '#dfe5ee'};
          border-radius: 6px;
          background: transparent;
          color: ${darkMode ? '#A9C8BE' : '#667085'};
          cursor: pointer;
          font-size: 10px;
          font-weight: 600;
        }

        .logout-btn:hover {
          color: #ff6b7a;
          border-color: ${darkMode ? '#2A4941' : '#f3c4ca'};
        }

        .main {
          width: calc(100% - 248px);
          margin-left: 248px;
          min-width: 0;
        }

        .topbar {
          position: sticky;
          top: 0;
          z-index: 30;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          background: ${darkMode ? 'rgba(7,10,16,.94)' : 'rgba(255,255,255,.96)'};
          border-bottom: 1px solid ${darkMode ? '#203A35' : '#e5e9f0'};
          backdrop-filter: blur(14px);
        }

        .mobile-menu {
          display: none;
          width: 38px;
          height: 38px;
          place-items: center;
          border: 1px solid ${darkMode ? '#2A4941' : '#dfe5ee'};
          border-radius: 6px;
          background: transparent;
          color: ${darkMode ? '#C9E7DD' : '#344054'};
          cursor: pointer;
        }

        .top-title {
          min-width: 0;
        }

        .eyebrow {
          color: ${darkMode ? '#0E7564' : '#4d8dff'};
          font-size: 9px;
          font-weight: 750;
          letter-spacing: 1.4px;
          text-transform: uppercase;
        }

        .top-title h1 {
          margin: 4px 0 0;
          font-size: 19px;
          line-height: 1.2;
          letter-spacing: -0.45px;
        }

        .top-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .icon-btn {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          position: relative;
          border: 1px solid ${darkMode ? '#20304a' : '#dfe5ee'};
          border-radius: 6px;
          background: ${darkMode ? '#0a1422' : '#ffffff'};
          color: ${darkMode ? '#8FA9A0' : '#667085'};
          cursor: pointer;
        }

        .icon-btn:hover {
          color: ${darkMode ? '#fff' : '#101828'};
          border-color: ${darkMode ? '#3A6A5F' : '#c5cedb'};
        }

        .notif-dot {
          position: absolute;
          right: 7px;
          top: 6px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ff5b6e;
          box-shadow: 0 0 0 2px ${darkMode ? '#0a1422' : '#fff'};
        }

        .theme-switch {
          width: 36px;
          height: 20px;
          padding: 3px;
          display: flex;
          align-items: center;
          border: 1px solid ${darkMode ? '#0E7564' : '#DCE6E0'};
          border-radius: 10px;
          background: ${darkMode ? '#0E7564' : '#E3F3EE'};
          cursor: pointer;
        }

        .theme-knob {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #fff;
          transform: translateX(${darkMode ? '16px' : '0'});
          transition: 180ms ease;
        }

        .content {
          max-width: 1560px;
          margin: 0 auto;
          padding: 28px 32px 48px;
        }

        .hero {
          position: relative;
          overflow: hidden;
          min-height: 238px;
          display: flex;
          align-items: flex-end;
          padding: 28px;
          border: 1px solid ${darkMode ? '#203A35' : '#d8e3f4'};
          border-radius: 10px;
          background:
            radial-gradient(circle at 82% 18%, ${darkMode ? 'rgba(14,117,100,.20)' : 'rgba(55,116,230,.18)'}, transparent 27%),
            linear-gradient(135deg, ${darkMode ? '#0B171D' : '#f0f6ff'}, ${darkMode ? '#071016' : '#ffffff'});
          box-shadow: ${darkMode ? '0 12px 35px rgba(0,0,0,.18)' : '0 12px 30px rgba(30,64,120,.06)'};
        }

        .hero-copy {
          position: relative;
          z-index: 2;
          max-width: 610px;
        }

        .hero-kicker {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 11px;
          color: #6FC8B4;
          font-size: 9px;
          font-weight: 750;
          letter-spacing: 1.4px;
          text-transform: uppercase;
        }

        .live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #29A36A;
          box-shadow: 0 0 12px rgba(34,211,166,.7);
        }

        .hero h2 {
          margin: 0;
          font-size: clamp(24px, 2.7vw, 33px);
          line-height: 1.08;
          letter-spacing: -1.1px;
        }

        .hero p {
          max-width: 570px;
          margin: 11px 0 20px;
          color: ${darkMode ? '#8FA9A0' : '#667085'};
          font-size: 11px;
          line-height: 1.65;
        }

        .hero-actions {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .primary-btn,
        .secondary-btn {
          height: 38px;
          padding: 0 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 6px;
          text-decoration: none;
          font-size: 10px;
          font-weight: 700;
        }

        .primary-btn {
          color: white;
          background: ${darkMode ? '#0E7564' : '#3f7cff'};
          box-shadow: 0 7px 18px rgba(43,105,238,.18);
        }

        .secondary-btn {
          color: ${darkMode ? '#C9E7DD' : '#344054'};
          border: 1px solid ${darkMode ? '#2A4941' : '#d8e0ea'};
          background: ${darkMode ? '#102A24' : '#fff'};
        }

        .section-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 292px;
          gap: 16px;
          margin-top: 16px;
        }

        .left-stack,
        .right-stack {
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-width: 0;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
        }

        .stat {
          padding: 16px;
          min-height: 110px;
          border: 1px solid ${darkMode ? '#1a2533' : '#e2e7ef'};
          background: ${darkMode ? '#0a0f16' : '#fff'};
          border-radius: 8px;
        }

        .stat-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .stat-label {
          margin-top: 13px;
          color: ${darkMode ? '#6F8F85' : '#667085'};
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: .8px;
          font-weight: 700;
        }

        .stat-value {
          margin-top: 4px;
          font-size: 22px;
          line-height: 1;
          font-weight: 750;
          letter-spacing: -.6px;
        }

        .stat-change {
          margin-top: 6px;
          color: ${darkMode ? '#29A36A' : '#20cda9'};
          font-size: 9px;
        }

        .panel {
          border: 1px solid ${darkMode ? '#1a2533' : '#e2e7ef'};
          background: ${darkMode ? '#0a0f16' : '#fff'};
          border-radius: 8px;
          overflow: hidden;
        }

        .panel-header {
          min-height: 64px;
          padding: 15px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid ${darkMode ? '#203A35' : '#e8edf3'};
        }

        .panel-title {
          margin: 0;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: -.1px;
        }

        .panel-subtitle {
          margin: 4px 0 0;
          color: ${darkMode ? '#78998F' : '#667085'};
          font-size: 9px;
        }

        .text-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: ${darkMode ? '#5FAE9A' : '#5a96ff'};
          text-decoration: none;
          font-size: 9px;
          font-weight: 650;
        }

        .mission {
          display: grid;
          grid-template-columns: 34px minmax(150px, 1fr) minmax(150px, 1fr) 70px 30px;
          gap: 12px;
          align-items: center;
          padding: 13px 18px;
          border-bottom: 1px solid ${darkMode ? '#141f30' : '#edf0f4'};
        }

        .mission:last-child {
          border-bottom: 0;
        }

        .mission-icon {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 6px;
        }

        .mission-title {
          font-size: 11px;
          font-weight: 650;
        }

        .mission-sub {
          margin-top: 3px;
          color: ${darkMode ? '#78998F' : '#667085'};
          font-size: 9px;
        }

        .progress-row {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .progress-track {
          flex: 1;
          height: 5px;
          overflow: hidden;
          border-radius: 99px;
          background: ${darkMode ? '#183B34' : '#e8edf3'};
        }

        .progress-fill {
          height: 100%;
          border-radius: inherit;
          background: ${darkMode ? '#0E7564' : 'linear-gradient(90deg, #397bff, #6a7bff)'};
        }

        .progress-text {
          min-width: 38px;
          color: ${darkMode ? '#A9C8BE' : '#667085'};
          font-size: 8px;
          text-align: right;
        }

        .xp {
          color: ${darkMode ? '#29A36A' : '#20d3ad'};
          font-size: 9px;
          font-weight: 700;
          text-align: right;
        }

        .mission-arrow {
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          border: 1px solid ${darkMode ? '#2A4941' : '#dfe5ee'};
          border-radius: 6px;
          background: transparent;
          color: ${darkMode ? '#5FAE9A' : '#5d98ff'};
        }

        .languages {
          padding: 16px 18px 18px;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 9px;
        }

        .language {
          min-height: 106px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border: 1px solid ${darkMode ? '#1a2533' : '#e2e7ef'};
          border-radius: 6px;
          background: ${darkMode ? '#0E2027' : '#fafbfc'};
          text-decoration: none;
          transition: 160ms ease;
        }

        .language:hover {
          transform: translateY(-2px);
          border-color: ${darkMode ? '#2b4668' : '#cbd7e6'};
        }

        .language-mark {
          width: 31px;
          height: 31px;
          display: grid;
          place-items: center;
          border-radius: 6px;
          font-size: 9px;
          font-weight: 800;
        }

        .language-name {
          font-size: 10px;
          font-weight: 700;
        }

        .language-desc {
          margin-top: 3px;
          color: ${darkMode ? '#6F8F85' : '#667085'};
          font-size: 8px;
        }

        .side-panel {
          padding: 17px;
        }

        .streak-number {
          margin-top: 4px;
          font-size: 30px;
          line-height: 1;
          font-weight: 780;
        }

        .streak-caption {
          margin-top: 5px;
          color: ${darkMode ? '#6F8F85' : '#667085'};
          font-size: 9px;
        }

        .streak-days {
          margin-top: 17px;
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 7px;
        }

        .day-label {
          color: ${darkMode ? '#5E7A72' : '#98a2b3'};
          text-align: center;
          font-size: 8px;
          font-weight: 700;
        }

        .day {
          height: 18px;
          display: grid;
          place-items: center;
        }

        .day span {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          border: 1px solid ${darkMode ? '#2A4941' : '#dbe2eb'};
        }

        .day.active span {
          border-color: ${darkMode ? '#0E7564' : '#397bff'};
          background: ${darkMode ? '#0E7564' : '#397bff'};
          box-shadow: 0 0 10px rgba(57,123,255,.35);
        }

        .side-value {
          margin-top: 14px;
          display: flex;
          align-items: baseline;
          gap: 5px;
        }

        .side-value strong {
          font-size: 27px;
          letter-spacing: -.7px;
        }

        .side-value span {
          color: ${darkMode ? '#78998F' : '#667085'};
          font-size: 9px;
        }

        .positive {
          margin-left: auto;
          padding: 4px 7px;
          border-radius: 5px;
          background: ${darkMode ? '#103A34' : '#e7f8f3'};
          color: #20d3ad !important;
          font-size: 8px !important;
          font-weight: 700;
        }

        .focus-link {
          min-height: 58px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 4px;
          border-bottom: 1px solid ${darkMode ? '#141f30' : '#edf0f4'};
          color: inherit;
          text-decoration: none;
        }

        .focus-link:last-child {
          border-bottom: 0;
        }

        .focus-link > span {
          color: #1549C2;
          font-size: 14px;
          font-weight: 600;
        }

        .focus-link:hover {
          color: ${darkMode ? '#ffffff' : '#0F1923'};
        }

        .activity {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 0;
          border-bottom: 1px solid ${darkMode ? '#141f30' : '#edf0f4'};
        }

        .activity:last-child {
          border-bottom: 0;
        }

        .activity-icon {
          width: 29px;
          height: 29px;
          display: grid;
          place-items: center;
          flex: 0 0 auto;
          border-radius: 6px;
        }

        .activity-copy {
          min-width: 0;
          flex: 1;
        }

        .activity-title {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: ${darkMode ? '#C9E7DD' : '#344054'};
          font-size: 9px;
        }

        .activity-time {
          margin-top: 3px;
          color: ${darkMode ? '#61738d' : '#98a2b3'};
          font-size: 8px;
        }

        .activity-xp {
          color: ${darkMode ? '#29A36A' : '#20d3ad'};
          font-size: 8px;
          font-weight: 700;
        }

        .stat,
        .panel,
        .language,
        .icon-btn,
        .profile-mini {
          box-shadow: 0 1px 0 rgba(255,255,255,.015);
        }

        .stat:hover,
        .panel:hover {
          border-color: ${darkMode ? '#2A4941' : '#d2dbe7'};
        }

        .nav-item,
        .primary-btn,
        .secondary-btn,
        .icon-btn,
        .language,
        .mission-arrow {
          transition:
            background-color 140ms ease,
            border-color 140ms ease,
            color 140ms ease,
            transform 140ms ease,
            box-shadow 140ms ease;
        }

        .primary-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 9px 22px rgba(43,105,238,.22);
        }

        .secondary-btn:hover,
        .icon-btn:hover {
          background: ${darkMode ? '#0E2027' : '#f8fafc'};
        }

        .mission:hover {
          background: ${darkMode ? '#0B171D' : '#fafcff'};
        }

        .section-grid > .left-stack > .panel,
        .section-grid > .right-stack > .panel {
          box-shadow: 0 8px 24px rgba(0,0,0,${darkMode ? '.08' : '.025'});
        }

        .eyebrow {
          letter-spacing: 1.6px;
        }

        @media (max-width: 1180px) {
          .section-grid {
            grid-template-columns: 1fr;
          }

          .right-stack {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            align-items: start;
          }

          .right-stack > .signout {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 900px) {
          .sidebar {
            transform: translateX(${mobileNav ? '0' : '-100%'});
            transition: transform 180ms ease;
            box-shadow: 18px 0 45px rgba(0,0,0,.2);
          }

          .main {
            width: 100%;
            margin-left: 0;
          }

          .mobile-menu {
            display: grid;
          }

          .topbar {
            padding: 0 18px;
          }

          .content {
            padding: 22px 18px 40px;
          }

          .stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .languages {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .top-actions .hide-mobile {
            display: none;
          }

          .top-title h1 {
            font-size: 17px;
          }

          .hero {
            min-height: 300px;
            padding: 22px;
          }

          .hero-copy {
            max-width: 100%;
          }

          .stats {
            grid-template-columns: 1fr 1fr;
          }

          .mission {
            grid-template-columns: 34px 1fr 30px;
          }

          .mission .progress-row,
          .mission .xp {
            grid-column: 2 / 3;
          }

          .mission .mission-arrow {
            grid-column: 3;
            grid-row: 1 / 3;
          }

          .languages {
            grid-template-columns: 1fr 1fr;
          }

          .right-stack {
            display: flex;
          }

          .section-grid {
            margin-top: 14px;
          }
        }
      `}</style>

      <div className="dashboard-shell">
        {mobileNav && (
          <button
            aria-label="Close navigation"
            onClick={() => setMobileNav(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 40,
              border: 0,
              background: 'rgba(0,0,0,.45)',
            }}
          />
        )}

        <aside className="sidebar">
          <Link href="/" className="brand">
            <Image
              src="/logo.png"
              alt="HackersHarbor"
              width={42}
              height={42}
              priority
            />
            <div>
              <div className="brand-name">
                Hackers<span>Harbor</span>
              </div>
              <div className="brand-sub">Developer Learning Platform</div>
            </div>
          </Link>

          <nav className="nav-wrap">
            <div className="nav-label">Workspace</div>

            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`nav-item ${item.label === 'Dashboard' ? 'active' : ''}`}
                onClick={() => setMobileNav(false)}
              >
                <Icon name={item.icon} size={17} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="sidebar-bottom">
            <div className="profile-mini">
              <div className="profile-row">
                <div className="avatar">
                  {firstName.charAt(0).toUpperCase()}
                </div>
                <div className="profile-name">
                  <strong>{user?.user_metadata?.full_name || firstName}</strong>
                  <span>
                    {userLevel > 0 ? `Explorer · Level ${userLevel}` : ''}
                  </span>
                </div>
              </div>

              <button className="logout-btn" onClick={handleSignOut}>
                <Icon name="logout" size={13} />
                Sign out
              </button>
            </div>
          </div>
        </aside>

        <div className="main">
          <header className="topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <button
                className="mobile-menu"
                onClick={() => setMobileNav(true)}
                aria-label="Open navigation"
              >
                <Icon name="menu" size={18} />
              </button>

              <div className="top-title">
                <div className="eyebrow">Command Center</div>
                <h1>Dashboard</h1>
              </div>
            </div>

            <div className="top-actions">
              <button className="icon-btn hide-mobile" aria-label="Search">
                <Icon name="search" size={17} />
              </button>

              <button className="icon-btn hide-mobile" aria-label="Notifications">
                <Icon name="bell" size={17} />
                <span className="notif-dot" />
              </button>

              <button className="icon-btn hide-mobile" aria-label="Calendar">
                <Icon name="calendar" size={17} />
              </button>

              <button
                type="button"
                className="theme-switch"
                onClick={() => setDarkMode((value) => !value)}
                aria-label="Toggle color theme"
                aria-pressed={darkMode}
              >
                <span className="theme-knob" />
              </button>
            </div>
          </header>

          <main className="content">
            <section className="hero">

              <div className="hero-copy">
                <div className="hero-kicker">
                  <span className="live-dot" />
                  Current voyage
                </div>

                <h2>
                  Welcome back, {firstName}.
                  <br />
                  Keep building.
                </h2>

                <p>
                  Your workspace is ready. Continue your current learning path,
                  sharpen your problem-solving skills, or head into The Dock
                  and build something real.
                </p>

                <div className="hero-actions">
                  <Link href="/voyage" className="primary-btn">
                    Continue The Voyage
                    <Icon name="arrow" size={14} />
                  </Link>

                  <Link href="/dock" className="secondary-btn">
                    Open The Dock
                  </Link>
                </div>
              </div>
            </section>

            <div className="section-grid">
              <div className="left-stack">
                <section className="stats">
                  {[
                    [
                      'Day Streak',
                      completedStreakDays > 0 ? completedStreakDays : '',
                      'days',
                      '#F59E0B',
                      completedStreakDays > 0 ? 'Keep it going' : '',
                    ],
                    [
                      'Problems Solved',
                      problemsSolved > 0 ? problemsSolved.toLocaleString() : '',
                      '',
                      '#20D3AD',
                      '',
                    ],
                    [
                      'Harbor XP',
                      harborXp > 0 ? harborXp.toLocaleString() : '',
                      '',
                      '#4D8DFF',
                      '',
                    ],
                    [
                      'Certificates',
                      certificates > 0 ? certificates.toLocaleString() : '',
                      '',
                      '#9B72FF',
                      '',
                    ],
                  ].map(([label, value, suffix, color, change]) => (
                    <div className="stat" key={label as string}>
                      <div className="stat-top" />
                      <div className="stat-label">{label}</div>
                      <div className="stat-value">
                        {value}
                        {suffix && value && (
                          <span
                            style={{
                              marginLeft: 4,
                              fontSize: 9,
                              color: darkMode ? '#667991' : '#667085',
                              fontWeight: 500,
                            }}
                          >
                            {suffix}
                          </span>
                        )}
                      </div>
                      <div className="stat-change" style={{ color }}>
                        {change}
                      </div>
                    </div>
                  ))}
                </section>

                <section className="panel">
                  <div className="panel-header">
                    <div>
                      <h2 className="panel-title">Today&apos;s Mission</h2>
                      <p className="panel-subtitle">
                        Small wins compound into serious skill.
                      </p>
                    </div>
                    <Link href="/practice" className="text-link">
                      View missions <Icon name="arrow" size={12} />
                    </Link>
                  </div>

                  {completedMissions.map((mission) => (
                    <div className="mission" key={mission.title}>
                      <div
                        className="mission-icon"
                        style={{
                          background: `${mission.color}16`,
                          color: mission.color,
                        }}
                      >
                        <Icon name={mission.icon} size={16} />
                      </div>

                      <div>
                        <div className="mission-title">{mission.title}</div>
                        <div className="mission-sub">{mission.subtitle}</div>
                      </div>

                      <div className="progress-row">
                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{ width: `${mission.progress}%` }}
                          />
                        </div>
                        <span className="progress-text">
                          {mission.current || `${mission.progress}%`}
                        </span>
                      </div>

                      <div className="xp">{mission.xp}</div>

                      <div className="mission-arrow">
                        <Icon name="chevron" size={13} />
                      </div>
                    </div>
                  ))}
                </section>

                <section className="panel">
                  <div className="panel-header">
                    <div>
                      <h2 className="panel-title">Language Library</h2>
                      <p className="panel-subtitle">
                        Choose the next technology to master.
                      </p>
                    </div>
                    <Link href="/voyage" className="text-link">
                      Explore all <Icon name="arrow" size={12} />
                    </Link>
                  </div>

                  <div className="languages">
                    {languages.map(([name, short, color, description]) => (
                      <Link
                        key={name}
                        href={`/voyage/${name
                          .toLowerCase()
                          .replace('+', 'plus')
                          .replace('#', 'sharp')
                          .replace(/\s+/g, '-')}`}
                        className="language"
                      >
                        <div
                          className="language-mark"
                          style={{
                            background: `${color}18`,
                            border: `1px solid ${color}35`,
                            color,
                          }}
                        >
                          {short}
                        </div>

                        <div>
                          <div className="language-name">{name}</div>
                          <div className="language-desc">{description}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              </div>

              <aside className="right-stack">
                <section className="panel">
                  <div className="side-panel">
                    <div className="eyebrow">Consistency</div>
                    <div className="streak-number">
                      {completedStreakDays > 0 ? completedStreakDays : ''}
                    </div>
                    <div className="streak-caption">
                      {completedStreakDays > 0 ? 'day learning streak' : ''}
                    </div>

                    {completedStreakDays > 0 && (
                      <div className="streak-days">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                          <div className="day-label" key={`${day}-${i}`}>
                            {day}
                          </div>
                        ))}

                        {Array.from({ length: 28 }).map((_, index) => (
                          <div
                            className={`day ${
                              index < completedStreakDays ? 'active' : ''
                            }`}
                            key={index}
                          >
                            <span />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>

                <section className="panel">
                  <div className="side-panel">
                    <div className="eyebrow">Weekly performance</div>

                    <div className="side-value">
                      <strong>
                        {weeklyXp > 0 ? `+${weeklyXp.toLocaleString()}` : ''}
                      </strong>
                      {weeklyXp > 0 && <span>XP</span>}
                      {weeklyXpChange > 0 && (
                        <span className="positive">+{weeklyXpChange}%</span>
                      )}
                    </div>

                    {weeklyXp > 0 ? (
                      <div
                        style={{
                          marginTop: 3,
                          color: darkMode ? '#61738d' : '#667085',
                          fontSize: 8,
                        }}
                      >
                        compared with last week
                      </div>
                    ) : (
                      <div
                        style={{
                          marginTop: 3,
                          color: darkMode ? '#61738d' : '#667085',
                          fontSize: 8,
                        }}
                      >
                        {''}
                      </div>
                    )}
                  </div>
                </section>

                <section className="panel">
                  <div className="panel-header">
                    <div>
                      <h2 className="panel-title">Learning Focus</h2>
                      <p className="panel-subtitle">Choose where to continue</p>
                    </div>
                  </div>

                  <div style={{ padding: '6px 13px 12px' }}>
                    <Link href="/voyage" className="focus-link">
                      <div>
                        <div className="panel-title">Continue The Voyage</div>
                        <div className="panel-subtitle">
                          Continue your learning path.
                        </div>
                      </div>
                      <span>→</span>
                    </Link>

                    <Link href="/practice" className="focus-link">
                      <div>
                        <div className="panel-title">Practice</div>
                        <div className="panel-subtitle">
                          Solve problems and build skill.
                        </div>
                      </div>
                      <span>→</span>
                    </Link>

                    <Link href="/dock" className="focus-link">
                      <div>
                        <div className="panel-title">The Dock</div>
                        <div className="panel-subtitle">
                          Build and analyze real projects.
                        </div>
                      </div>
                      <span>→</span>
                    </Link>
                  </div>
                </section>

                <section className="panel">
                  <div className="side-panel">
                    <div className="panel-title">Recent Activity</div>

                    {recentActivity.length > 0 ? (
                      recentActivity.map((activity: any, index: number) => (
                        <div className="activity" key={`${activity.title}-${index}`}>
                          <div
                            className="activity-icon"
                            style={{
                              background: `${activity.color || '#4D8DFF'}17`,
                              color: activity.color || '#4D8DFF',
                            }}
                          >
                            <Icon
                              name={(activity.icon || 'check') as IconName}
                              size={14}
                            />
                          </div>

                          <div className="activity-copy">
                            <div className="activity-title">
                              {activity.title}
                            </div>
                            <div className="activity-time">
                              {activity.time}
                            </div>
                          </div>

                          <div className="activity-xp">{activity.xp}</div>
                        </div>
                      ))
                    ) : (
                      <div
                        style={{
                          marginTop: 15,
                          color: darkMode ? '#667991' : '#667085',
                          fontSize: 9,
                          lineHeight: 1.6,
                        }}
                      >
                        Your activity will appear here as you learn, practice,
                        and build.
                      </div>
                    )}
                  </div>
                </section>
              </aside>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}

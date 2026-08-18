'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'

type Course = {
  id: number
  title: string
  desc: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  modules: number
  hours: number
  enrolled: number
  progress: number
  color: string
  bg: string
  enrolled_by_user: boolean
}

const courses: Course[] = [
  {
    id: 1,
    title: 'Python Fundamentals',
    desc: 'Master Python from scratch. Variables, loops, functions, OOP and real projects.',
    level: 'Beginner',
    modules: 14,
    hours: 28,
    enrolled: 4200,
    progress: 64,
    color: '#3FB950',
    bg: '#0A1910',
    enrolled_by_user: true,
  },
  {
    id: 2,
    title: 'SQL Mastery',
    desc: 'From basic queries to advanced joins, CTEs, window functions and optimization.',
    level: 'Intermediate',
    modules: 10,
    hours: 20,
    enrolled: 3100,
    progress: 38,
    color: '#4A8CFF',
    bg: '#0C1E3D',
    enrolled_by_user: true,
  },
  {
    id: 3,
    title: 'DSA for Interviews',
    desc: 'Arrays, trees, graphs, dynamic programming. Everything for FAANG interviews.',
    level: 'Intermediate',
    modules: 12,
    hours: 40,
    enrolled: 5800,
    progress: 0,
    color: '#D29922',
    bg: '#1E1505',
    enrolled_by_user: false,
  },
  {
    id: 4,
    title: 'Data Science Track',
    desc: 'Python, pandas, numpy, matplotlib, machine learning and real projects.',
    level: 'Advanced',
    modules: 16,
    hours: 60,
    enrolled: 2400,
    progress: 0,
    color: '#B392F0',
    bg: '#140C1E',
    enrolled_by_user: false,
  },
  {
    id: 5,
    title: 'Full Stack Web Dev',
    desc: 'React, Next.js, Node.js, PostgreSQL. Build and deploy complete applications.',
    level: 'Intermediate',
    modules: 18,
    hours: 72,
    enrolled: 3600,
    progress: 0,
    color: '#00BCD4',
    bg: '#061A1E',
    enrolled_by_user: false,
  },
  {
    id: 6,
    title: 'System Design Masterclass',
    desc: 'HLD, LLD, case studies. Design Netflix, WhatsApp, Amazon from scratch.',
    level: 'Advanced',
    modules: 10,
    hours: 35,
    enrolled: 1900,
    progress: 0,
    color: '#E24B4A',
    bg: '#1A0A0A',
    enrolled_by_user: false,
  },
  {
    id: 7,
    title: 'Crack TCS NQT in 3 Weeks',
    desc: 'Targeted prep for TCS National Qualifier Test. Aptitude, coding and verbal.',
    level: 'Beginner',
    modules: 6,
    hours: 12,
    enrolled: 7200,
    progress: 0,
    color: '#3FB950',
    bg: '#0A1910',
    enrolled_by_user: false,
  },
  {
    id: 8,
    title: 'JavaScript for Beginners',
    desc: 'Learn JavaScript from zero. DOM, events, APIs and modern ES6+ features.',
    level: 'Beginner',
    modules: 12,
    hours: 24,
    enrolled: 4800,
    progress: 0,
    color: '#D29922',
    bg: '#1E1505',
    enrolled_by_user: false,
  },
]

const levelColor: Record<Course['level'], string> = {
  Beginner: '#16A34A',
  Intermediate: '#B7791F',
  Advanced: '#DC2626',
}

const levelBgLight: Record<Course['level'], string> = {
  Beginner: '#ECFDF3',
  Intermediate: '#FFF8E7',
  Advanced: '#FFF1F2',
}

const levelBgDark: Record<Course['level'], string> = {
  Beginner: '#0B2115',
  Intermediate: '#241A08',
  Advanced: '#250D10',
}

export default function Voyage() {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [darkMode, setDarkMode] = useState(false)

  /*
   * Restore saved theme.
   * Default is light mode.
   */
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('hackersharbor-theme')

      if (savedTheme === 'dark') {
        setDarkMode(true)
      }

      if (savedTheme === 'light') {
        setDarkMode(false)
      }
    } catch {
      // Ignore localStorage errors.
    }
  }, [])

  /*
   * Persist theme.
   */
  useEffect(() => {
    try {
      localStorage.setItem(
        'hackersharbor-theme',
        darkMode ? 'dark' : 'light'
      )
    } catch {
      // Ignore localStorage errors.
    }
  }, [darkMode])

  const filtered = useMemo(() => {
    return courses.filter((course) => {
      const matchFilter =
        filter === 'All' ||
        (filter === 'Enrolled'
          ? course.enrolled_by_user
          : course.level === filter)

      const matchSearch = course.title
        .toLowerCase()
        .includes(search.toLowerCase())

      return matchFilter && matchSearch
    })
  }, [filter, search])

  /*
   * Theme tokens.
   * These follow the same visual language as the Practice page.
   */
  const bg = darkMode ? '#080C10' : '#F8FAFF'
  const cardBg = darkMode ? '#0D1520' : '#FFFFFF'
  const elevatedBg = darkMode ? '#101925' : '#FFFFFF'

  const border = darkMode ? '#1A2636' : '#E5EAF0'
  const subtleBorder = darkMode ? '#121C29' : '#EEF2F6'

  const textPrimary = darkMode ? '#E8EEF6' : '#111827'
  const textSecondary = darkMode ? '#8292A8' : '#65758B'
  const textMuted = darkMode ? '#5A6B80' : '#8A98A9'

  const blue = '#1549C2'
  const brightBlue = '#4A8CFF'

  const inputBg = darkMode ? '#060A0F' : '#F4F7FA'

  const levelBg = darkMode
    ? levelBgDark
    : levelBgLight

  return (
    <div
      style={{
        minHeight: '100vh',
        background: bg,
        color: textPrimary,
        fontFamily:
          "'Google Sans', 'Inter', 'Segoe UI', system-ui, sans-serif",
        transition:
          'background 180ms ease, color 180ms ease',
      }}
    >
      {/* TOP NAVIGATION */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          height: '56px',
          background: cardBg,
          borderBottom: `1px solid ${border}`,
          flexShrink: 0,
          boxShadow: darkMode
            ? '0 1px 0 rgba(255,255,255,0.015)'
            : '0 1px 3px rgba(15,23,42,0.025)',
        }}
      >
        {/* BRAND */}
        <a
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            minWidth: '190px',
          }}
        >
          <Image
            src="/logo.png"
            alt="HackersHarbor"
            width={34}
            height={34}
            priority
          />

          <span
            style={{
              fontSize: '15px',
              fontWeight: 650,
              letterSpacing: '-0.25px',
              color: textPrimary,
            }}
          >
            Hackers
            <span style={{ color: blue }}>Harbor</span>
          </span>
        </a>

        {/* NAVIGATION */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
          }}
        >
          {[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Practice', href: '/practice' },
            { label: 'The Voyage', href: '/voyage' },
            { label: 'The Dock', href: '/dock' },
            { label: 'Community', href: '/community' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              style={{
                fontSize: '12px',
                fontWeight:
                  item.label === 'The Voyage' ? 600 : 500,
                color:
                  item.label === 'The Voyage'
                    ? textPrimary
                    : textSecondary,
                padding: '7px 11px',
                textDecoration: 'none',
                background:
                  item.label === 'The Voyage'
                    ? darkMode
                      ? '#111B29'
                      : '#EFF4FF'
                    : 'transparent',
                borderRadius: '6px',
                transition:
                  'background 150ms ease, color 150ms ease',
              }}
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* RIGHT SIDE */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: '190px',
            justifyContent: 'flex-end',
          }}
        >
          {/* PROFESSIONAL PLAIN THEME SWITCH */}
          <button
            type="button"
            onClick={() =>
              setDarkMode((value) => !value)
            }
            aria-label="Toggle color theme"
            aria-pressed={darkMode}
            style={{
              width: '34px',
              height: '18px',
              padding: 0,
              border: `1px solid ${
                darkMode ? '#2B4F89' : '#C9D2DE'
              }`,
              borderRadius: '999px',
              background: darkMode
                ? '#123C83'
                : '#D9E0E8',
              position: 'relative',
              cursor: 'pointer',
              outline: 'none',
              transition:
                'background 160ms ease, border-color 160ms ease',
              boxSizing: 'border-box',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '2px',
                left: darkMode ? '17px' : '2px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#FFFFFF',
                boxShadow:
                  '0 1px 3px rgba(0,0,0,0.22)',
                transition: 'left 160ms ease',
              }}
            />
          </button>

          <a
            href="/dashboard"
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: brightBlue,
              textDecoration: 'none',
              border: `1px solid ${
                darkMode ? '#1F3D70' : '#D5E0F5'
              }`,
              padding: '6px 12px',
              borderRadius: '6px',
              background: darkMode
                ? '#0D1726'
                : '#F7F9FD',
            }}
          >
            Dashboard
          </a>
        </div>
      </nav>

      {/* MAIN LAYOUT */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '220px minmax(0, 1fr)',
          minHeight: 'calc(100vh - 56px)',
        }}
      >
        {/* SIDEBAR */}
        <aside
          style={{
            background: cardBg,
            borderRight: `1px solid ${border}`,
            minHeight: 'calc(100vh - 56px)',
            padding: '14px 0',
          }}
        >
          {/* SIDEBAR HEADER */}
          <div
            style={{
              padding: '0 13px 12px',
              borderBottom: `1px solid ${border}`,
              marginBottom: '10px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                color: '#16A34A',
                marginBottom: '5px',
                fontWeight: 600,
                letterSpacing: '0.01em',
              }}
            >
              THE VOYAGE
            </div>

            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: textPrimary,
              }}
            >
              Course catalog
            </div>
          </div>

          {/* MY VOYAGES */}
          <div
            style={{
              marginBottom: '14px',
            }}
          >
            <div
              style={{
                fontSize: '10px',
                color: textMuted,
                padding: '0 13px',
                marginBottom: '5px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontWeight: 600,
              }}
            >
              My voyages
            </div>

            {['In progress', 'Completed', 'Saved'].map(
              (item) => (
                <div
                  key={item}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '7px 13px',
                    fontSize: '12px',
                    color: textSecondary,
                    cursor: 'pointer',
                    transition:
                      'background 150ms ease',
                  }}
                >
                  <span>{item}</span>

                  <span
                    style={{
                      fontSize: '10px',
                      background: darkMode
                        ? '#111A27'
                        : '#F3F6FA',
                      color: textMuted,
                      borderRadius: '8px',
                      padding: '2px 6px',
                      border: `1px solid ${subtleBorder}`,
                    }}
                  >
                    {item === 'In progress'
                      ? '2'
                      : item === 'Completed'
                      ? '1'
                      : '5'}
                  </span>
                </div>
              )
            )}
          </div>

          {/* TOPICS */}
          <div
            style={{
              paddingTop: '10px',
              borderTop: `1px solid ${border}`,
            }}
          >
            <div
              style={{
                fontSize: '10px',
                color: textMuted,
                padding: '0 13px',
                marginBottom: '5px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontWeight: 600,
              }}
            >
              Topics
            </div>

            {[
              { label: 'Python', color: '#3FB950' },
              { label: 'SQL', color: '#4A8CFF' },
              { label: 'DSA', color: '#D29922' },
              { label: 'Data Science', color: '#B392F0' },
              { label: 'Web Dev', color: '#00BCD4' },
              { label: 'Interviews', color: '#E24B4A' },
            ].map((topic) => (
              <div
                key={topic.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 13px',
                  fontSize: '12px',
                  color: textSecondary,
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: topic.color,
                    flexShrink: 0,
                  }}
                />

                {topic.label}
              </div>
            ))}
          </div>
        </aside>

        {/* CONTENT */}
        <main
          style={{
            padding: '20px 24px',
            minWidth: 0,
          }}
        >
          {/* PAGE HEADER */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: '18px',
                  fontWeight: 650,
                  letterSpacing: '-0.25px',
                  color: textPrimary,
                  margin: '0 0 3px',
                }}
              >
                The Voyage
              </h1>

              <p
                style={{
                  fontSize: '12px',
                  color: textSecondary,
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                Structured courses from beginner to job-ready
              </p>
            </div>

            {/* SEARCH */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <input
                type="text"
                placeholder="Search voyages..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                aria-label="Search voyages"
                style={{
                  background: inputBg,
                  border: `1px solid ${border}`,
                  borderRadius: '6px',
                  padding: '7px 10px',
                  fontSize: '12px',
                  color: textPrimary,
                  outline: 'none',
                  width: '190px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* FILTERS */}
          <div
            style={{
              display: 'flex',
              gap: '5px',
              marginBottom: '17px',
              flexWrap: 'wrap',
            }}
          >
            {[
              'All',
              'Enrolled',
              'Beginner',
              'Intermediate',
              'Advanced',
            ].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                aria-pressed={filter === item}
                style={{
                  fontSize: '10px',
                  fontWeight: 550,
                  padding: '5px 10px',
                  borderRadius: '5px',
                  border: `1px solid ${
                    filter === item ? blue : border
                  }`,
                  cursor: 'pointer',
                  background:
                    filter === item
                      ? blue
                      : darkMode
                      ? '#111A27'
                      : '#F7F9FC',
                  color:
                    filter === item
                      ? '#FFFFFF'
                      : textSecondary,
                  fontFamily: 'inherit',
                  transition:
                    'background 150ms ease, border-color 150ms ease',
                }}
              >
                {item}
              </button>
            ))}
          </div>

          {/* COURSE GRID */}
          {filtered.length === 0 ? (
            <div
              style={{
                background: cardBg,
                border: `1px solid ${border}`,
                borderRadius: '8px',
                padding: '40px 20px',
                textAlign: 'center',
                color: textMuted,
                fontSize: '12px',
              }}
            >
              No courses found.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '12px',
              }}
            >
              {filtered.map((course) => (
                <div
                  key={course.id}
                  style={{
                    background: cardBg,
                    border: `1px solid ${
                      course.enrolled_by_user
                        ? `${course.color}55`
                        : border
                    }`,
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition:
                      'border-color 160ms ease, transform 160ms ease',
                    boxShadow: darkMode
                      ? '0 1px 0 rgba(255,255,255,0.01)'
                      : '0 2px 8px rgba(15,23,42,0.025)',
                  }}
                >
                  {/* COURSE ACCENT */}
                  <div
                    style={{
                      height: '4px',
                      background: course.color,
                      opacity: 0.72,
                    }}
                  />

                  <div
                    style={{
                      padding: '14px',
                    }}
                  >
                    {/* TOP ROW */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        marginBottom: '10px',
                        gap: '10px',
                      }}
                    >
                      {/* COURSE MARK */}
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '7px',
                          background: darkMode
                            ? course.bg
                            : `${course.color}12`,
                          border: `1px solid ${course.color}35`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: course.color,
                            boxShadow: `0 0 0 4px ${course.color}15`,
                          }}
                        />
                      </div>

                      {/* LEVEL */}
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          padding: '3px 7px',
                          borderRadius: '4px',
                          background:
                            levelBg[course.level],
                          color:
                            levelColor[course.level],
                        }}
                      >
                        {course.level}
                      </span>
                    </div>

                    {/* TITLE */}
                    <h3
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: textPrimary,
                        margin: '0 0 5px',
                        letterSpacing: '-0.1px',
                      }}
                    >
                      {course.title}
                    </h3>

                    {/* DESCRIPTION */}
                    <p
                      style={{
                        fontSize: '11px',
                        color: textSecondary,
                        lineHeight: 1.55,
                        margin: '0 0 11px',
                      }}
                    >
                      {course.desc}
                    </p>

                    {/* COURSE METADATA */}
                    <div
                      style={{
                        display: 'flex',
                        gap: '12px',
                        marginBottom: '11px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '10px',
                          color: textMuted,
                        }}
                      >
                        {course.modules} modules
                      </span>

                      <span
                        style={{
                          fontSize: '10px',
                          color: textMuted,
                        }}
                      >
                        {course.hours}h
                      </span>

                      <span
                        style={{
                          fontSize: '10px',
                          color: textMuted,
                        }}
                      >
                        {course.enrolled.toLocaleString()} learners
                      </span>
                    </div>

                    {/* PROGRESS */}
                    {course.enrolled_by_user &&
                      course.progress > 0 && (
                        <div
                          style={{
                            marginBottom: '11px',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent:
                                'space-between',
                              marginBottom: '4px',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '10px',
                                color: textMuted,
                              }}
                            >
                              Progress
                            </span>

                            <span
                              style={{
                                fontSize: '10px',
                                color: course.color,
                                fontWeight: 600,
                              }}
                            >
                              {course.progress}%
                            </span>
                          </div>

                          <div
                            style={{
                              height: '3px',
                              background: darkMode
                                ? '#1A2636'
                                : '#E9EEF4',
                              borderRadius: '999px',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                width: `${course.progress}%`,
                                background:
                                  course.color,
                                borderRadius: '999px',
                              }}
                            />
                          </div>
                        </div>
                      )}

                    {/* ACTION */}
                    <button
                      type="button"
                      style={{
                        width: '100%',
                        background:
                          course.enrolled_by_user
                            ? blue
                            : darkMode
                            ? '#111A27'
                            : '#F7F9FC',
                        color:
                          course.enrolled_by_user
                            ? '#FFFFFF'
                            : textSecondary,
                        border: `1px solid ${
                          course.enrolled_by_user
                            ? blue
                            : border
                        }`,
                        borderRadius: '6px',
                        padding: '7px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontFamily: 'inherit',
                        transition:
                          'background 150ms ease, border-color 150ms ease',
                      }}
                    >
                      {course.enrolled_by_user
                        ? course.progress > 0
                          ? 'Continue voyage →'
                          : 'Start voyage →'
                        : 'Enroll →'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
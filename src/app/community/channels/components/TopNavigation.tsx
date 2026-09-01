'use client'

import Image from 'next/image'
import { useState } from 'react'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', active: false },
  { label: 'Practice', href: '/practice', active: false },
  { label: 'The Voyage', href: '/voyage', active: false },
  { label: 'The Dock', href: '/dock', active: false },
  { label: 'Community', href: '/community', active: true },
] as const

export function TopNavigation() {
  const [isToggled, setIsToggled] = useState(false)

  return (
    <header
      style={{
        height: '72px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        background: '#FFFFFF',
        borderBottom: '1px solid #DDE4EF',
        flexShrink: 0,
        position: 'relative',
        zIndex: 10,
        boxSizing: 'border-box',
      }}
    >
      {/* Brand */}
      <div
        style={{
          width: '250px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: '0 28px',
          borderRight: '1px solid #DDE4EF',
          boxSizing: 'border-box',
          flexShrink: 0,
        }}
      >
        <a
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
            width={38}
            height={38}
            style={{
              width: '38px',
              height: '38px',
              objectFit: 'contain',
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1px',
            }}
          >
            <span
              style={{
                fontSize: '15px',
                lineHeight: '18px',
                fontWeight: 700,
                color: '#172033',
                letterSpacing: '-0.02em',
              }}
            >
              Hackers
              <span style={{ color: '#3F7CFF' }}>
                Harbor
              </span>
            </span>

            <span
              style={{
                fontSize: '10px',
                lineHeight: '12px',
                fontWeight: 600,
                color: '#8A97A8',
                letterSpacing: '0.13em',
              }}
            >
              Channels / Discussions
            </span>
          </div>
        </a>
      </div>

      {/* Page identity */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 28px',
        }}
      >
        <div
          style={{
            fontSize: '9px',
            lineHeight: '12px',
            fontWeight: 700,
            color: '#3F7CFF',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            marginBottom: '3px',
          }}
        >
          Community
        </div>

        <div
          style={{
            fontSize: '15px',
            lineHeight: '20px',
            fontWeight: 600,
            color: '#172033',
            letterSpacing: '-0.025em',
          }}
        >
          Discussions
        </div>
      </div>

      {/* Main navigation */}
      <nav
        aria-label="Primary navigation"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          whiteSpace: 'nowrap',
        }}
      >
        {NAV_ITEMS.map(item => (
          <a
            key={item.label}
            href={item.href}
            aria-current={
              item.active ? 'page' : undefined
            }
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '34px',
              padding: '0 12px',
              borderRadius: '7px',
              background: item.active
                ? '#EEF4FF'
                : 'transparent',
              color: item.active
                ? '#2F6FED'
                : '#66758A',
              fontSize: '12px',
              lineHeight: '16px',
              fontWeight: item.active ? 600 : 500,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              boxSizing: 'border-box',
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>

      {/* Toggle switch */}
      <div
        style={{
          paddingRight: '20px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <button
          type="button"
          aria-label={
            isToggled
              ? 'Disable toggle'
              : 'Enable toggle'
          }
          aria-pressed={isToggled}
          onClick={() => setIsToggled(value => !value)}
          style={{
            width: '36px',
            height: '20px',
            padding: '2px',
            borderRadius: '999px',
            border: '1px solid #D9E6E2',
            background: isToggled
              ? '#DFF4EC'
              : '#E5F2EF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isToggled
              ? 'flex-end'
              : 'flex-start',
            cursor: 'pointer',
            boxSizing: 'border-box',
            transition:
              'background 0.15s ease, border-color 0.15s ease',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: '#FFFFFF',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.12)',
              display: 'block',
              transition: 'transform 0.15s ease',
            }}
          />
        </button>
      </div>
    </header>
  )
}
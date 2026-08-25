'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
    } else {
      router.replace('/dashboard')
    }

    setLoading(false)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F8FAFF',
        color: '#0F1923',
      }}
    >
      {/* NAVBAR */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          height: '64px',
          borderBottom: '1px solid #E8EDF2',
          background: '#FFFFFF',
        }}
      >
        {/* LOGO */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
          }}
        >
          <Image
            src="/logo.png"
            alt="HackersHarbor"
            width={46}
            height={46}
          />

          <span
            style={{
              fontSize: '18px',
              fontWeight: 600,
              letterSpacing: '-0.2px',
              color: '#0F1923',
            }}
          >
            Hackers
            <span style={{ color: '#1549C2' }}>Harbor</span>
          </span>
        </Link>

        {/* SIGN UP LINK */}
        <p
          style={{
            fontSize: '13px',
            color: '#5A6E85',
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Don't have an account?{' '}
          <Link
            href="/signup"
            style={{
              color: '#1549C2',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Create a free account
          </Link>
        </p>
      </nav>

      {/* MAIN */}
      <main
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 64px)',
          padding: '48px 20px',
        }}
      >
        {/* LOGIN CARD */}
        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            background: '#FFFFFF',
            border: '1px solid #E8EDF2',
            borderRadius: '18px',
            padding: '42px',
            boxShadow: '0 8px 30px rgba(15, 25, 35, 0.06)',
          }}
        >
          {/* HEADER */}
          <div
            style={{
              marginBottom: '30px',
              textAlign: 'center',
            }}
          >
            <h1
              style={{
                fontSize: '28px',
                lineHeight: 1.2,
                fontWeight: 700,
                letterSpacing: '-0.6px',
                color: '#0F1923',
                margin: '0 0 9px 0',
              }}
            >
              Welcome back
            </h1>

            <p
              style={{
                fontSize: '14px',
                lineHeight: 1.6,
                color: '#6B7C93',
                margin: 0,
              }}
            >
              Log in to continue your coding journey.
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleLogin}>
            {/* EMAIL */}
            <div
              style={{
                marginBottom: '20px',
              }}
            >
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  lineHeight: 1.4,
                  fontWeight: 600,
                  color: '#243447',
                  marginBottom: '7px',
                }}
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                style={{
                  width: '100%',
                  height: '46px',
                  background: '#FBFCFE',
                  border: '1px solid #DDE4EC',
                  borderRadius: '9px',
                  padding: '0 14px',
                  fontSize: '14px',
                  color: '#0F1923',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s ease',
                }}
              />
            </div>

            {/* PASSWORD */}
            <div
              style={{
                marginBottom: '9px',
              }}
            >
              <label
                htmlFor="password"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  lineHeight: 1.4,
                  fontWeight: 600,
                  color: '#243447',
                  marginBottom: '7px',
                }}
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                style={{
                  width: '100%',
                  height: '46px',
                  background: '#FBFCFE',
                  border: '1px solid #DDE4EC',
                  borderRadius: '9px',
                  padding: '0 14px',
                  fontSize: '14px',
                  color: '#0F1923',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s ease',
                }}
              />
            </div>

            {/* FORGOT PASSWORD */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '24px',
              }}
            >
              <Link
                href="/forgot-password"
                style={{
                  fontSize: '13px',
                  color: '#1549C2',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                Forgot password?
              </Link>
            </div>

            {/* ERROR MESSAGE */}
            {message && (
              <div
                style={{
                  marginBottom: '18px',
                  padding: '11px 13px',
                  background: '#FFF5F5',
                  border: '1px solid #FED7D7',
                  borderRadius: '9px',
                  fontSize: '13px',
                  lineHeight: 1.5,
                  color: '#C53030',
                }}
              >
                {message}
              </div>
            )}

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: '46px',
                background: loading ? '#6E8FD8' : '#1549C2',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '9px',
                padding: '0 16px',
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '-0.1px',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading
                  ? 'none'
                  : '0 4px 12px rgba(21, 73, 194, 0.18)',
              }}
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          {/* DIVIDER */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: '26px 0',
            }}
          >
            <div
              style={{
                flex: 1,
                height: '1px',
                background: '#E8EDF2',
              }}
            />

            <span
              style={{
                fontSize: '11px',
                fontWeight: 500,
                color: '#9AA8B8',
                letterSpacing: '0.4px',
              }}
            >
              OR
            </span>

            <div
              style={{
                flex: 1,
                height: '1px',
                background: '#E8EDF2',
              }}
            />
          </div>

          {/* CREATE ACCOUNT */}
          <p
            style={{
              textAlign: 'center',
              fontSize: '13px',
              lineHeight: 1.5,
              color: '#6B7C93',
              margin: 0,
            }}
          >
            Don't have an account?{' '}
            <Link
              href="/signup"
              style={{
                color: '#1549C2',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Create a free account
            </Link>
          </p>

          {/* TERMS */}
          <p
            style={{
              textAlign: 'center',
              fontSize: '11.5px',
              lineHeight: 1.6,
              color: '#9AA8B8',
              marginTop: '18px',
              marginBottom: 0,
            }}
          >
            By logging in you agree to our{' '}
            <Link
              href="/terms"
              style={{
                color: '#6D83A1',
                textDecoration: 'none',
              }}
            >
              Terms
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              style={{
                color: '#6D83A1',
                textDecoration: 'none',
              }}
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
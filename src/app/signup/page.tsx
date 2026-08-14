'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

export default function SignUp() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setLoading(true)
    setMessage('')
    setSuccess(false)

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: name.trim(),
        },
      },
    })

    if (error) {
      setMessage(error.message)
      setSuccess(false)
    } else {
      setMessage('Check your email to confirm your account.')
      setSuccess(true)
    }

    setLoading(false)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8faff',
        color: '#0F1923',
        fontFamily: 'inherit',
      }}
    >
      {/* NAVBAR */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          height: '60px',
          borderBottom: '1px solid #E8EDF2',
          background: '#ffffff',
          boxSizing: 'border-box',
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
          }}
        >
          {/* SAME LOGO SIZE AS LOGIN PAGE */}
          <Image
            src="/logo.png"
            alt="HackersHarbor"
            width={46}
            height={46}
            priority
          />

          <span
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#0F1923',
              letterSpacing: '-0.2px',
            }}
          >
            Hackers
            <span style={{ color: '#1549C2' }}>Harbor</span>
          </span>
        </a>

        {/* LOGIN */}
        <p
          style={{
            margin: 0,
            fontSize: '13px',
            color: '#5A6E85',
          }}
        >
          Already have an account?{' '}
          <a
            href="/login"
            style={{
              color: '#1549C2',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Log in
          </a>
        </p>
      </nav>

      {/* MAIN */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 60px)',
          padding: '40px 20px',
          boxSizing: 'border-box',
        }}
      >
        {/* SIGNUP CARD */}
        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            background: '#ffffff',
            border: '1px solid #E8EDF2',
            borderRadius: '16px',
            padding: '40px',
            boxSizing: 'border-box',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}
        >
          {/* HEADER */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: '32px',
            }}
          >
            <h1
              style={{
                margin: '0 0 8px',
                fontSize: '26px',
                lineHeight: '1.25',
                fontWeight: 700,
                letterSpacing: '-0.5px',
                color: '#0F1923',
              }}
            >
              Join HackersHarbor
            </h1>

            <p
              style={{
                margin: 0,
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#5A6E85',
              }}
            >
              Start your coding journey today. Free forever.
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSignUp}>

            {/* FULL NAME */}
            <div
              style={{
                marginBottom: '16px',
              }}
            >
              <label
                htmlFor="name"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#0F1923',
                  marginBottom: '6px',
                }}
              >
                Full name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                autoComplete="name"
                required
                style={{
                  width: '100%',
                  height: '44px',
                  background: '#F8FAFF',
                  border: '1px solid #E8EDF2',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                  color: '#0F1923',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* EMAIL */}
            <div
              style={{
                marginBottom: '16px',
              }}
            >
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#0F1923',
                  marginBottom: '6px',
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
                autoComplete="email"
                required
                style={{
                  width: '100%',
                  height: '44px',
                  background: '#F8FAFF',
                  border: '1px solid #E8EDF2',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                  color: '#0F1923',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* PASSWORD */}
            <div
              style={{
                marginBottom: '24px',
              }}
            >
              <label
                htmlFor="password"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#0F1923',
                  marginBottom: '6px',
                }}
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                autoComplete="new-password"
                minLength={8}
                required
                style={{
                  width: '100%',
                  height: '44px',
                  background: '#F8FAFF',
                  border: '1px solid #E8EDF2',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                  color: '#0F1923',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* MESSAGE */}
            {message && (
              <div
                style={{
                  marginBottom: '16px',
                  padding: '10px 14px',
                  background: success ? '#F0FFF4' : '#FFF5F5',
                  border: `1px solid ${
                    success ? '#C6F6D5' : '#FED7D7'
                  }`,
                  borderRadius: '8px',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  color: success ? '#276749' : '#C53030',
                }}
              >
                {message}
              </div>
            )}

            {/* CREATE ACCOUNT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: '45px',
                background: loading ? '#6D8DD8' : '#1549C2',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                fontFamily: 'inherit',
                fontSize: '14px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Creating account...' : 'Create free account'}
            </button>
          </form>

          {/* TERMS */}
          <p
            style={{
              textAlign: 'center',
              fontSize: '12px',
              lineHeight: '1.6',
              color: '#8A9BB5',
              margin: '16px 0 0',
            }}
          >
            By signing up you agree to our{' '}
            <a
              href="/terms"
              style={{
                color: '#1549C2',
                textDecoration: 'none',
              }}
            >
              Terms
            </a>{' '}
            and{' '}
            <a
              href="/privacy"
              style={{
                color: '#1549C2',
                textDecoration: 'none',
              }}
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
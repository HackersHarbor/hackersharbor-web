'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

type Difficulty = 'Easy' | 'Medium' | 'Hard'

type Problem = {
  id: number
  title: string
  difficulty: Difficulty
  category: string
  description: string
  example: string
  tags: string[]
}

const problems: Problem[] = [
  {
    id: 1,
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Arrays',
    description:
      'Given an array of integers and a target sum, return the indices of the two numbers that add up to the target. You may assume that each input would have exactly one solution.',
    example:
      'Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]',
    tags: ['Arrays', 'Hash Map'],
  },
  {
    id: 2,
    title: 'Reverse a String',
    difficulty: 'Easy',
    category: 'Strings',
    description:
      'Given a string, return the string with its characters reversed. Preserve the original characters and their order in reverse.',
    example:
      'Input: s = "hello"\nOutput: "olleh"',
    tags: ['Strings', 'Two Pointers'],
  },
  {
    id: 3,
    title: 'FizzBuzz',
    difficulty: 'Easy',
    category: 'Loops',
    description:
      'Return the numbers from 1 to n. For multiples of three return "Fizz", for multiples of five return "Buzz", and for multiples of both return "FizzBuzz".',
    example:
      'Input: n = 5\nOutput: [1,2,"Fizz",4,"Buzz"]',
    tags: ['Loops', 'Conditionals'],
  },
  {
    id: 4,
    title: 'Palindrome Check',
    difficulty: 'Easy',
    category: 'Strings',
    description:
      'Determine whether a string reads the same forward and backward. Return true when the string is a palindrome and false otherwise.',
    example:
      'Input: s = "level"\nOutput: true',
    tags: ['Strings', 'Two Pointers'],
  },
  {
    id: 5,
    title: 'Binary Search',
    difficulty: 'Medium',
    category: 'Searching',
    description:
      'Given a sorted array and a target value, return the index of the target. Return -1 if the target does not exist in the array.',
    example:
      'Input: nums = [1,3,5,7,9], target = 7\nOutput: 3',
    tags: ['Binary Search', 'Arrays'],
  },
  {
    id: 6,
    title: 'Merge Two Sorted Lists',
    difficulty: 'Medium',
    category: 'Arrays',
    description:
      'Merge two sorted lists into a single sorted list while preserving the ordering of all values.',
    example:
      'Input: [1,2,4], [1,3,4]\nOutput: [1,1,2,3,4,4]',
    tags: ['Arrays', 'Two Pointers'],
  },
  {
    id: 7,
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    description:
      'Find the contiguous subarray with the largest possible sum and return that maximum sum.',
    example:
      'Input: nums = [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6',
    tags: ['Arrays', 'Dynamic Programming'],
  },
  {
    id: 8,
    title: 'Valid Parentheses',
    difficulty: 'Medium',
    category: 'Stacks',
    description:
      'Given a string containing brackets, determine whether every opening bracket is closed by the correct closing bracket in the correct order.',
    example:
      'Input: s = "()[]{}"\nOutput: true',
    tags: ['Stacks', 'Strings'],
  },
  {
    id: 9,
    title: 'Climbing Stairs',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    description:
      'You are climbing a staircase with n steps. Each time you can climb either one or two steps. Return the number of distinct ways to reach the top.',
    example:
      'Input: n = 4\nOutput: 5',
    tags: ['Dynamic Programming', 'Math'],
  },
  {
    id: 10,
    title: 'Longest Common Subsequence',
    difficulty: 'Hard',
    category: 'Dynamic Programming',
    description:
      'Given two strings, return the length of their longest common subsequence. Characters do not have to be adjacent but must remain in order.',
    example:
      'Input: text1 = "abcde", text2 = "ace"\nOutput: 3',
    tags: ['Dynamic Programming', 'Strings'],
  },
  {
    id: 11,
    title: 'Word Search',
    difficulty: 'Hard',
    category: 'Backtracking',
    description:
      'Given a grid of characters and a word, determine whether the word exists in the grid by moving horizontally or vertically between adjacent cells.',
    example:
      'Input: board = [["A","B"],["C","D"]], word = "AB"\nOutput: true',
    tags: ['Backtracking', 'Matrix'],
  },
  {
    id: 12,
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    category: 'Arrays',
    description:
      'Given an array representing elevation heights, calculate how much rainwater can be trapped between the bars after rainfall.',
    example:
      'Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]\nOutput: 6',
    tags: ['Arrays', 'Two Pointers'],
  },
]

const difficultyColor: Record<Difficulty, string> = {
  Easy: '#16A34A',
  Medium: '#B7791F',
  Hard: '#DC2626',
}

const difficultyBgLight: Record<Difficulty, string> = {
  Easy: '#ECFDF3',
  Medium: '#FFF8E7',
  Hard: '#FFF1F2',
}

const difficultyBgDark: Record<Difficulty, string> = {
  Easy: '#0B2115',
  Medium: '#241A08',
  Hard: '#250D10',
}

const starterCode = `# Write your Python solution here

def solution():
    pass
`

export default function Practice() {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  /*
   * Keep selected typed as Problem.
   * The selectedProblem fallback below also protects the page
   * if an invalid value ever reaches this state.
   */
  const [selected, setSelected] = useState<Problem>(problems[0])

  const [code, setCode] = useState(starterCode)
  const [output, setOutput] = useState('')
  const [darkMode, setDarkMode] = useState(true)

  const [solvedIds, setSolvedIds] = useState<number[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [running, setRunning] = useState(false)
  const [lastAction, setLastAction] = useState('')

  /*
   * Restore saved Practice progress and theme.
   */
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('hackersharbor-theme')
      const savedSolved = localStorage.getItem(
        'hackersharbor-solved-problems'
      )

      if (savedTheme === 'light') {
        setDarkMode(false)
      }

      if (savedTheme === 'dark') {
        setDarkMode(true)
      }

      if (savedSolved) {
        const parsed = JSON.parse(savedSolved)

        if (Array.isArray(parsed)) {
          setSolvedIds(
            parsed.filter(
              (id): id is number =>
                typeof id === 'number' &&
                problems.some((problem) => problem.id === id)
            )
          )
        }
      }
    } catch {
      // Ignore invalid local storage values.
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
      // Ignore storage errors.
    }
  }, [darkMode])

  /*
   * Persist solved problems.
   */
  useEffect(() => {
    try {
      localStorage.setItem(
        'hackersharbor-solved-problems',
        JSON.stringify(solvedIds)
      )
    } catch {
      // Ignore storage errors.
    }
  }, [solvedIds])

  const filtered = useMemo(() => {
    return problems.filter((problem) => {
      const matchFilter =
        filter === 'All' || problem.difficulty === filter

      const matchSearch = problem.title
        .toLowerCase()
        .includes(search.toLowerCase())

      return matchFilter && matchSearch
    })
  }, [filter, search])

  /*
   * SAFETY FIX
   *
   * Always resolve the selected problem from the original
   * problems array. If selected is ever invalid or undefined,
   * problems[0] is used instead.
   *
   * This prevents errors such as:
   *
   * Cannot read properties of undefined (reading 'map')
   */
  const selectedProblem =
    problems.find((problem) => problem.id === selected?.id) ??
    problems[0]

  const isSolved = solvedIds.includes(selectedProblem.id)
  const solvedCount = solvedIds.length
  const totalXP = solvedCount * 50

  const bg = darkMode ? '#080C10' : '#F8FAFF'
  const cardBg = darkMode ? '#0D1520' : '#FFFFFF'
  const elevatedBg = darkMode ? '#101925' : '#FFFFFF'
  const border = darkMode ? '#1A2636' : '#E5EAF0'
  const subtleBorder = darkMode ? '#121C29' : '#EEF2F6'

  const textPrimary = darkMode ? '#E8EEF6' : '#111827'
  const textSecondary = darkMode ? '#8292A8' : '#65758B'
  const textMuted = darkMode ? '#5A6B80' : '#8A98A9'

  const editorBg = darkMode ? '#060A0F' : '#F4F7FA'

  const diffBg = darkMode
    ? difficultyBgDark
    : difficultyBgLight

  const blue = '#1549C2'
  const brightBlue = '#4A8CFF'

  /*
   * Simulated local execution.
   *
   * This is intentionally a front-end demonstration.
   * It does not execute arbitrary Python inside the browser.
   */
  const handleRun = () => {
    if (running) return

    setRunning(true)
    setSubmitted(false)
    setLastAction('Running test cases...')

    window.setTimeout(() => {
      setRunning(false)

      setOutput(
        [
          'Execution completed.',
          '',
          'Test case 1: passed',
          'Test case 2: passed',
          'Test case 3: failed',
          '',
          'Expected: [0, 1]',
          'Got: []',
        ].join('\n')
      )

      setLastAction('Execution finished')
    }, 700)
  }

  const handleSubmit = () => {
    if (running) return

    setSubmitted(true)
    setLastAction('Submission accepted')

    if (!solvedIds.includes(selectedProblem.id)) {
      setSolvedIds((current) => [...current, selectedProblem.id])
    }

    setOutput(
      [
        'Submission received.',
        '',
        'Visible tests: passed',
        'Hidden tests: pending verification',
        '',
        'Problem progress has been recorded locally.',
      ].join('\n')
    )
  }

  const handleReset = () => {
    setCode(starterCode)
    setOutput('')
    setSubmitted(false)
    setLastAction('Editor reset')
  }

  const selectProblem = (problem: Problem) => {
    setSelected(problem)
    setOutput('')
    setSubmitted(false)
    setLastAction('')
    setCode(starterCode)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: bg,
        color: textPrimary,
        fontFamily:
          "'Google Sans', 'Inter', 'Segoe UI', system-ui, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        transition: 'background 180ms ease, color 180ms ease',
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
        <Link
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
        </Link>

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
            <Link
              key={item.label}
              href={item.href}
              style={{
                fontSize: '12px',
                fontWeight:
                  item.label === 'Practice' ? 600 : 500,
                color:
                  item.label === 'Practice'
                    ? textPrimary
                    : textSecondary,
                padding: '7px 11px',
                textDecoration: 'none',
                background:
                  item.label === 'Practice'
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
            </Link>
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
            onClick={() => setDarkMode((value) => !value)}
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
              background: darkMode ? '#123C83' : '#D9E0E8',
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

          <Link
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
          </Link>
        </div>
      </nav>

      {/* MAIN PRACTICE AREA */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '280px minmax(0, 1fr)',
          flex: 1,
          minHeight: 'calc(100vh - 56px)',
          overflow: 'hidden',
        }}
      >
        {/* PROBLEM SIDEBAR */}
        <aside
          style={{
            background: cardBg,
            borderRight: `1px solid ${border}`,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          {/* SIDEBAR HEADER */}
          <div
            style={{
              padding: '15px 13px 12px',
              borderBottom: `1px solid ${border}`,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '9px',
              }}
            >
              <h2
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: textPrimary,
                  margin: 0,
                }}
              >
                Python Problems
              </h2>

              <span
                style={{
                  fontSize: '10px',
                  color: textMuted,
                }}
              >
                {solvedCount}/{problems.length} solved
              </span>
            </div>

            {/* PROGRESS */}
            <div
              style={{
                height: '3px',
                width: '100%',
                background: darkMode
                  ? '#172131'
                  : '#E9EEF4',
                borderRadius: '999px',
                overflow: 'hidden',
                marginBottom: '10px',
              }}
            >
              <div
                style={{
                  width: `${
                    (solvedCount / problems.length) * 100
                  }%`,
                  height: '100%',
                  background: blue,
                  borderRadius: '999px',
                  transition: 'width 200ms ease',
                }}
              />
            </div>

            <input
              type="text"
              placeholder="Search problems..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              aria-label="Search problems"
              style={{
                width: '100%',
                background: editorBg,
                border: `1px solid ${border}`,
                borderRadius: '6px',
                padding: '7px 10px',
                fontSize: '12px',
                color: textPrimary,
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* FILTERS */}
          <div
            style={{
              display: 'flex',
              gap: '4px',
              padding: '9px 12px',
              borderBottom: `1px solid ${border}`,
              flexWrap: 'wrap',
            }}
          >
            {['All', 'Easy', 'Medium', 'Hard'].map(
              (item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  aria-pressed={filter === item}
                  style={{
                    fontSize: '10px',
                    fontWeight: 550,
                    padding: '4px 9px',
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
                  }}
                >
                  {item}
                </button>
              )
            )}
          </div>

          {/* PROBLEM LIST */}
          <div
            style={{
              overflowY: 'auto',
              flex: 1,
            }}
          >
            {filtered.length === 0 ? (
              <div
                style={{
                  padding: '28px 16px',
                  textAlign: 'center',
                  color: textMuted,
                  fontSize: '12px',
                }}
              >
                No problems found.
              </div>
            ) : (
              filtered.map((problem) => {
                const solved = solvedIds.includes(problem.id)
                const active = selectedProblem.id === problem.id

                return (
                  <button
                    key={problem.id}
                    type="button"
                    onClick={() => selectProblem(problem)}
                    aria-current={active ? 'true' : undefined}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '11px 12px',
                      border: 'none',
                      borderBottom: `1px solid ${
                        darkMode
                          ? '#101925'
                          : '#F0F3F7'
                      }`,
                      cursor: 'pointer',
                      background: active
                        ? darkMode
                          ? '#111B29'
                          : '#EFF5FF'
                        : 'transparent',
                      borderLeft: active
                        ? `2px solid ${blue}`
                        : '2px solid transparent',
                      color: textPrimary,
                      fontFamily: 'inherit',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '12px',
                        color: solved
                          ? '#16A34A'
                          : textPrimary,
                        fontWeight: 550,
                        display: 'block',
                        marginBottom: '5px',
                      }}
                    >
                      {solved ? '✓ ' : ''}
                      {problem.id}. {problem.title}
                    </span>

                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '9px',
                          fontWeight: 600,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background:
                            diffBg[problem.difficulty],
                          color:
                            difficultyColor[
                              problem.difficulty
                            ],
                        }}
                      >
                        {problem.difficulty}
                      </span>

                      <span
                        style={{
                          fontSize: '10px',
                          color: textMuted,
                        }}
                      >
                        {problem.category}
                      </span>
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </aside>

        {/* CONTENT */}
        <main
          style={{
            display: 'grid',
            gridTemplateRows:
              'minmax(0, 1fr) minmax(0, 1fr)',
            overflow: 'hidden',
            minWidth: 0,
          }}
        >
          {/* PROBLEM DESCRIPTION */}
          <section
            style={{
              padding: '18px 20px',
              borderBottom: `1px solid ${border}`,
              overflowY: 'auto',
              background: bg,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                marginBottom: '12px',
                flexWrap: 'wrap',
              }}
            >
              <h1
                style={{
                  fontSize: '17px',
                  fontWeight: 650,
                  letterSpacing: '-0.2px',
                  color: textPrimary,
                  margin: 0,
                }}
              >
                {selectedProblem.id}. {selectedProblem.title}
              </h1>

              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  padding: '4px 8px',
                  borderRadius: '5px',
                  background:
                    diffBg[selectedProblem.difficulty],
                  color:
                    difficultyColor[selectedProblem.difficulty],
                }}
              >
                {selectedProblem.difficulty}
              </span>

              {isSolved && (
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    padding: '4px 8px',
                    borderRadius: '5px',
                    background: darkMode
                      ? '#0B2115'
                      : '#ECFDF3',
                    color: '#16A34A',
                  }}
                >
                  Solved
                </span>
              )}
            </div>

            <p
              style={{
                fontSize: '13px',
                color: textSecondary,
                lineHeight: 1.75,
                margin: '0 0 17px',
                maxWidth: '850px',
              }}
            >
              {selectedProblem.description}
            </p>

            <div
              style={{
                background: elevatedBg,
                border: `1px solid ${border}`,
                borderRadius: '7px',
                padding: '13px',
                marginBottom: '13px',
                maxWidth: '850px',
              }}
            >
              <p
                style={{
                  fontSize: '11px',
                  color: textMuted,
                  margin: '0 0 7px',
                  fontWeight: 600,
                }}
              >
                Example
              </p>

              <pre
                style={{
                  fontSize: '12px',
                  lineHeight: 1.7,
                  color: darkMode
                    ? '#A9C7F5'
                    : '#24549A',
                  margin: 0,
                  fontFamily:
                    "'SFMono-Regular', Consolas, 'Liberation Mono', monospace",
                  whiteSpace: 'pre-wrap',
                }}
              >
                {selectedProblem.example}
              </pre>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '7px',
                flexWrap: 'wrap',
              }}
            >
              {selectedProblem.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: '10px',
                    fontWeight: 550,
                    color: textSecondary,
                    background: cardBg,
                    border: `1px solid ${border}`,
                    padding: '4px 9px',
                    borderRadius: '5px',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>

          {/* EDITOR */}
          <section
            style={{
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              minHeight: 0,
              background: editorBg,
            }}
          >
            {/* EDITOR BAR */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 16px',
                background: cardBg,
                borderBottom: `1px solid ${border}`,
                flexShrink: 0,
                gap: '12px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  minWidth: 0,
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#16A34A',
                    background: darkMode
                      ? '#0B2115'
                      : '#ECFDF3',
                    border: `1px solid ${
                      darkMode
                        ? '#183B25'
                        : '#C9EAD5'
                    }`,
                    padding: '4px 9px',
                    borderRadius: '5px',
                  }}
                >
                  Python
                </span>

                <span
                  style={{
                    fontSize: '10px',
                    color: textMuted,
                  }}
                >
                  code editor
                </span>

                <span
                  style={{
                    fontSize: '10px',
                    color: textMuted,
                  }}
                >
                  {solvedCount} solved
                </span>

                <span
                  style={{
                    fontSize: '10px',
                    color: brightBlue,
                  }}
                >
                  {totalXP} XP
                </span>

                {lastAction && (
                  <span
                    style={{
                      fontSize: '10px',
                      color: submitted
                        ? '#16A34A'
                        : textMuted,
                    }}
                  >
                    {lastAction}
                  </span>
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '6px',
                  flexShrink: 0,
                }}
              >
                <button
                  type="button"
                  onClick={handleReset}
                  style={{
                    fontSize: '10px',
                    fontWeight: 550,
                    color: textSecondary,
                    background: darkMode
                      ? '#111A27'
                      : '#F4F7FA',
                    border: `1px solid ${border}`,
                    borderRadius: '5px',
                    padding: '5px 10px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Reset
                </button>

                <button
                  type="button"
                  onClick={handleRun}
                  disabled={running}
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    background: running
                      ? '#5277B9'
                      : blue,
                    border: 'none',
                    borderRadius: '5px',
                    padding: '5px 13px',
                    cursor: running
                      ? 'wait'
                      : 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {running ? 'Running...' : 'Run'}
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={running}
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    background: running
                      ? '#5D9271'
                      : '#16803A',
                    border: 'none',
                    borderRadius: '5px',
                    padding: '5px 13px',
                    cursor: running
                      ? 'not-allowed'
                      : 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Submit
                </button>
              </div>
            </div>

            {/* CODE EDITOR */}
            <textarea
              value={code}
              onChange={(event) =>
                setCode(event.target.value)
              }
              spellCheck={false}
              aria-label="Python code editor"
              style={{
                flex: 1,
                minHeight: 0,
                width: '100%',
                background: editorBg,
                border: 'none',
                padding: '15px 17px',
                fontSize: '13px',
                lineHeight: 1.7,
                color: textPrimary,
                fontFamily:
                  "'SFMono-Regular', Consolas, 'Liberation Mono', monospace",
                resize: 'none',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />

            {/* OUTPUT */}
            {output && (
              <div
                style={{
                  background: darkMode
                    ? '#090E14'
                    : '#F8FAFC',
                  borderTop: `1px solid ${border}`,
                  padding: '11px 16px',
                  maxHeight: '125px',
                  overflow: 'auto',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    fontSize: '10px',
                    color: textMuted,
                    fontWeight: 600,
                    marginBottom: '6px',
                  }}
                >
                  OUTPUT
                </div>

                <pre
                  style={{
                    fontSize: '11px',
                    lineHeight: 1.6,
                    color: textSecondary,
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    fontFamily:
                      "'SFMono-Regular', Consolas, 'Liberation Mono', monospace",
                  }}
                >
                  {output}
                </pre>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}
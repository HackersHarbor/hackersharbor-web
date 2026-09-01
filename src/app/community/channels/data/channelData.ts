import type { Channel } from '../types'

export const CHANNELS: Channel[] = [
  {
    id: 'general',
    name: '#general',
    description: 'General community discussion',
    online: 84,
    unread: 3,
  },
  {
    id: 'python',
    name: '#python',
    description: 'Python programming',
    online: 31,
    unread: 0,
  },
  {
    id: 'sql',
    name: '#sql',
    description: 'SQL and databases',
    online: 18,
    unread: 7,
  },
  {
    id: 'dsa',
    name: '#dsa',
    description: 'Data structures and algorithms',
    online: 24,
    unread: 0,
  },
  {
    id: 'jobs',
    name: '#jobs',
    description: 'Jobs, internships and referrals',
    online: 12,
    unread: 12,
  },
  {
    id: 'data-science',
    name: '#data-science',
    description: 'ML, AI and data science',
    online: 29,
    unread: 0,
  },
  {
    id: 'webdev',
    name: '#webdev',
    description: 'Web development',
    online: 15,
    unread: 2,
  },
  {
    id: 'random',
    name: '#random',
    description: 'Off-topic community chat',
    online: 22,
    unread: 0,
  },
  {
    id: 'ai-ml',
    name: '#ai-ml',
    description: 'AI, LLMs and machine learning',
    online: 42,
    unread: 8,
  },
  {
    id: 'typescript',
    name: '#typescript',
    description: 'TypeScript and modern JavaScript',
    online: 27,
    unread: 4,
  },
  {
    id: 'react',
    name: '#react',
    description: 'React, Next.js and frontend',
    online: 35,
    unread: 6,
  },
  {
    id: 'devops',
    name: '#devops',
    description: 'CI/CD, containers and DevOps',
    online: 19,
    unread: 2,
  },
  {
    id: 'cybersecurity',
    name: '#cybersecurity',
    description: 'Security, privacy and CTFs',
    online: 23,
    unread: 5,
  },
  {
    id: 'cloud',
    name: '#cloud',
    description: 'AWS, Azure and cloud systems',
    online: 17,
    unread: 1,
  },
  {
    id: 'opensource',
    name: '#opensource',
    description: 'Open source projects and GitHub',
    online: 14,
    unread: 0,
  },
  {
    id: 'projects',
    name: '#projects',
    description: 'Builds, portfolios and side projects',
    online: 26,
    unread: 3,
  },
]

export const DEFAULT_CHANNEL_ID = 'general'


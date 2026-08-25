'use client'

import { useState } from 'react'
import Image from 'next/image'

const sections = [
  { id: 'harbour', name: 'The Harbour', icon: '🧭', color: '#4A8CFF', bg: '#0C1E3D', desc: 'Forums', count: '248 posts', detail: 'Ask questions, share knowledge, get answers from 20,000+ developers.' },
  { id: 'channels', name: 'Channels', icon: '📻', color: '#00BCD4', bg: '#061A1E', desc: 'Real-time chat', count: '84 online', detail: 'Real-time chat rooms by topic — #python, #sql, #dsa, #jobs.' },
  { id: 'crew', name: 'Crew rooms', icon: '🚢', color: '#B392F0', bg: '#140C1E', desc: 'Study groups', count: '142 rooms', detail: 'Private study groups with video calls and live notebook sync.' },
  { id: 'shiplogs', name: 'Ship logs', icon: '🗺️', color: '#D29922', bg: '#1E1505', desc: 'Articles', count: '340 articles', detail: 'Community-written technical articles and tutorials.' },
  { id: 'wrecks', name: 'Wrecks', icon: '⛈️', color: '#E24B4A', bg: '#1A0A0A', desc: 'Bug reports', count: '53 open', detail: 'Report bugs, wrong content, and feature requests.' },
]

const harbourPosts = [
  { id: 1, title: 'Binary search returning -1 on edge cases?', author: 'Arjun K.', time: '2h ago', votes: 42, replies: 8, solved: false, tags: ['Python', 'DSA'] },
  { id: 2, title: 'How to join 3 SQL tables without duplicates?', author: 'Meera S.', time: '4h ago', votes: 28, replies: 5, solved: true, tags: ['SQL'] },
  { id: 3, title: 'System design for a URL shortener', author: 'Rahul P.', time: '6h ago', votes: 64, replies: 22, solved: false, tags: ['System Design'] },
  { id: 4, title: 'Difference between list and tuple in Python?', author: 'Neha R.', time: '1d ago', votes: 15, replies: 11, solved: true, tags: ['Python', 'Beginner'] },
  { id: 5, title: 'How to prepare for TCS NQT in 2 weeks?', author: 'Karan M.', time: '1d ago', votes: 38, replies: 17, solved: false, tags: ['Interview', 'TCS'] },
]

const channels = [
  { name: '#general', online: 84, last: 'Hey everyone! Just solved my first hard problem 🎉' },
  { name: '#python', online: 31, last: 'Anyone know how to use decorators with async functions?' },
  { name: '#sql', online: 18, last: 'Window functions are so powerful once you get them' },
  { name: '#dsa', online: 24, last: 'DP is clicking for me finally after 3 weeks' },
  { name: '#jobs', online: 12, last: 'Amazon is hiring for SDE-1, 3+ years exp' },
  { name: '#data-science', online: 9, last: 'Anyone using polars instead of pandas?' },
]

const shiplogs = [
  { title: 'Binary search — 5 patterns you must know', author: 'Arjun K.', likes: 142, views: '2.4k', time: '2d ago' },
  { title: 'From SQL beginner to data analyst in 60 days', author: 'Meera S.', likes: 98, views: '1.8k', time: '4d ago' },
  { title: 'Time complexity explained with real examples', author: 'Rahul P.', likes: 74, views: '1.2k', time: '1w ago' },
  { title: 'How I cracked TCS NQT on my first attempt', author: 'Neha R.', likes: 189, views: '3.1k', time: '1w ago' },
]

const wrecks = [
  { title: 'C++ editor crashes on 100+ lines of code', type: 'Bug', votes: 84, status: 'In progress', time: '2d ago' },
  { title: 'Wrong output for linked list reversal problem', type: 'Wrong content', votes: 41, status: 'Fixed', time: '3d ago' },
  { title: 'Dock not saving notebooks on mobile Safari', type: 'Bug', votes: 17, status: 'Reported', time: '4d ago' },
  { title: 'Add dark mode to community pages', type: 'Feature', votes: 63, status: 'Under review', time: '5d ago' },
]

const statusColor: Record<string, string> = {
  'In progress': '#D29922',
  'Fixed': '#3FB950',
  'Reported': '#4A8CFF',
  'Under review': '#B392F0',
}

export default function Community() {
  const [activeSection, setActiveSection] = useState('harbour')
  const [newPost, setNewPost] = useState(false)

  const active = sections.find(s => s.id === activeSection)

  return (
    <div style={{minHeight: '100vh', background: '#080C10', fontFamily: 'system-ui, sans-serif'}}>

      <nav style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: '48px', background: '#0D1520', borderBottom: '0.5px solid #1A2233'}}>
        <a href="/" style={{display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none'}}>
          <Image src="/logo.png" alt="HackersHarbor" width={32} height={32} />
          <span style={{fontSize: '14px', fontWeight: '600', color: '#E2EAF4'}}>Hackers<span style={{color: '#4A8CFF'}}>Harbor</span></span>
        </a>
        <div style={{display: 'flex', gap: '4px'}}>
          {['Dashboard', 'Practice', 'The Voyage', 'The Dock', 'Community'].map(item => (
            <a key={item} href="#" style={{fontSize: '12px', color: item === 'Community' ? '#E2EAF4' : '#5A6E85', padding: '4px 10px', textDecoration: 'none', background: item === 'Community' ? '#111A27' : 'none', borderRadius: '4px'}}>{item}</a>
          ))}
        </div>
        <a href="/dashboard" style={{fontSize: '12px', color: '#4A8CFF', textDecoration: 'none', border: '0.5px solid #1A3A6E', padding: '4px 12px', borderRadius: '4px'}}>Dashboard</a>
      </nav>

      <div style={{padding: '16px 20px', borderBottom: '0.5px solid #1A2233', background: '#090D14'}}>
        <h1 style={{fontSize: '16px', fontWeight: '500', color: '#E2EAF4', marginBottom: '4px'}}>The HackersHarbor community</h1>
        <p style={{fontSize: '12px', color: '#5A6E85', marginBottom: '12px'}}>Ask questions, share knowledge, study with a crew, and report what's broken.</p>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px'}}>
          {sections.map(s => (
            <div
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              style={{background: activeSection === s.id ? s.bg : '#0D1520', border: `0.5px solid ${activeSection === s.id ? s.color + '60' : '#1A2233'}`, borderRadius: '8px', padding: '10px 12px', cursor: 'pointer', borderBottom: activeSection === s.id ? `2px solid ${s.color}` : '2px solid transparent'}}
            >
              <div style={{fontSize: '18px', marginBottom: '4px'}}>{s.icon}</div>
              <div style={{fontSize: '12px', fontWeight: '500', color: activeSection === s.id ? '#E2EAF4' : '#8A9BB5'}}>{s.name}</div>
              <div style={{fontSize: '10px', color: activeSection === s.id ? s.color : '#3A4E63'}}>{s.count}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '200px 1fr 220px'}}>

        <div style={{background: '#0D1520', borderRight: '0.5px solid #1A2233', minHeight: 'calc(100vh - 170px)', padding: '12px 0'}}>
          <div style={{fontSize: '10px', color: '#3A4E63', padding: '0 12px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em'}}>Topics</div>
          {['All topics', 'DSA', 'Python', 'SQL', 'System Design', 'JavaScript', 'Interview Prep', 'Careers', 'General'].map((t, i) => (
            <div key={t} style={{padding: '6px 12px', fontSize: '12px', color: i === 0 ? '#E2EAF4' : '#8A9BB5', cursor: 'pointer', background: i === 0 ? '#111A27' : 'none', borderLeft: i === 0 ? `2px solid ${active?.color}` : '2px solid transparent'}}>
              {t}
            </div>
          ))}
        </div>

        <div style={{padding: '16px'}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px'}}>
            <div>
              <h2 style={{fontSize: '14px', fontWeight: '500', color: '#E2EAF4', marginBottom: '2px'}}>{active?.name}</h2>
              <p style={{fontSize: '12px', color: '#5A6E85'}}>{active?.detail}</p>
            </div>
            <button onClick={() => setNewPost(true)} style={{fontSize: '12px', color: '#fff', background: '#1549C2', border: 'none', borderRadius: '5px', padding: '6px 14px', cursor: 'pointer', fontWeight: '500'}}>
              + New post
            </button>
          </div>

          {activeSection === 'harbour' && (
            <div>
              {harbourPosts.map(post => (
                <div key={post.id} style={{background: '#0D1520', border: '0.5px solid #1A2233', borderRadius: '8px', padding: '12px', marginBottom: '8px', cursor: 'pointer'}}>
                  <div style={{display: 'flex', alignItems: 'flex-start', gap: '10px'}}>
                    <div style={{textAlign: 'center', minWidth: '36px'}}>
                      <div style={{fontSize: '14px', fontWeight: '500', color: '#4A8CFF'}}>{post.votes}</div>
                      <div style={{fontSize: '10px', color: '#3A4E63'}}>votes</div>
                    </div>
                    <div style={{flex: 1}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px'}}>
                        {post.solved && <span style={{fontSize: '10px', color: '#3FB950', background: '#0A1910', border: '0.5px solid #1A3010', padding: '1px 6px', borderRadius: '3px'}}>Solved</span>}
                        <span style={{fontSize: '13px', color: '#E2EAF4', fontWeight: '500'}}>{post.title}</span>
                      </div>
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        {post.tags.map(tag => (
                          <span key={tag} style={{fontSize: '10px', color: '#5A6E85', background: '#111A27', padding: '1px 6px', borderRadius: '3px'}}>{tag}</span>
                        ))}
                        <span style={{fontSize: '11px', color: '#3A4E63'}}>{post.author} · {post.time} · {post.replies} replies</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'channels' && (
            <div>
              {channels.map(ch => (
                <div key={ch.name} style={{background: '#0D1520', border: '0.5px solid #1A2233', borderRadius: '8px', padding: '12px', marginBottom: '8px', cursor: 'pointer'}}>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px'}}>
                    <span style={{fontSize: '13px', fontWeight: '500', color: '#00BCD4'}}>{ch.name}</span>
                    <span style={{fontSize: '10px', color: '#3FB950', display: 'flex', alignItems: 'center', gap: '3px'}}>
                      <span style={{width: '5px', height: '5px', borderRadius: '50%', background: '#3FB950', display: 'inline-block'}} />
                      {ch.online} online
                    </span>
                  </div>
                  <p style={{fontSize: '12px', color: '#5A6E85', margin: 0}}>{ch.last}</p>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'crew' && (
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px'}}>
              {['DSA squad', 'SQL masters', 'Google prep 2026', 'Python beginners', 'System design crew', 'Data science team'].map((room, i) => (
                <div key={room} style={{background: '#0D1520', border: '0.5px solid #1A2233', borderRadius: '8px', padding: '14px', cursor: 'pointer'}}>
                  <div style={{fontSize: '13px', fontWeight: '500', color: '#E2EAF4', marginBottom: '4px'}}>{room}</div>
                  <div style={{fontSize: '11px', color: '#5A6E85', marginBottom: '10px'}}>{[7,11,8,15,6,9][i]} members · {i < 2 ? 'Live now' : 'Open'}</div>
                  <button style={{fontSize: '11px', color: '#B392F0', background: '#140C1E', border: '0.5px solid #2A1A4E', borderRadius: '4px', padding: '4px 10px', cursor: 'pointer', width: '100%'}}>Join crew →</button>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'shiplogs' && (
            <div>
              {shiplogs.map(log => (
                <div key={log.title} style={{background: '#0D1520', border: '0.5px solid #1A2233', borderRadius: '8px', padding: '12px', marginBottom: '8px', cursor: 'pointer'}}>
                  <div style={{fontSize: '13px', fontWeight: '500', color: '#E2EAF4', marginBottom: '6px'}}>{log.title}</div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: '#3A4E63'}}>
                    <span style={{color: '#D29922'}}>by {log.author}</span>
                    <span>❤ {log.likes}</span>
                    <span>👁 {log.views} views</span>
                    <span>{log.time}</span>
                  </div>
                </div>
              ))}
              <button style={{width: '100%', background: '#0D1520', border: '0.5px dashed #1A2233', borderRadius: '8px', padding: '12px', fontSize: '13px', color: '#5A6E85', cursor: 'pointer', marginTop: '4px'}}>
                + Write a Ship log
              </button>
            </div>
          )}

          {activeSection === 'wrecks' && (
            <div>
              {wrecks.map(wreck => (
                <div key={wreck.title} style={{background: '#0D1520', border: '0.5px solid #1A2233', borderRadius: '8px', padding: '12px', marginBottom: '8px', cursor: 'pointer'}}>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px'}}>
                    <span style={{fontSize: '13px', fontWeight: '500', color: '#E2EAF4'}}>{wreck.title}</span>
                    <span style={{fontSize: '10px', padding: '2px 7px', borderRadius: '3px', background: statusColor[wreck.status] + '20', color: statusColor[wreck.status]}}>{wreck.status}</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: '#3A4E63'}}>
                    <span style={{color: '#E24B4A'}}>{wreck.type}</span>
                    <span>▲ {wreck.votes} votes</span>
                    <span>{wreck.time}</span>
                  </div>
                </div>
              ))}
              <button style={{width: '100%', background: '#0D1520', border: '0.5px dashed #1A2233', borderRadius: '8px', padding: '12px', fontSize: '13px', color: '#5A6E85', cursor: 'pointer', marginTop: '4px'}}>
                + Report a Wreck
              </button>
            </div>
          )}
        </div>

        <div style={{borderLeft: '0.5px solid #1A2233', padding: '16px', background: '#090D14'}}>
          <div style={{marginBottom: '16px'}}>
            <div style={{fontSize: '11px', color: '#3A4E63', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em'}}>Community stats</div>
            {[
              { label: 'Members', value: '12,400+', color: '#4A8CFF' },
              { label: 'Online now', value: '84', color: '#3FB950' },
              { label: 'Posts today', value: '47', color: '#D29922' },
              { label: 'Ship logs', value: '340', color: '#B392F0' },
            ].map(stat => (
              <div key={stat.label} style={{display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '0.5px solid #111A27'}}>
                <span style={{fontSize: '12px', color: '#5A6E85'}}>{stat.label}</span>
                <span style={{fontSize: '12px', color: stat.color, fontWeight: '500'}}>{stat.value}</span>
              </div>
            ))}
          </div>

          <div style={{marginBottom: '16px'}}>
            <div style={{fontSize: '11px', color: '#3A4E63', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em'}}>Top contributors</div>
            {['Arjun K.', 'Meera S.', 'Rahul P.', 'Neha R.', 'Karan M.'].map((name, i) => (
              <div key={name} style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0', borderBottom: '0.5px solid #111A27'}}>
                <span style={{fontSize: '11px', color: '#3A4E63', minWidth: '14px'}}>#{i + 1}</span>
                <div style={{width: '22px', height: '22px', borderRadius: '50%', background: ['#0C1E3D', '#0A1910', '#140C1E', '#1E1505', '#061A1E'][i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: ['#4A8CFF', '#3FB950', '#B392F0', '#D29922', '#00BCD4'][i], fontWeight: '600'}}>
                  {name.split(' ').map(n => n[0]).join('')}
                </div>
                <span style={{fontSize: '12px', color: '#8A9BB5'}}>{name}</span>
              </div>
            ))}
          </div>

          <div style={{background: '#0C1E3D', border: '0.5px solid #1A3A6E', borderRadius: '8px', padding: '12px'}}>
            <div style={{fontSize: '12px', fontWeight: '500', color: '#E2EAF4', marginBottom: '4px'}}>Community rules</div>
            <div style={{fontSize: '11px', color: '#5A6E85', lineHeight: '1.6'}}>
              Be respectful. Share knowledge. No spam. Credit sources. Help beginners.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
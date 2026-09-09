'use client'

import { useState } from 'react'
import Image from 'next/image'

const rooms = [
  {
    id: 1,
    name: 'DSA Squad',
    desc: 'Daily DSA practice and problem solving sessions',
    members: 7,
    maxMembers: 10,
    status: 'live',
    type: 'open',
    tags: ['DSA', 'Python', 'Algorithms'],
    host: 'Arjun K.',
    hostInitials: 'AK',
    hostColor: '#0C1E3D',
    topic: 'Working on Dynamic Programming problems',
    duration: '1h 24m',
  },
  {
    id: 2,
    name: 'SQL Masters',
    desc: 'Advanced SQL queries, optimization and database design',
    members: 11,
    maxMembers: 15,
    status: 'live',
    type: 'open',
    tags: ['SQL', 'Database', 'PostgreSQL'],
    host: 'Meera S.',
    hostInitials: 'MS',
    hostColor: '#0A1910',
    topic: 'Window functions deep dive',
    duration: '42m',
  },
  {
    id: 3,
    name: 'Google Prep 2026',
    desc: 'Focused interview preparation for Google SWE roles',
    members: 8,
    maxMembers: 8,
    status: 'live',
    type: 'invite',
    tags: ['FAANG', 'System Design', 'DSA'],
    host: 'Rahul P.',
    hostInitials: 'RP',
    hostColor: '#140C1E',
    topic: 'System design — design YouTube',
    duration: '2h 10m',
  },
  {
    id: 4,
    name: 'Python Beginners',
    desc: 'Safe space for Python beginners to learn and ask questions',
    members: 15,
    maxMembers: 20,
    status: 'live',
    type: 'open',
    tags: ['Python', 'Beginner'],
    host: 'Neha R.',
    hostInitials: 'NR',
    hostColor: '#061A1E',
    topic: 'Functions and scope explained',
    duration: '18m',
  },
  {
    id: 5,
    name: 'System Design Crew',
    desc: 'HLD and LLD case studies for senior engineers',
    members: 6,
    maxMembers: 10,
    status: 'scheduled',
    type: 'open',
    tags: ['System Design', 'HLD', 'LLD'],
    host: 'Karan M.',
    hostInitials: 'KM',
    hostColor: '#1E1505',
    topic: 'Starts in 30 minutes',
    duration: '',
  },
  {
    id: 6,
    name: 'Data Science Team',
    desc: 'ML projects, kaggle competitions and data analysis',
    members: 9,
    maxMembers: 12,
    status: 'scheduled',
    type: 'open',
    tags: ['ML', 'Python', 'Data Science'],
    host: 'Arjun K.',
    hostInitials: 'AK',
    hostColor: '#0C1E3D',
    topic: 'Starts tomorrow 7pm',
    duration: '',
  },
]

const myRooms = [
  { name: 'DSA Squad', status: 'live', members: 7 },
  { name: 'Python Beginners', status: 'live', members: 15 },
]

export default function CrewRooms() {
  const [filter, setFilter] = useState('All')
  const [activeRoom, setActiveRoom] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)
  const [newRoom, setNewRoom] = useState({ name: '', desc: '', type: 'open', maxMembers: '10' })

  const filtered = rooms.filter(r => {
    if (filter === 'Live') return r.status === 'live'
    if (filter === 'Scheduled') return r.status === 'scheduled'
    if (filter === 'Open') return r.type === 'open'
    if (filter === 'My rooms') return myRooms.some(m => m.name === r.name)
    return true
  })

  const joinRoom = (id: number) => setActiveRoom(id)
  const room = rooms.find(r => r.id === activeRoom)

  if (activeRoom && room) {
    return (
      <div style={{height: '100vh', background: '#080C10', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column'}}>
        <nav style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: '48px', background: '#0D1520', borderBottom: '0.5px solid #1A2233', flexShrink: 0}}>
          <a href="/" style={{display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none'}}>
            <Image src="/logo.png" alt="HackersHarbor" width={32} height={32} />
            <span style={{fontSize: '14px', fontWeight: '600', color: '#E2EAF4'}}>Hackers<span style={{color: '#4A8CFF'}}>Harbor</span></span>
          </a>
          <div style={{fontSize: '13px', color: '#E2EAF4', fontWeight: '500'}}>{room.name}</div>
          <button onClick={() => setActiveRoom(null)} style={{fontSize: '12px', color: '#E24B4A', background: '#1A0A0A', border: '0.5px solid #3A1010', borderRadius: '5px', padding: '4px 12px', cursor: 'pointer'}}>Leave room</button>
        </nav>

        <div style={{display: 'grid', gridTemplateColumns: '1fr 240px', flex: 1, overflow: 'hidden'}}>
          <div style={{display: 'flex', flexDirection: 'column', background: '#090D14'}}>
            <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'}}>
              <div style={{textAlign: 'center'}}>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px'}}>
                  {[room.host, 'Meera S.', 'Rahul P.', 'Neha R.', 'Karan M.', 'You'].slice(0, Math.min(room.members, 6)).map((name, i) => (
                    <div key={name} style={{background: '#0D1520', border: '0.5px solid #1A2233', borderRadius: '10px', padding: '16px', textAlign: 'center'}}>
                      <div style={{width: '48px', height: '48px', borderRadius: '50%', background: ['#0C1E3D', '#0A1910', '#140C1E', '#1E1505', '#061A1E', '#1549C2'][i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#E2EAF4', fontWeight: '600', margin: '0 auto 8px'}}>
                        {name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div style={{fontSize: '12px', color: '#E2EAF4'}}>{name}</div>
                      {i === 0 && <div style={{fontSize: '10px', color: '#D29922', marginTop: '2px'}}>Host</div>}
                      {name === 'You' && <div style={{fontSize: '10px', color: '#3FB950', marginTop: '2px'}}>You</div>}
                    </div>
                  ))}
                </div>
                <div style={{fontSize: '13px', color: '#5A6E85', marginBottom: '16px'}}>📍 {room.topic}</div>
                <div style={{display: 'flex', gap: '8px', justifyContent: 'center'}}>
                  {[
                    { icon: '🎤', label: 'Mic', color: '#3FB950' },
                    { icon: '📷', label: 'Camera', color: '#4A8CFF' },
                    { icon: '🖥️', label: 'Screen', color: '#B392F0' },
                    { icon: '📓', label: 'Dock Sync', color: '#D29922' },
                    { icon: '✋', label: 'Raise hand', color: '#00BCD4' },
                  ].map(btn => (
                    <button key={btn.label} style={{background: '#0D1520', border: `0.5px solid ${btn.color}40`, borderRadius: '8px', padding: '10px 14px', cursor: 'pointer', textAlign: 'center', minWidth: '70px'}}>
                      <div style={{fontSize: '18px', marginBottom: '3px'}}>{btn.icon}</div>
                      <div style={{fontSize: '10px', color: btn.color}}>{btn.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{borderTop: '0.5px solid #1A2233', padding: '12px 16px', background: '#0D1520', display: 'flex', alignItems: 'center', gap: '8px'}}>
              <input placeholder="Send a message to the room..." style={{flex: 1, background: '#060A0E', border: '0.5px solid #1A2233', borderRadius: '5px', padding: '7px 10px', fontSize: '12px', color: '#E2EAF4', outline: 'none'}} />
              <button style={{fontSize: '12px', color: '#fff', background: '#1549C2', border: 'none', borderRadius: '5px', padding: '7px 14px', cursor: 'pointer'}}>Send</button>
            </div>
          </div>

          <div style={{background: '#0D1520', borderLeft: '0.5px solid #1A2233', padding: '12px 0', overflow: 'auto'}}>
            <div style={{fontSize: '10px', color: '#3A4E63', padding: '0 12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em'}}>Members — {room.members}</div>
            {[room.host, 'Meera S.', 'Rahul P.', 'Neha R.', 'Karan M.', 'You'].slice(0, room.members).map((name, i) => (
              <div key={name} style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px'}}>
                <div style={{width: '28px', height: '28px', borderRadius: '50%', background: ['#0C1E3D', '#0A1910', '#140C1E', '#1E1505', '#061A1E', '#1549C2'][i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#E2EAF4', fontWeight: '600'}}>
                  {name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div style={{fontSize: '12px', color: '#E2EAF4'}}>{name}</div>
                  {i === 0 && <div style={{fontSize: '10px', color: '#D29922'}}>Host</div>}
                </div>
                <div style={{marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: '#3FB950'}} />
              </div>
            ))}

            <div style={{margin: '12px', borderTop: '0.5px solid #1A2233', paddingTop: '12px'}}>
              <div style={{fontSize: '10px', color: '#3A4E63', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em'}}>Room info</div>
              <div style={{fontSize: '11px', color: '#5A6E85', lineHeight: '1.6'}}>
                <div>Duration: {room.duration}</div>
                <div>Type: {room.type}</div>
                <div style={{marginTop: '6px', color: '#E2EAF4'}}>📍 {room.topic}</div>
              </div>
            </div>

            <div style={{margin: '12px'}}>
              <button style={{width: '100%', background: '#0A1910', color: '#3FB950', border: '0.5px solid #1A3010', borderRadius: '6px', padding: '8px', fontSize: '12px', cursor: 'pointer', marginBottom: '6px'}}>
                📓 Open Dock Sync
              </button>
              <button style={{width: '100%', background: '#1A0A0A', color: '#E24B4A', border: '0.5px solid #3A1010', borderRadius: '6px', padding: '8px', fontSize: '12px', cursor: 'pointer'}}>
                Leave room
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{minHeight: '100vh', background: '#080C10', fontFamily: 'system-ui, sans-serif'}}>
      <nav style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: '48px', background: '#0D1520', borderBottom: '0.5px solid #1A2233'}}>
        <a href="/" style={{display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none'}}>
          <Image src="/logo.png" alt="HackersHarbor" width={32} height={32} />
          <span style={{fontSize: '14px', fontWeight: '600', color: '#E2EAF4'}}>Hackers<span style={{color: '#4A8CFF'}}>Harbor</span></span>
        </a>
        <div style={{display: 'flex', gap: '4px'}}>
          {['Dashboard', 'Practice', 'The Voyage', 'The Dock', 'Community'].map(item => (
            <a key={item} href={item === 'Community' ? '/community' : '#'} style={{fontSize: '12px', color: item === 'Community' ? '#E2EAF4' : '#5A6E85', padding: '4px 10px', textDecoration: 'none', background: item === 'Community' ? '#111A27' : 'none', borderRadius: '4px'}}>{item}</a>
          ))}
        </div>
        <div style={{display: 'flex', gap: '8px'}}>
          <button onClick={() => setCreating(true)} style={{fontSize: '12px', color: '#fff', background: '#1549C2', border: 'none', borderRadius: '5px', padding: '5px 14px', cursor: 'pointer', fontWeight: '500'}}>+ Create room</button>
          <a href="/dashboard" style={{fontSize: '12px', color: '#4A8CFF', textDecoration: 'none', border: '0.5px solid #1A3A6E', padding: '4px 12px', borderRadius: '4px'}}>Dashboard</a>
        </div>
      </nav>

      <div style={{padding: '16px 20px', borderBottom: '0.5px solid #1A2233', background: '#090D14'}}>
        <h1 style={{fontSize: '16px', fontWeight: '500', color: '#E2EAF4', marginBottom: '3px'}}>🚢 Crew rooms</h1>
        <p style={{fontSize: '12px', color: '#5A6E85', marginBottom: '12px'}}>Private study groups with video calls, screen sharing, and live Dock notebook sync.</p>
        <div style={{display: 'flex', gap: '16px', marginBottom: '12px'}}>
          {[{ label: 'Live rooms', value: '4', color: '#E24B4A' }, { label: 'Total members', value: '51', color: '#3FB950' }, { label: 'Scheduled', value: '2', color: '#D29922' }].map(s => (
            <div key={s.label}>
              <span style={{fontSize: '16px', fontWeight: '500', color: s.color}}>{s.value}</span>
              <span style={{fontSize: '12px', color: '#5A6E85', marginLeft: '4px'}}>{s.label}</span>
            </div>
          ))}
        </div>
        <div style={{display: 'flex', gap: '6px'}}>
          {['All', 'Live', 'Scheduled', 'Open', 'My rooms'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{fontSize: '11px', padding: '4px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', background: filter === f ? '#1549C2' : '#0D1520', color: filter === f ? '#fff' : '#5A6E85', borderWidth: '0.5px', borderStyle: 'solid', borderColor: filter === f ? '#1549C2' : '#1A2233'}}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '200px 1fr', minHeight: 'calc(100vh - 180px)'}}>
        <div style={{background: '#0D1520', borderRight: '0.5px solid #1A2233', padding: '12px 0'}}>
          <div style={{fontSize: '10px', color: '#3A4E63', padding: '0 12px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em'}}>My rooms</div>
          {myRooms.map(r => (
            <div key={r.name} style={{padding: '6px 12px', fontSize: '12px', color: '#8A9BB5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <span>{r.name}</span>
              <span style={{fontSize: '10px', color: '#E24B4A', display: 'flex', alignItems: 'center', gap: '3px'}}>
                <span style={{width: '4px', height: '4px', borderRadius: '50%', background: '#E24B4A', display: 'inline-block'}} />
                Live
              </span>
            </div>
          ))}
          <div style={{padding: '10px 12px', marginTop: '8px', borderTop: '0.5px solid #1A2233'}}>
            <div style={{fontSize: '10px', color: '#3A4E63', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em'}}>Topics</div>
            {['DSA', 'Python', 'SQL', 'System Design', 'Interview Prep', 'Data Science'].map(t => (
              <div key={t} style={{padding: '4px 0', fontSize: '12px', color: '#8A9BB5', cursor: 'pointer'}}>{t}</div>
            ))}
          </div>
        </div>

        <div style={{padding: '16px 20px'}}>
          {creating && (
            <div style={{background: '#0D1520', border: '0.5px solid #1549C2', borderRadius: '10px', padding: '16px', marginBottom: '16px'}}>
              <h3 style={{fontSize: '13px', fontWeight: '500', color: '#E2EAF4', marginBottom: '12px'}}>Create a new Crew room</h3>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px'}}>
                <input value={newRoom.name} onChange={e => setNewRoom({...newRoom, name: e.target.value})} placeholder="Room name" style={{background: '#060A0E', border: '0.5px solid #1A2233', borderRadius: '5px', padding: '7px 10px', fontSize: '12px', color: '#E2EAF4', outline: 'none'}} />
                <select value={newRoom.type} onChange={e => setNewRoom({...newRoom, type: e.target.value})} style={{background: '#060A0E', border: '0.5px solid #1A2233', borderRadius: '5px', padding: '7px 10px', fontSize: '12px', color: '#E2EAF4', outline: 'none'}}>
                  <option value="open">Open — anyone can join</option>
                  <option value="invite">Invite only</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <input value={newRoom.desc} onChange={e => setNewRoom({...newRoom, desc: e.target.value})} placeholder="Description" style={{width: '100%', background: '#060A0E', border: '0.5px solid #1A2233', borderRadius: '5px', padding: '7px 10px', fontSize: '12px', color: '#E2EAF4', outline: 'none', boxSizing: 'border-box', marginBottom: '8px'}} />
              <div style={{display: 'flex', gap: '8px'}}>
                <button style={{fontSize: '12px', color: '#fff', background: '#1549C2', border: 'none', borderRadius: '5px', padding: '7px 16px', cursor: 'pointer', fontWeight: '500'}}>Create room</button>
                <button onClick={() => setCreating(false)} style={{fontSize: '12px', color: '#5A6E85', background: 'none', border: '0.5px solid #1A2233', borderRadius: '5px', padding: '7px 16px', cursor: 'pointer'}}>Cancel</button>
              </div>
            </div>
          )}

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px'}}>
            {filtered.map(room => (
              <div key={room.id} style={{background: '#0D1520', border: `0.5px solid ${room.status === 'live' ? '#E24B4A40' : '#1A2233'}`, borderRadius: '10px', overflow: 'hidden'}}>
                <div style={{height: '3px', background: room.status === 'live' ? '#E24B4A' : '#D29922'}} />
                <div style={{padding: '14px'}}>
                  <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px'}}>
                    <div>
                      <div style={{display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px'}}>
                        <span style={{fontSize: '13px', fontWeight: '500', color: '#E2EAF4'}}>{room.name}</span>
                        {room.status === 'live' && (
                          <span style={{fontSize: '9px', color: '#E24B4A', background: '#1A0A0A', border: '0.5px solid #3A1010', borderRadius: '3px', padding: '1px 5px', display: 'flex', alignItems: 'center', gap: '3px'}}>
                            <span style={{width: '4px', height: '4px', borderRadius: '50%', background: '#E24B4A', display: 'inline-block'}} />
                            LIVE
                          </span>
                        )}
                        {room.status === 'scheduled' && (
                          <span style={{fontSize: '9px', color: '#D29922', background: '#1E1505', border: '0.5px solid #3A2A05', borderRadius: '3px', padding: '1px 5px'}}>SOON</span>
                        )}
                        {room.type === 'invite' && (
                          <span style={{fontSize: '9px', color: '#B392F0', background: '#140C1E', border: '0.5px solid #2A1A4E', borderRadius: '3px', padding: '1px 5px'}}>🔒 Invite</span>
                        )}
                      </div>
                      <p style={{fontSize: '11px', color: '#5A6E85', margin: 0}}>{room.desc}</p>
                    </div>
                  </div>

                  <div style={{fontSize: '11px', color: '#4A8CFF', background: '#0C1E3D', borderRadius: '4px', padding: '4px 8px', marginBottom: '10px'}}>
                    📍 {room.topic}
                  </div>

                  <div style={{display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px'}}>
                    {room.tags.map(tag => (
                      <span key={tag} style={{fontSize: '10px', color: '#5A6E85', background: '#111A27', border: '0.5px solid #1A2233', padding: '2px 7px', borderRadius: '3px'}}>{tag}</span>
                    ))}
                  </div>

                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                      <div style={{width: '20px', height: '20px', borderRadius: '50%', background: room.hostColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: '#E2EAF4', fontWeight: '600'}}>
                        {room.hostInitials}
                      </div>
                      <span style={{fontSize: '11px', color: '#5A6E85'}}>Host: {room.host}</span>
                    </div>
                    <span style={{fontSize: '11px', color: room.members >= room.maxMembers ? '#E24B4A' : '#5A6E85'}}>
                      {room.members}/{room.maxMembers} members
                    </span>
                  </div>

                  {room.status === 'live' && room.duration && (
                    <div style={{fontSize: '10px', color: '#3A4E63', marginBottom: '8px'}}>⏱ Running for {room.duration}</div>
                  )}

                  <button
                    onClick={() => joinRoom(room.id)}
                    disabled={room.members >= room.maxMembers && room.type !== 'invite'}
                    style={{width: '100%', background: room.members >= room.maxMembers ? '#111A27' : '#1549C2', color: room.members >= room.maxMembers ? '#5A6E85' : '#fff', border: 'none', borderRadius: '6px', padding: '8px', fontSize: '12px', cursor: room.members >= room.maxMembers ? 'not-allowed' : 'pointer', fontWeight: '500'}}
                  >
                    {room.members >= room.maxMembers ? 'Room full' : room.type === 'invite' ? 'Request to join →' : room.status === 'scheduled' ? 'Set reminder →' : 'Join crew →'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
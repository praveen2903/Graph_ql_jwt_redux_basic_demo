import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import { useDispatch } from 'react-redux'
import { clearCredentials } from '../redux/slices/authSlice'

const MY_SKILLS = gql`
  query Me {
    me {
      id
      username
      skills {
        id
        name
      }
    }
  }
`

export default function SkillsPage() {
  const dispatch = useDispatch()
  const { data, loading, error } = useQuery<{ me: { id: string; username: string; skills: { id: string; name: string }[] } }>(MY_SKILLS)



  return (
    <div style={{ maxWidth: 760, margin: '24px auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>My Skills</h2>
        <button type="button" onClick={() => dispatch(clearCredentials())}>
          Logout
        </button>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'crimson' }}>{error.message}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {(data?.me?.skills ?? []).map((s: any) => (
          <div
            key={s.id}
            style={{ border: '1px solid #e5e4e7', borderRadius: 10, padding: 16, background: 'white' }}
          >
            <div style={{ fontWeight: 700 }}>{s.name}</div>
            <div style={{ opacity: 0.7, marginTop: 6 }}>Skill ID: {s.id}</div>
          </div>
        ))}
      </div>
    </div>
  )
}


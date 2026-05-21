import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { setCredentials } from '../redux/slices/authSlice'
import { useNavigate } from 'react-router-dom'

const LOGIN = gql`
  mutation Login($emailOrUsername: String!, $password: String!) {
    login(emailOrUsername: $emailOrUsername, password: $password) {
      token
      user {
        id
        username
        email
      }
    }
  }
`

const schema = z.object({
  emailOrUsername: z.string().min(3, 'Required'),
  password: z.string().min(6, 'Min 6 characters'),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const [login, { loading }] = useMutation<{ login: { token: string; user: { id: string; username: string; email: string } } }>(LOGIN)

  return (
    <div style={{ maxWidth: 520, margin: '24px auto' }}>
      <h2>Login</h2>
      <form
        onSubmit={handleSubmit(async (values) => {
          const res = await login({ variables: values })
          const payload = res.data?.login
          if (payload?.token && payload.user) {
            dispatch(setCredentials({ token: payload.token, user: payload.user }))
            navigate('/skills')
          }
        })}
      >
        <div style={{ marginBottom: 12 }}>
          <label>Email/Username</label>
          <input {...register('emailOrUsername')} style={{ width: '100%', padding: 8 }} />
          {errors.emailOrUsername && <div style={{ color: 'crimson' }}>{errors.emailOrUsername.message}</div>}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Password</label>
          <input
            type="password"
            {...register('password')}
            style={{ width: '100%', padding: 8 }}
          />
          {errors.password && <div style={{ color: 'crimson' }}>{errors.password.message}</div>}
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  )
}


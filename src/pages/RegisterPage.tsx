import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { useMutation } from '@apollo/client/react'

import { useDispatch } from 'react-redux'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import Select from 'react-select'
import { setCredentials } from '../redux/slices/authSlice'

const AVAILABLE_SKILLS = gql`
  query AvailableSkills {
    availableSkills {
      id
      name
    }
  }
`

const REGISTER = gql`
  mutation Register(
    $username: String!
    $email: String!
    $password: String!
    $securityQuestionId: ID!
    $securityAnswer: String!
    $skillIds: [ID!]!
  ) {
    register(
      username: $username
      email: $email
      password: $password
      securityQuestionId: $securityQuestionId
      securityAnswer: $securityAnswer
      skillIds: $skillIds
    ) {
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
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  securityQuestionId: z.string().min(1),
  securityAnswer: z.string().min(2).max(100),

  // changed here
  skills: z
    .array(
      z.object({
        skillId: z.string().min(1),
      })
    )
    .min(1, 'Select at least 1 skill'),

  gender: z.enum(['male', 'female']).optional(),
})

type FormValues = z.infer<typeof schema>

type SkillOption = { value: string; label: string }

type GenderOption = { value: 'male' | 'female'; label: string }

const genderOptions: GenderOption[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
]

export default function RegisterPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { data, loading } = useQuery<{
    availableSkills: { id: string; name: string }[]
  }>(AVAILABLE_SKILLS)

  const skillsOptions: SkillOption[] = (data?.availableSkills ?? []).map(
    (s: any) => ({
      value: String(s.id),
      label: s.name,
    })
  )

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),

    defaultValues: {
      gender: undefined,

      // changed here
      skills: [{ skillId: '' }],
    },
  })

  // useFieldArray added
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'skills',
  })

  const [registerMutation, { loading: submitting }] = useMutation<{
    register: {
      token: string
      user: {
        id: string
        username: string
        email: string
      }
    }
  }>(REGISTER)

  return (
    <div style={{ maxWidth: 720, margin: '24px auto' }}>
      <h2>Register</h2>

      <form
        onSubmit={handleSubmit(async (values) => {
          const res = await registerMutation({
            variables: {
              username: values.username,
              email: values.email,
              password: values.password,
              securityQuestionId: values.securityQuestionId,
              securityAnswer: values.securityAnswer,

              // changed here
              skillIds: values.skills.map((s) => s.skillId),
            },
          })

          const payload = res.data?.register

          if (payload?.token && payload.user) {
            dispatch(
              setCredentials({
                token: payload.token,
                user: payload.user,
              })
            )

            navigate('/skills')
          }
        })}
      >
        <div style={{ marginBottom: 12 }}>
          <label>Username</label>

          <input
            {...register('username')}
            style={{ width: '100%', padding: 8 }}
          />

          {errors.username && (
            <div style={{ color: 'crimson' }}>
              {errors.username.message}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Email</label>

          <input
            {...register('email')}
            style={{ width: '100%', padding: 8 }}
          />

          {errors.email && (
            <div style={{ color: 'crimson' }}>
              {errors.email.message}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Password</label>

          <input
            type="password"
            {...register('password')}
            style={{ width: '100%', padding: 8 }}
          />

          {errors.password && (
            <div style={{ color: 'crimson' }}>
              {errors.password.message}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Gender (Controller selector)</label>

          <Controller
            control={control}
            name="gender"
            render={({ field }) => (
              <Select
                options={genderOptions}
                value={
                  genderOptions.find(
                    (o) => o.value === field.value
                  ) ?? null
                }
                onChange={(opt) =>
                  field.onChange(opt?.value)
                }
              />
            )}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Security Question ID</label>

          <select
            {...register('securityQuestionId')}
            style={{ width: '100%', padding: 8 }}
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>

          {errors.securityQuestionId && (
            <div style={{ color: 'crimson' }}>
              {errors.securityQuestionId.message}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Security Answer</label>

          <input
            {...register('securityAnswer')}
            style={{ width: '100%', padding: 8 }}
          />

          {errors.securityAnswer && (
            <div style={{ color: 'crimson' }}>
              {errors.securityAnswer.message}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Skills</label>

          {fields.map((field, index) => (
            <div
              key={field.id}
              style={{
                display: 'flex',
                gap: 10,
                marginBottom: 10,
              }}
            >
              <div style={{ flex: 1 }}>
                <Controller
                  control={control}
                  name={`skills.${index}.skillId`}
                  render={({ field }) => (
                    <Select
                      isLoading={loading}
                      options={skillsOptions}
                      value={
                        skillsOptions.find(
                          (o) => o.value === field.value
                        ) ?? null
                      }
                      onChange={(opt) =>
                        field.onChange(opt?.value)
                      }
                    />
                  )}
                />
              </div>

              <button
                type="button"
                onClick={() => remove(index)}
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              append({
                skillId: '',
              })
            }
          >
            Add Skill
          </button>

          {errors.skills && (
            <div style={{ color: 'crimson' }}>
              {errors.skills.message}
            </div>
          )}
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating...' : 'Register'}
        </button>
      </form>
    </div>
  )
}
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { pool } from '../db/pool.js'

import { getSkillsByUserId } from './skills.js'



const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me'

function sha256(text: string) {
  return crypto.createHash('sha256').update(text).digest('hex')
}

function signToken(userId: number) {
  // jsonwebtoken TS types can be strict depending on @types/jsonwebtoken version.
  // Cast the options to keep the demo simple.
  return jwt.sign(
    { sub: userId } as Record<string, unknown>,
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' } as jwt.SignOptions,
  )
}


export async function getUserFromAuthHeader(authHeader?: string | string[]) {
  const token = Array.isArray(authHeader) ? authHeader[0] : authHeader
  if (!token) return null

  const raw = token.startsWith('Bearer ') ? token.slice('Bearer '.length) : token
  try {
    const payload = jwt.verify(raw, JWT_SECRET) as unknown
    const sub = (payload as any)?.sub as number | undefined
    if (!sub) return null
    return { id: String(sub) }
  } catch {
    return null
  }
}

export async function registerUser(args: {
  username: string
  email: string
  password: string
  securityQuestionId: string
  securityAnswer: string
  skillIds: string[]
}) {
  const passwordHash = await bcrypt.hash(args.password, 10)
  const securityAnswerHash = sha256(args.securityAnswer)

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const userInsert = await client.query(
      `INSERT INTO users(username, email, password_hash, security_question_id, security_answer_hash)
       VALUES($1,$2,$3,$4,$5)
       RETURNING id, username, email`,
      [args.username, args.email, passwordHash, Number(args.securityQuestionId), securityAnswerHash],
    )

    const user = userInsert.rows[0]

    // Insert skills
    for (const skillId of args.skillIds) {
      await client.query(
        `INSERT INTO user_skills(user_id, skill_id) VALUES($1,$2) ON CONFLICT DO NOTHING`,
        [user.id, Number(skillId)],
      )
    }

    await client.query('COMMIT')

    const token = signToken(user.id)
    return {
      token,
      user: {
        id: String(user.id),
        username: user.username,
        email: user.email,
        skills: [],
      },
    }
  } catch (e: any) {
    await client.query('ROLLBACK')
    // eslint-disable-next-line no-console
    console.error(e)
    throw new Error('Registration failed. Username/email may already exist.')
  } finally {
    client.release()
  }
}

export async function loginUser(args: { emailOrUsername: string; password: string }) {
  const { rows } = await pool.query(
    `SELECT id, username, email, password_hash
     FROM users
     WHERE email = $1 OR username = $1
     LIMIT 1`,
    [args.emailOrUsername],
  )

  if (rows.length === 0) throw new Error('Invalid credentials')
  const user = rows[0]

  const ok = await bcrypt.compare(args.password, user.password_hash)
  if (!ok) throw new Error('Invalid credentials')

  const token = signToken(user.id)
  return {
    token,
    user: {
      id: String(user.id),
      username: user.username,
      email: user.email,
      skills: [],
    },
  }
}

export async function forgotPassword(email: string) {
  // Basic demo: store reset token hash but do not expose it (email sending omitted)
  const { rows } = await pool.query(`SELECT id FROM users WHERE email = $1`, [email])
  if (rows.length === 0) return true

  const userId = rows[0].id as number

  const resetToken = crypto.randomBytes(32).toString('hex')
  const resetTokenHash = sha256(resetToken)

  await pool.query(
    `INSERT INTO password_resets(user_id, reset_token_hash, expires_at)
     VALUES($1,$2, NOW() + interval '30 minutes')`,
    [userId, resetTokenHash],
  )

  // For demo: store token in console so you can copy from server logs
  // eslint-disable-next-line no-console
  console.log('[DEMO] password reset token:', resetToken)

  return true
}

export async function verifyResetViaSecurityQuestion(args: {
  email: string
  securityAnswer: string
  newPassword: string
  securityQuestionId: string
}) {
  const securityAnswerHash = sha256(args.securityAnswer)

  const { rows } = await pool.query(
    `SELECT id
     FROM users
     WHERE email = $1
       AND security_question_id = $2
       AND security_answer_hash = $3
     LIMIT 1`,
    [args.email, Number(args.securityQuestionId), securityAnswerHash],
  )

  if (rows.length === 0) throw new Error('Security answer or question is incorrect')

  const passwordHash = await bcrypt.hash(args.newPassword, 10)

  await pool.query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [passwordHash, rows[0].id])

  return true
}

export async function getUserSkillsForToken(userId: string) {
  return getSkillsByUserId(userId)
}


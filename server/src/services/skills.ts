import { pool } from '../db/pool.js'


export async function listAllSkills() {
  const { rows } = await pool.query('SELECT id, name FROM skills ORDER BY name ASC')
  return rows.map((r) => ({ id: String(r.id), name: r.name }))
}

export async function getUserById(userId: string) {
  const { rows } = await pool.query('SELECT id, username, email FROM users WHERE id = $1', [Number(userId)])
  if (rows.length === 0) return null
  const r = rows[0]
  return { id: String(r.id), username: r.username, email: r.email }
}

export async function getSkillsByUserId(userId: string) {
  const { rows } = await pool.query(
    `SELECT s.id, s.name
     FROM user_skills us
     JOIN skills s ON s.id = us.skill_id
     WHERE us.user_id = $1
     ORDER BY s.name ASC`,
    [Number(userId)],
  )

  return rows.map((r) => ({ id: String(r.id), name: r.name }))
}


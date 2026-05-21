import { pool } from './pool.js'


export async function ensureSchemaAndSeed() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS skills (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL
    );
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS security_questions (
      id SERIAL PRIMARY KEY,
      question_text TEXT UNIQUE NOT NULL
    );
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      security_question_id INT NOT NULL REFERENCES security_questions(id),
      security_answer_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_skills (
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      skill_id INT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
      PRIMARY KEY (user_id, skill_id)
    );
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      reset_token_hash TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ
    );
  `)

  // Seed skills
  const skills = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'GraphQL']
  for (const s of skills) {
    await pool.query(`INSERT INTO skills(name) VALUES($1) ON CONFLICT(name) DO NOTHING`, [s])
  }

  // Seed security questions
  const questions = [
    'What is your favorite color?',
    'What is the name of your first pet?',
    'What city were you born in?',
  ]
  for (const q of questions) {
    await pool.query(
      `INSERT INTO security_questions(question_text) VALUES($1) ON CONFLICT(question_text) DO NOTHING`,
      [q],
    )
  }
}


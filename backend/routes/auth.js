import { Router } from 'express'
import crypto from 'crypto'
import { pool } from '../services/postgres.js'
import {
  clearSessionCookie,
  createPasswordRecord,
  createSessionToken,
  getAuthenticatedUser,
  getSessionTokenFromRequest,
  normalizeEmail,
  hashSessionToken,
  setSessionCookie,
  verifyPassword,
} from '../services/auth.js'
import requireAuth from '../middleware/requireAuth.js'

const router = Router()

async function createSession(client, userId) {
  const { token, sessionTokenHash, expiresAt } = createSessionToken()
  await client.query(
    `
      INSERT INTO auth_sessions (session_token_hash, user_id, expires_at)
      VALUES ($1, $2, $3)
    `,
    [sessionTokenHash, userId, expiresAt]
  )

  return { token, expiresAt }
}

router.get('/me', async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req)
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    res.json({ user })
  } catch (err) {
    console.error('Auth me error:', err)
    res.status(500).json({ error: 'Failed to load session' })
  }
})

router.post('/register', async (req, res) => {
  const email = normalizeEmail(req.body.email)
  const password = String(req.body.password || '')
  const displayName = String(req.body.displayName || '').trim() || null
  const inviteCode = String(req.body.inviteCode || '').trim()

  if (!email || !password || !inviteCode) {
    return res.status(400).json({ error: 'email, password, and inviteCode are required' })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const inviteResult = await client.query(
      `
        SELECT code, expires_at, claimed_at, display_name
        FROM auth_invites
        WHERE code = $1
        FOR UPDATE
      `,
      [inviteCode]
    )

    const invite = inviteResult.rows[0]
    if (!invite) {
      await client.query('ROLLBACK')
      return res.status(400).json({ error: 'Invalid invite code' })
    }

    if (invite.claimed_at) {
      await client.query('ROLLBACK')
      return res.status(400).json({ error: 'Invite code has already been used' })
    }

    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      await client.query('ROLLBACK')
      return res.status(400).json({ error: 'Invite code has expired' })
    }

    const existingUser = await client.query('SELECT id FROM auth_users WHERE email = $1', [email])
    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK')
      return res.status(409).json({ error: 'An account with that email already exists' })
    }

    const userId = crypto.randomUUID()
    const { salt, hash } = createPasswordRecord(password)

    const userResult = await client.query(
      `
        INSERT INTO auth_users (id, email, display_name, password_salt, password_hash, role)
        VALUES ($1, $2, $3, $4, $5, 'member')
        RETURNING id, email, display_name AS "displayName", role
      `,
      [userId, email, displayName, salt, hash]
    )

    await client.query(
      `
        UPDATE auth_invites
        SET claimed_at = NOW(), claimed_by = $1
        WHERE code = $2
      `,
      [userId, inviteCode]
    )

    const session = await createSession(client, userId)

    await client.query('COMMIT')
    setSessionCookie(res, session.token, session.expiresAt)
    res.status(201).json({ user: userResult.rows[0] })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Auth register error:', err)
    res.status(500).json({ error: 'Failed to create account' })
  } finally {
    client.release()
  }
})

router.get('/invites/:code', async (req, res) => {
  const code = String(req.params.code || '').trim()
  if (!code) {
    return res.status(400).json({ error: 'Invite code is required' })
  }

  try {
    const result = await pool.query(
      `
        SELECT code, display_name AS "displayName", expires_at AS "expiresAt", claimed_at AS "claimedAt"
        FROM auth_invites
        WHERE code = $1
        LIMIT 1
      `,
      [code]
    )

    const invite = result.rows[0]
    if (!invite) {
      return res.status(404).json({ error: 'Invite not found' })
    }

    res.json({ invite })
  } catch (err) {
    console.error('Invite lookup error:', err)
    res.status(500).json({ error: 'Failed to load invite' })
  }
})

router.get('/invites', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }

  try {
    const result = await pool.query(
      `
        SELECT
          code,
          display_name AS "displayName",
          expires_at AS "expiresAt",
          claimed_at AS "claimedAt",
          claimed_by AS "claimedBy",
          created_at AS "createdAt"
        FROM auth_invites
        ORDER BY created_at DESC
      `
    )

    res.json({ invites: result.rows })
  } catch (err) {
    console.error('Invite list error:', err)
    res.status(500).json({ error: 'Failed to load invites' })
  }
})

router.delete('/invites/:code', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }

  const code = String(req.params.code || '').trim()
  if (!code) {
    return res.status(400).json({ error: 'Invite code is required' })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const inviteResult = await client.query(
      `
        SELECT code, claimed_at
        FROM auth_invites
        WHERE code = $1
        FOR UPDATE
      `,
      [code]
    )

    const invite = inviteResult.rows[0]
    if (!invite) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'Invite not found' })
    }

    if (invite.claimed_at) {
      await client.query('ROLLBACK')
      return res.status(409).json({ error: 'Used invites cannot be deleted' })
    }

    await client.query('DELETE FROM auth_invites WHERE code = $1', [code])
    await client.query('COMMIT')

    res.json({ deleted: true, code })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Invite delete error:', err)
    res.status(500).json({ error: 'Failed to delete invite' })
  } finally {
    client.release()
  }
})

router.get('/users', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }

  try {
    const result = await pool.query(
      `
        SELECT
          u.id,
          u.email,
          u.display_name AS "displayName",
          u.role,
          u.created_at AS "createdAt",
          u.updated_at AS "updatedAt",
          u.last_login_at AS "lastLoginAt",
          (
            SELECT COUNT(*)
            FROM auth_invites i
            WHERE i.created_by = u.id
          ) AS "createdInviteCount",
          (
            SELECT COUNT(*)
            FROM auth_invites i
            WHERE i.claimed_by = u.id
          ) AS "claimedInviteCount",
          (
            SELECT COUNT(*)
            FROM auth_sessions s
            WHERE s.user_id = u.id
              AND s.revoked_at IS NULL
              AND s.expires_at > NOW()
          ) AS "activeSessionCount"
        FROM auth_users u
        ORDER BY u.created_at DESC
      `
    )

    res.json({ users: result.rows })
  } catch (err) {
    console.error('User list error:', err)
    res.status(500).json({ error: 'Failed to load users' })
  }
})

router.patch('/users/:id', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }

  const userId = String(req.params.id || '').trim()
  const nextRole = req.body.role
  const nextDisplayName = req.body.displayName === undefined
    ? undefined
    : String(req.body.displayName || '').trim() || null

  if (!userId) {
    return res.status(400).json({ error: 'User id is required' })
  }

  if (nextRole !== undefined && !['admin', 'member'].includes(nextRole)) {
    return res.status(400).json({ error: 'role must be admin or member' })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const targetResult = await client.query(
      `
        SELECT id, role
        FROM auth_users
        WHERE id = $1
        FOR UPDATE
      `,
      [userId]
    )

    const target = targetResult.rows[0]
    if (!target) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'User not found' })
    }

    if (target.id === req.user.id) {
      await client.query('ROLLBACK')
      return res.status(400).json({ error: 'You cannot modify your own account from here' })
    }

    if (target.role === 'admin' && nextRole === 'member') {
      const adminCountResult = await client.query(
        `
          SELECT COUNT(*)::int AS count
          FROM auth_users
          WHERE role = 'admin'
        `
      )

      if (adminCountResult.rows[0].count <= 1) {
        await client.query('ROLLBACK')
        return res.status(409).json({ error: 'At least one admin must remain' })
      }
    }

    const updates = []
    const values = []

    if (nextDisplayName !== undefined) {
      values.push(nextDisplayName)
      updates.push(`display_name = $${values.length}`)
    }

    if (nextRole !== undefined) {
      values.push(nextRole)
      updates.push(`role = $${values.length}`)
    }

    if (updates.length === 0) {
      await client.query('ROLLBACK')
      return res.status(400).json({ error: 'No updates provided' })
    }

    values.push(userId)
    const updated = await client.query(
      `
        UPDATE auth_users
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE id = $${values.length}
        RETURNING
          id,
          email,
          display_name AS "displayName",
          role,
          created_at AS "createdAt",
          updated_at AS "updatedAt",
          last_login_at AS "lastLoginAt"
      `,
      values
    )

    await client.query('COMMIT')
    res.json({ user: updated.rows[0] })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('User update error:', err)
    res.status(500).json({ error: 'Failed to update user' })
  } finally {
    client.release()
  }
})

router.delete('/users/:id', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }

  const userId = String(req.params.id || '').trim()
  if (!userId) {
    return res.status(400).json({ error: 'User id is required' })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const targetResult = await client.query(
      `
        SELECT id, role
        FROM auth_users
        WHERE id = $1
        FOR UPDATE
      `,
      [userId]
    )

    const target = targetResult.rows[0]
    if (!target) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'User not found' })
    }

    if (target.id === req.user.id) {
      await client.query('ROLLBACK')
      return res.status(400).json({ error: 'You cannot delete your own account from here' })
    }

    if (target.role === 'admin') {
      const adminCountResult = await client.query(
        `
          SELECT COUNT(*)::int AS count
          FROM auth_users
          WHERE role = 'admin'
        `
      )

      if (adminCountResult.rows[0].count <= 1) {
        await client.query('ROLLBACK')
        return res.status(409).json({ error: 'At least one admin must remain' })
      }
    }

    await client.query('UPDATE auth_invites SET created_by = NULL WHERE created_by = $1', [userId])
    await client.query('UPDATE auth_invites SET claimed_by = NULL WHERE claimed_by = $1', [userId])
    await client.query('DELETE FROM auth_sessions WHERE user_id = $1', [userId])
    await client.query('DELETE FROM auth_users WHERE id = $1', [userId])

    await client.query('COMMIT')
    res.json({ deleted: true, id: userId })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('User delete error:', err)
    res.status(500).json({ error: 'Failed to delete user' })
  } finally {
    client.release()
  }
})

router.post('/login', async (req, res) => {
  const email = normalizeEmail(req.body.email)
  const password = String(req.body.password || '')

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' })
  }

  const client = await pool.connect()

  try {
    const userResult = await client.query(
      `
        SELECT id, email, display_name AS "displayName", role, password_salt, password_hash
        FROM auth_users
        WHERE email = $1
        LIMIT 1
      `,
      [email]
    )

    const user = userResult.rows[0]
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const passwordOk = verifyPassword(password, user.password_salt, user.password_hash)
    if (!passwordOk) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const session = await createSession(client, user.id)

    await client.query('UPDATE auth_users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1', [user.id])

    setSessionCookie(res, session.token, session.expiresAt)
    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
    })
  } catch (err) {
    console.error('Auth login error:', err)
    res.status(500).json({ error: 'Failed to sign in' })
  } finally {
    client.release()
  }
})

router.post('/logout', async (req, res) => {
  const token = getSessionTokenFromRequest(req)

  try {
    if (token) {
      await pool.query(
        `
          UPDATE auth_sessions
          SET revoked_at = NOW()
          WHERE session_token_hash = $1
        `,
        [hashSessionToken(token)]
      )
    }
  } finally {
    clearSessionCookie(res)
  }

  res.json({ ok: true })
})

router.post('/invites', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }

  const expiresInDays = Number(req.body.expiresInDays || 30)
  const inviteDisplayName = String(req.body.displayName || '').trim() || null
  const inviteCode = crypto.randomBytes(12).toString('base64url')
  const expiresAt = Number.isFinite(expiresInDays) && expiresInDays > 0
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null

  try {
    await pool.query(
      `
        INSERT INTO auth_invites (code, created_by, display_name, expires_at)
        VALUES ($1, $2, $3, $4)
      `,
      [inviteCode, req.user.id, inviteDisplayName, expiresAt]
    )

    res.status(201).json({ inviteCode, displayName: inviteDisplayName, expiresAt })
  } catch (err) {
    console.error('Invite creation error:', err)
    res.status(500).json({ error: 'Failed to create invite' })
  }
})

export default router
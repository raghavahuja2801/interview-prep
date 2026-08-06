import crypto from 'crypto'
import { pool } from './postgres.js'

export const SESSION_COOKIE_NAME = 'ip_session'
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30

const PASSWORD_KEY_LEN = 64

function parseCookies(cookieHeader = '') {
  return cookieHeader.split(';').reduce((acc, pair) => {
    const index = pair.indexOf('=')
    if (index === -1) {
      return acc
    }

    const key = pair.slice(0, index).trim()
    const value = pair.slice(index + 1).trim()
    if (key) {
      acc[key] = decodeURIComponent(value)
    }
    return acc
  }, {})
}

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

export function createPasswordRecord(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(String(password), salt, PASSWORD_KEY_LEN).toString('hex')
  return { salt, hash }
}

export function verifyPassword(password, salt, expectedHash) {
  const actualHash = crypto.scryptSync(String(password), salt, PASSWORD_KEY_LEN).toString('hex')
  const actualBuffer = Buffer.from(actualHash, 'hex')
  const expectedBuffer = Buffer.from(expectedHash, 'hex')

  if (actualBuffer.length !== expectedBuffer.length) {
    return false
  }

  return crypto.timingSafeEqual(actualBuffer, expectedBuffer)
}

export function createSessionToken() {
  const token = crypto.randomBytes(32).toString('base64url')
  const sessionTokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)
  return { token, sessionTokenHash, expiresAt }
}

export function hashSessionToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function getAuthCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.AUTH_COOKIE_SECURE === 'true'

  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    path: '/',
  }
}

export function setSessionCookie(res, token, expiresAt) {
  res.cookie(SESSION_COOKIE_NAME, token, {
    ...getAuthCookieOptions(),
    expires: expiresAt,
  })
}

export function clearSessionCookie(res) {
  res.clearCookie(SESSION_COOKIE_NAME, getAuthCookieOptions())
}

export function getSessionTokenFromRequest(req) {
  const cookies = parseCookies(req.headers.cookie)
  return cookies[SESSION_COOKIE_NAME] || null
}

export async function getAuthenticatedUser(req) {
  const token = getSessionTokenFromRequest(req)
  if (!token) {
    return null
  }

  const tokenHash = hashSessionToken(token)
  const result = await pool.query(
    `
      SELECT
        u.id,
        u.email,
        u.display_name AS "displayName",
        u.role,
        s.expires_at AS "sessionExpiresAt"
      FROM auth_sessions s
      JOIN auth_users u ON u.id = s.user_id
      WHERE s.session_token_hash = $1
        AND s.revoked_at IS NULL
        AND s.expires_at > NOW()
      LIMIT 1
    `,
    [tokenHash]
  )

  return result.rows[0] || null
}
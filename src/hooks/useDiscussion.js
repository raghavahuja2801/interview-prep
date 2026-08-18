import { useEffect, useRef, useState, useCallback } from 'react'
import {
  fetchDiscussionMessages,
  getDiscussionSocketUrl,
  notifyTyping,
} from '../api/discussion.js'

// How long a peer's typing bubble stays visible after their last typing event.
const TYPING_VISIBLE_MS = 2500
// Client-side throttle for how often we announce our own typing.
const TYPING_THROTTLE_MS = 1500

/**
 * Per-problem discussion chat state + WebSocket lifecycle.
 *
 * The WebSocket is the single source of truth for live messages: the server
 * re-broadcasts every persisted message to all subscribers (including the
 * sender), so the client appends from WS events and never double-renders.
 * History is fetched over REST only once, on connect.
 */
export function useDiscussion(problemId, currentUser) {
  const [messages, setMessages] = useState([])
  const [onlineUsers, setOnlineUsers] = useState([])
  const [typingUsers, setTypingUsers] = useState([])
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [historyLoaded, setHistoryLoaded] = useState(false)

  const wsRef = useRef(null)
  const typingTimersRef = useRef(new Map())
  const lastTypingSentRef = useRef(0)
  const reconnectRef = useRef({ attempts: 0 })

  // Clean up typing timers on unmount.
  useEffect(() => {
    const timers = typingTimersRef.current
    return () => {
      for (const t of timers.values()) clearTimeout(t)
      timers.clear()
    }
  }, [])

  const addTypingUser = useCallback((userId, displayName) => {
    setTypingUsers((prev) => {
      if (prev.some((u) => u.userId === userId)) return prev
      return [...prev, { userId, displayName }]
    })
  }, [])

  const removeTypingUser = useCallback((userId) => {
    setTypingUsers((prev) => prev.filter((u) => u.userId !== userId))
  }, [])

  // Refresh the message list once per problem from persistent history.
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setHistoryLoaded(false)

    fetchDiscussionMessages(problemId)
      .then((data) => {
        if (!cancelled) {
          setMessages(data.messages || [])
          setHistoryLoaded(true)
        }
      })
      .catch(() => {
        if (!cancelled) setError('Could not load discussion history')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [problemId])

  // Open / manage the WebSocket for this problem.
  useEffect(() => {
    let disposed = false
    let socket = null

    const connect = () => {
      if (disposed) return

      try {
        socket = new WebSocket(getDiscussionSocketUrl(problemId))
      } catch {
        return
      }
      wsRef.current = socket

      socket.onopen = () => {
        reconnectRef.current.attempts = 0
        setConnected(true)
      }

      socket.onmessage = (event) => {
        let data
        try {
          data = JSON.parse(event.data)
        } catch {
          return
        }

        switch (data.type) {
          case 'message': {
            if (!data.message) break
            setMessages((prev) => {
              const exists = prev.some((m) => m.id === data.message.id)
              return exists ? prev : [...prev, data.message]
            })
            break
          }
          case 'presence:init': {
            setOnlineUsers(data.online || [])
            break
          }
          case 'join': {
            setOnlineUsers((prev) => {
              if (prev.some((u) => u.userId === data.userId)) return prev
              return [...prev, { userId: data.userId, displayName: data.displayName }]
            })
            break
          }
          case 'leave': {
            setOnlineUsers((prev) => prev.filter((u) => u.userId !== data.userId))
            removeTypingUser(data.userId)
            break
          }
          case 'typing': {
            // Ignore our own typing events.
            if (currentUser && data.userId === currentUser.id) break
            addTypingUser(data.userId, data.displayName)

            const timers = typingTimersRef.current
            const existing = timers.get(data.userId)
            if (existing) clearTimeout(existing)
            timers.set(
              data.userId,
              setTimeout(() => {
                timers.delete(data.userId)
                removeTypingUser(data.userId)
              }, TYPING_VISIBLE_MS)
            )
            break
          }
          default:
            break
        }
      }

      socket.onclose = () => {
        if (disposed) return
        setConnected(false)
        setOnlineUsers([])

        // Exponential backoff reconnect while the problem stays mounted.
        const { attempts } = reconnectRef.current
        const delay = Math.min(1000 * 2 ** attempts, 15000)
        reconnectRef.current.attempts = attempts + 1
        setTimeout(connect, delay)
      }

      socket.onerror = () => {
        socket.close()
      }
    }

    connect()

    return () => {
      disposed = true
      if (socket) {
        socket.onclose = null
        socket.close()
      }
      wsRef.current = null
    }
  }, [problemId, currentUser, addTypingUser, removeTypingUser])

  // Announce "currently typing" (throttled client-side).
  const sendTyping = useCallback(() => {
    const now = Date.now()
    if (now - lastTypingSentRef.current < TYPING_THROTTLE_MS) return
    lastTypingSentRef.current = now
    notifyTyping(problemId).catch(() => {})
  }, [problemId])

  return {
    messages,
    onlineUsers,
    typingUsers,
    connected,
    loading,
    historyLoaded,
    error,
    sendTyping,
    setError,
  }
}

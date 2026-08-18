// backend/services/tts.js
//
// Fish Audio text-to-speech wrapper.
//
// Converts the AI interviewer's text reply into audible MP3 audio that the
// backend sends back to the frontend over SSE for playback.
//
// Design notes:
//  - The interviewer text streams token-by-token from DeepSeek. Audio cannot
//    stream at character level (TTS providers synthesise a complete phrase
//    first), so we stream at *sentence* granularity: the backend detects each
//    completed sentence in the incoming text and synthesises + emits it as an
//    `audio` SSE event while the rest of the reply is still being generated.
//    The frontend queues the clips, so speech starts well before the text is
//    done.
//  - Soft-failure: TTS is best-effort. A missing key or a Fish API error only
//    skips that sentence's audio — the text bubble is unaffected.

const FISH_TTS_BASE = 'https://api.fish.audio/v1/tts'

/**
 * Strip lightweight markdown so the TTS voice doesn't read syntax aloud.
 */
function cleanForTts(text) {
  return text
    .replace(/[`*_~]/g, '')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/^>\s*/gm, '')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Split a reply into speech-sized chunks at sentence/line boundaries.
 * Splits after `.`, `!`, `?` followed by whitespace, or on line breaks.
 *
 * @param {string} text
 * @returns {string[]}
 */
export function splitIntoSentences(text) {
  if (!text) return []
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean)
}


/**
 * Synthesise the whole assistant reply as a single base64 MP3 clip.
 *
 * @param {string} text - Full interviewer text.
 * @param {{model?: string, voice?: string}} [opts]
 * @returns {Promise<{ base64: string, encoding: string, mimeType: string }>}
 */
export async function synthesizeReply(text, { model = 's2.1-pro-free', voice = process.env.FISH_VOICE_ID } = {}) {
  const apiKey = process.env.FISH_AUDIO_API_KEY
  if (!apiKey) {
    throw new Error('FISH_AUDIO_API_KEY is not configured on the server')
  }
  if (!text || !text.trim()) {
    throw new Error('No text provided to synthesize')
  }

  const res = await fetch(FISH_TTS_BASE, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      model,
    },
    body: JSON.stringify({
      text: cleanForTts(text),
      format: 'mp3',
      ...(voice ? { reference_id: voice } : {}),
    }),
  })

  if (!res.ok) {
    const errBody = await res.text()
    throw new Error(`Fish Audio TTS error ${res.status}: ${errBody}`)
  }

  const audioAb = await res.arrayBuffer()
  return {
    base64: Buffer.from(audioAb).toString('base64'),
    encoding: 'base64',
    mimeType: 'audio/mpeg',
  }
}

export default synthesizeReply

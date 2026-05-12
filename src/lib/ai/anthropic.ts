import Anthropic from '@anthropic-ai/sdk'

// Client singleton — Anthropic SDK est stateless, on peut le partager
// entre route handlers. La clé est lue depuis ANTHROPIC_API_KEY (env).
let _client: Anthropic | null = null

export function getAnthropic(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null
  if (_client) return _client
  _client = new Anthropic()
  return _client
}

export const COACH_MODEL = 'claude-opus-4-7'

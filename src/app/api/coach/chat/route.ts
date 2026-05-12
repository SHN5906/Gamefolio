import type { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getAnthropic, COACH_MODEL } from '@/lib/ai/anthropic'
import { COACH_SYSTEM_PROMPT } from '@/lib/ai/coach-prompt'

// Route de chat streaming pour Prism, le coach IA.
// - Runtime Node (besoin du SDK Anthropic streaming, donc pas Edge)
// - Cache prompt activé sur le system prompt (~2-3 KB, payé une fois)
// - Le contexte joueur (volatile) est injecté AVANT les messages user,
//   après le cache breakpoint, pour ne pas casser le cache.
export const runtime = 'nodejs'
export const maxDuration = 60

// ── Types ────────────────────────────────────────────────────────────

interface PlayerContext {
  balanceUsd: number
  inventoryCount: number
  inventoryValueUsd: number
  username: string
  /** Top 3 cartes les plus chères de l'inventaire (pour suggestions roue/regrade). */
  topCards?: Array<{ name: string; grade: string; price: number }>
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface RequestBody {
  messages: ChatMessage[]
  context: PlayerContext
}

// ── Helpers ──────────────────────────────────────────────────────────

function buildContextBlock(ctx: PlayerContext): string {
  const lines = [
    `## Contexte du joueur (à utiliser pour personnaliser tes conseils)`,
    ``,
    `- **Pseudo** : ${ctx.username}`,
    `- **Solde** : $${ctx.balanceUsd.toFixed(2)} fictifs`,
    `- **Cartes en inventaire** : ${ctx.inventoryCount}`,
    `- **Valeur totale de l'inventaire** : $${ctx.inventoryValueUsd.toFixed(2)} fictifs`,
  ]
  if (ctx.topCards && ctx.topCards.length > 0) {
    lines.push(``, `### Top cartes du joueur`)
    for (const c of ctx.topCards) {
      lines.push(`- ${c.name} (${c.grade}) — $${c.price.toFixed(2)}`)
    }
  }
  lines.push(``, `Ne resalut pas le joueur à chaque message. Réponds directement à sa question.`)
  return lines.join('\n')
}

function badRequest(message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  })
}

// ── Handler ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<Response> {
  const anthropic = getAnthropic()
  if (!anthropic) {
    return new Response(
      JSON.stringify({
        error:
          "Prism n'est pas configuré sur cette instance (ANTHROPIC_API_KEY manquant). Voir DEPLOY.md.",
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    )
  }

  let body: RequestBody
  try {
    body = (await req.json()) as RequestBody
  } catch {
    return badRequest('JSON invalide')
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return badRequest('messages: array vide ou manquant')
  }
  if (!body.context) {
    return badRequest('context: manquant')
  }

  // Sanity caps pour éviter abuse côté Phase 1 (sans rate-limit serveur).
  // Phase 2 = Upstash Redis + auth Supabase pour limiter par user.
  if (body.messages.length > 30) {
    return badRequest('Conversation trop longue (max 30 tours).')
  }
  for (const m of body.messages) {
    if (typeof m.content !== 'string' || m.content.length > 4000) {
      return badRequest('Message trop long (max 4000 caractères).')
    }
  }

  const contextBlock = buildContextBlock(body.context)

  // Le premier message user = contexte joueur (volatile) + premier message réel.
  // On combine en un seul tour user pour respecter l'alternance.
  const [firstUserMsg, ...restMessages] = body.messages
  const messages: Anthropic.MessageParam[] = [
    {
      role: 'user',
      content: `${contextBlock}\n\n---\n\n${firstUserMsg.content}`,
    },
    ...restMessages.map<Anthropic.MessageParam>(m => ({
      role: m.role,
      content: m.content,
    })),
  ]

  // Stream — l'Opus 4.7 peut prendre quelques secondes pour démarrer,
  // donc on streame pour donner du feedback immédiat à l'UI.
  const stream = anthropic.messages.stream({
    model: COACH_MODEL,
    max_tokens: 1024,
    system: [
      {
        type: 'text',
        text: COACH_SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages,
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ delta: event.delta.text })}\n\n`,
              ),
            )
          }
        }
        // Final message pour les métriques (cache hit, tokens utilisés)
        const final = await stream.finalMessage()
        const usage = final.usage
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              done: true,
              usage: {
                input: usage.input_tokens,
                output: usage.output_tokens,
                cacheRead: usage.cache_read_input_tokens ?? 0,
                cacheWrite: usage.cache_creation_input_tokens ?? 0,
              },
            })}\n\n`,
          ),
        )
        controller.close()
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'unknown error'
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`),
        )
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}

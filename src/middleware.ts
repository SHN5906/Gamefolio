import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes protégées — redirige vers /login si non authentifié
const PROTECTED = ['/dashboard', '/collection', '/add', '/insights', '/wishlist', '/settings']
// Routes publiques — redirige vers /dashboard si déjà connecté
const AUTH_ROUTES = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Le jeu (et la landing) sont publics — pas besoin de toucher à Supabase
  // Ça évite les hangs/échecs réseau quand Supabase est indispo
  if (
    pathname === '/' ||
    pathname.startsWith('/game') ||
    pathname.startsWith('/u/') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/privacy') ||
    pathname.startsWith('/terms')
  ) {
    return NextResponse.next()
  }

  // Si Supabase n'est pas configuré (dev sans .env.local), on laisse passer
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    return NextResponse.next()
  }

  const response = NextResponse.next({ request })

  // Wrap dans un try/catch : si Supabase est injoignable, on laisse passer plutôt que de bloquer
  try {
    const supabase = createServerClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookies) =>
            cookies.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            ),
        },
      }
    )

    // Timeout court : si Supabase ne répond pas en 1.5s, on laisse passer
    const userPromise = supabase.auth.getUser()
    const timeoutPromise = new Promise<{ data: { user: null } }>((resolve) =>
      setTimeout(() => resolve({ data: { user: null } }), 1500)
    )
    const { data: { user } } = await Promise.race([userPromise, timeoutPromise])

    const isProtected = PROTECTED.some((p) => pathname.startsWith(p))
    const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p))

    if (isProtected && !user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (isAuthRoute && user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  } catch (err) {
    // Supabase injoignable → ne pas bloquer la navigation
    console.warn('[middleware] Supabase unreachable, allowing through:', err)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}

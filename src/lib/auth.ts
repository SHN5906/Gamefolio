'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const email    = formData.get('email')    as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Email ou mot de passe incorrect.' }
  }

  redirect('/game')
}

export async function signupAction(formData: FormData) {
  const email    = formData.get('email')    as string
  const password = formData.get('password') as string
  const name     = formData.get('name')     as string

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: name },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Email de confirmation envoyé — on redirige vers une page d'attente
  redirect('/login?confirm=1')
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function getSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

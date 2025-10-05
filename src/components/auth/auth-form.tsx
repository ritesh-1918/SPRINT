"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function AuthForm({ isSignUp = false }: { isSignUp?: boolean }) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    setLoading(true)
    let error = null

    if (isSignUp) {
      const { error: signUpError } = await supabase.auth.signUp({ email, password })
      error = signUpError
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      error = signInError
    }

    if (error) {
      console.error("Authentication error:", error);
      alert(error.message);
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col space-y-4">
      <h1 className="text-2xl font-bold text-center">Welcom to SPRINT</h1>
      <p className="text-center">{isSignUp ? 'Sign up' : 'Sign in'} with your email below</p>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <Input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full"
        />
        <Input
          type="password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full"
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Loading' : (isSignUp ? 'Sign Up' : 'Sign In')}
        </Button>
      </form>
    </div>
  )
}

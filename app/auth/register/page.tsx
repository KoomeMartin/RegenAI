import { redirect } from 'next/navigation'

export default function RegisterPage() {
  // Redirect to dashboard - no signup required
  redirect('/dashboard')
}

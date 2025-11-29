import { redirect } from 'next/navigation'

export default function LoginPage() {
  // Redirect to dashboard - no login required
  redirect('/dashboard')
}

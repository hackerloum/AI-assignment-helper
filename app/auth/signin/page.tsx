import { redirect } from 'next/navigation'

export default function SignInPage() {
  // Redirect to new auth page
  redirect('/login')
}


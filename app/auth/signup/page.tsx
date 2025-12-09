import { redirect } from 'next/navigation';

export default function SignUpPage() {
  // Redirect to new auth page
  redirect('/register')
}


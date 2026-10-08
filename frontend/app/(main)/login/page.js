import LoginForm from '@/components/LoginForm'

export const metadata = {
  title: 'Login',
  description: 'Sign in to your QRCraft account to manage your trackable QR codes and view scan analytics.',
  alternates: { canonical: '/login' },
  robots: { index: false, follow: true },
}

export default function LoginPage() {
  return <LoginForm />
}

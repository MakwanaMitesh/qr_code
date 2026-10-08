import RegisterForm from '@/components/RegisterForm'

export const metadata = {
  title: 'Sign Up',
  description: 'Create a free QRCraft account to save your QR codes, get trackable short links, and view scan analytics.',
  alternates: { canonical: '/register' },
  robots: { index: false, follow: true },
}

export default function RegisterPage() {
  return <RegisterForm />
}

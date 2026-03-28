import Link from 'next/link'
import { Mail } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-8 shadow-xl backdrop-blur-sm text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
            <Mail className="h-8 w-8 text-emerald-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-white">Check your email</h1>
          <p className="mt-4 text-slate-400">
            We&apos;ve sent you a confirmation link. Please check your email to verify your account before signing in.
          </p>

          <div className="mt-8">
            <Link 
              href="/auth/login" 
              className="inline-block rounded-lg bg-slate-700 px-6 py-3 font-medium text-white transition-colors hover:bg-slate-600"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

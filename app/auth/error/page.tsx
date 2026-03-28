import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-8 shadow-xl backdrop-blur-sm text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
          
          {params?.error ? (
            <p className="mt-4 text-slate-400">Error: {params.error}</p>
          ) : (
            <p className="mt-4 text-slate-400">An unspecified error occurred during authentication.</p>
          )}

          <div className="mt-8 flex gap-4 justify-center">
            <Link 
              href="/auth/login" 
              className="inline-block rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-500"
            >
              Try Again
            </Link>
            <Link 
              href="/" 
              className="inline-block rounded-lg bg-slate-700 px-6 py-3 font-medium text-white transition-colors hover:bg-slate-600"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

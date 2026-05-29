import LoginForm from '@/components/login-form'
import { Building2 } from 'lucide-react'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen bg-slate-50">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy-800 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center">
            <Building2 size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-semibold">Asset District</p>
            <p className="text-slate-400 text-sm">Business Strategy Consultancy</p>
          </div>
        </div>
        <div>
          <blockquote className="text-2xl font-light text-white/90 leading-relaxed">
            &ldquo;Track every lead. Close every deal.&rdquo;
          </blockquote>
          <p className="text-slate-400 text-sm mt-4">Your complete CRM for strategy consulting.</p>
        </div>
        <p className="text-slate-500 text-xs">© {new Date().getFullYear()} Asset District</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center">
              <Building2 size={15} className="text-white" />
            </div>
            <p className="font-semibold text-slate-900">Asset District CRM</p>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h1>
          <p className="text-slate-500 text-sm mb-8">Sign in to your CRM</p>

          <LoginForm />
        </div>
      </div>
    </main>
  )
}

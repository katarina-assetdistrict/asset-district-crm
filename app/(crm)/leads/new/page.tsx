import AddLeadForm from '@/components/add-lead-form'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function NewLeadPage() {
  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-6">
        <Link
          href="/pipeline"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ChevronLeft size={16} />
          Back to Pipeline
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Add New Lead</h1>
        <p className="text-slate-500 text-sm mt-0.5">Fill in the details to create a new lead</p>
      </div>
      <AddLeadForm />
    </div>
  )
}

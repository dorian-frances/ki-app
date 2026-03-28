import type { ReactNode } from 'react'

export default function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full flex flex-col items-center px-4 py-6 sm:py-10">
      <div className="w-full max-w-lg">
        {children}
      </div>
    </div>
  )
}

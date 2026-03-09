// src/components/layout/PageContainer.tsx
interface PageContainerProps {
  children: React.ReactNode
  className?: string
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div
      className={`px-4 py-4 ${className}`}
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }}
    >
      {children}
    </div>
  )
}

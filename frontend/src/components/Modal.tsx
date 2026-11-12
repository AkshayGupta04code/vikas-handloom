import { useEffect, type ReactNode } from 'react'

export default function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', k)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', k); document.body.style.overflow = '' }
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`card max-h-[92vh] w-full overflow-y-auto rounded-b-none sm:rounded-b-2xl ${wide ? 'max-w-4xl' : 'max-w-xl'} animate-fadeUp`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-sand/60 bg-white px-5 py-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button className="btn-ghost !px-3 !py-1" onClick={onClose} aria-label="Close">&#10005;</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

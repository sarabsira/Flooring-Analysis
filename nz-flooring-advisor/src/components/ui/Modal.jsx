import { X } from 'lucide-react'
import { useEffect } from 'react'

export default function Modal({ open, onClose, title, children, wide = false }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-forest-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white shadow-2xl rounded-sm w-full animate-fadeIn ${wide ? 'max-w-3xl' : 'max-w-xl'} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 flex-shrink-0">
          <h2 className="font-display text-forest-700 text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-forest-700 transition-colors p-1 rounded-sm hover:bg-stone-100">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

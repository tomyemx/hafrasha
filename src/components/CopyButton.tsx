import { useState } from 'react'

export function CopyButton({ text, label = 'העתקה' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setDone(true)
      setTimeout(() => setDone(false), 1600)
    } catch {
      // נפילה חיננית — בחירת הטקסט ידנית
      setDone(false)
    }
  }
  return (
    <button className="copybtn" onClick={copy} type="button">
      {done ? '✓ הועתק' : `⧉ ${label}`}
    </button>
  )
}

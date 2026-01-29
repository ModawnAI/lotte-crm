'use client'

import { AlertCircle, X } from 'lucide-react'
import { useState } from 'react'

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false)
  
  if (dismissed) return null
  
  return (
    <div className="bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        <span>
          <strong>데모 모드:</strong> 샘플 데이터가 표시됩니다. 실제 데이터베이스를 연결하려면 Supabase 환경변수를 설정하세요.
        </span>
      </div>
      <button 
        onClick={() => setDismissed(true)}
        className="hover:bg-amber-600 rounded p-1"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

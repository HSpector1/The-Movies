// M3 scale-reference entry (validation harness — not the hero scene).
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ScaleRef } from './ScaleRef'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ScaleRef />
  </StrictMode>,
)

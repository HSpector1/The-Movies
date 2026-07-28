// ── M2 entry (isolated asset-survey harness) ──────────────────────────────────
// Separate page from the M1 slice. Renders the Kenney (CC0) sample survey scene.
// Owns no simulation truth and imports nothing from the M1 app.

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { M2Scene } from './M2Scene'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <M2Scene />
  </StrictMode>,
)

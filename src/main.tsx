import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Postcard from './Postcard.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Postcard />
  </StrictMode>,
)

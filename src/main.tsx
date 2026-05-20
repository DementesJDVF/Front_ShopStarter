import './i18n'
import { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './css/globals.css'
import App from './App'
import { registerSW } from 'virtual:pwa-register'

if ('serviceWorker' in navigator) {
  registerSW({ immediate: true })
}

if (typeof globalThis.t !== 'function') {
  globalThis.t = (key: string) => key
}

createRoot(document.getElementById('root')!).render(
    <HelmetProvider>
        <Suspense>
            <App />
        </Suspense>
    </HelmetProvider>
    ,
)

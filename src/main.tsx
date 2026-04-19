import { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './css/globals.css'
import App from './App'


createRoot(document.getElementById('root')!).render(
    <HelmetProvider>
        <Suspense>
            <App />
        </Suspense>
    </HelmetProvider>
    ,
)

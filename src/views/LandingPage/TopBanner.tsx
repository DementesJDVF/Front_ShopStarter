import { useState } from 'react';
import { Link } from 'react-router';
import { Icon } from '@iconify/react';

import FullLogo from '../../layouts/full/shared/logo/FullLogo';

interface NavbarProps {
  // Props can be added here if needed in the future
}

const TopBanner: React.FC<NavbarProps> = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const navLinks = [
    { name: 'Características', href: '#features' },
    { name: 'Cómo funciona', href: '#how-it-works' },
   
  ];

  return (
    <>
      {/* Navbar principal Glassmorphism Premium */}
      <nav className="fixed w-full z-40 bg-white/40 backdrop-blur-xl border-b border-white/30 shadow-[0_4px_30px_rgba(0,0,0,0.05)] dark:bg-gray-900/40 dark:border-gray-800/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 md:h-24 px-1 sm:px-4">
            
            {/* 👈 Logo Unificado - Perfectly aligned and structurally sound */}
            <div className="flex-shrink-0 flex items-center transform hover:scale-[1.02] transition duration-300">
              <FullLogo />
            </div>

            {/* 👉 Enlaces Desktop (ocultos en móvil) */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.href} 
                  className="relative text-gray-700 dark:text-gray-300 font-semibold hover:text-indigo-600 dark:hover:text-indigo-400 transition-all before:content-[''] before:absolute before:-bottom-1 before:left-0 before:w-0 before:h-0.5 before:bg-indigo-600 hover:before:w-full before:transition-all before:duration-300"
                >
                  {link.name}
                </a>
              ))}
              
              <Link 
                to="/auth/login" 
                className="text-gray-700 dark:text-gray-300 font-semibold hover:text-indigo-600 transition tracking-wide"
              >
                Ingresar
              </Link>

              <Link 
                to="/auth/register" 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-full font-bold hover:shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-1 transition-all duration-300 text-center"
              >
                Empezar Gratis
              </Link>
            </div>

            {/* 📱 Botón menú móvil (solo visible en móvil) */}
            <div className="md:hidden flex items-center gap-3">
              <Link 
                to="/auth/register"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2 rounded-full text-sm font-bold shadow-md hover:shadow-lg transform active:scale-95 transition"
              >
                Empezar
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition"
                aria-label="Abrir menú"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* 📱 Overlay + Menú Móvil (Sidebar) */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay oscuro */}
          <div 
            className="fixed inset-0 bg-black/50 z-45 md:hidden" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Panel lateral */}
          <div className="fixed inset-y-0 right-0 z-50 w-64 bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out md:hidden">
            <div className="p-4 flex items-center justify-between border-b dark:border-gray-800">
              <div className="scale-75 origin-left">
                <FullLogo />
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <nav className="p-4 space-y-2">
              {navLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 rounded-lg transition font-medium"
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-4 border-t dark:border-gray-800 space-y-3">
                <Link 
                  to="/auth/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center px-5 py-3 text-gray-700 dark:text-gray-200 font-medium hover:text-indigo-600 transition"
                >
                  Iniciar Sesión
                </Link>
                <Link 
                  to="/auth/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full bg-indigo-600 text-white px-5 py-3 rounded-lg font-medium hover:bg-indigo-700 transition text-center"
                >
                  Empezar Ahora
                </Link>
              </div>
            </nav>
          </div>
        </>
      )}

      {/* Spacer para que el contenido no quede debajo del navbar fijo */}
      <div className="h-16" />
    </>
  );
};

export default TopBanner;
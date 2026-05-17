import { useState } from 'react';
import { Link } from 'react-router';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { useThemeMode } from 'flowbite-react';
import FullLogo from '../../layouts/full/shared/logo/FullLogo';
import { A11yHeaderButton } from '../../components/Accessibility/AccessibilityWidget';
import LanguageSelector from '../../components/LanguageSelector/LanguageSelector';

interface NavbarProps {}

const TopBanner: React.FC<NavbarProps> = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation("landingPage");
  const { mode, toggleMode } = useThemeMode();

  const navLinks = [
    { name: t('nav.features'), href: '#features' },
    { name: t('nav.how_works'), href: '#how-it-works' }
  ];

  return (
    <>
      {/* Navbar principal Glassmorphism Premium */}
      <nav className="fixed w-full z-40 bg-gradient-to-r from-[#000351] to-[#280051] border-b border-white/10 shadow-2xl transition-all duration-500">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-14 md:h-16 px-1 sm:px-2">

            {/* 👈 Logo */}
            <div className="flex-shrink-0 flex items-center transform hover:scale-[1.05] transition duration-500 drop-shadow-lg">
              <FullLogo />
            </div>

            {/* 👉 Enlaces Desktop */}
            <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="relative text-white font-black uppercase tracking-widest text-[10px] lg:text-[11px] hover:text-white/80 transition-all before:content-[''] before:absolute before:-bottom-1 before:left-0 before:w-0 before:h-0.5 before:bg-white hover:before:w-full before:transition-all before:duration-300"
                >
                  {link.name}
                </a>
              ))}

              <Link
                to="/auth/login"
                className="text-white font-black uppercase tracking-widest text-[10px] lg:text-[11px] hover:text-white/80 transition-all"
              >
                {t('nav.login')}
              </Link>

              <Link
                to="/auth/register"
                className="bg-[#51009E] text-white px-4 lg:px-6 py-2 rounded-xl font-black uppercase tracking-widest text-[10px] lg:text-[11px] shadow-[0_0_15px_rgba(81,0,158,0.5)] hover:shadow-[0_0_25px_rgba(81,0,158,0.7)] hover:scale-[1.05] active:scale-95 transition-all duration-300 ring-2 ring-[#51009E]/20"
              >
                {t('nav.register')}
              </Link>

              {/* Separador vertical sutil */}
              <div className="h-6 w-px bg-white/20 mx-1"></div>

              {/* Botón de Modo Oscuro */}
              <button
                onClick={toggleMode}
                className="p-2 rounded-xl text-white hover:bg-white/20 transition-all focus:ring-0"
                aria-label="Toggle Dark Mode"
              >
                <Icon icon={mode === 'dark' ? "solar:sun-bold-duotone" : "solar:moon-stars-bold-duotone"} className="w-5 h-5" />
              </button>

              {/* Selector de Idioma */}
              <LanguageSelector variant="icon" />

              {/* Botón de Accesibilidad */}
              <A11yHeaderButton variant="icon" />


            </div>
            
              <div className="md:hidden flex items-center space-x-2">
                <Link
                  to="/auth/register"
                  className="bg-[#51009E] text-white px-3 py-1.5 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#6a00cc] transition-all duration-300"
                >
                  {t('nav.register')}
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 rounded-xl text-white hover:bg-white/20 transition-colors"
                  aria-label={t('nav.open_menu', 'Abrir menú')}
                >
                  <Icon icon="solar:hamburger-menu-bold-duotone" className="w-6 h-6" />
                </button>
              </div>
          </div>
        </div>
      </nav>

      {/* 📱 Overlay + Menú Móvil (Sidebar) */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-45 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />

           <div className="fixed inset-y-0 right-0 z-50 w-64 sm:w-72 bg-gradient-to-r from-[#000351] to-[#280051] backdrop-blur-3xl shadow-[0_0_50px_rgba(10,1,74,0.3)] transform transition-transform duration-500 ease-in-out md:hidden border-l border-white/20 dark:border-slate-800">
            <div className="p-4 sm:p-6 flex items-center justify-between border-b dark:border-slate-800">
              <div className="scale-75 origin-left">
                <FullLogo variant="dark" />
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 text-white/80 hover:bg-white/10 hover:text-white rounded-xl transition-all"
              >
                <Icon icon="solar:close-circle-linear" className="w-7 h-7" />
              </button>
            </div>

            <nav className="p-4 sm:p-6 space-y-2 sm:space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-white hover:bg-slate-800 hover:text-indigo-600 rounded-2xl transition-all font-black uppercase tracking-widest text-xs"
                >
                  {link.name}
                </a>
              ))}
               <div className="pt-4 sm:pt-6 border-t border-white/10 space-y-3">
                 <Link
                   to="/auth/login"
                   onClick={() => setIsMobileMenuOpen(false)}
                   className="block w-full text-center px-4 py-2.5 text-white/90 hover:text-white hover:bg-white/10 border border-white/20 rounded-xl font-black uppercase tracking-widest text-xs transition-all"
                 >
                   {t('nav.mobile_login')}
                 </Link>
                 <Link
                   to="/auth/register"
                   onClick={() => setIsMobileMenuOpen(false)}
                   className="block w-full bg-[#51009E] text-white px-4 py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-[0_0_15px_rgba(81,0,158,0.5)] hover:shadow-[0_0_25px_rgba(81,0,158,0.7)] active:scale-95 transition-all text-center"
                 >
                   {t('nav.mobile_start')}
                 </Link>
               </div>
               
               {/* Selector de Idioma, Modo Oscuro y Accesibilidad en Mobile */}
               <div className="pt-4 sm:pt-6 border-t border-white/10">
                 <div className="flex items-center gap-2 px-4 sm:px-6">
                   <button
                     onClick={toggleMode}
                     className="p-1.5 rounded-xl hover:bg-white/20 dark:hover:bg-slate-800 text-white transition-all focus:ring-0 flex-1"
                     aria-label="Toggle Dark Mode"
                   >
                     <Icon icon={mode === 'dark' ? "solar:sun-bold-duotone" : "solar:moon-stars-bold-duotone"} className="w-4 h-4" />
                   </button>
                   <LanguageSelector className="flex-1" />
                   <A11yHeaderButton className="flex-1" />
                 </div>
               </div>
            </nav>
          </div>
        </>
      )}

      {/* Spacer para que el contenido no quede debajo del navbar fijo */}
      <div className="h-14 md:h-16" />
    </>
  );
};
export default TopBanner;
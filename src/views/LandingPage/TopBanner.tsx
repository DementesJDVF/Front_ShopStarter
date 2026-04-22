import { useState } from 'react';
import { Link } from 'react-router';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import FullLogo from '../../layouts/full/shared/logo/FullLogo';
import LenguajeSelector from 'src/components/LanguageSelector/LanguageSelector.tsx'; // Cambia la ruta si tu componente está en otro lado

interface NavbarProps {}

const TopBanner: React.FC<NavbarProps> = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation("landingPage");

  const navLinks = [
    { name: t('nav.features'), href: '#features' },
    { name: t('nav.how_works'), href: '#how-it-works' }
  ];

  return (
    <>
      {/* Navbar principal Glassmorphism Premium */}
      <nav className="fixed w-full z-40 bg-white/60 backdrop-blur-2xl border-b border-white/40 shadow-xl dark:bg-gray-900/60 dark:border-gray-800/50 transition-all duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 md:h-24 px-1 sm:px-4">

            {/* 👈 Logo */}
            <div className="flex-shrink-0 flex items-center transform hover:scale-[1.05] transition duration-500 drop-shadow-lg">
              <FullLogo />
            </div>

            {/* 👉 Enlaces Desktop */}
            <div className="hidden md:flex items-center space-x-10">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="relative text-[#0A014A] dark:text-white font-black uppercase tracking-widest text-[11px] hover:text-[#3A17E4] transition-all before:content-[''] before:absolute before:-bottom-1 before:left-0 before:w-0 before:h-0.5 before:bg-[#3A17E4] hover:before:w-full before:transition-all before:duration-300"
                >
                  {link.name}
                </a>
              ))}

              <Link
                to="/auth/login"
                className="text-[#0A014A] dark:text-white font-black uppercase tracking-widest text-[11px] hover:text-[#3A17E4] transition-all"
              >
                {t('nav.login')}
              </Link>

              <Link
                to="/auth/register"
                className="bg-gradient-to-r from-[#3A17E4] via-[#2CD4D9] to-[#0A014A] text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:shadow-[0_10px_30px_rgba(58,23,228,0.3)] hover:scale-[1.05] active:scale-95 transition-all duration-300 shadow-xl"
              >
                {t('nav.register')}
              </Link>

              {/* Selector de Idioma Desktop */}
              <div className="pl-4">
                <LenguajeSelector />
              </div>
            </div>

            {/* 📱 Botón menú móvil */}
            <div className="md:hidden flex items-center gap-3">
              <Link
                to="/auth/register"
                className="bg-gradient-to-r from-[#3A17E4] to-[#0A014A] text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-90 transition"
              >
                {t('nav.register_mini')}
              </Link>
              <LenguajeSelector />
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-xl text-[#0A014A] dark:text-white hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors"
                aria-label={t('nav.open_menu', 'Abrir menú')}
              >
                <Icon icon="solar:hamburger-menu-bold-duotone" className="w-7 h-7" />
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

          <div className="fixed inset-y-0 right-0 z-50 w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl shadow-[0_0_50px_rgba(10,1,74,0.3)] transform transition-transform duration-500 ease-in-out md:hidden border-l border-white/20 dark:border-slate-800">
            <div className="p-6 flex items-center justify-between border-b border-indigo-50 dark:border-slate-800">
              <div className="scale-90 origin-left">
                <FullLogo variant="dark" />
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-[#0A014A] dark:text-white hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl"
              >
                <Icon icon="solar:close-circle-bold-duotone" className="w-7 h-7" />
              </button>
            </div>

            <nav className="p-6 space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-5 py-4 text-[#0A014A] dark:text-white hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-[#3A17E4] rounded-2xl transition-all font-black uppercase tracking-widest text-xs"
                >
                  {link.name}
                </a>
              ))}
              {/* Idioma en móvil */}
              <LenguajeSelector />
              <div className="pt-6 border-t border-indigo-50 space-y-4">
                <Link
                  to="/auth/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center px-5 py-2 text-[#0A014A] dark:text-white font-black uppercase tracking-widest text-xs hover:text-[#3A17E4]"
                >
                  {t('nav.mobile_login')}
                </Link>
                <Link
                  to="/auth/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full bg-gradient-to-r from-[#3A17E4] to-[#0A014A] text-white px-5 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-transform text-center"
                >
                  {t('nav.mobile_start')}
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
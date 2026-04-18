import { useState, useEffect } from "react";
import { Navbar, useThemeMode } from "flowbite-react";
import { Icon } from "@iconify/react";
import { Drawer } from "flowbite-react";
import MobileSidebar from "../sidebar/MobileSidebar";
import Notification from "./notification";
import Profile from "./Profile";
import Cart from "./Cart";
import { useAuth } from "../../../context/AuthContext";
import FullLogo from "../shared/logo/FullLogo";

// --- Animado y Reloj en Tiempo Real ---
const GreetingClock = ({ user }: { user: any }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  
  let greeting = 'Buenas noches';
  let emoji = '🌙';
  let gradient = 'from-indigo-500 to-purple-500';
  
  if (hours >= 5 && hours < 12) {
    greeting = 'Buenos días';
    emoji = '🌅';
    gradient = 'from-orange-400 to-yellow-500';
  } else if (hours >= 12 && hours < 19) {
    greeting = 'Buenas tardes';
    emoji = '☀️';
    gradient = 'from-blue-400 to-cyan-500';
  }

  const timeString = time.toLocaleTimeString('es-CO', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
  
  const dateString = time.toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'short'
  });

  return (
    <div className="flex bg-white/40 dark:bg-slate-900/60 backdrop-blur-xl border border-gray-200/50 dark:border-slate-800/50 rounded-full px-6 py-2.5 items-center gap-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:shadow-black/20 hover:shadow-lg transition-all duration-500 animate-fade-in group">
      
      {/* Saludo y Fecha */}
      <div className="flex flex-col -mt-0.5">
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          {dateString}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-lg transform transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110 origin-bottom-right">{emoji}</span>
          <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
            {greeting}, <span className={`text-transparent bg-clip-text bg-gradient-to-r ${gradient} font-black`}>{user?.first_name || user?.username || user?.role || 'Amigo'}</span>
          </span>
        </div>
      </div>
      
      {/* Separador */}
      <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 group-hover:opacity-50 transition-opacity"></div>

      {/* Reloj Dinámico */}
      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-mono bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full shadow-inner border border-indigo-100/50 dark:border-indigo-500/30">
        <Icon icon="solar:clock-circle-bold-duotone" className="text-xl animate-spin-slow" style={{ animationDuration: '8s' }} />
        <span className="text-base font-black tracking-tight">{timeString}</span>
      </div>
    </div>
  );
};
// -------------------------------------

const Header = () => {
  const [isSticky, setIsSticky] = useState(false);
  const { mode, toggleMode } = useThemeMode();
  const { user } = useAuth();

  // Manejador del scroll para añadir efecto de transparencia y desenfoque (sticky) al bajar la página
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Estado para el sidebar móvil (menú hamburguesa)
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);

  return (
    <>
      <header
        className={`sticky top-0 z-[50] transition-all duration-300 ${isSticky
          ? "bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-100/50 dark:border-slate-800/50 py-2 shadow-sm"
          : "bg-transparent py-4"
          }`}
      >
        <Navbar fluid className="bg-transparent dark:bg-transparent px-4">
          <div className="flex items-center justify-between w-full h-12">
            
            {/* Sección Izquierda: Botón de menú móvil y Logo (Solo visible en móvil) */}
            <div className="flex items-center gap-4 w-1/4">
              <button
                onClick={() => setIsOpen(true)}
                className="h-10 w-10 flex text-gray-600 dark:text-gray-300 xl:hidden hover:text-primary hover:bg-lightprimary rounded-xl justify-center items-center transition-colors shadow-sm bg-white dark:bg-dark-light"
                aria-label="Abrir menú"
              >
                <Icon icon="solar:hamburger-menu-line-duotone" height={22} />
              </button>
              
              <div className="xl:hidden block">
                  <div className="scale-75 origin-left">
                    <FullLogo />
                  </div>
              </div>
            </div>

            {/* 🔥 Sección Central: Reloj Animado Premium (Oculto en móviles peq) */}
            <div className="hidden md:flex flex-1 justify-center">
               <GreetingClock user={user} />
            </div>

            {/* Sección Derecha: Notificaciones, Carrito y Perfil */}
            <div className="flex items-center justify-end gap-2 sm:gap-4 w-1/4">
              
              {user?.role === 'CLIENTE' && (
                <div className="flex items-center">
                  <Cart />
                </div>
              )}

              <div className="flex items-center">
                <Notification />
              </div>

              <button
                onClick={toggleMode}
                className="group h-10 w-10 flex text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-lightprimary dark:hover:bg-slate-800 rounded-full justify-center items-center transition-all duration-500 active:scale-95 bg-gray-50 dark:bg-slate-900 shadow-sm border border-gray-200/50 dark:border-slate-800/50"
                title={mode === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              >
                <div className={`transition-all duration-500 transform ${mode === 'dark' ? 'rotate-180' : 'rotate-0'}`}>
                  {mode === "dark" ? (
                    <Icon icon="solar:sun-2-line-duotone" height={22} className="text-yellow-500 group-hover:scale-110 transition-transform drop-shadow" />
                  ) : (
                    <Icon icon="solar:moon-line-duotone" height={20} className="text-indigo-500 group-hover:scale-110 transition-transform drop-shadow" />
                  )}
                </div>
              </button>

              <div className="h-8 w-[1px] bg-gray-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
              <Profile />
              
            </div>
          </div>
        </Navbar>
      </header>

      <Drawer open={isOpen} onClose={handleClose} className="w-72 p-0">
        <Drawer.Items className="h-full">
          <MobileSidebar />
        </Drawer.Items>
      </Drawer>
    </>
  );
};

export default Header;

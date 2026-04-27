import { useState, useEffect } from "react";
import { Navbar, useThemeMode } from "flowbite-react";
import { Icon } from "@iconify/react";
import { Drawer } from "flowbite-react";
import { useTranslation } from "react-i18next";
import MobileSidebar from "../sidebar/MobileSidebar";
import Notification from "./notification";
import Profile from "./Profile";
import Cart from "./Cart";
import { useAuth } from "../../../context/AuthContext";
import FullLogo from "../shared/logo/FullLogo";
import LanguageSelector from "../../../components/LanguageSelector/LanguageSelector";

// --- Animado y Reloj en Tiempo Real ---
const GreetingClock = ({ user }: { user: any }) => {
  const [time, setTime] = useState(new Date());
  const { t } = useTranslation("header");

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();

  let greeting = t("goodNight");
  let emoji = "🌙";

  if (hours >= 5 && hours < 12) {
    greeting = t("goodMorning");
    emoji = "🌅";
  } else if (hours >= 12 && hours < 19) {
    greeting = t("goodAfternoon");
    emoji = "☀️";
  }

  const locale = t("locale");

  const timeString = time.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const dateString = time.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="flex bg-indigo-50/40 dark:bg-slate-950/80 backdrop-blur-2xl border border-indigo-200/40 dark:border-white/10 rounded-full px-6 py-2.5 items-center gap-6 shadow-2xl hover:shadow-[0_0_30px_rgba(58,23,228,0.2)] hover:scale-[1.02] transition-all duration-500 animate-fade-in group relative overflow-hidden">
      {/* ✨ Efecto de Aura Premium Pulsante */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-[#2CD4D9]/20 to-transparent animate-pulse shadow-[0_0_50px_rgba(44,212,217,0.2)]"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#3A17E4]/20 to-transparent animate-pulse [animation-delay:2s] shadow-[0_0_50px_rgba(58,23,228,0.2)]"></div>
      </div>

      {/* Saludo y Fecha */}
      <div className="flex flex-col -mt-0.5 relative z-10">
        <span className="text-[10px] font-black text-indigo-700 dark:text-white/70 uppercase tracking-[0.2em]">
          {dateString}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-lg transform transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110 origin-bottom-right">
            {emoji}
          </span>
          <span className="text-sm font-bold text-[#0A014A] dark:text-white">
            {greeting},{" "}
            <span className="text-[#3A17E4] dark:text-[#2CD4D9] font-black">
              {user?.first_name || user?.username || user?.role || t("friend")}
            </span>
          </span>
        </div>
      </div>

      {/* Separador */}
      <div className="h-6 w-px bg-white/20 group-hover:opacity-50 transition-opacity relative z-10"></div>

      {/* Reloj Dinámico (Efecto Cristal Inverso) */}
      <div className="flex items-center gap-2 text-[#3A17E4] dark:text-[#2CD4D9] font-mono bg-indigo-100/30 dark:bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full shadow-inner border border-indigo-200/40 dark:border-white/10 relative z-10">
        <Icon
          icon="solar:clock-circle-bold-duotone"
          className="text-xl animate-spin-slow"
          style={{ animationDuration: "8s" }}
        />
        <span className="text-base font-black tracking-tight text-indigo-900 dark:text-white">
          {timeString}
        </span>
      </div>
    </div>
  );
};
// -------------------------------------

const Header = () => {
  const [isSticky, setIsSticky] = useState(false);
  const { mode, toggleMode } = useThemeMode();
  const { user } = useAuth();
  const { t } = useTranslation("header");

  // Manejador del scroll para añadir efecto sticky al bajar la página
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
        className={`sticky top-0 z-[50] transition-all duration-500 ${
          isSticky
            ? "bg-[#0A014A]/60 backdrop-blur-2xl border-b border-[#2CD4D9]/20 py-2 shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
            : "bg-[#0A014A]/30 backdrop-blur-md py-4 border-b border-white/5"
        }`}
      >
        <Navbar fluid className="bg-transparent dark:bg-transparent px-4">
          <div className="flex items-center justify-between w-full h-12">

            {/* Sección Izquierda: Botón de menú móvil y Logo */}
            <div className="flex items-center gap-4 flex-none min-w-[50px] xl:min-w-0">
              <button
                onClick={() => setIsOpen(true)}
                className="h-10 w-10 flex text-white xl:hidden hover:bg-white/10 rounded-xl justify-center items-center transition-all shadow-sm bg-white/10 backdrop-blur-md border border-white/10"
                aria-label={t("openMenu")}
              >
                <Icon
                  icon="solar:hamburger-menu-line-duotone"
                  height={22}
                  className="text-[#2CD4D9]"
                />
              </button>

              <div className="xl:hidden block">
                <div className="scale-75 origin-left">
                  <FullLogo />
                </div>
              </div>
            </div>

            {/* 🔥 Sección Central: Reloj Animado Premium (Oculto en móviles peq) */}
            <div className="hidden lg:flex flex-1 justify-center px-4 overflow-hidden">
              <GreetingClock user={user} />
            </div>

            {/* Sección Derecha: Acciones */}
            <div className="flex items-center justify-end gap-1.5 sm:gap-3 flex-none ml-auto">
              {/* Selector de idioma - Con espacio preventivo */}
              <div className="mr-1">
                <LanguageSelector />
              </div>

              {user?.role === "CLIENTE" && (
                <div className="flex items-center">
                  <Cart />
                </div>
              )}

              <div className="flex items-center">
                <Notification />
              </div>

              {/* Botón de cambio de tema */}
              <button
                onClick={toggleMode}
                className="group h-9 w-9 sm:h-10 sm:w-10 flex text-white hover:bg-white/20 rounded-full justify-center items-center transition-all duration-500 active:scale-95 bg-white/10 shadow-sm border border-white/10 backdrop-blur-sm"
                title={mode === "dark" ? t("switchToLight") : t("switchToDark")}
              >
                <div
                  className={`transition-all duration-500 transform ${
                    mode === "dark" ? "rotate-180" : "rotate-0"
                  }`}
                >
                  {mode === "dark" ? (
                    <Icon
                      icon="solar:sun-2-line-duotone"
                      height={20}
                      className="text-yellow-500 group-hover:scale-110 transition-transform drop-shadow"
                    />
                  ) : (
                    <Icon
                      icon="solar:moon-line-duotone"
                      height={18}
                      className="text-indigo-500 group-hover:scale-110 transition-transform drop-shadow"
                    />
                  )}
                </div>
              </button>

              <div className="h-8 w-[1px] bg-white/10 mx-1 hidden md:block"></div>
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
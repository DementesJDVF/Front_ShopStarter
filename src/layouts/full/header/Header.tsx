import { useState, useEffect } from "react";
import { Navbar, useThemeMode } from "flowbite-react";
import { Icon } from "@iconify/react";
import { Drawer } from "flowbite-react";
import { useTranslation } from "react-i18next";
import MobileSidebar from "../sidebar/MobileSidebar";
import Notification from "./notification";
import Profile from "./Profile";
import { useAuth } from "../../../context/AuthContext";
import FullLogo from "../shared/logo/FullLogo";
import LanguageSelector from "../../../components/LanguageSelector/LanguageSelector";
import { A11yHeaderButton } from "../../../components/Accessibility/AccessibilityWidget";

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
    <div className="flex bg-white/10 dark:bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full px-8 py-3 items-center justify-between w-full shadow-2xl hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:scale-[1.01] transition-all duration-500 animate-fade-in group relative overflow-hidden">
      {/* ✨ Efecto de Aura Premium Pulsante */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-[#2CD4D9]/20 to-transparent animate-pulse shadow-[0_0_50px_rgba(44,212,217,0.2)]"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#3A17E4]/20 to-transparent animate-pulse [animation-delay:2s] shadow-[0_0_50px_rgba(58,23,228,0.2)]"></div>
      </div>

      {/* Saludo y Fecha */}
      <div className="flex flex-col -mt-0.5 relative z-10">
        <span className="text-[10px] font-black text-white/60 dark:text-white/70 uppercase tracking-[0.2em]">
          {dateString}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-lg transform transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110 origin-bottom-right">
            {emoji}
          </span>
          <span className="text-sm font-bold text-white whitespace-nowrap">
            {greeting},{" "}
            <span className="text-[#7a9dff] dark:text-[#9e7aff] font-black">
              {user?.first_name || user?.username || user?.role || t("friend")}
            </span>
          </span>
        </div>
      </div>

      {/* Reloj Dinámico (Efecto Cristal Inverso) */}
      <div className="flex items-center gap-2 text-[#7a9dff] dark:text-[#9e7aff] font-mono bg-white/10 dark:bg-white/5 backdrop-blur-md px-4 py-2 rounded-full shadow-inner border border-white/10 relative z-10 flex-shrink-0">
        <Icon
          icon="solar:clock-circle-bold-duotone"
          className="text-xl animate-spin-slow"
          style={{ animationDuration: "8s" }}
        />
        <span className="text-base font-black tracking-tight text-white whitespace-nowrap">
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
        className={`sticky top-0 z-[50] transition-all duration-500 bg-gradient-to-r from-[#000351] to-[#280051] ${
          isSticky
            ? "backdrop-blur-2xl border-b border-white/10 py-2 shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
            : "py-4 border-b border-white/5"
        }`}
      >
        <Navbar fluid className="bg-transparent dark:bg-transparent px-4">
          <div className="flex items-center justify-between w-full h-12">

            {/* Sección Izquierda: Botón de menú móvil y Logo */}
            <div className="flex items-center gap-2 sm:gap-3 flex-none">
              <button
                onClick={() => setIsOpen(true)}
                className="h-9 w-9 sm:h-10 sm:w-10 flex text-white xl:hidden hover:bg-white/10 rounded-xl justify-center items-center transition-all shadow-sm bg-white/10 backdrop-blur-md border border-white/10"
                aria-label={t("openMenu")}
              >
                <Icon
                  icon="solar:hamburger-menu-line-duotone"
                  height={20}
                  className="text-[#2CD4D9]"
                />
              </button>

              <div className="xl:hidden block">
                <div className="scale-75 sm:scale-90 origin-left">
                  <FullLogo />
                </div>
              </div>
            </div>

            {/* 🔥 Sección Central: Reloj Animado Premium (Solo en pantallas medianas+ para evitar solapamiento) */}
            <div className="hidden md:flex flex-1 justify-center px-4 overflow-hidden md:max-w-md lg:max-w-xl xl:max-w-2xl mx-4 w-full">
              <GreetingClock user={user} />
            </div>

            {/* Sección Derecha: Acciones */}
            <div className="flex items-center justify-end gap-1.5 sm:gap-2 flex-none">
              {/* Selector de idioma - Solo en PC */}
              <div className="hidden md:block">
                <LanguageSelector variant="icon" />
              </div>

              {/* Botón de accesibilidad - Solo en PC */}
              <div className="hidden md:flex">
                <A11yHeaderButton variant="icon" />
              </div>

              {/* Botón de cambio de tema - Solo en PC */}
              <button
                onClick={toggleMode}
                className="p-2 rounded-xl text-white hover:bg-white/20 transition-all focus:ring-0 hidden md:flex items-center justify-center"
                title={mode === "dark" ? t("switchToLight") : t("switchToDark")}
              >
                <Icon
                  icon={mode === "dark" ? "solar:sun-bold-duotone" : "solar:moon-stars-bold-duotone"}
                  className="w-5 h-5 text-white"
                />
              </button>

              <div className="flex items-center">
                <Notification variant="light" />
              </div>

              <div className="h-8 w-[1px] bg-white/10 mx-1 hidden md:block"></div>
              <Profile variant="light" />
            </div>
          </div>
        </Navbar>
      </header>

      <Drawer open={isOpen} onClose={handleClose} className="w-64 p-0 bg-darkgray dark:bg-darkgray !z-[60]">
        <Drawer.Items className="h-full bg-darkgray dark:bg-darkgray">
          <MobileSidebar />
        </Drawer.Items>
      </Drawer>
    </>
  );
};

export default Header;
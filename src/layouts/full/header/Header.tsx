import { useState, useEffect } from "react";
import { Navbar } from "flowbite-react";
import { Icon } from "@iconify/react";
import { Drawer } from "flowbite-react";
import MobileSidebar from "../sidebar/MobileSidebar";
import Notification from "./notification";
import Profile from "./Profile";
import Cart from "./Cart";
import { useAuth } from "../../../context/AuthContext";

const Header = () => {
  const [isSticky, setIsSticky] = useState(false);
  const { user } = useAuth();

  // Manejador del scroll para añadir efecto de transparencia y desenfoque (sticky) al bajar la página
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Estado para el sidebar móvil (menú hamburguesa)
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);

  return (
    <>
      <header
        className={`sticky top-0 z-[50] transition-all duration-300 ${isSticky
          ? "bg-white/80 dark:bg-dark/80 backdrop-blur-md shadow-sm py-2"
          : "bg-white dark:bg-dark py-4"
          }`}
      >
        <Navbar fluid className="bg-transparent dark:bg-transparent px-4">
          <div className="flex items-center justify-between w-full">

            
            {/* Sección Izquierda: Botón de menú móvil y Logo */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsOpen(true)}
                className="h-10 w-10 flex text-gray-600 dark:text-gray-300 xl:hidden hover:text-primary hover:bg-lightprimary rounded-xl justify-center items-center transition-colors"
                aria-label="Abrir menú"
              >
                <Icon icon="solar:hamburger-menu-line-duotone" height={22} />
              </button>
              
              <div className="hidden sm:block">
                 <h2 className="text-lg font-black tracking-tight text-gray-800 dark:text-white uppercase">
                    Shop<span className="text-primary">Starter</span>
                 </h2>
              </div>
            </div>

            {/* Sección Derecha: Notificaciones, Carrito y Perfil */}
            <div className="flex items-center gap-2 sm:gap-4">
              
              {/* Lógica de Rol: El carrito solo se muestra a los Clientes */}
              {user?.role === 'CLIENTE' && (
                <div className="flex items-center">
                  <Cart />
                </div>
              )}

              {/* Las notificaciones son visibles para todos los roles (Vendedor, Cliente, Admin) */}
              <div className="flex items-center">
                <Notification />
              </div>

              {/* Divisor visual */}
              <div className="h-6 w-[1px] bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block"></div>

              {/* Menú desplegable del Perfil de Usuario */}
              <Profile />
              
            </div>
          </div>
        </Navbar>
      </header>

      {/* Menú lateral móvil deslizante */}
      <Drawer open={isOpen} onClose={handleClose} className="w-72 p-0">
        <Drawer.Items className="h-full">
          <MobileSidebar />
        </Drawer.Items>
      </Drawer>
    </>
  );
};

export default Header;

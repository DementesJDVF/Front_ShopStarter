import { Sidebar, useThemeMode } from "flowbite-react";
import SidebarContent from "./Sidebaritems";
import NavItems from "./NavItems";
// @ts-ignore
import SimpleBar from "simplebar-react";
import React from "react";
import FullLogo from "../shared/logo/FullLogo";
import 'simplebar-react/dist/simplebar.min.css';
import Upgrade from "./Upgrade";
import { useAuth } from "../../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { Icon } from "@iconify/react";
import LanguageSelector from "../../../components/LanguageSelector/LanguageSelector";
import { A11yHeaderButton } from "../../../components/Accessibility/AccessibilityWidget";

const MobileSidebar = () => {
  const { user } = useAuth();
  const { t } = useTranslation("sidebar");
  const { mode, toggleMode } = useThemeMode();


  const resolveHeadingText = (heading?: string) => {
    if (!heading) return "";
    const translated = t(heading);
    return translated && translated !== heading ? translated : heading;
  };


  const filteredContent = SidebarContent?.filter(item => {
    if (!user) return false;

    const rawHeading = item.heading ?? "";
    const headingText = resolveHeadingText(rawHeading).toString().trim();
    const normalized = headingText.toUpperCase();

    if (user.role === 'ADMIN') {
      return (
        normalized.includes("ADMIN") ||
        normalized.includes("SISTEMA") ||
        rawHeading === "heading.admin" ||
        rawHeading === "heading.system" ||
        rawHeading === "SISTEMA (UI)"
      );
    }

    if (normalized === user.role) return true;
    if (rawHeading === user.role) return true;

    return false;
  });

  return (
    <>
      <div>
        <Sidebar
          theme={{
            root: {
              base: "h-full bg-transparent transition-all",
              inner: "h-full bg-transparent pt-0 px-0"
            }
          }}
          className="fixed menu-sidebar pt-0 !bg-darkgray transition-all"
          aria-label="Sidebar with multi-level dropdown example"
        >
          <SimpleBar className="bg-darkgray h-[calc(100vh_-_20px)] pt-8">
            <Sidebar.Items className="px-5 mt-2">
              <Sidebar.ItemGroup className="sidebar-nav hide-menu">
                {filteredContent &&
                  filteredContent?.map((item, index) => (
                    <div className="caption" key={item.heading}>
                      <React.Fragment key={index}>
                        <h5 className="bg-darkgray text-link caption font-semibold leading-6 tracking-widest text-white pb-2 uppercase">
                          {t(item.heading ?? "")}
                        </h5>
                        {item.children?.map((child, index) => (
                          <React.Fragment key={child.id && index}>
                              <NavItems item={child} />
                          </React.Fragment>
                        ))}
                      </React.Fragment>
                    </div>
                  ))}
              </Sidebar.ItemGroup>

              {/* Selector de Idioma, Modo Oscuro y Accesibilidad en el Sidebar Móvil */}
              <div className="pt-6 pb-4 border-t border-white/10 mt-6 bg-darkgray">
                <div className="flex items-center gap-3">
                  {/* Botón de Modo Oscuro */}
                  <button
                    onClick={toggleMode}
                    className="p-2.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-all flex-1 flex justify-center items-center bg-white/5 border border-white/10"
                    aria-label="Toggle Dark Mode"
                  >
                    <Icon
                      icon={mode === "dark" ? "solar:sun-2-line-duotone" : "solar:moon-line-duotone"}
                      className="w-5 h-5 text-white"
                    />
                  </button>
                  
                  {/* Selector de Idioma */}
                  <div className="flex-grow min-w-0">
                    <LanguageSelector className="w-full" />
                  </div>
                  
                  {/* Botón de Accesibilidad */}
                  <div className="flex-1 flex justify-center">
                    <A11yHeaderButton className="w-full flex justify-center text-white" />
                  </div>
                </div>
              </div>
            </Sidebar.Items>
          </SimpleBar>

          <Upgrade/>
        </Sidebar>
      </div>
    </>
  );
};

export default MobileSidebar;
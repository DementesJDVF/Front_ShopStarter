import { Sidebar } from "flowbite-react";
import SidebarContent from "./Sidebaritems";
import NavItems from "./NavItems";
// @ts-ignore
import SimpleBar from "simplebar-react";
import React, { useState } from "react";
import NavCollapse from "./NavCollapse";
import { useAuth } from "../../../context/AuthContext";
import { useTranslation } from "react-i18next";

interface SidebarProps {
  isHovered: boolean;
}

const SidebarLayout: React.FC<SidebarProps> = ({ isHovered }) => {
  const { user } = useAuth();
  const { t } = useTranslation("sidebar");

  
  const resolveHeadingText = (heading?: string) => {
    if (!heading) return "";
    const translated = t(heading);
    
    return translated && translated !== heading ? translated : heading;
  };

  
  const filteredContent = SidebarContent?.filter((item) => {
    if (!user) return false;

    const rawHeading = item.heading ?? "";
    const headingText = resolveHeadingText(rawHeading).toString().trim();
    const normalized = headingText.toUpperCase();

    
    if (user.role === "ADMIN") {

      return (
        normalized.includes("ADMIN") ||
        normalized.includes("SISTEMA") ||
        rawHeading === "heading.admin" ||
        rawHeading === "heading.system"
      );
    }

    if (normalized === user.role) return true;

    if (rawHeading === user.role) return true;

    return false;
  });

  const isCollapsed = !isHovered;

  return (
    <Sidebar
      theme={{
        root: {
          base: "h-full bg-transparent transition-all duration-300",
          inner: "h-full overflow-y-auto overflow-x-hidden bg-transparent py-4 px-3"
        }
      }}
      className={`transition-all duration-300 ease-in-out ${isHovered ? 'w-64' : 'w-20'}`}
      aria-label="Sidebar"
    >
      <SimpleBar className="h-full overflow-x-hidden backdrop-blur-sm">
        <Sidebar.Items className={`${isCollapsed ? 'px-1' : 'px-4'} transition-all duration-300 pt-2`}>
          <Sidebar.ItemGroup className="sidebar-nav">
            {filteredContent?.map((item, index) => (
              <div className="mb-6 pt-2" key={item.heading ?? index}>
                {!isCollapsed && (
                  <h5 className="text-white/40 font-black text-[11px] mb-4 uppercase tracking-[0.2em] transition-opacity duration-300 px-2">
                    {t(item.heading ?? "")}
                  </h5>
                )}
                {item.children?.map((child, idx) => (
                  <div key={child.id || idx} className="mb-1">
                    {child.children ? (
                      <NavCollapse item={child} isCollapsed={isCollapsed} />
                    ) : (
                      <NavItems item={child} isCollapsed={isCollapsed} />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </Sidebar.ItemGroup>
        </Sidebar.Items>
      </SimpleBar>
    </Sidebar>
  );
};

export default SidebarLayout;
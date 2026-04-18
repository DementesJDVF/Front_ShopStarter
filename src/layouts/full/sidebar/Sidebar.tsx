
import {  Sidebar } from "flowbite-react";
import SidebarContent from "./Sidebaritems";
import NavItems from "./NavItems";
// @ts-ignore
import SimpleBar from "simplebar-react";
import React, { useState } from "react";
import NavCollapse from "./NavCollapse";
import { useAuth } from "../../../context/AuthContext";

interface SidebarProps {
  isHovered: boolean;
}

const SidebarLayout: React.FC<SidebarProps> = ({ isHovered }) => {
  const { user } = useAuth();

  // Filtrar contenido del sidebar según el ROL
  const filteredContent = SidebarContent?.filter(item => {
    if (!user) return false;
    
    // El admin ve su sección y la sección de SISTEMA (UI)
    if (user.role === 'ADMIN') {
      return item.heading === 'ADMIN' || item.heading === 'SISTEMA (UI)';
    }
    
    // Otros roles ven su sección correspondiente
    return item.heading === user.role;
  });

  const isCollapsed = !isHovered;

  return (
    <Sidebar
      className={`bg-transparent dark:bg-transparent transition-all duration-300 ease-in-out ${isHovered ? 'w-64' : 'w-20'}`}
      aria-label="Sidebar"
    >
      <SimpleBar className="h-full overflow-x-hidden backdrop-blur-sm">
        <Sidebar.Items className={`${isCollapsed ? 'px-1' : 'px-4'} transition-all duration-300 pt-2`}>
          <Sidebar.ItemGroup className="sidebar-nav">
            {filteredContent?.map((item, index) => (
              <div className="mb-6 pt-2" key={item.heading || index}>
                {!isCollapsed && (
                  <h5 className="text-gray-400 dark:text-gray-500 font-bold text-[11px] mb-4 uppercase tracking-[0.15em] opacity-100 transition-opacity duration-300 px-2">
                    {item.heading}
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

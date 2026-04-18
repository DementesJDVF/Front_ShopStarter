import { FC, useState } from 'react';
import { Outlet } from "react-router";
import ScrollToTop from 'src/components/shared/ScrollToTop';
import Sidebar from './sidebar/Sidebar';
import Header from './header/Header';
import FloatingAssistant from 'src/components/chat/FloatingAssistant';
import FullLogo from './shared/logo/FullLogo';

const FullLayout: FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <>
      <div className="flex w-full min-h-screen bg-lightgray dark:bg-darkgray overflow-hidden">
        {/* Desktop Sidebar Column */}
        <aside 
          className={`xl:block hidden sticky top-0 h-screen z-40 transition-all duration-300 ease-in-out bg-white dark:bg-darkgray border-r border-gray-100 dark:border-gray-800 ${isHovered ? 'w-64' : 'w-20'}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="flex flex-col h-full">
            {/* Logo Section - Sticky & Centered */}
          <div className={`flex items-center justify-center h-[100px] border-b border-gray-100 dark:border-gray-800 transition-all duration-300`}>
            <FullLogo isCollapsed={!isHovered} />
          </div>
            
            {/* Navigation Area */}
            <div className="flex-grow overflow-y-auto custom-scrollbar">
              <Sidebar isHovered={isHovered} />
            </div>
          </div>
        </aside>

        {/* Main Content Column */}
        <div className="flex flex-col flex-grow min-h-screen relative overflow-hidden">
          {/* Global Header (Actions & Mobile Menu) */}
          <Header /> 
          
          {/* Page Outlet */}
          <main className="flex-grow p-4 md:p-8 overflow-y-auto custom-scrollbar bg-gray-50/50 dark:bg-transparent">
            <ScrollToTop>
              <div className="container-fluid mx-auto max-w-[1600px] animate-fade-in">
                <Outlet />
              </div>
            </ScrollToTop>
          </main>
        </div>
      </div>
      <FloatingAssistant />
    </>
  );
};

export default FullLayout;

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
      <div className="flex w-full min-h-screen bg-transparent relative overflow-hidden">
        
        {/* ✨ ATMÓSFERA GLOBAL: SEDA GALÁCTICA (SOLO MODO CLARO) */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-gradient-to-br from-[#E0E7FF] via-[#F1F5FF] to-[#E0F2FE] dark:hidden">
          {/* Blobs Maestra: Máxima Cobertura y Saturación */}
          <div className="absolute top-[-25%] left-[-25%] w-[130vw] h-[130vw] bg-indigo-500/25 rounded-full blur-[220px] animate-blob transition-all duration-700"></div>
          <div className="absolute top-[20%] right-[-40%] w-[120vw] h-[120vw] bg-[#2CD4D9]/25 rounded-full blur-[240px] animate-blob [animation-delay:4s]"></div>
          <div className="absolute bottom-[-40%] left-[10%] w-[110vw] h-[110vw] bg-purple-500/20 rounded-full blur-[200px] animate-blob [animation-delay:2s]"></div>
          
          {/* Textura de Seda Sutil */}
          <div className="absolute inset-0 opacity-[0.08] bg-[url('https://www.transparenttextures.com/patterns/grilled-noise.png')]"></div>
        </div>

        {/* ✨ CAPA DE ESTRELLAS UNIVERSAL (VISIBLE EN MODO CLARO Y OSCURO) */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-40">
            {/* Estrellas Parpadeantes */}
            <div className="absolute top-[10%] left-[15%] w-1 h-1 bg-white rounded-full animate-twinkle shadow-[0_0_8px_white]"></div>
            <div className="absolute top-[25%] left-[85%] w-1.5 h-1.5 bg-white rounded-full animate-twinkle [animation-delay:1s] shadow-[0_0_10px_white]"></div>
            <div className="absolute top-[45%] left-[35%] w-1 h-1 bg-white rounded-full animate-twinkle [animation-delay:2s] shadow-[0_0_8px_white]"></div>
            <div className="absolute top-[65%] left-[75%] w-1.5 h-1.5 bg-white rounded-full animate-twinkle [animation-delay:1.5s] shadow-[0_0_10px_white]"></div>
            <div className="absolute top-[85%] left-[25%] w-1 h-1 bg-white rounded-full animate-twinkle [animation-delay:2.5s] shadow-[0_0_8px_white]"></div>
            
            {/* Estrellas Fugaces (Meteoros) */}
            <div className="absolute top-[5%] left-[10%] w-[100px] h-[1.5px] bg-gradient-to-r from-white to-transparent animate-shooting"></div>
            <div className="absolute top-[50%] left-[60%] w-[120px] h-[1.5px] bg-gradient-to-r from-white to-transparent animate-shooting [animation-delay:7s]"></div>
          </div>
        </div>

        {/* Desktop Sidebar Column (Fondo Infinito con Efecto Galáctico) */}
        <div className={`xl:block hidden bg-[#0A014A] transition-all duration-300 relative border-r border-white/5 z-20 ${isHovered ? 'w-64' : 'w-20'}`}>
          {/* ✨ Capa Maestra de Galaxia (Cubre todo el alto del Track) */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A014A] via-[#1A0B6A] to-[#3A17E4] opacity-100">
            {/* Estrellas Estáticas Repartidas por el Track */}
            <div className="absolute top-[5%] left-[10%] w-1 h-1 bg-white rounded-full animate-twinkle shadow-[0_0_5px_white]"></div>
            <div className="absolute top-[15%] left-[80%] w-1.5 h-1.5 bg-white rounded-full animate-twinkle [animation-delay:1s] shadow-[0_0_8px_white]"></div>
            <div className="absolute top-[35%] left-[25%] w-1 h-1 bg-white rounded-full animate-twinkle [animation-delay:2s] shadow-[0_0_5px_white]"></div>
            <div className="absolute top-[55%] left-[75%] w-1 h-1 bg-white rounded-full animate-twinkle [animation-delay:3s] shadow-[0_0_5px_white]"></div>
            <div className="absolute top-[75%] left-[15%] w-1.5 h-1.5 bg-white rounded-full animate-twinkle [animation-delay:1.5s] shadow-[0_0_8px_white]"></div>
            <div className="absolute top-[95%] left-[65%] w-1 h-1 bg-white rounded-full animate-twinkle [animation-delay:2.5s] shadow-[0_0_5px_white]"></div>
            
            {/* Estrellas Fugaces en el Track */}
            <div className="absolute top-[10%] left-[10%] w-[60px] h-[1.5px] bg-gradient-to-r from-white to-transparent animate-shooting"></div>
            <div className="absolute top-[60%] left-[30%] w-[80px] h-[1.5px] bg-gradient-to-r from-white to-transparent animate-shooting [animation-delay:4s]"></div>
          </div>

          <aside 
            className={`sticky top-0 h-screen z-40 transition-all duration-300 ease-in-out relative overflow-hidden bg-transparent`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="flex flex-col h-full relative z-10">
              {/* Logo Section - Sticky & Centered */}
              <div className={`flex items-center justify-center h-[100px] border-b border-white/10 transition-all duration-300`}>
                <FullLogo isCollapsed={!isHovered} variant="light" />
              </div>
              
              {/* Navigation Area */}
              <div className="flex-grow overflow-y-auto custom-scrollbar">
                <Sidebar isHovered={isHovered} />
              </div>
            </div>
          </aside>
        </div>

        {/* Main Content Column */}
        <div className="flex flex-col flex-grow min-w-0 min-h-screen relative z-10 bg-transparent dark:bg-darkgray">
          {/* Global Header (Actions & Mobile Menu) */}
          <Header /> 
          
          {/* Page Outlet */}
          <main className="flex-grow p-4 md:p-6 bg-transparent relative overflow-x-hidden">
            <ScrollToTop>
              <div className="w-full max-w-[1400px] mx-auto animate-fade-in relative z-10">
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
import FullLogo from "src/layouts/full/shared/logo/FullLogo";
import AuthRegister from "../authforms/AuthRegister";
import { Link } from "react-router";
import { Icon } from "@iconify/react";

const Register = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent dark:bg-slate-950 font-sans selection:bg-indigo-500/30">
      
      {/* ✨ EFECTO DE FONDO: SEDA GALÁCTICA (SOLO MODO CLARO) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-gradient-to-br from-[#E0E7FF] via-[#F1F5FF] to-[#E0F2FE] dark:hidden">
        {/* Blobs Maestra: Máxima Cobertura y Saturación */}
        <div className="absolute top-[-25%] left-[-25%] w-[130vw] h-[130vw] bg-indigo-500/30 rounded-full blur-[220px] animate-blob transition-all duration-700"></div>
        <div className="absolute top-[20%] right-[-40%] w-[120vw] h-[120vw] bg-[#2CD4D9]/30 rounded-full blur-[240px] animate-blob [animation-delay:4s]"></div>
        <div className="absolute bottom-[-40%] left-[10%] w-[110vw] h-[110vw] bg-purple-500/25 rounded-full blur-[200px] animate-blob [animation-delay:2s]"></div>
        
        {/* Textura de Seda Sutil Reforzada */}
        <div className="absolute inset-0 opacity-[0.1] bg-[url('https://www.transparenttextures.com/patterns/grilled-noise.png')]"></div>
      </div>

      {/* ✨ CAPA DE ESTRELLAS UNIVERSAL (VISIBLE EN MODO CLARO Y OSCURO) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-50">
          <div className="absolute top-[20%] left-[20%] w-1 h-1 bg-white rounded-full animate-twinkle shadow-[0_0_8px_white]"></div>
          <div className="absolute top-[40%] left-[80%] w-1.5 h-1.5 bg-white rounded-full animate-twinkle [animation-delay:2s] shadow-[0_0_10px_white]"></div>
          <div className="absolute top-[70%] left-[30%] w-1 h-1 bg-white rounded-full animate-twinkle [animation-delay:4s] shadow-[0_0_8px_white]"></div>
          
          <div className="absolute top-[10%] left-[10%] w-[80px] h-[1.5px] bg-gradient-to-r from-white to-transparent animate-shooting"></div>
          <div className="absolute top-[60%] left-[70%] w-[100px] h-[1.5px] bg-gradient-to-r from-white to-transparent animate-shooting [animation-delay:5s]"></div>
        </div>
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-[480px] animate-fade-in text-center">
          {/* LOGO SUPERIOR ÚNICO */}
          <div className="flex justify-center mb-10 transform hover:scale-105 transition-transform duration-500 drop-shadow-2xl">
            <FullLogo variant="dark" />
          </div>
          
          {/* COMPONENTE DE REGISTRO (LA TARJETA ÚNICA) */}
          <AuthRegister />
        </div>
      </div>
    </div>
  );
};

export default Register;
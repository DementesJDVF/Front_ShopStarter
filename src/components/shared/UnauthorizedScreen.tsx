import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

interface Props {
  code?: 401 | 403;
  message?: string;
}

const UnauthorizedScreen = ({ code = 403, message }: Props) => {
  const navigate = useNavigate();

  const is401 = code === 401;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-[#0A014A] to-indigo-950 px-4">
      {/* Glow de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-red-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 text-center max-w-lg mx-auto animate-fade-in">

        {/* Ícono grande */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-red-500/20 to-red-900/30 border border-red-500/30 flex items-center justify-center shadow-2xl backdrop-blur-xl">
              <Icon
                icon={is401 ? "solar:lock-keyhole-bold-duotone" : "solar:shield-warning-bold-duotone"}
                className={`text-6xl ${is401 ? 'text-yellow-400' : 'text-red-400'}`}
              />
            </div>
            {/* Badge del código */}
            <span className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg">
              {code}
            </span>
          </div>
        </div>

        {/* Texto principal */}
        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-4">
          {is401 ? 'Sin Sesión' : 'Acceso Denegado'}
        </h1>

        <p className="text-lg text-slate-400 font-semibold mb-2">
          {message || (
            is401
              ? 'Debes iniciar sesión para ver este contenido.'
              : 'No tienes permisos para acceder a esta sección. Solo el administrador puede entrar aquí.'
          )}
        </p>

        <p className="text-sm text-slate-600 mb-10">
          {is401 ? 'Tu sesión ha expirado o no has iniciado sesión.' : 'Si crees que esto es un error, contacta al administrador.'}
        </p>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {is401 ? (
            <button
              onClick={() => navigate('/auth/login')}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white font-black rounded-2xl hover:scale-105 transition-all duration-300 shadow-2xl shadow-indigo-900/40 uppercase tracking-widest text-sm"
            >
              <Icon icon="solar:login-3-bold-duotone" className="text-xl" />
              Iniciar Sesión
            </button>
          ) : (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl transition-all duration-300 border border-white/20 uppercase tracking-widest text-sm"
            >
              <Icon icon="solar:arrow-left-bold-duotone" className="text-xl" />
              Volver
            </button>
          )}
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#3A17E4]/80 to-[#0A014A]/80 text-white font-black rounded-2xl hover:scale-105 transition-all duration-300 border border-indigo-500/30 uppercase tracking-widest text-sm"
          >
            <Icon icon="solar:home-angle-bold-duotone" className="text-xl" />
            Ir al Inicio
          </button>
        </div>

      </div>
    </div>
  );
};

export default UnauthorizedScreen;

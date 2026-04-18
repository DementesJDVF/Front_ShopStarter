import { useState } from "react";
import api from "src/utils/axios";
import FullLogo from "src/layouts/full/shared/logo/FullLogo";
import { Link, useNavigate } from "react-router";
import { useAuth } from "src/context/AuthContext";
import { Icon } from "@iconify/react";


const gradientStyle = {
  background:
    "linear-gradient(45deg, rgb(238, 119, 82,0.2), rgb(231, 60, 126,0.2), rgb(35, 166, 213,0.2), rgb(35, 213, 171,0.2))",
  backgroundSize: "400% 400%",
  animation: "gradient 15s ease infinite",
  height: "100vh",
};

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setErrorMsg("Debes ingresar correo y contraseña.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("users/auth/login/", {
        email: cleanEmail,
        password,
      });

      const { access_token, user } = response.data;
      login(user, access_token);

      if (user.role === 'VENDEDOR') {
          navigate("/vendedor/dashboard");
      } else if (user.role === 'CLIENTE') {
          navigate("/cliente/home");
      } else {
          navigate("/");
      }

    } catch (error: any) {
      if (error.response) {
        const data = error.response.data;
        const msg =
          data?.message || 
          data?.detail || 
          (typeof data === 'string' ? data : null) ||
          "Credenciales inválidas. Verifica email y contraseña.";
        setErrorMsg(msg);
      } else if (error.request) {
        setErrorMsg("No se pudo conectar con el servidor. Verifica que el backend esté corriendo.");
      } else {
        setErrorMsg("Ocurrió un error inesperado.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex items-center justify-center font-sans tracking-tight">
      
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

      <div className="relative z-10 w-full max-w-[440px] px-6 py-12 animate-fade-in">
        
        {/* LOGO SUPERIOR */}
        <div className="flex justify-center mb-10 transform hover:scale-105 transition-transform duration-500 drop-shadow-2xl">
          <FullLogo />
        </div>

        {/* CARD DE LOGIN: GLASSMORPHISM */}
        <div className="glass-card-premium p-10 border border-white/50 dark:border-white/10">
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-[#0A014A] dark:text-white tracking-tighter mb-2">Bienvenido de nuevo</h2>
            <p className="text-sm font-bold text-slate-500/80 dark:text-slate-400 uppercase tracking-widest">Acceso a ShopStarter</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label className="block mb-2 text-[11px] font-extrabold text-[#0A014A] dark:text-slate-300 uppercase tracking-widest ml-1">Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full bg-white/50 border border-slate-200 rounded-2xl px-5 py-3.5 outline-none focus:border-[#3A17E4] focus:bg-white/80 transition-all duration-300 font-medium text-slate-900 shadow-sm"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 px-1">
                <label className="text-[11px] font-extrabold text-[#0A014A] dark:text-slate-300 uppercase tracking-widest">Contraseña</label>
                <Link to="/auth/forgot-password"  className="text-[#3A17E4] dark:text-[#2CD4D9] text-[11px] font-black hover:underline uppercase tracking-widest">¿Olvidaste tu clave?</Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/50 border border-slate-200 rounded-2xl px-5 py-3.5 outline-none focus:border-[#3A17E4] focus:bg-white/80 transition-all duration-300 font-medium text-slate-900 shadow-sm"
                autoComplete="current-password"
                required
              />
            </div>

            <div className="flex items-center gap-3 px-1 mt-1">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-5 h-5 rounded-lg border-slate-300 text-[#3A17E4] focus:ring-[#3A17E4] transition-all cursor-pointer"
              />
              <label htmlFor="remember" className="text-xs font-bold text-slate-600 cursor-pointer select-none tracking-tight">Recordar mi sesión en este equipo</label>
            </div>

            {errorMsg && (
              <div className={`p-4 rounded-2xl text-xs font-bold animate-shake border ${
                errorMsg.includes("REVISADA") 
                  ? "bg-amber-50 border-amber-200 text-amber-700 shadow-lg shadow-amber-200/20"
                  : "bg-red-50 border-red-100 text-red-600 shadow-lg shadow-red-200/20"
              }`}>
                <div className="flex items-center gap-3">
                  <Icon icon={errorMsg.includes("REVISADA") ? "solar:clock-circle-bold-duotone" : "solar:danger-square-bold-duotone"} className="text-xl flex-shrink-0" />
                  <span className="leading-relaxed">{errorMsg}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#3A17E4] to-[#0A014A] text-white rounded-2xl py-4 font-black text-sm uppercase tracking-[0.15em] hover:shadow-[0_10px_30px_rgba(58,23,228,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-60 shadow-xl mt-4"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Entrando...</span>
                </div>
              ) : "Iniciar Sesión"}
            </button>
          </form>

          <div className="flex flex-col gap-1 text-center mt-10">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">¿Eres nuevo aquí?</p>
            <Link to="/auth/register" className="text-[#3A17E4] font-black hover:underline text-sm tracking-tight flex items-center justify-center gap-2 group">
              Crea tu cuenta de comerciante
              <Icon icon="solar:arrow-right-up-bold-duotone" className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
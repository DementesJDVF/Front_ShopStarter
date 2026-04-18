import Footer from "./Footer";
import TopBanner from "./TopBanner";
import { Link } from "react-router";
import { Icon } from '@iconify/react';
import { useEffect, useState, useRef } from "react";
import api from "../../utils/axios";

// --- Componentes Funcionales de Utilidad ---

const AnimatedCounter = ({ targetNumber, label }: { targetNumber: number, label: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (targetNumber === 0) return;
    let start = 0;
    const duration = 2000; 
    const stepTime = Math.abs(Math.floor(duration / targetNumber));
    const increment = targetNumber > 100 ? Math.ceil(targetNumber / 50) : 1;

    const timer = setInterval(() => {
      start += increment;
      if (start >= targetNumber) {
        setCount(targetNumber);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [targetNumber]);

  return (
    <div className="flex items-baseline gap-1">
      <span className="text-xl md:text-3xl font-black text-[#0A014A] dark:text-white tracking-tighter">
        {count > 0 ? "+" : ""}{count}
      </span>
      <span className="text-sm font-black text-[#3A17E4]/60 dark:text-indigo-300/60 uppercase tracking-widest ml-1">{label}</span>
    </div>
  );
};

// --- Nuevos Componentes de Enriquecimiento Visual ---

// 1. Ticker / Marquee Dinámico
const MarqueeStrip = () => {
  const phrases = [
    "🚀 Tienda de Barrio Digital",
    "📱 Organiza tus Pedidos",
    "🌍 Visible en el Mapa Local",
    "🤝 Conecta con tus Vecinos",
    "🛡️ Gestión Puramente Organizativa",
    "📦 Control Total de Entregas"
  ];
  
  const infinitePhrases = [...phrases, ...phrases, ...phrases];

  return (
    <div className="w-full bg-[#0A014A]/90 backdrop-blur-md border-y border-white/10 py-5 overflow-hidden relative rotate-1 scale-105 my-16 shadow-2xl">
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0A014A] to-transparent z-10 pointer-events-none"></div>
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#0A014A] to-transparent z-10 pointer-events-none"></div>
      <div className="flex whitespace-nowrap animate-[marquee_25s_linear_infinite]">
        {infinitePhrases.map((phrase, idx) => (
          <span key={idx} className="mx-8 text-lg sm:text-xl font-black text-slate-200 flex items-center gap-4">
             {phrase} <Icon icon="solar:star-fall-bold-duotone" className="text-indigo-400 opacity-50" />
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-33.33%); } }
      `}</style>
    </div>
  );
};

// 2. Bloque del Slogan (El alma del proyecto)
const SloganBlock = () => (
  <section className="relative py-24 sm:py-32 overflow-hidden bg-transparent">
    {/* Fondo abstracto de textura "Hard work" (Cuadricula/Sudor/Energía) */}
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grilled-noise.png')] opacity-5"></div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
      <div className="inline-block p-4 sm:p-5 bg-indigo-100/50 dark:bg-slate-800/50 text-[#3A17E4] dark:text-indigo-300 rounded-[2rem] mb-8 transform -rotate-3 hover:rotate-0 transition-transform duration-300 shadow-sm border border-indigo-200 dark:border-slate-700">
        <Icon icon="solar:heart-bold-duotone" className="text-5xl sm:text-6xl animate-pulse" />
      </div>
      <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-[#0A014A] dark:text-white leading-[1.1] tracking-tighter drop-shadow-sm">
        "Con amor y esfuerzo <br className="hidden md:block"/> 
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2CD4D9] via-[#3A17E4] to-[#0A014A] pb-2">
          nos ganaremos el almuerzo."
        </span>
      </h2>
      <p className="mt-8 sm:mt-10 text-xl sm:text-2xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto font-bold leading-relaxed">
        Nuestra filosofía es tu crecimiento. Entendemos el sudor de la calle y el sacrificio local. ShopStarter es tu aliado para darle orden y dignidad digital al fruto de tu trabajo.
      </p>
    </div>
  </section>
);

// 3. Testimonios / Validadores
const Testimonials = () => {
  const reviews = [
    { name: "Doña Nubia", role: "Vendedora de Postres", text: "Esto es una bendición. Antes anotaba los encargos en un cuaderno viejo. Ahora me llegan directos al celular, organizo mis pudines y el cliente pasa a recoger. Cero enredos.", icon: "solar:shop-2-bold-duotone", color: "text-pink-600 dark:text-pink-400", bg: "bg-pink-100 dark:bg-pink-500/20" },
    { name: "Carlos Vargas", role: "Repartición de Lácteos", text: "Al ver mi ubicación en el mapa, los vecinos del barrio se dieron cuenta de mi ruta y me solicitan la leche directamente. ¡Conecto fácil y ellos me pagan a la entrega!", icon: "solar:map-point-wave-bold-duotone", color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-100 dark:bg-indigo-500/20" },
    { name: "Familia Giraldo", role: "Artesanías Locales", text: "Nos sentimos grandes. Tenemos nuestro propio catálogo visual, acordamos la entrega y todo queda registrado clarito para alistar los paquetes a tiempo.", icon: "solar:crown-star-bold-duotone", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-500/20" }
  ];

  return (
    <section className="py-24 bg-transparent relative overflow-hidden">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none animate-blob"></div>
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16" data-aos="fade-up">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3A17E4] to-[#2CD4D9] font-black tracking-[0.2em] uppercase text-xs mb-4 block">Voz del Pueblo</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#0A014A] dark:text-white mb-4 tracking-tighter">La comunidad habla</h2>
          <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 font-bold">Hecho por y para los luchadores del día a día.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
           {reviews.map((rev, i) => (
             <div key={i} className="bg-indigo-50/50 dark:bg-slate-800/40 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-xl border border-white/60 dark:border-slate-700/50 hover:shadow-indigo-900/10 hover:-translate-y-2 transition-all duration-500 relative group">
                <Icon icon="solar:quote-right-bold" className="absolute top-8 right-8 text-7xl text-indigo-500/5 group-hover:scale-110 transition-transform" />
                <p className="text-[#0A014A]/80 dark:text-slate-200 text-lg relative z-10 mb-10 font-bold leading-relaxed">"{rev.text}"</p>
                <div className="flex items-center gap-4 relative z-10 mt-auto">
                   <div className={`w-14 h-14 flex items-center justify-center rounded-2xl ${rev.bg} ${rev.color} shadow-lg`}>
                      <Icon icon={rev.icon} className="text-3xl" />
                   </div>
                   <div>
                      <h4 className="font-black text-[#0A014A] dark:text-white text-lg tracking-tight">{rev.name}</h4>
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{rev.role}</span>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
};

// 4. Acordeón de FAQs
const FAQAccordion = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const faqs = [
     { q: "¿Gestionan ustedes el dinero o cobran comisión?", a: "¡No! ShopStarter es una plataforma puramente organizativa y logística. No tocamos tu dinero ni cobramos porcentajes por venta. Tus clientes te pagarán directamente por los medios que tú y ellos coordinen (efectivo al entregar, transferencia bancaria, vecindad, etc)." },
     { q: "¿Qué ventajas tengo al registrarme?", a: "Tu negocio aparecerá en nuestro mapa hiperlocal, tendrás un catálogo visual y recibirás una notificación clara cada vez que alguien te haga un pedido. ¡Orden estricto en tu celular en vez de cuadernos caóticos!" },
     { q: "¿Es necesario ser una empresa formal o grande?", a: "Para nada. ShopStarter está diseñado para ayudar a todos: desde vendedores de arepas de la esquina, hasta emprendimientos formales nacientes. Creemos en el trabajo honrado y te damos una vitrina profesional sin exigir papeleo absurdo." },
     { q: "¿Mis clientes deben descargar una aplicación compleja?", a: "No. Tus clientes pueden ver tu tienda desde la web pública usando cualquier navegador de forma rapidísima. Eligen lo que quieren, hacen el encargo, y a ti te notifica." }
  ];

  return (
    <section className="py-32 bg-transparent">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-16" data-aos="fade-up">
           <Icon icon="solar:question-circle-bold-duotone" className="text-7xl text-[#3A17E4] dark:text-indigo-400 mx-auto mb-6 drop-shadow-lg" />
           <h2 className="text-4xl md:text-5xl font-black text-[#0A014A] dark:text-white tracking-tighter">Preguntas Frecuentes</h2>
           <p className="text-sm font-black text-[#3A17E4]/40 uppercase tracking-widest mt-4">Todo clarito como el agua.</p>
        </div>
        <div className="space-y-6">
           {faqs.map((faq, i) => (
             <div key={i} className={`border ${openIdx === i ? 'border-indigo-300 dark:border-indigo-500 bg-indigo-50/80 dark:bg-slate-800/60 shadow-2xl scale-[1.02]' : 'border-white/60 dark:border-slate-700/40 bg-indigo-50/40 dark:bg-slate-800/20'} rounded-[2.5rem] backdrop-blur-xl overflow-hidden transition-all duration-500`}>
                <button onClick={() => setOpenIdx(openIdx === i ? null : i)} className="w-full px-8 py-8 flex items-center justify-between text-left cursor-pointer hover:bg-white/40 dark:hover:bg-slate-700/40 transition-all">
                  <span className="font-black text-xl text-[#0A014A] dark:text-white pr-4 leading-tight tracking-tight">{faq.q}</span>
                  <div className={`w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-2xl bg-indigo-100/50 dark:bg-slate-700/50 text-[#3A17E4] dark:text-indigo-300 transition-all duration-500 ${openIdx === i ? 'rotate-180 bg-gradient-to-r from-[#3A17E4] to-[#0A014A] text-white shadow-lg' : ''}`}>
                    <Icon icon="solar:alt-arrow-down-bold" className="text-2xl" />
                  </div>
               </button>
               <div className={`px-8 overflow-hidden transition-all duration-500 ease-in-out ${openIdx === i ? 'max-h-80 pb-8 opacity-100' : 'max-h-0 py-0 opacity-0'}`}>
                  <p className="text-[#0A014A]/70 dark:text-slate-300 font-bold text-lg leading-relaxed border-t border-indigo-100/30 dark:border-slate-700/30 pt-6">{faq.a}</p>
               </div>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
};


// --- Secciones Principales Modificadas (Libres de Dinero/Pagos) ---

const Hero = () => {
  const [metrics, setMetrics] = useState({ vendors: 580, products: 1200 });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const prodRes = await api.get('products/catalog/');
        const prodData = prodRes.data;
        const totalProds = Array.isArray(prodData) 
          ? prodData.length 
          : (prodData?.results && Array.isArray(prodData.results) ? prodData.results.length : (prodData?.count || 0));
        
        const usersRes = await api.get('users/list/');
        const userData = usersRes.data;
        const vendors = Array.isArray(userData) 
          ? userData.filter((u: any) => u.role === "VENDEDOR").length 
          : 0;

        setMetrics({ vendors, products: totalProds });
      } catch (err) {
        console.error("Métricas silenciosas fallaron", err);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <section className="relative pt-32 pb-40 px-4 sm:px-6 lg:px-8 mx-auto overflow-hidden flex flex-col items-center justify-center border-b border-transparent">
      
      {/* Fondo Dinámico: AMBIENT MESH PREMIUM - Sin blanco sólido */}
      <div className="absolute inset-0 w-full h-full pointer-events-none -z-10 bg-transparent">
        <div className="absolute top-[10%] left-1/4 w-[60vw] h-[60vw] bg-indigo-500/20 rounded-full blur-[140px] animate-blob"></div>
        <div className="absolute bottom-[20%] right-1/4 w-[50vw] h-[50vw] bg-[#2CD4D9]/20 rounded-full blur-[160px] animate-blob [animation-delay:3s]"></div>
        <div className="absolute top-[40%] right-[10%] w-[40vw] h-[40vw] bg-purple-500/15 rounded-full blur-[120px] animate-blob [animation-delay:5s]"></div>
      </div>

      <div className="flex flex-col items-center text-center z-10 w-full max-w-5xl mx-auto mt-10" data-aos="zoom-out">
        
        <div className="inline-flex items-center gap-2 px-5 py-2 mb-10 rounded-full bg-white/60 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 shadow-sm text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform duration-300">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span>Monitoreo Activo - Cero Comisiones Financieras</span>
        </div>

        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-[#0A014A] dark:text-white tracking-tighter mb-8 leading-[1.1] drop-shadow-sm">
          Conecta tus pedidos <br className="hidden sm:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3A17E4] via-[#2CD4D9] to-[#0A014A] dark:to-indigo-300 pb-2">
            con tu comunidad
          </span>
        </h1>
        
        <p className="text-xl sm:text-2xl text-slate-500 dark:text-slate-400 mb-12 max-w-3xl leading-relaxed font-bold">
          ShopStarter te da la infraestructura tecnológica para profesionalizar la recepción
          de pedidos. Visibiliza tu catálogo a los vecinos de forma limpia, organizada y libre.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-24 w-full justify-center">
          <Link 
            to="/auth/register"
            className="group relative inline-flex items-center justify-center px-12 py-5 font-black text-white transition-all duration-300 bg-gradient-to-r from-[#3A17E4] to-[#0A014A] rounded-2xl hover:shadow-[0_20px_40px_rgba(58,23,228,0.3)] hover:scale-[1.05] overflow-hidden w-full sm:w-auto shadow-2xl"
          >
            <span className="relative flex items-center gap-3 text-lg uppercase tracking-widest">
              Empezar Completamente Gratis
              <Icon icon="solar:arrow-right-up-bold-duotone" className="text-2xl group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </span>
          </Link>
        </div>
        
        {/* Mockup enfocado SOLO a seguimiento y pedidos (eliminadas referencias financieras) */}
        <div className="relative w-full max-w-4xl mx-auto rounded-[2rem] sm:rounded-[2.5rem] p-4 bg-white/40 dark:bg-slate-800/40 backdrop-blur-2xl border border-white/60 dark:border-slate-700/50 shadow-2xl shadow-indigo-900/5 overflow-visible group" data-aos="fade-up" data-aos-delay="200">
           
           <div className="w-full h-12 border-b border-slate-200/50 dark:border-slate-700/50 flex items-center px-4 gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600"></div>
              <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600"></div>
              <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600"></div>
           </div>
           
           <img 
               src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=1200&auto=format&fit=crop"
               alt="Control de Emprendimiento"
               className="w-full h-[300px] md:h-[450px] object-cover rounded-[1.5rem] shadow-inner opacity-90 saturate-150 transform transition duration-700 group-hover:scale-[1.01]"
           />
           
           {/* Estadísticas de Mero Seguimiento Organizativo */}
           <div className="absolute top-20 -right-6 md:-right-10 bg-indigo-50/60 backdrop-blur-2xl p-5 rounded-3xl shadow-2xl border border-white/40 animate-float-day hidden sm:block overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent"></div>
              <div className="flex items-center gap-4 relative z-10">
                 <div className="bg-indigo-100/80 p-3 rounded-2xl text-[#3A17E4] shadow-inner">
                    <Icon icon="solar:clipboard-check-bold-duotone" className="text-3xl" />
                 </div>
                  <div className="text-left">
                    <div className="text-[10px] font-black text-[#3A17E4]/60 dark:text-indigo-300/60 uppercase tracking-widest mb-1">Actividad Diaria</div>
                    <div className="text-2xl font-black text-[#0A014A] dark:text-indigo-900">45 Pedidos Hoy</div>
                  </div>
              </div>
           </div>

           <div className="absolute -bottom-8 -left-6 md:-left-12 bg-indigo-50/70 backdrop-blur-2xl p-5 rounded-3xl shadow-2xl border border-white/40 transform hover:scale-105 transition-all duration-300">
             <div className="flex flex-col items-start gap-2">
                <div className="flex -space-x-3 mt-1">
                   <img className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Avatar" />
                   <img className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80" alt="Avatar" />
                   <img className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 object-cover" src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=100&q=80" alt="Avatar" />
                </div>
                <div className="mt-2 text-left">
                  <AnimatedCounter targetNumber={metrics.vendors} label="Comerciantes Activos" />
                </div>
             </div>
           </div>
        </div>
      </div>
    </section>
  );
};
      
const Features = () => {
  const features = [
    { title: 'Catálogo Visual Puro', desc: 'Despliega tus productos con fotografías brillantes y descripciones sin preocuparte de recargos transaccionales.', icon: 'solar:shop-window-bold-duotone', color: 'from-blue-500 to-indigo-500' },
    { title: 'GPS y Geolocalización', desc: 'Tu tienda local es visible en el mapa. Tus vecinos y transeúntes te encontrarán fácil.', icon: 'solar:map-point-bold-duotone', color: 'from-purple-500 to-pink-500' },
    { title: 'Gestión de Encargos', desc: 'Aprueba y monitoriza pedidos en tiempo real. Cero caos en hojas de papel, total organización digital.', icon: 'solar:checklist-minimalistic-bold-duotone', color: 'from-sky-400 to-blue-500' },
    { title: 'IA de Visualización', desc: 'Sugerencias apoyadas por Inteligencia Artificial para ayudarte a presentar mejores títulos en tus productos.', icon: 'solar:cpu-bold-duotone', color: 'from-orange-400 to-amber-500' },
    { title: 'Directorio Cívico', desc: 'Cuentas seguras para ti y acceso ágil para tus clientes. Mantén a tu clientela informada de tu stock.', icon: 'solar:users-group-two-rounded-bold-duotone', color: 'from-teal-400 to-emerald-500' },
    { title: 'Libertad de Pago', desc: 'Ponte de acuerdo con tu cliente: si te pagan en efectivo, depósito o en el local. Nosotros solo unimos la necesidad.', icon: 'solar:handshake-bold-duotone', color: 'from-green-400 to-emerald-500' },
  ];

  return (
    <section id="features" className="py-32 bg-transparent overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20" data-aos="fade-up">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3A17E4] to-[#2CD4D9] font-black tracking-[0.2em] uppercase text-xs mb-4 block">
            Herramientas Limpias
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-[#0A014A] dark:text-white tracking-tighter">
            Diseñado para poner <br className="hidden md:block" /> orden y dignidad
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              data-aos="fade-up" 
              data-aos-delay={index * 100}
              className="group relative bg-white/40 dark:bg-slate-800/40 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white/50 dark:border-slate-700/50 hover:border-[#3A17E4]/30 shadow-xl hover:shadow-[#3A17E4]/10 transition-all duration-500 transform hover:-translate-y-3 overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${feature.color} rounded-full blur-[100px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none`}></div>
              
              <div className={`w-16 h-16 rounded-2xl mb-8 flex items-center justify-center bg-gradient-to-br ${feature.color} shadow-2xl text-white transform group-hover:scale-110 group-hover:rotate-[12deg] transition-all duration-500`}>
                <Icon icon={feature.icon} className="text-3xl" />
              </div>
              <h3 className="text-2xl font-black text-[#0A014A] dark:text-white mb-3 tracking-tighter">{feature.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-bold">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-32 relative bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 relative">
        <div className="text-center mb-20" data-aos="zoom-in">
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-[#0A014A] dark:text-white mb-6 tracking-tighter leading-none">
            Digitaliza tus procesos <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2CD4D9] to-[#3A17E4]">en Minutos</span>
          </h2>
          <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-bold">
            Entendemos que no tienes tiempo para complicarte. Registrar tu negocio toma sólo unos pasos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 flex flex-col gap-8">
             <div className="bg-white/50 dark:bg-slate-800/40 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/60 dark:border-slate-700/50 flex-1 relative group overflow-hidden shadow-xl" data-aos="fade-right">
                <div className="relative z-10">
                   <div className="w-14 h-14 bg-indigo-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center font-black text-[#3A17E4] dark:text-indigo-300 text-xl mb-6 shadow-sm border border-indigo-100 dark:border-slate-600">1</div>
                   <h3 className="text-3xl font-black text-[#0A014A] dark:text-white mb-4 tracking-tight">Registro</h3>
                   <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">Asegura tu cuenta comunitaria gratuita en pocos clics.</p>
                </div>
                <Icon icon="solar:user-circle-bold-duotone" className="absolute -bottom-10 -right-10 text-[180px] text-indigo-500/5 group-hover:text-indigo-500/10 transition-all duration-700" />
             </div>
             <div className="bg-white/50 dark:bg-slate-800/40 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/60 dark:border-slate-700/50 flex-1 relative group overflow-hidden shadow-xl" data-aos="fade-right" data-aos-delay="100">
                <div className="relative z-10">
                   <div className="w-14 h-14 bg-cyan-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center font-black text-[#2CD4D9] text-xl mb-6 shadow-sm border border-cyan-100 dark:border-slate-600">2</div>
                   <h3 className="text-3xl font-black text-[#0A014A] dark:text-white mb-4 tracking-tight">Tu Vitrina</h3>
                   <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">Sube fotos de tus mejores productos de forma visual.</p>
                </div>
                <Icon icon="solar:box-minimalistic-bold-duotone" className="absolute -bottom-10 -right-10 text-[180px] text-cyan-500/5 group-hover:text-cyan-500/10 transition-all duration-700" />
             </div>
          </div>

          <div className="md:col-span-1 bg-gradient-to-br from-[#3A17E4] via-[#2CD4D9] to-[#0A014A] rounded-[3rem] p-12 text-white relative group overflow-hidden shadow-3xl transform hover:scale-[1.02] transition-all duration-500" data-aos="zoom-in" data-aos-delay="200">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
             <div className="relative z-10 flex flex-col h-full items-center text-center justify-center">
                 <div className="w-20 h-20 bg-white/20 rounded-3xl border border-white/40 backdrop-blur-md flex items-center justify-center font-black text-white text-3xl mb-10 shadow-inner">3</div>
                 <Icon icon="solar:global-bold-duotone" className="text-8xl mb-8 animate-float-day drop-shadow-2xl" />
                 <h3 className="text-4xl font-black mb-6 tracking-tighter">Expansión Local</h3>
                 <p className="text-white/90 font-bold text-xl leading-relaxed">
                   Eres indexado en el mapa barrial y los vecinos sabrán que estás ahí.
                 </p>
             </div>
          </div>

          <div className="md:col-span-1 bg-[#0A014A] rounded-[3rem] p-12 text-white relative group overflow-hidden shadow-3xl flex flex-col justify-between" data-aos="fade-left" data-aos-delay="300">
             <div>
                <div className="w-14 h-14 bg-white/10 rounded-2xl border border-white/20 flex items-center justify-center font-black text-[#2CD4D9] text-xl mb-8 shadow-sm">4</div>
                <h3 className="text-3xl font-black text-white mb-6 tracking-tighter">Control Total</h3>
                <p className="text-slate-300 font-bold text-lg leading-relaxed mb-12">
                   Notificaciones directas cada que alguien quiera algo. Aprueba, entrega y mantén tu orden digital.
                </p>
             </div>
             
             <div className="bg-white/10 backdrop-blur-md rounded-[1.5rem] p-6 border border-white/20 group-hover:-translate-y-4 transition-all duration-500 shadow-lg">
                 <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-[#2CD4D9] uppercase tracking-[0.2em]">Sincronizado</span>
                    <Icon icon="solar:bell-bing-bold-duotone" className="text-3xl text-white animate-pulse" />
                 </div>
                 <div className="font-black text-xl text-white tracking-tight">NUEVO PEDIDO RECIBIDO</div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const CTA = () => (
  <section className="py-24 px-4 relative bg-transparent">
    <div className="max-w-6xl mx-auto rounded-[4rem] p-12 md:p-24 text-center text-white shadow-3xl relative overflow-hidden bg-gradient-to-br from-[#0A014A] via-[#060B14] to-indigo-950 border border-white/10" data-aos="fade-up">
      
      <div className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none mix-blend-overlay">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-indigo-500/20 via-[#2CD4D9]/20 to-transparent rounded-full blur-[120px] animate-spin-slow"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 rounded-3xl mb-12 border border-white/20 backdrop-blur-xl shadow-2xl">
           <Icon icon="solar:stars-minimalistic-bold-duotone" className="text-5xl text-[#2CD4D9]" />
        </div>

        <h2 className="text-6xl md:text-8xl font-black mb-10 leading-tight tracking-tighter text-white drop-shadow-2xl">
          Simplifica tu vida.<br/> Organiza tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2CD4D9] to-indigo-400">negocio</span>.
        </h2>
        
        <p className="text-2xl sm:text-3xl text-indigo-100/80 font-bold mb-16 max-w-3xl mx-auto leading-relaxed">
          No dejes que los encargos se pierdan en hojas sueltas. Únete a la plataforma que dignifica tu esfuerzo.
        </p>
        
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-[#3A17E4] via-[#2CD4D9] to-[#3A17E4] rounded-full blur-2xl opacity-40 group-hover:opacity-100 transition duration-700 animate-pulse"></div>
          <Link 
            to="/auth/register"
            className="relative flex items-center justify-center gap-4 bg-white text-[#0A014A] px-16 py-8 rounded-full font-black text-2xl hover:scale-[1.05] transition-all duration-500 shadow-3xl uppercase tracking-widest"
          >
            Formar Parte
            <Icon icon="solar:shop-2-bold-duotone" className="text-4xl" />
          </Link>
        </div>
      </div>
    </div>
  </section>
);

const Home = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-transparent font-sans text-slate-900 selection:bg-indigo-500/30 selection:text-indigo-900 overflow-x-hidden relative">
      
      {/* ✨ ATMÓSFERA GLOBAL: SEDA GALÁCTICA (SOLO MODO CLARO) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-gradient-to-br from-[#E0E7FF] via-[#F1F5FF] to-[#E0F2FE] dark:hidden">
        {/* Blobs Maestra: Máxima Cobertura y Saturación */}
        <div className="absolute top-[-25%] left-[-25%] w-[130vw] h-[130vw] bg-indigo-500/30 rounded-full blur-[220px] animate-blob"></div>
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

      <TopBanner/>

      <main className="relative z-10">
        <Hero />
        <MarqueeStrip />
        
        {/* Envolvimiento de secciones en contenedores semi-traslúcidos */}
        <div className="space-y-0">
          <section className="bg-transparent">
            <SloganBlock />
          </section>
          
          <section className="bg-indigo-500/10 backdrop-blur-md border-y border-indigo-200/40">
            <Features />
          </section>
          
          <section className="bg-transparent">
            <HowItWorks />
          </section>
          
          <section className="bg-[#0A014A]/[0.06] backdrop-blur-xl py-20 border-b border-white/20">
            <Testimonials />
          </section>
          
          <section className="bg-transparent">
            <FAQAccordion />
          </section>
          
          <section className="bg-transparent pb-20">
            <CTA />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
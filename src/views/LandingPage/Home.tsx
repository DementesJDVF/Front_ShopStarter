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
      <span className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
        {count > 0 ? "+" : ""}{count}
      </span>
      <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">{label}</span>
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
    <div className="w-full bg-slate-900 dark:bg-[#060B14] border-y border-slate-800 py-4 overflow-hidden relative rotate-1 scale-105 my-10 shadow-2xl">
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-slate-900 dark:from-[#060B14] to-transparent z-10 pointer-events-none"></div>
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-slate-900 dark:from-[#060B14] to-transparent z-10 pointer-events-none"></div>
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
  <section className="relative py-24 sm:py-32 overflow-hidden bg-white dark:bg-[#0B1121]">
    {/* Fondo abstracto de textura "Hard work" (Cuadricula/Sudor/Energía) */}
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grilled-noise.png')] opacity-5"></div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
      <div className="inline-block p-4 sm:p-5 bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-[2rem] mb-8 transform -rotate-3 hover:rotate-0 transition-transform duration-300 shadow-sm border border-orange-200 dark:border-orange-500/20">
        <Icon icon="solar:heart-bold-duotone" className="text-5xl sm:text-6xl animate-pulse" />
      </div>
      <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tighter mix-blend-hard-light">
        "Con amor y esfuerzo <br className="hidden md:block"/> 
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 pb-2">
          nos ganaremos el almuerzo."
        </span>
      </h2>
      <p className="mt-8 sm:mt-10 text-xl sm:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed">
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
    <section className="py-24 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16" data-aos="fade-up">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500 font-extrabold tracking-widest uppercase text-sm mb-4 block">Voz del Pueblo</span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">La comunidad habla</h2>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400">Hecho por y para los luchadores del día a día, sin corporaciones en medio.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
           {reviews.map((rev, i) => (
             <div key={i} className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative group">
                <Icon icon="solar:quote-right-bold" className="absolute top-6 right-6 text-6xl text-slate-100 dark:text-slate-700/50 group-hover:scale-110 transition-transform" />
                <p className="text-slate-700 dark:text-slate-300 text-lg relative z-10 mb-10 font-medium leading-relaxed">"{rev.text}"</p>
                <div className="flex items-center gap-4 relative z-10 mt-auto">
                   <div className={`w-14 h-14 flex items-center justify-center rounded-2xl ${rev.bg} ${rev.color} shadow-inner`}>
                      <Icon icon={rev.icon} className="text-3xl" />
                   </div>
                   <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-lg">{rev.name}</h4>
                      <span className="text-sm font-bold text-slate-500">{rev.role}</span>
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
    <section className="py-32 bg-white dark:bg-[#0B1121]">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-16" data-aos="fade-up">
           <Icon icon="solar:question-circle-line-duotone" className="text-6xl text-indigo-500 mx-auto mb-6" />
           <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Preguntas Frecuentes</h2>
           <p className="text-lg text-slate-500 mt-4">Todo clarito como el agua.</p>
        </div>
        <div className="space-y-4">
           {faqs.map((faq, i) => (
             <div key={i} className={`border ${openIdx === i ? 'border-indigo-200 dark:border-indigo-500/50 shadow-md' : 'border-slate-200 dark:border-slate-800'} rounded-[1.5rem] overflow-hidden transition-all duration-300`}>
               <button onClick={() => setOpenIdx(openIdx === i ? null : i)} className="w-full px-6 py-6 flex items-center justify-between bg-white dark:bg-slate-900 text-left cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                  <span className="font-bold text-lg text-slate-900 dark:text-white pr-4 leading-tight">{faq.q}</span>
                  <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 transition-transform duration-300 ${openIdx === i ? 'rotate-180 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : ''}`}>
                    <Icon icon="solar:alt-arrow-down-bold" className="text-xl" />
                  </div>
               </button>
               <div className={`px-6 overflow-hidden transition-all duration-500 ease-in-out bg-slate-50 dark:bg-slate-800/20 ${openIdx === i ? 'max-h-60 pb-6 opacity-100' : 'max-h-0 py-0 opacity-0'}`}>
                  <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed mt-2">{faq.a}</p>
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
    <section className="relative pt-32 pb-40 px-4 sm:px-6 lg:px-8 mx-auto overflow-hidden flex flex-col items-center justify-center border-b border-transparent dark:border-slate-800">
      
      {/* Fondo Dinámico */}
      <div className="absolute inset-0 w-full h-full pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-white to-white dark:from-slate-900 dark:via-[#0B1121] dark:to-[#0B1121]">
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen opacity-60 animate-pulse"></div>
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-sky-500/10 dark:bg-sky-600/10 rounded-full blur-[150px] mix-blend-screen opacity-50"></div>
      </div>

      <div className="flex flex-col items-center text-center z-10 w-full max-w-5xl mx-auto mt-10" data-aos="zoom-out">
        
        <div className="inline-flex items-center gap-2 px-5 py-2 mb-10 rounded-full bg-white/60 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 shadow-sm text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform duration-300">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span>Monitoreo Activo - Cero Comisiones Financieras</span>
        </div>

        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white tracking-tighter mb-8 leading-[1.1]">
          Conecta tus pedidos <br className="hidden sm:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-500 pb-2">
            con tu comunidad
          </span>
        </h1>
        
        <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300/80 mb-12 max-w-3xl leading-relaxed font-medium">
          ShopStarter te da la infraestructura tecnológica para profesionalizar la recepción
          de pedidos. Visibiliza tu catálogo a los vecinos de forma limpia, organizada y libre.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-24 w-full justify-center">
          <Link 
            to="/auth/register"
            className="group relative inline-flex items-center justify-center px-10 py-5 font-black text-white transition-all duration-300 bg-indigo-600 rounded-2xl hover:bg-indigo-500 hover:shadow-[0_0_40px_rgba(79,70,229,0.4)] overflow-hidden w-full sm:w-auto"
          >
            <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-72 group-hover:h-56 opacity-10"></span>
            <span className="relative flex items-center gap-2 text-lg">
              Empezar Completamente Gratis
              <Icon icon="solar:menu-dots-square-bold-duotone" className="text-2xl group-hover:scale-110 transition-transform" />
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
           <div className="absolute top-20 -right-6 md:-right-10 bg-white dark:bg-slate-900 backdrop-blur-xl p-5 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 animate-float-day hidden sm:block">
              <div className="flex items-center gap-4">
                 <div className="bg-sky-100 dark:bg-sky-900/30 p-3 rounded-2xl text-sky-600 dark:text-sky-400">
                    <Icon icon="solar:clipboard-check-bold-duotone" className="text-3xl" />
                 </div>
                 <div className="text-left">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Actividad Diaria</div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">45 Pedidos Hoy</div>
                 </div>
              </div>
           </div>

           <div className="absolute -bottom-8 -left-6 md:-left-12 bg-white dark:bg-slate-900 backdrop-blur-xl p-5 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 transform hover:scale-105 transition-transform duration-300">
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
    <section id="features" className="py-32 bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20" data-aos="fade-up">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-sky-500 font-extrabold tracking-widest uppercase text-sm mb-4 block">
            Herramientas Limpias
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Diseñado para <br className="md:hidden"/> poner orden y visibilidad
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              data-aos="fade-up" 
              data-aos-delay={index * 100}
              className="group relative bg-white dark:bg-slate-800/50 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 hover:border-indigo-500/30 dark:hover:border-indigo-400/30 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 transform hover:-translate-y-2 z-10 overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} rounded-full blur-[80px] opacity-0 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none`}></div>
              
              <div className={`w-14 h-14 rounded-2xl mb-8 flex items-center justify-center bg-gradient-to-br ${feature.color} shadow-lg shadow-black/10 text-white transform group-hover:scale-110 group-hover:rotate-[10deg] transition-transform duration-500`}>
                <Icon icon={feature.icon} className="text-3xl" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-32 relative bg-white dark:bg-[#0B1121]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 relative">
        <div className="text-center mb-20" data-aos="zoom-in">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter">
            Digitaliza tus procesos en <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-500">Minutos</span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
            Entendemos que no tienes tiempo para complicarte. Registrar tu negocio y ordenar tus encargos toma sólo unos pasos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 flex flex-col gap-6">
             <div className="bg-slate-50 dark:bg-slate-800/40 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 flex-1 relative group overflow-hidden" data-aos="fade-right">
                <div className="relative z-10">
                   <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center font-black text-indigo-500 mb-6 shadow-sm">1</div>
                   <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Registro</h3>
                   <p className="text-slate-600 dark:text-slate-400 font-medium">Asegura tu cuenta comunitaria gratuita.</p>
                </div>
                <Icon icon="solar:user-circle-bold-duotone" className="absolute -bottom-8 -right-8 text-[150px] text-indigo-500/5 group-hover:text-indigo-500/10 transition-colors duration-500" />
             </div>
             <div className="bg-slate-50 dark:bg-slate-800/40 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 flex-1 relative group overflow-hidden" data-aos="fade-right" data-aos-delay="100">
                <div className="relative z-10">
                   <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center font-black text-sky-500 mb-6 shadow-sm">2</div>
                   <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Tu Vitrina</h3>
                   <p className="text-slate-600 dark:text-slate-400 font-medium">Fotos de tus servicios y mercancía para todos.</p>
                </div>
                <Icon icon="solar:box-minimalistic-bold-duotone" className="absolute -bottom-8 -right-8 text-[150px] text-sky-500/5 group-hover:text-sky-500/10 transition-colors duration-500" />
             </div>
          </div>

          <div className="md:col-span-1 bg-gradient-to-br from-indigo-500 to-sky-600 rounded-[2.5rem] p-8 text-white relative group overflow-hidden shadow-xl" data-aos="zoom-in" data-aos-delay="200">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
             <div className="relative z-10 flex flex-col h-full items-center text-center justify-center">
                 <div className="w-16 h-16 bg-white/20 rounded-full border border-white/30 backdrop-blur-md flex items-center justify-center font-black text-white text-2xl mb-8 shadow-inner">3</div>
                 <Icon icon="solar:global-bold-duotone" className="text-7xl mb-6 animate-float-day" />
                 <h3 className="text-3xl font-black mb-4 tracking-tight">Expansión Local</h3>
                 <p className="text-indigo-100 font-medium text-lg max-w-[200px] mx-auto">
                   Eres indexado en el mapa barrial y los vecinos se enteran que existes.
                 </p>
             </div>
          </div>

          <div className="md:col-span-1 bg-slate-900 dark:bg-slate-800 rounded-[2.5rem] p-8 text-white relative group overflow-hidden flex flex-col justify-between" data-aos="fade-left" data-aos-delay="300">
             <div>
                <div className="w-12 h-12 bg-slate-800 dark:bg-slate-900 rounded-full border border-slate-700 flex items-center justify-center font-black text-emerald-400 mb-6 shadow-sm">4</div>
                <h3 className="text-2xl font-black text-white mb-3">Control de Pedidos</h3>
                <p className="text-slate-400 font-medium mb-12">
                   Notificaciones directas de gente interesada. Aprueba, entrega el pedido con una sonrisa y mantén tu inventario claro.
                </p>
             </div>
             
             <div className="bg-slate-800 dark:bg-slate-900 rounded-2xl p-4 border border-slate-700 group-hover:-translate-y-2 transition-transform duration-500">
                 <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-slate-500">CONTROL DE STOCK</span>
                    <Icon icon="solar:bell-bing-bold" className="text-emerald-400" />
                 </div>
                 <div className="font-black text-lg text-emerald-300">NUEVO ENCARGO RECIBIDO</div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const CTA = () => (
  <section className="py-24 px-4 relative bg-white dark:bg-[#0B1121]">
    <div className="max-w-6xl mx-auto rounded-[3rem] sm:rounded-[4rem] p-12 md:p-24 text-center text-white shadow-2xl relative overflow-hidden bg-[#060B14] border border-slate-800" data-aos="fade-up">
      
      <div className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none mix-blend-screen">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[600px] sm:h-[900px] bg-gradient-to-r from-indigo-500/10 via-sky-500/10 to-transparent rounded-full blur-[100px] animate-spin-slow"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-500/20 rounded-full mb-10 border border-indigo-500/30 backdrop-blur-md">
           <Icon icon="solar:round-transfer-horizontal-bold-duotone" className="text-4xl text-indigo-400" />
        </div>

        <h2 className="text-5xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tighter">
          Simplifica tu vida.<br/> Organiza tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-sky-400">negocio</span>.
        </h2>
        
        <p className="text-xl sm:text-2xl text-slate-400 font-medium mb-12 max-w-2xl mx-auto">
          No dejes que los encargos se pierdan en hojas sueltas.  
          Únete a la plataforma que da valor y claridad a los comerciantes esforzados.
        </p>
        
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-sky-600 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition duration-500"></div>
          <Link 
            to="/auth/register"
            className="relative flex items-center justify-center gap-3 bg-white text-slate-900 px-12 py-6 rounded-full font-black text-xl hover:scale-[1.02] transition-transform duration-300 shadow-2xl"
          >
            Formar Parte
            <Icon icon="solar:shop-2-bold-duotone" className="text-3xl text-indigo-600" />
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1121] font-sans text-slate-900 selection:bg-indigo-500/30 selection:text-indigo-900 dark:selection:text-indigo-100 overflow-x-hidden">
      <TopBanner/>
      <main>
        <Hero />
        <MarqueeStrip />
        <SloganBlock />
        <Features />
        <HowItWorks />
        <Testimonials />
        <FAQAccordion />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
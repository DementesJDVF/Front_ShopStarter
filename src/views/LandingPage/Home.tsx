import Footer from "./Footer";
import TopBanner from "./TopBanner";
import { Link } from "react-router";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import VisualCatalog from "./VisualCatalog";
import { Helmet } from "react-helmet-async";
import api from "../../utils/axios";
import { useTranslation } from "react-i18next";

// --- Animated Counter ---
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
      <span className="text-xl md:text-3xl font-black text-indigo-900 dark:text-white tracking-tighter">
        {count > 0 ? "+" : ""}
        {count}
      </span>
      <span className="text-sm font-black text-[#000351] dark:text-indigo-900 uppercase tracking-widest ml-1">{label}</span>
    </div>
  );
};

// --- Marquee / Ticker ---
const MarqueeStrip = () => {
  const { t } = useTranslation("landingPage");
  const phrases = t("marquee", { returnObjects: true }) as string[];
  const infinitePhrases = [...phrases, ...phrases, ...phrases];

  return (
    <div className="w-full bg-indigo-950/90 backdrop-blur-md border-y border-white/10 py-5 overflow-hidden relative rotate-1 scale-105 my-16 shadow-2xl">
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-indigo-950 to-transparent z-10 pointer-events-none"></div>
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-indigo-950 to-transparent z-10 pointer-events-none"></div>
      <div className="flex whitespace-nowrap animate-[marquee_25s_linear_infinite]">
        {infinitePhrases.map((phrase, idx) => (
          <span key={idx} className="mx-8 text-lg sm:text-xl font-black text-slate-200 flex items-center gap-4">
            {phrase}
            <Icon icon="solar:star-fall-bold-duotone" className="text-indigo-400 opacity-50" />
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-33.33%); } }
      `}</style>
    </div>
  );
};

// --- Slogan Block ---
const SloganBlock = () => {
  const { t } = useTranslation("landingPage");
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <section 
      className="relative py-24 sm:py-32 overflow-hidden bg-transparent cursor-pointer group select-none"
      onClick={() => setShowOriginal(!showOriginal)}
    >
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grilled-noise.png')] opacity-5 pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center transition-all duration-500">
        <div className={`inline-block p-4 sm:p-5 bg-indigo-100/50 dark:bg-slate-800/50 text-indigo-600 dark:text-indigo-300 rounded-[2rem] mb-8 transform transition-transform duration-500 shadow-sm border border-indigo-200 dark:border-slate-700 ${showOriginal ? 'rotate-12 scale-110' : '-rotate-3 group-hover:rotate-0'}`}>
          <Icon icon={showOriginal ? "solar:heart-bold" : "solar:shop-2-bold-duotone"} className="text-5xl sm:text-6xl animate-pulse" />
        </div>
        
        {showOriginal ? (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <h2
              className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-indigo-950 dark:text-white leading-[1.1] tracking-tighter drop-shadow-sm"
              dangerouslySetInnerHTML={{ __html: t("slogan.main") }}
            />
          </div>
        ) : (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <h2 
              className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#000351] to-[#280051] dark:from-[#7a9dff] dark:to-[#9e7aff] leading-[1.1] tracking-tighter drop-shadow-sm pb-2"
              dangerouslySetInnerHTML={{ __html: t("slogan.secondary") }}
            />
          </div>
        )}

        <p className="mt-8 sm:mt-10 text-xl sm:text-2xl text-black dark:text-white max-w-3xl mx-auto font-bold leading-relaxed transition-all duration-500">
          {t("slogan.philosophy")}
        </p>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
};

// --- Testimonials ---
const Testimonials = () => {
  const { t } = useTranslation("landingPage");
  const reviews = t("testimonials.reviews", { returnObjects: true }) as
    { name: string; role: string; text: string }[];
  const cardMeta = [
    {
      icon: "solar:shop-2-bold-duotone",
      color: "text-pink-600 dark:text-pink-400",
      bg: "bg-pink-100 dark:bg-pink-500/20"
    },
    {
      icon: "solar:map-point-wave-bold-duotone",
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-100 dark:bg-indigo-500/20"
    },
    {
      icon: "solar:crown-star-bold-duotone",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-100 dark:bg-amber-500/20"
    }
  ];

  return (
    <section className="py-24 bg-transparent relative overflow-hidden">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none animate-blob"></div>
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16" data-aos="fade-up">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#000351] to-[#280051] dark:from-[#7a9dff] dark:to-[#9e7aff] font-black tracking-[0.3em] uppercase text-sm md:text-base mb-4 block">
            {t("testimonials.section_tag")}
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-indigo-950 dark:text-white mb-4 tracking-tighter">
            {t("testimonials.section_title")}
          </h2>
          <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 font-bold">{t("testimonials.section_desc")}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((rev, i) => (
            <div
              key={i}
              className="bg-white/70 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-xl border border-white/80 hover:shadow-indigo-200/50 hover:-translate-y-2 transition-all duration-500 relative group"
            >
              <Icon icon="solar:quote-right-bold" className="absolute top-8 right-8 text-7xl text-indigo-500/5 group-hover:scale-110 transition-transform" />
              <p className="text-black text-lg relative z-10 mb-10 font-bold leading-relaxed">"{rev.text}"</p>
              <div className="flex items-center gap-4 relative z-10 mt-auto">
                <div className={`w-14 h-14 flex items-center justify-center rounded-2xl ${cardMeta[i].bg} ${cardMeta[i].color} shadow-lg`}>
                  <Icon icon={cardMeta[i].icon} className="text-3xl" />
                </div>
                <div>
                  <h4 className="font-black text-black text-lg tracking-tight">{rev.name}</h4>
                  <span className="text-xs font-black text-black/60 uppercase tracking-widest">{rev.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- FAQ Accordion ---
const FAQAccordion = () => {
  const { t } = useTranslation("landingPage");
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const faqs = t("faq.questions", { returnObjects: true }) as { q: string; a: string }[];

  return (
    <section className="py-20 md:py-32 bg-transparent">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-12 md:mb-16" data-aos="fade-up">
          <Icon icon="solar:question-circle-bold-duotone" className="text-6xl md:text-7xl text-indigo-600 dark:text-indigo-400 mx-auto mb-6 drop-shadow-lg" />
          <h2 className="text-3xl md:text-5xl font-black text-indigo-950 dark:text-white tracking-tighter">
            {t("faq.title")}
          </h2>

        </div>
        <div className="space-y-4 md:space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className={`border ${openIdx === i ? 'border-indigo-600 dark:border-indigo-500 bg-white dark:bg-slate-800 shadow-xl md:shadow-2xl md:scale-[1.02]' : 'border-indigo-100 dark:border-white/10 bg-indigo-50/50 dark:bg-[#000351]/40'} rounded-[1.5rem] md:rounded-[2.5rem] backdrop-blur-sm overflow-hidden transition-all duration-500`}>
              <button onClick={() => setOpenIdx(openIdx === i ? null : i)} className={`w-full px-5 py-5 md:px-8 md:py-8 flex items-center justify-between text-left cursor-pointer transition-all ${openIdx === i ? 'bg-indigo-50 dark:bg-slate-800/80' : 'hover:bg-indigo-100/50 dark:hover:bg-white/5'}`}>
                <span className={`font-black text-base md:text-xl pr-4 leading-tight tracking-tight drop-shadow-sm ${openIdx === i ? 'text-indigo-950 dark:text-white' : 'text-slate-800 dark:text-white/90'}`}>{faq.q}</span>
                <div className={`w-10 h-10 md:w-14 md:h-14 flex-shrink-0 flex items-center justify-center rounded-xl md:rounded-2xl transition-all duration-500 ${openIdx === i ? 'rotate-180 bg-indigo-600 text-white shadow-lg' : 'bg-indigo-200/50 dark:bg-white/10 text-indigo-900 dark:text-white'}`}>
                  <Icon icon="solar:alt-arrow-down-bold" className="text-lg md:text-2xl" />
                </div>
              </button>
              <div className={`px-5 md:px-8 overflow-hidden transition-all duration-500 ease-in-out ${openIdx === i ? 'max-h-[500px] pb-5 md:pb-8 opacity-100' : 'max-h-0 py-0 opacity-0'}`}>
                <p className={`font-bold text-sm md:text-lg leading-relaxed border-t pt-4 md:pt-6 ${openIdx === i ? 'border-indigo-100 dark:border-slate-700 text-slate-700 dark:text-slate-300' : 'border-transparent text-slate-700 dark:text-slate-300'}`}>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Hero Section ---
const Hero = () => {
  const { t } = useTranslation("landingPage");
  const [metrics, setMetrics] = useState({ vendors: 580, products: 1200 });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const prodRes = await api.get("products/catalog/");
        const prodData = prodRes.data;
        const totalProds = Array.isArray(prodData)
          ? prodData.length
          : (prodData?.results && Array.isArray(prodData.results) ? prodData.results.length : (prodData?.count || 0));

        // Usamos el endpoint público de geo para contar vendedores activos (no el de admin)
        const vendorsRes = await api.get('geo/vendors-locations/');
        const vendorData = vendorsRes.data;
        const vendors = Array.isArray(vendorData) ? vendorData.length : 0;

        setMetrics({ vendors, products: totalProds });
      } catch (err) {
        console.error("Métricas silenciosas fallaron", err);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <section className="relative pt-32 pb-40 px-4 sm:px-6 lg:px-8 mx-auto overflow-hidden flex flex-col items-center justify-center border-b border-transparent">
      <div className="absolute inset-0 w-full h-full pointer-events-none -z-10 bg-transparent">
        <div className="absolute top-[10%] left-1/4 w-[60vw] h-[60vw] bg-[#000351]/20 rounded-full blur-[140px] animate-blob"></div>
        <div className="absolute bottom-[20%] right-1/4 w-[50vw] h-[50vw] bg-[#280051]/20 rounded-full blur-[160px] animate-blob [animation-delay:3s]"></div>
        <div className="absolute top-[40%] right-[10%] w-[40vw] h-[40vw] bg-[#280051]/15 rounded-full blur-[120px] animate-blob [animation-delay:5s]"></div>
      </div>

      <div className="flex flex-col items-center text-center z-10 w-full max-w-5xl mx-auto mt-10" data-aos="zoom-out">
        <div className="inline-flex items-center gap-2 px-5 py-2 mb-10 rounded-full bg-white/60 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 shadow-sm text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform duration-300">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span>{t("hero.status")}</span>
        </div>
        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-[#000351] dark:text-white tracking-tighter mb-8 leading-[1.1] drop-shadow-sm">
          {t("hero.title_1")} <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#000351] to-[#280051] dark:from-[#7a9dff] dark:to-[#9e7aff] pb-2">
            {t("hero.title_2")}
          </span>
        </h1>
        <p className="text-xl sm:text-2xl text-black dark:text-white mb-12 max-w-3xl leading-relaxed font-bold">
          {t("hero.description")}
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-24 w-full justify-center">
          <Link
            to="/auth/register"
            className="group relative inline-flex items-center justify-center px-12 py-5 font-black text-white dark:text-[#000351] transition-all duration-300 bg-gradient-to-r from-[#000351] to-[#280051] dark:from-[#7a9dff] dark:to-[#9e7aff] rounded-2xl hover:shadow-[0_20px_40px_rgba(0,3,81,0.3)] hover:scale-[1.05] overflow-hidden w-full sm:w-auto shadow-2xl"
          >
            <span className="relative flex items-center gap-3 text-lg uppercase tracking-widest">
              {t("hero.register_button")}
              <Icon icon="solar:arrow-right-up-bold-duotone" className="text-2xl group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </span>
          </Link>
          <Link
            to="/catalog"
            className="group relative inline-flex items-center justify-center px-12 py-5 font-black text-indigo-950 dark:text-white transition-all duration-300 bg-white/80 dark:bg-slate-800/80 border-2 border-indigo-200 dark:border-slate-700 rounded-2xl hover:shadow-[0_20px_40px_rgba(79,70,229,0.2)] hover:scale-[1.05] hover:bg-white dark:hover:bg-slate-700 overflow-hidden w-full sm:w-auto shadow-lg backdrop-blur-sm"
          >
            <span className="relative flex items-center gap-3 text-lg uppercase tracking-widest">
              {t("hero.browse_catalog", { defaultValue: "Explorar Catálogo" })}
              <Icon icon="solar:shop-2-bold-duotone" className="text-2xl group-hover:scale-110 transition-transform" />
            </span>
          </Link>
        </div>

        {/* Demo Mockup - Lavender Glass Style */}
        <div className="relative w-full max-w-4xl mx-auto rounded-[2.5rem] p-4 bg-white/60 backdrop-blur-2xl border border-white/60 shadow-2xl shadow-indigo-200/50 overflow-visible group" data-aos="fade-up" data-aos-delay="200">
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
          {/* Estadísticas */}
          <div className="absolute top-20 -right-6 md:-right-10 bg-indigo-50/60 backdrop-blur-2xl p-5 rounded-3xl shadow-2xl border border-white/40 animate-float-day hidden sm:block overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="bg-indigo-100/80 p-3 rounded-2xl text-indigo-600 shadow-inner">
                <Icon icon="solar:clipboard-check-bold-duotone" className="text-3xl" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-black text-[#000351] dark:text-indigo-900 uppercase tracking-widest mb-1">
                  {t("hero.stat_activity")}
                </div>
                <div className="text-2xl font-black text-indigo-950 dark:text-indigo-900">
                  {t("hero.stat_orders_today", { count: 45 })}
                </div>
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
                <AnimatedCounter targetNumber={metrics.vendors} label={t("hero.stat_merchants")} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- Features ---
const Features = () => {
  const { t } = useTranslation("landingPage");
  const features = t("features.list", { returnObjects: true }) as
    { title: string; desc: string }[];

  const featureIcons = [
    'solar:gallery-wide-bold-duotone',
    'solar:map-point-bold-duotone',
    'solar:cart-large-4-bold-duotone',
    'solar:cpu-bold-duotone',
    'solar:users-group-rounded-bold-duotone',
    'solar:wallet-bold-duotone'
  ];
  const featureColors = [
    'from-blue-500 to-indigo-500',
    'from-purple-500 to-pink-500',
    'from-blue-600 to-indigo-600',
    'from-orange-400 to-amber-500',
    'from-teal-400 to-emerald-500',
    'from-green-400 to-emerald-500'
  ];

  return (
    <section id="features" className="py-32 bg-transparent overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20" data-aos="fade-up">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#000351] to-[#280051] dark:from-[#7a9dff] dark:to-[#9e7aff] font-black tracking-[0.3em] uppercase text-sm md:text-base mb-4 block">
            {t("features.tag")}
          </span>
          <h2
            className="text-4xl md:text-5xl lg:text-7xl font-black text-indigo-950 dark:text-white tracking-tighter"
            dangerouslySetInnerHTML={{ __html: t("features.title") }}
          ></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              data-aos="fade-up"
              data-aos-delay={index * 100}
              className="group relative bg-white/60 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white/60 hover:border-indigo-300 shadow-xl shadow-indigo-100/50 hover:shadow-indigo-200/50 transition-all duration-500 transform hover:-translate-y-3 overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${featureColors[index]} rounded-full blur-[100px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none`}></div>
              <div className={`w-16 h-16 rounded-2xl mb-8 flex items-center justify-center bg-gradient-to-br ${featureColors[index]} shadow-2xl text-white transform group-hover:scale-110 group-hover:rotate-[12deg] transition-all duration-500`}>
                <Icon icon={featureIcons[index]} className="text-4xl drop-shadow-lg" />
              </div>
              <h3 className="text-2xl font-black text-indigo-950 dark:text-white mb-3 tracking-tighter">{feature.title}</h3>
              <p className="text-black leading-relaxed font-bold">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- How It Works ---
const HowItWorks = () => {
  const { t } = useTranslation("landingPage");
  const steps = t("howItWorks.steps", { returnObjects: true }) as
    { title: string; desc: string }[];

  return (
    <section id="how-it-works" className="py-32 relative bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 relative">
        <div className="text-center mb-20" data-aos="zoom-in">
          <h2
            className="text-4xl md:text-5xl lg:text-7xl font-black text-indigo-950 dark:text-white mb-6 tracking-tighter leading-none"
            dangerouslySetInnerHTML={{ __html: t("howItWorks.title") }}
          ></h2>
          <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-bold">{t("howItWorks.desc")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 flex flex-col gap-8">
            {[0, 1].map(i => (
              <div key={i}
                className="bg-gradient-to-br from-[#7a9dff] to-[#9e7aff] rounded-[2.5rem] p-10 border border-white/20 flex-1 relative group overflow-hidden shadow-xl"
                data-aos="fade-right"
                data-aos-delay={i === 1 ? "100" : "0"}
              >
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-[#000351]/10 rounded-2xl flex items-center justify-center font-black text-[#000351] text-xl mb-6 shadow-sm border border-[#000351]/10">{i + 1}</div>
                  <h3 className="text-3xl font-black text-[#000351] mb-4 tracking-tight">{steps[i]?.title}</h3>
                  <p className="text-[#000351]/70 font-bold leading-relaxed">{steps[i]?.desc}</p>
                </div>
                <Icon icon={i === 0 ? "solar:user-circle-bold-duotone" : "solar:box-minimalistic-bold-duotone"} className="absolute -bottom-10 -right-10 text-[180px] text-[#000351]/5 group-hover:text-[#000351]/10 transition-all duration-700" />
              </div>
            ))}
          </div>
          <div className="md:col-span-1 bg-gradient-to-br from-[#000351] to-[#280051] rounded-[3rem] p-12 text-white relative group overflow-hidden shadow-3xl transform hover:scale-[1.02] transition-all duration-500" data-aos="zoom-in" data-aos-delay="200">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="relative z-10 flex flex-col h-full items-center text-center justify-center">
              <div className="w-20 h-20 bg-white/20 rounded-3xl border border-white/40 backdrop-blur-md flex items-center justify-center font-black text-white text-3xl mb-10 shadow-inner">3</div>
              <Icon icon="solar:global-bold-duotone" className="text-8xl mb-8 animate-float-day drop-shadow-2xl" />
              <h3 className="text-4xl font-black mb-6 tracking-tighter text-white">{steps[2]?.title}</h3>
              <p className="text-white/90 font-bold text-xl leading-relaxed">
                {steps[2]?.desc}
              </p>
            </div>
          </div>
          <div className="md:col-span-1 bg-gradient-to-br from-[#7a9dff] to-[#9e7aff] rounded-[3rem] p-12 text-[#000351] relative group overflow-hidden shadow-3xl flex flex-col justify-between" data-aos="fade-left" data-aos-delay="300">
            <div>
              <div className="w-14 h-14 bg-[#000351]/10 rounded-2xl border border-[#000351]/20 flex items-center justify-center font-black text-[#000351] text-xl mb-8 shadow-sm">4</div>
              <h3 className="text-3xl font-black text-[#000351] mb-6 tracking-tighter">{steps[3]?.title}</h3>
              <p className="text-[#000351]/70 font-bold text-lg leading-relaxed mb-12">{steps[3]?.desc}</p>
            </div>
            <div className="bg-[#000351]/10 backdrop-blur-md rounded-[1.5rem] p-6 border border-[#000351]/20 group-hover:-translate-y-4 transition-all duration-500 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-[#000351] uppercase tracking-[0.2em]">{t("howItWorks.notify.synced")}</span>
                <Icon icon="solar:bell-bing-bold-duotone" className="text-3xl text-[#000351] animate-pulse" />
              </div>
              <div className="font-black text-xl text-[#000351] tracking-tight">{t("howItWorks.notify.new_order")}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- CTA ---
const CTA = () => {
  const { t } = useTranslation("landingPage");
  return (
    <section className="py-24 px-4 relative bg-transparent">
      <div className="max-w-6xl mx-auto rounded-[4rem] p-12 md:p-24 text-center text-white shadow-3xl relative overflow-hidden bg-gradient-to-br from-[#000351] to-[#280051] border border-white/10" data-aos="fade-up">
        <div className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none mix-blend-overlay">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-indigo-500/20 via-cyan-400/20 to-transparent rounded-full blur-[120px] animate-spin-slow"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 rounded-3xl mb-12 border border-white/20 backdrop-blur-xl shadow-2xl">
            <Icon icon="solar:stars-minimalistic-bold-duotone" className="text-5xl text-cyan-400" />
          </div>
          <h2
            className="text-6xl md:text-8xl font-black mb-10 leading-tight tracking-tighter text-white drop-shadow-2xl"
            dangerouslySetInnerHTML={{ __html: t("cta.title") }}
          ></h2>
          <p className="text-2xl sm:text-3xl text-indigo-100/80 font-bold mb-16 max-w-3xl mx-auto leading-relaxed">{t("cta.desc")}</p>
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-600 via-cyan-400 to-indigo-600 rounded-full blur-2xl opacity-40 group-hover:opacity-100 transition duration-700 animate-pulse"></div>
            <Link
              to="/auth/register"
              className="relative flex items-center justify-center gap-4 bg-white text-indigo-950 px-16 py-8 rounded-full font-black text-2xl hover:scale-[1.05] transition-all duration-500 shadow-3xl uppercase tracking-widest"
            >
              {t("cta.button")}
              <Icon icon="solar:shop-2-bold-duotone" className="text-4xl" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

const Home = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 font-sans text-slate-700 dark:text-slate-200 selection:bg-[#000351]/30 selection:text-[#280051] overflow-x-hidden relative">
      <Helmet>
        <title>ShopStarter | Conecta tu Negocio Local con tu Comunidad</title>
        <meta name="description" content="Digitaliza tu tienda de barrio o emprendimiento local. Gestiona pedidos, muestra tu catálogo y conéctate con tus vecinos sin comisiones." />
        <meta property="og:title" content="ShopStarter - Impulsa tu Negocio Local" />
        <meta property="og:description" content="La plataforma organizacional para emprendedores locales. Gratis, fácil y sin comisiones." />
        <meta property="og:image" content="/og-image.jpg" />
      </Helmet>
      {/* ... efectos decorativos ... */}
      <TopBanner />
      <main className="relative z-10">
        <Hero />
        <MarqueeStrip />
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
          <section className="py-24 bg-white/30 dark:bg-slate-900/40 backdrop-blur-sm">
            <VisualCatalog />
          </section>
          <section className="bg-indigo-950/[0.06] dark:bg-slate-900/60 backdrop-blur-xl py-20 border-b border-white/20">
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
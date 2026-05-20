const Icons = {
  X: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.214-6.817L5.769 21.75H2.46l7.73-8.835L1.54 2.25h6.822l4.822 6.383L18.244 2.25zM17.41 19.87h1.823L6.397 4.881H4.47L17.41 19.87z" /></svg>
  ),
  Instagram: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7.5 2h9A5.5 5.5 0 0122 7.5v9A5.5 5.5 0 0116.5 22h-9A5.5 5.5 0 012 16.5v-9A5.5 5.5 0 017.5 2zm0 1.5A4 4 0 003.5 7.5v9A4 4 0 007.5 20.5h9a4 4 0 004-4v-9a4 4 0 00-4-4h-9zm9 2.5a1 1 0 110 2 1 1 0 010-2zm-4.5 1.5a5 5 0 110 10 5 5 0 010-10zm0 1.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" /></svg>
  ),
  ArrowRight: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
  )
};

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Parte Superior: Newsletter y Logo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12 pb-12 border-b border-white/5">
          <div>
            <h3 className="text-3xl font-black text-white tracking-tighter italic">SHOP<span className="text-indigo-500">STARTER</span></h3>
            <p className="text-sm text-slate-500 mt-2 font-bold italic">Impulsando el emprendimiento local.</p>
          </div>
          
          <div className="md:text-right">
            <div className="flex flex-col sm:flex-row gap-2 max-w-md md:ml-auto">
  
            </div>
          </div>
        </div>

        {/* Parte Media: Enlaces de Navegación */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h5 className="text-white font-black uppercase tracking-widest text-xs mb-6">Producto</h5>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-indigo-400 transition font-bold">Características</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition font-bold">Plantillas</a></li>
            
              <li><a href="#" className="hover:text-indigo-400 transition font-bold">Changelog</a></li>
            </ul>
          </div>
          
          <div>
            <h5 className="text-white font-black uppercase tracking-widest text-xs mb-6">Recursos</h5>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-indigo-400 transition font-bold">Documentación</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition font-bold">Guías de API</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition font-bold">Soporte</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition font-bold">Comunidad</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-black uppercase tracking-widest text-xs mb-6">Compañía</h5>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-indigo-400 transition font-bold">Sobre Nosotros</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition font-bold">Blog</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition font-bold">Carreras</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition font-bold">Contacto</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-black uppercase tracking-widest text-xs mb-6">Legal</h5>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-indigo-400 transition font-bold">Privacidad</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition font-bold">Términos</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition font-bold">Licencia</a></li>
            </ul>
          </div>
        </div>

        {/* Parte Inferior: Copyright y Redes */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5">
          <p className="text-sm text-slate-600 font-bold">
            &copy; {new Date().getFullYear()} ShopStarter Inc. Todos los derechos reservados.
          </p>
          
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="https://x.com/ShopStarter1604" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition transform hover:scale-110">
              <Icons.X />
            </a>
            <a href="https://www.instagram.com/shopstarter.online/" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition transform hover:scale-110">
              <Icons.Instagram />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
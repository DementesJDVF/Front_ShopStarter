import { Link } from "react-router";
import LogoImage from "src/assets/images/logos/shopstarter-logo.png";

interface FullLogoProps {
  isCollapsed?: boolean;
}

const FullLogo = ({ isCollapsed = false }: FullLogoProps) => {
  return (
    <Link to={"/"} className="flex items-center gap-3 group decoration-none shrink-0">
      {/* 🚀 Round Icon - High Precision Layout & Scaling (Elegant sizing) */}
      <div className={`logo-container logo-glow flex-shrink-0 relative transition-all duration-300 ease-out
        ${isCollapsed ? 'w-10 h-10' : 'w-11 h-11 md:w-12 md:h-12'}`}>
        <div className="logo-inner-ring"></div>
        <div className="w-full h-full rounded-full overflow-hidden border border-white/20 relative z-20 bg-white shadow-lg shadow-indigo-500/10 flex items-center justify-center">
           <img 
            src={LogoImage} 
            alt="ShopStarter" 
            className="w-[185%] h-[185%] max-w-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[68%] object-contain transform transition-transform duration-500 group-hover:scale-110" 
          />
        </div>
      </div>

      {/* 💎 Brand Name - Perfectly Balanced, Clean Typography (No italics, controlled tracking) */}
      {!isCollapsed && (
        <div className="flex flex-col leading-none animate-fade-in pl-0.5 justify-center mt-0.5">
          <h2 className="text-xl md:text-[22px] font-extrabold tracking-tight leading-none whitespace-nowrap">
            <span className="text-gray-900 dark:text-gray-50">Shop</span>
            <span className="text-brand-gradient ml-[1px]">Starter</span>
          </h2>
        </div>
      )}
    </Link>
  );
};

export default FullLogo;

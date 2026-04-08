import { Link } from "react-router";

const FullLogo = () => {
  return (
    <Link to={"/"} className="flex items-center gap-2 group decoration-none">
      <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:bg-indigo-700 transition">
        <span className="text-white font-black text-xl italic">S</span>
      </div>
      <span className="text-2xl font-black tracking-tight text-gray-900 group-hover:text-indigo-600 transition">
        Shop<span className="text-indigo-600 group-hover:text-gray-900">Starter</span>
      </span>
    </Link>
  );
};

export default FullLogo;

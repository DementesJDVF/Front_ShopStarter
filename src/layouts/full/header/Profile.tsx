import { Button, Dropdown } from "flowbite-react";
import { Icon } from "@iconify/react";
import user1 from "/src/assets/images/profile/user-1.jpg";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../../context/AuthContext";
import { useTranslation } from 'react-i18next';

interface ProfileProps {
  variant?: "light" | "dark";
}

const Profile = ({ variant = "dark" }: ProfileProps) => {
  const isDark = variant === "dark";
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation('header');

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  return (
    <div className="relative group/menu">
      <Dropdown
        label=""
        className="rounded-sm w-44"
        dismissOnClick={false}
        renderTrigger={() => (
          <div className="flex items-center gap-2 cursor-pointer group-hover/menu:text-primary p-2 rounded-lg hover:bg-lightprimary transition">
            <span className="h-10 w-10 flex justify-center items-center">
              <img
                src={user1}
                alt="logo"
                height="35"
                width="35"
                className="rounded-full"
              />
            </span>
            <div className="text-left hidden sm:block">
               <p className={`text-sm font-bold ${isDark ? 'text-gray-900 dark:text-white' : 'text-white'}`}>{user?.username || t('profile.userFallback')}</p>
               <p className={`text-xs uppercase font-black ${isDark ? 'text-gray-600 dark:text-gray-300' : 'text-white/90'}`}>{user?.role}</p>
            </div>
          </div>
        )}
      >

        <Dropdown.Item
          as={Link}
          to="#"
          className="px-3 py-3 flex items-center bg-hover group/link w-full gap-3 text-gray-700 dark:text-white hover:bg-primary/10"
        >
          <Icon icon="solar:user-circle-outline" className="text-gray-500 dark:text-gray-400" height={20} />
          {t('profile.myProfile')}
        </Dropdown.Item>
        <Dropdown.Item
          as={Link}
          to="#"
          className="px-3 py-3 flex items-center bg-hover group/link w-full gap-3 text-gray-700 dark:text-white hover:bg-primary/10"
        >
          <Icon icon="solar:letter-linear" className="text-gray-500 dark:text-gray-400" height={20} />
          {t('profile.myAccount')}
        </Dropdown.Item>
        <Dropdown.Item
          as={Link}
          to="/usuario/seguridad"
          className="px-3 py-3 flex items-center bg-hover group/link w-full gap-3 text-gray-700 dark:text-white hover:bg-primary/10"
        >
          <Icon icon="solar:shield-keyhole-linear" className="text-gray-500 dark:text-gray-400" height={20} />
          {t('profile.security')}
        </Dropdown.Item>

        <div className="p-3 pt-0">
          <Button 
            onClick={handleLogout}
            size={'sm'} 
            className="w-full mt-2 border border-primary/20 text-gray-800 dark:text-white bg-primary/10 hover:bg-primary hover:text-white transition-all duration-300 rounded-xl"
          >
            {t('profile.logout')}
          </Button>
        </div>
      </Dropdown>
    </div>
  );
};

export default Profile;
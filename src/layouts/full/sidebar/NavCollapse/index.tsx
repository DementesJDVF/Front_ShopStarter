import React from "react";
import { ChildItem } from "../Sidebaritems";
import { Sidebar, Tooltip } from "flowbite-react";
import { Icon } from "@iconify/react";
import { Link, useLocation } from "react-router";
import { useTranslation } from "react-i18next";

interface NavItemsProps {
  item: ChildItem;
  isCollapsed?: boolean;
}

const NavItems: React.FC<NavItemsProps> = ({ item, isCollapsed = false }) => {
  const location = useLocation();
  const pathname = location.pathname;
  const { t } = useTranslation("sidebar");

  const content = (
    <Sidebar.Item
      to={item.url}
      target={item?.isPro ? "blank" : "_self"}
      as={Link}
      className={`transition-all duration-300 w-full block ${item.url == pathname
          ? "text-white bg-white/20 backdrop-blur-md shadow-xl rounded-xl border border-white/20"
          : "text-white/60 font-bold bg-transparent group/link hover:bg-white/10 hover:text-white"
        } ${isCollapsed ? 'px-2' : 'px-4 mb-1'}`}
    >
      <div className={`flex items-center gap-3 w-full transition-all duration-300`}>
        <div className="flex-shrink-0 flex items-center justify-center w-6 h-6">
          {item.icon ? (
            <Icon icon={item.icon} className={`text-[#2CD4D9] transition-transform duration-300 ${!isCollapsed ? 'scale-110' : ''}`} height={20} />
          ) : (
            <span
              className={`${item.url == pathname
                ? "bg-white"
                : "bg-black/40 dark:bg-white/40"
                } h-1.5 w-1.5 rounded-full`}
            ></span>
          )}
        </div>
        <span className={`transition-all duration-300 origin-left whitespace-nowrap ${
          isCollapsed ? 'opacity-0 w-0 scale-95 overflow-hidden' : 'opacity-100 w-auto scale-100'
        }`}>
          {t(item.name ?? "")}
          {item.isPro && (
            <span className="ml-2 py-0.5 px-2 text-[10px] bg-secondary/10 text-secondary rounded animate-pulse">{t("Pro")}</span>
          )}
        </span>
      </div>
    </Sidebar.Item>
  );

  return isCollapsed ? (
    <Tooltip content={t(item.name ?? "")} placement="right" style="light">
      {content}
    </Tooltip>
  ) : content;
};

export default NavItems;
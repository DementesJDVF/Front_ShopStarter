import { uniqueId } from "lodash";

export interface ChildItem {
  id?: number | string;
  name?: string; // clave de i18n, por ejemplo "Productos"
  icon?: any;
  children?: ChildItem[];
  item?: any;
  url?: any;
  color?: string;
  isPro?: boolean;
}

export interface MenuItem {
  heading?: string; // clave de i18n, por ejemplo "VENDEDOR"
  name?: string;
  icon?: any;
  id?: number | string;
  to?: string;
  items?: MenuItem[];
  children?: ChildItem[];
  url?: any;
  isPro?: boolean;
}

/**
 * Definición de los ítems de navegación del Sidebar.
 * Los valores de `heading` y `name` aquí son las claves que están en tus JSON de i18n.
 */
const SidebarContent: MenuItem[] = [
  {
    heading: "VENDEDOR",
    children: [
      {
        name: "Mi Dashboard",
        icon: "solar:widget-add-line-duotone",
        id: uniqueId(),
        url: "/vendedor/dashboard",
      },
      {
        name: "Productos",
        icon: "solar:cart-large-minimalistic-outline",
        id: uniqueId(),
        url: "/vendedor/productos",
      },
      {
        name: "Mapa",
        icon: "solar:map-point-line-duotone",
        id: uniqueId(),
        url: "/vendedor/mapa",
      },
      {
        name: "Pedidos",
        icon: "solar:calendar-mark-line-duotone",
        id: uniqueId(),
        url: "/vendedor/pedidos",
      },
      {
        name: "Reseñas",
        icon: "solar:star-fall-2-outline",
        id: uniqueId(),
        url: "/vendedor/reseñas",
      },
    ],
  },
  {
    heading: "CLIENTE",
    children: [
      {
        name: "Inicio",
        icon: "solar:home-2-outline",
        id: uniqueId(),
        url: "/cliente/home",
      },
      {
        name: "Catálogo",
        icon: "solar:shop-2-outline",
        id: uniqueId(),
        url: "/cliente/productos",
      },
      {
        name: "Mapa",
        icon: "solar:map-point-line-duotone",
        id: uniqueId(),
        url: "/cliente/mapa",
      },
      {
        name: "Reseñas",
        icon: "solar:star-fall-2-outline",
        id: uniqueId(),
        url: "/cliente/reseñas",
      },
    ],
  },
  {
    heading: "ADMIN",
    children: [
      {
        name: "Panel de Control",
        icon: "solar:widget-add-line-duotone",
        id: uniqueId(),
        url: "/admin",
      },
      {
        name: "Aprobación Productos",
        icon: "solar:clipboard-check-outline",
        id: uniqueId(),
        url: "/admin/productos/aprobar",
      },
      {
        name: "Gestión Usuarios",
        icon: "solar:users-group-two-rounded-outline",
        id: uniqueId(),
        url: "/admin/usuarios",
      },
      {
        name: "Categorías",
        icon: "solar:layers-minimalistic-outline",
        id: uniqueId(),
        url: "/admin/categorias",
      },
    ],
  },
  {
    heading: "SISTEMA (UI)",
    children: [
      {
        name: "Typography",
        icon: "solar:text-circle-outline",
        id: uniqueId(),
        url: "/ui/typography",
      },
      {
        name: "Table",
        icon: "solar:bedside-table-3-linear",
        id: uniqueId(),
        url: "/ui/table",
      },
      {
        name: "Form",
        icon: "solar:password-minimalistic-outline",
        id: uniqueId(),
        url: "/ui/form",
      },
      {
        name: "Alert",
        icon: "solar:airbuds-case-charge-outline",
        id: uniqueId(),
        url: "/ui/alert",
      },
    ],
  },
];

export default SidebarContent;
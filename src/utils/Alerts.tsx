import toast from 'react-hot-toast';
import { ReactNode } from 'react';
import { Icon } from '@iconify/react';

// Estilos base para los toasts (diseño moderno, sombras suaves, borde redondeado)
const toastOptions = {
  duration: 4000,
  style: {
    borderRadius: '16px',
    background: '#ffffff',
    color: '#001E4C',
    padding: '16px 24px',
    boxShadow: '0 20px 40px rgba(0, 30, 76, 0.12), 0 4px 12px rgba(0, 50, 76, 0.05)',
    border: '1px solid rgba(0, 50, 76, 0.08)',
    fontWeight: 600,
    fontSize: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontFamily: "'Manrope', system-ui, sans-serif",
    zIndex: 99990, // Por debajo del filtro global de daltonismo (99997)
  },
};

/**
 * Notificación de Éxito
 */
export const showSuccessAlert = (message: string | ReactNode) => {
  toast.success(message, {
    ...toastOptions,
    icon: <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 shadow-inner"><Icon icon="solar:check-circle-bold-duotone" className="text-xl" /></span>,
    style: {
      ...toastOptions.style,
      borderLeft: '5px solid #10b981',
    },
  });
};

/**
 * Notificación de Error
 */
export const showErrorAlert = (message: string | ReactNode) => {
  toast.error(message, {
    ...toastOptions,
    duration: 6000, // Los errores requieren más tiempo para leer
    icon: <span className="flex items-center justify-center w-8 h-8 rounded-full bg-rose-100 text-rose-600 shadow-inner"><Icon icon="solar:close-circle-bold-duotone" className="text-xl" /></span>,
    style: {
      ...toastOptions.style,
      borderLeft: '5px solid #f43f5e',
    },
  });
};

/**
 * Notificación de Advertencia
 */
export const showWarningAlert = (message: string | ReactNode) => {
  toast(message, {
    ...toastOptions,
    duration: 5000,
    icon: <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-600 shadow-inner"><Icon icon="solar:danger-triangle-bold-duotone" className="text-xl" /></span>,
    style: {
      ...toastOptions.style,
      borderLeft: '5px solid #f59e0b',
    },
  });
};

/**
 * Notificación de Información
 */
export const showInfoAlert = (message: string | ReactNode) => {
  toast(message, {
    ...toastOptions,
    icon: <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 shadow-inner"><Icon icon="solar:info-circle-bold-duotone" className="text-xl" /></span>,
    style: {
      ...toastOptions.style,
      borderLeft: '5px solid #00324C',
    },
  });
};

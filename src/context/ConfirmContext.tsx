import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Icon } from '@iconify/react';

interface ConfirmContextType {
  confirm: (message: string, options?: ConfirmOptions) => Promise<boolean>;
}

interface ConfirmOptions {
  title?: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [options, setOptions] = useState<ConfirmOptions>({});
  const [resolvePromise, setResolvePromise] = useState<(value: boolean) => void>(() => () => {});

  const confirm = useCallback((msg: string, opts: ConfirmOptions = {}) => {
    setMessage(msg);
    setOptions(opts);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolvePromise(() => resolve);
    });
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    resolvePromise(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    resolvePromise(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[99990] flex items-center justify-center p-4 bg-[#001E4C]/30 backdrop-blur-md transition-all duration-300 animate-[fadeIn_0.2s_ease-out]"
          onClick={handleCancel}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[24px] shadow-[0_20px_50px_rgba(0,30,76,0.3)] border border-slate-100 dark:border-slate-800 overflow-hidden transform transition-all animate-[slideUp_0.3s_cubic-bezier(0.34,1.56,0.64,1)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className={`p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 ${options.isDestructive ? 'bg-rose-50/50 dark:bg-rose-900/10' : 'bg-slate-50/50 dark:bg-slate-800/50'}`}>
              <div className={`flex items-center justify-center w-12 h-12 rounded-2xl ${options.isDestructive ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-[#00324C]'}`}>
                <Icon icon={options.isDestructive ? "solar:trash-bin-trash-bold-duotone" : "solar:question-circle-bold-duotone"} className="text-3xl" />
              </div>
              <h3 className="text-xl font-black text-[#001E4C] dark:text-white">
                {options.title || 'Confirmar acción'}
              </h3>
            </div>

            {/* Cuerpo */}
            <div className="p-6">
              <p className="text-slate-600 dark:text-slate-300 font-bold leading-relaxed text-[15px]">
                {message}
              </p>
            </div>

            {/* Footer con botones */}
            <div className="p-6 pt-2 flex items-center justify-end gap-3 bg-slate-50/30 dark:bg-slate-900">
              <button
                onClick={handleCancel}
                className="px-6 py-2.5 rounded-xl font-black text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-white transition-all shadow-sm"
              >
                {options.cancelText || '❌ Cancelar'}
              </button>
              <button
                onClick={handleConfirm}
                className={`px-6 py-2.5 rounded-xl font-black text-white shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 ${
                  options.isDestructive
                    ? 'bg-gradient-to-r from-rose-500 to-rose-600 hover:shadow-rose-500/30 ring-2 ring-transparent focus:ring-rose-200'
                    : 'bg-gradient-to-r from-[#00324C] to-[#001E4C] hover:shadow-[#00324C]/30 ring-2 ring-transparent focus:ring-indigo-200'
                }`}
              >
                {options.confirmText || '✅ Confirmar'}
              </button>
            </div>
          </div>
          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
          `}</style>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (context === undefined) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context.confirm;
};

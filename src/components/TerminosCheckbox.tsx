import React from 'react';
import { Checkbox, Label } from 'flowbite-react';
import { Icon } from '@iconify/react';

interface TerminosCheckboxProps {
  aceptado: boolean;
  onChange: (valor: boolean) => void;
  error?: boolean;
}

const TerminosCheckbox: React.FC<TerminosCheckboxProps> = ({
  aceptado,
  onChange,
  error = false,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div
        className={`flex items-start gap-4 p-5 rounded-3xl border transition-all shadow-sm group ${
          error
            ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
            : 'bg-[#3A17E4]/5 dark:bg-[#3A17E4]/10 border-[#3A17E4]/20 hover:bg-[#3A17E4]/10 dark:hover:bg-[#3A17E4]/20'
        }`}
      >
        <Checkbox
          id="terminos_aceptados"
          checked={aceptado}
          onChange={(e) => onChange(e.target.checked)}
          required
          className={`${
            error
              ? 'text-red-500 focus:ring-red-500'
              : 'text-[#3A17E4] focus:ring-[#3A17E4]'
          } h-5 w-5 mt-1 cursor-pointer rounded-lg`}
        />
        <Label
          htmlFor="terminos_aceptados"
          className={`text-xs font-bold leading-relaxed cursor-pointer ${
            error
              ? 'text-red-700 dark:text-red-300'
              : 'text-[#0A014A] dark:text-slate-200'
          }`}
        >
          He leído y acepto los{' '}
          <a
            href="/terminos"
            target="_blank"
            rel="noopener noreferrer"
            className={`${
              error ? 'text-red-600 dark:text-red-400' : 'text-[#3A17E4]'
            } font-black hover:underline outline-none transition-colors`}
          >
            Términos y Condiciones
          </a>
        </Label>
      </div>
      {error && (
        <div className="flex items-center gap-2 text-red-500 dark:text-red-400 text-xs font-bold animate-shake">
          <Icon icon="solar:danger-square-bold-duotone" className="text-sm" />
          Debes aceptar los términos para continuar
        </div>
      )}
    </div>
  );
};

export default TerminosCheckbox;

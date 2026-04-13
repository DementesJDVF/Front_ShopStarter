import React, { useState } from 'react';
import CardBox from '../../components/shared/CardBox';
import { Button, Label, Spinner } from 'flowbite-react';
import { Icon } from '@iconify/react';
import api from '../../utils/axios';
import CustomTextInput from '../../components/shared/CustomTextInput';

const Security = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (formData.new_password !== formData.confirm_password) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }

    if (formData.new_password.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      // Endpoint estándar para cambio de contraseña
      await api.post('users/auth/password/change/', {
        old_password: formData.old_password,
        new_password: formData.new_password,
      });
      setSuccess(true);
      setFormData({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Error al cambiar la contraseña. Verifica tu contraseña actual.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 animate-fade-in">
      <CardBox>
        <div className="flex items-center gap-3 mb-6 border-b pb-4">
          <div className="p-3 bg-indigo-50 text-primary rounded-2xl">
            <Icon icon="solar:shield-keyhole-bold-duotone" height={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-indigo-900">Seguridad</h2>
            <p className="text-sm text-gray-500 font-medium">Actualiza tu contraseña para mantener tu cuenta segura</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold flex items-center gap-2 animate-shake">
            <Icon icon="solar:danger-bold" height={20} />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm font-bold flex items-center gap-2 animate-fade-in">
            <Icon icon="solar:check-circle-bold" height={20} />
            ¡Contraseña actualizada con éxito!
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="old_password" value="Contraseña Actual" className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500" />
              <CustomTextInput
                id="old_password"
                isPassword
                required
                value={formData.old_password}
                onChange={handleChange}
                placeholder="••••••••"
                className="form-rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <Label htmlFor="new_password" value="Nueva Contraseña" className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500" />
                <CustomTextInput
                  id="new_password"
                  isPassword
                  required
                  value={formData.new_password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="form-rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="confirm_password" value="Repetir Nueva Contraseña" className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500" />
                <CustomTextInput
                  id="confirm_password"
                  isPassword
                  required
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="form-rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
            <Icon icon="solar:info-circle-bold-duotone" className="text-amber-500 mt-0.5" height={20} />
            <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
              La nueva contraseña debe tener al menos 8 caracteres, incluir una mayúscula, un número y un símbolo especial para mayor seguridad.
            </p>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full py-2 bg-primary hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all"
          >
            {loading ? <Spinner size="sm" className="mr-2" /> : <Icon icon="solar:lock-password-bold" className="mr-2" />}
            {loading ? 'Procesando...' : 'Cambiar Contraseña'}
          </Button>
        </form>
      </CardBox>
    </div>
  );
};

export default Security;

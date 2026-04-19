import React, { useState } from 'react';
import { Button, Checkbox, Label, TextInput, Select, Modal } from 'flowbite-react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router';
import api from '../../../utils/axios';
import CustomTextInput from 'src/components/shared/CustomTextInput';
import FullLogo from 'src/layouts/full/shared/logo/FullLogo';

const fieldLabels: Record<string, string> = {
    username: 'Nombre de usuario',
    email: 'Correo electrónico',
    password: 'Contraseña',
    password_confirm: 'Confirmación de contraseña',
    full_name: 'Nombre completo',
    national_id: 'Cédula',
    document_number: 'Número de documento',
    document_type: 'Tipo de documento',
    phone_number: 'Teléfono',
    birth_date: 'Fecha de nacimiento',
    role: 'Rol de usuario',
};

const AuthRegister = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showTerms, setShowTerms] = useState(false);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password_confirm: '',
        role: 'CLIENTE', // VENDEDOR o CLIENTE
        full_name: '',
        national_id: '',
        phone_number: '',
        document_type: 'CC',
        document_number: '',
        birth_date: '',
        is_human: false,
        accepted_terms: false,
        honeypot: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData({ ...formData, [id]: val });
    };

    const validateStep = () => {
        setError(null);
        if (step === 1) {
            if (!formData.username.trim()) { setError("El usuario es obligatorio."); return false; }
            if (!formData.email.trim()) { setError("El correo es obligatorio."); return false; }
            if (!/\S+@\S+\.\S+/.test(formData.email)) { setError("Formato de correo inválido."); return false; }
        }
        if (step === 2) {
            if (formData.password.length < 8) { setError("La contraseña debe tener al menos 8 caracteres."); return false; }
            if (formData.password !== formData.password_confirm) { setError("Las contraseñas no coinciden."); return false; }
        }
        return true;
    };

    const passwordMismatch = step === 2 && formData.password_confirm.length > 0 && formData.password !== formData.password_confirm;

    const nextStep = () => { if (validateStep()) setStep(step + 1); };
    const prevStep = () => setStep(step - 1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (step < 3) { nextStep(); return; }
        if (!validateStep()) return;
        if (!formData.accepted_terms) { setError("Debes aceptar los términos y condiciones."); return; }

        setLoading(true);
        setError(null);

        try {
            const dataToSend = {
                ...formData,
                is_human: true, // Forzamos esto si pasó el checkbox
            };

            const response = await api.post('users/auth/register/', dataToSend);
            if (response.status === 201) setShowSuccess(true);
        } catch (err: any) {
            const responseData = err.response?.data;
            if (responseData) {
                const mainMsg = responseData.message || responseData.detail;
                const fieldDetails = responseData.details;
                if (fieldDetails && typeof fieldDetails === 'object' && Object.keys(fieldDetails).length > 0) {
                    const fieldMessages = Object.entries(fieldDetails)
                        .map(([field, msgs]) => {
                            const label = fieldLabels[field] || field;
                            const message = Array.isArray(msgs) ? msgs[0] : String(msgs);
                            return `${label}: ${message}`;
                        }).join(" | ");
                    setError(fieldMessages);
                } else {
                    setError(mainMsg || "Error al registrar. Revisa tus datos.");
                }
            } else {
                setError("Error de conexión con el servidor.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (showSuccess) {
        return (
            <div className="flex flex-col items-center justify-center p-10 animate-fade-in text-center">
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                    <Icon icon="solar:check-circle-bold-duotone" className="text-6xl text-green-500" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-4">¡Registro Exitoso!</h2>
                <p className="text-slate-600 mb-8 max-w-sm">Tu cuenta ha sido creada. Si eres vendedor, un administrador revisará tu perfil pronto.</p>
                <Link to="/auth/login" className="bg-[#3A17E4] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:shadow-xl transition-all">
                    Ir al Inicio de Sesión
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full animate-fade-in">
            {/* CARD DE REGISTRO: GLASSMORPHISM PREMIUM (Simplificado para importación) */}
            <div className="glass-card-premium p-8 sm:p-10 border border-white/50 dark:border-white/10 shadow-2xl">
                
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-black text-[#0A014A] tracking-tighter mb-2">Comienza tu viaje</h2>
                    <p className="text-xs font-bold text-slate-500/80 uppercase tracking-[0.2em]">Registro de nuevo usuario</p>
                </div>

                    {/* Barra de Progreso Visual */}
                    <div className="flex items-center justify-between mb-8 px-2 relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10 rounded-full"></div>
                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#3A17E4] -z-10 rounded-full transition-all duration-500 shadow-[0_0_10px_#3A17E4]`} style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
                        
                        {[1, 2, 3].map((s) => (
                            <div key={s} className={`w-9 h-9 flex items-center justify-center rounded-full font-black text-xs transition-all duration-300 ${step >= s ? 'bg-[#3A17E4] text-white shadow-lg shadow-indigo-600/30 ring-4 ring-indigo-100' : 'bg-white text-slate-400 border border-slate-200'}`}>
                                {s}
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        {step === 1 && (
                            <div className="flex flex-col gap-5 animate-fade-in">
                                <div>
                                    <Label value="Nombre de Usuario" className="text-[11px] font-extrabold text-[#0A014A] dark:text-slate-300 uppercase tracking-wider ml-1 mb-1.5 block" />
                                    <TextInput id="username" required value={formData.username} onChange={handleChange} placeholder="ej: juan.perez" className="mt-1 form-rounded-xl" />
                                </div>
                                <div>
                                    <Label value="Correo Electrónico" className="text-[11px] font-extrabold text-[#0A014A] dark:text-slate-300 uppercase tracking-wider ml-1 mb-1.5 block" />
                                    <TextInput id="email" type="email" required value={formData.email} onChange={handleChange} placeholder="tu@correo.com" className="mt-1 form-rounded-xl" />
                                </div>
                                <div>
                                    <Label value="¿Cómo quieres registrarte?" className="text-[11px] font-extrabold text-[#0A014A] dark:text-slate-300 uppercase tracking-wider ml-1 mb-1.5 block" />
                                    <Select id="role" value={formData.role} onChange={handleChange} className="mt-1 form-rounded-xl focus:ring-[#3A17E4] focus:border-[#3A17E4] rounded-2xl">
                                        <option value="CLIENTE">👤 Cliente (Quiero comprar)</option>
                                        <option value="VENDEDOR">🏪 Vendedor (Tengo un negocio)</option>
                                    </Select>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="flex flex-col gap-5 animate-fade-in">
                                <div>
                                    <Label value="Contraseña Segura" className="text-[11px] font-extrabold text-[#0A014A] dark:text-slate-300 uppercase tracking-wider ml-1 mb-1.5 block" />
                                    <CustomTextInput id="password" isPassword required value={formData.password} onChange={handleChange} className="mt-1 form-rounded-xl" placeholder="••••••••" />
                                </div>
                                <div>
                                    <Label value="Confirmar Contraseña" className="text-[11px] font-extrabold text-[#0A014A] dark:text-slate-300 uppercase tracking-wider ml-1 mb-1.5 block" />
                                    <CustomTextInput id="password_confirm" isPassword required value={formData.password_confirm} onChange={handleChange} className={`mt-1 form-rounded-xl transition-colors ${passwordMismatch ? 'border-red-500 ring-red-500/20' : ''}`} placeholder="••••••••" />
                                    {passwordMismatch && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 animate-fade-in uppercase tracking-tighter">Las contraseñas no coinciden</p>}
                                </div>

                                <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800 mt-2">
                                    <p className="text-[10px] text-indigo-600 dark:text-indigo-300 font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                                        <Icon icon="solar:shield-check-bold" /> Seguridad
                                    </p>
                                    <p className="text-xs text-indigo-800/80 dark:text-indigo-200/80 leading-relaxed font-semibold italic">"Usa al menos 8 caracteres para una cuenta protegida."</p>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="flex flex-col gap-5 animate-fade-in">
                                <div>
                                    <Label value="Tu Nombre Completo" className="text-[11px] font-extrabold text-[#0A014A] dark:text-slate-300 uppercase tracking-wider ml-1 mb-1.5 block" />
                                    <TextInput id="full_name" required value={formData.full_name} onChange={handleChange} placeholder="ej: Juan Pérez" className="mt-1 form-rounded-xl" />
                                </div>

                                {formData.role === 'VENDEDOR' && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label value="Tipo Doc" className="text-[11px] font-extrabold text-[#0A014A] uppercase tracking-wider ml-1 mb-1.5 block" />
                                                <Select id="document_type" value={formData.document_type} onChange={handleChange} className="mt-1 form-rounded-xl rounded-2xl">
                                                    <option value="CC">Cédula</option>
                                                    <option value="NIT">NIT</option>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label value="Número Doc" className="text-[11px] font-extrabold text-[#0A014A] uppercase tracking-wider ml-1 mb-1.5 block" />
                                                <TextInput id="document_number" required value={formData.document_number} onChange={handleChange} placeholder="Número" className="mt-1 form-rounded-xl" />
                                            </div>
                                        </div>
                                        <div>
                                            <Label value="WhatsApp de Negocio" className="text-[11px] font-extrabold text-[#0A014A] uppercase tracking-wider ml-1 mb-1.5 block" />
                                            <TextInput id="phone_number" required value={formData.phone_number} onChange={handleChange} placeholder="3xx xxxxxxx" className="mt-1 form-rounded-xl" />
                                        </div>
                                    </>
                                )}

                                <div className="flex items-start gap-4 p-5 bg-[#3A17E4]/5 rounded-3xl border border-[#3A17E4]/20 mt-2 hover:bg-[#3A17E4]/10 transition-all shadow-sm group">
                                    <Checkbox id="accepted_terms" checked={formData.accepted_terms} onChange={handleChange} required className="text-[#3A17E4] focus:ring-[#3A17E4] h-5 w-5 mt-1 cursor-pointer transition-transform group-hover:scale-110" />
                                    <div className="text-xs font-bold text-[#0A014A] leading-relaxed">
                                        Acepto los <button type="button" onClick={() => setShowTerms(true)} className="text-[#3A17E4] font-black hover:underline outline-none">Términos y Política de Datos (Ley 1581)</button>.
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-[11px] font-black uppercase tracking-tight animate-shake flex items-center gap-3 shadow-lg shadow-red-200/20">
                                <Icon icon="solar:danger-square-bold-duotone" className="text-xl flex-shrink-0" />
                                <span className="leading-tight">{error}</span>
                            </div>
                        )}

                        <div className="flex gap-4 mt-4">
                            {step > 1 && (
                                <button type="button" onClick={prevStep} className="w-1/3 bg-white border border-slate-200 text-slate-700 rounded-2xl py-4 font-black text-xs uppercase tracking-widest hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 shadow-sm">
                                    Atrás
                                </button>
                            )}
                            <button
                                type={step === 3 ? "submit" : "button"}
                                onClick={step === 3 ? undefined : nextStep}
                                disabled={loading}
                                className={`${step > 1 ? 'w-2/3' : 'w-full'} bg-gradient-to-r from-[#3A17E4] to-[#0A014A] text-white rounded-2xl py-4 font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:shadow-[#3A17E4]/20 hover:scale-[1.02] active:scale-95 transition-all transition-all duration-300 disabled:opacity-50`}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        <span>Procesando...</span>
                                    </div>
                                ) : (step === 3 ? "Comenzar Ahora" : "Continuar")}
                            </button>
                        </div>
                    </form>

                    <div className="flex flex-col gap-1 text-center mt-10">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">¿Ya eres parte?</p>
                        <Link to="/auth/login" className="text-[#3A17E4] dark:text-[#2CD4D9] font-black hover:underline text-sm tracking-tight flex items-center justify-center gap-2 group">
                            Inicia sesión aquí
                            <Icon icon="solar:arrow-right-up-bold-duotone" className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                <Modal show={showTerms} onClose={() => setShowTerms(false)} size="lg">
                    <Modal.Header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 p-6 rounded-t-[2.5rem]">
                        <span className="font-black text-xl text-[#0A014A] dark:text-white uppercase tracking-tighter">Acuerdo de Servicio y Datos</span>
                    </Modal.Header>
                    <Modal.Body className="p-8 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl">
                        <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                            <div className="p-5 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 rounded-2xl">
                                <p className="font-black text-red-600 dark:text-red-400 uppercase tracking-tight italic flex items-center gap-2 mb-2">
                                    <Icon icon="solar:danger-bold" /> Aviso Importante
                                </p>
                                <p className="text-xs font-bold leading-tight">ShopStarter es una plataforma organizacional. NO procesamos pagos ni intervenimos en la logística de entrega.</p>
                            </div>
                            
                            <div className="space-y-4">
                               <p className="flex gap-3"><span className="font-black text-[#3A17E4]">1.</span> <strong>Tratamiento de Datos:</strong> Al registrarte, autorizas el uso de tus datos (Ley 1581 de 2012) exclusivamente para la gestión de pedidos y catálogo dentro de la plataforma.</p>
                               <p className="flex gap-3"><span className="font-black text-[#3A17E4]">2.</span> <strong>Responsabilidad:</strong> El cumplimiento del pago y la entrega es un acuerdo privado entre el vendedor y el cliente.</p>
                               <p className="flex gap-3"><span className="font-black text-[#3A17E4]">3.</span> <strong>Seguridad:</strong> Te comprometes a mantener la confidencialidad de tu contraseña.</p>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="bg-gray-50/50 dark:bg-slate-900/80 justify-end p-6 backdrop-blur-md rounded-b-[2.5rem]">
                        <button onClick={() => setShowTerms(false)} className="glass-button !bg-primary !text-white !px-10">
                            He leído y acepto
                        </button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    };

export default AuthRegister;
import React, { useState } from "react";
import { Label, TextInput, Select, Checkbox, Spinner } from "flowbite-react";
import { useNavigate } from "react-router";
import api from "../../../utils/axios";
import { Icon } from "@iconify/react";

/**
 * AuthRegister: Registro multi-paso (3 pasos) con tarjeta cuadrada premium.
 *
 * LÓGICA DE CAMPOS POR ROL:
 * - CLIENTE: username, email, password, password_confirm, full_name, role, is_human
 * - VENDEDOR: todo lo anterior + phone_number, document_type, document_number, birth_date
 *
 * ESTADO POST-REGISTRO:
 * - CLIENTE → status=ACTIVE → puede iniciar sesión inmediatamente
 * - VENDEDOR → status=PENDING → debe esperar aprobación del administrador
 */
const AuthRegister = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    // Mapeo de campos técnicos a nombres en español para mostrar errores del backend legibles
    const fieldLabels: Record<string, string> = {
        username: 'Nombre de Usuario',
        email: 'Correo Electrónico',
        password: 'Contraseña',
        password_confirm: 'Confirmar Contraseña',
        full_name: 'Nombre Completo',
        phone_number: 'Teléfono',
        document_number: 'Número de Documento',
        document_type: 'Tipo de Documento',
        birth_date: 'Fecha de Nacimiento',
        is_human: 'Captcha',
        non_field_errors: 'Error general',
        detail: 'Detalle',
        error: 'Error'
    };

    // Estado inicial del formulario — incluye TODOS los campos posibles del backend
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password_confirm: '',
        role: 'CLIENTE',
        full_name: '',
        phone_number: '',
        document_type: 'CC',
        document_number: '',
        birth_date: '',
        is_human: false,
        honeypot: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value, type } = e.target as HTMLInputElement;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [id]: val }));
    };

    /**
     * Validación estricta por paso.
     * Los vendedores deben pasar validaciones adicionales en el Paso 3.
     */
    const validateStep = (): boolean => {
        setError(null);

        if (step === 1) {
            if (!formData.username.trim()) {
                setError("El nombre de usuario es obligatorio.");
                return false;
            }
            if (!formData.email.trim()) {
                setError("El correo electrónico es obligatorio.");
                return false;
            }
        }

        if (step === 2) {
            if (!formData.password || !formData.password_confirm) {
                setError("Debes completar ambos campos de contraseña.");
                return false;
            }
            if (formData.password !== formData.password_confirm) {
                setError("Las contraseñas no coinciden.");
                return false;
            }
            const hasUpper  = /[A-Z]/.test(formData.password);
            const hasNumber = /[0-9]/.test(formData.password);
            const hasSymbol = /[@#$%^&+=!¡¿?*]/.test(formData.password);
            const hasLength = formData.password.length >= 8;
            if (!hasUpper || !hasNumber || !hasSymbol || !hasLength) {
                setError("La contraseña no cumple todos los requisitos de seguridad.");
                return false;
            }
        }

        if (step === 3) {
            if (!formData.full_name.trim()) {
                setError("El nombre completo es obligatorio.");
                return false;
            }
            // Campos extra obligatorios solo para VENDEDOR
            if (formData.role === 'VENDEDOR') {
                if (!formData.phone_number.trim()) {
                    setError("El teléfono es obligatorio para Vendedores.");
                    return false;
                }
                if (!formData.document_number.trim()) {
                    setError("El número de documento es obligatorio para Vendedores.");
                    return false;
                }
                if (!formData.birth_date) {
                    setError("La fecha de nacimiento es obligatoria para Vendedores.");
                    return false;
                }
            }
            if (!formData.is_human) {
                setError("Debes confirmar que no eres un robot.");
                return false;
            }
        }

        return true;
    };

    const handleNext = () => {
        if (validateStep()) setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setError(null);
        setStep(prev => prev - 1);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Si el formulario se envía antes del último paso, avanzamos de paso
        if (step < 3) {
            handleNext();
            return;
        }

        // Validar el paso final antes de enviar
        if (!validateStep()) return;

        setLoading(true);
        setError(null);

        try {
            // Construir el payload según el ROL del usuario
            // CLIENTE: solo los campos básicos
            // VENDEDOR: todos los campos (incluyendo datos fiscales)
            let dataToSend: Record<string, any>;

            if (formData.role === 'CLIENTE') {
                dataToSend = {
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    password_confirm: formData.password_confirm,
                    role: formData.role,
                    full_name: formData.full_name,
                    is_human: formData.is_human,
                    honeypot: formData.honeypot,
                };
            } else {
                // VENDEDOR — enviar todos los campos que el backend requiere
                dataToSend = {
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    password_confirm: formData.password_confirm,
                    role: formData.role,
                    full_name: formData.full_name,
                    phone_number: formData.phone_number,
                    document_type: formData.document_type,
                    document_number: formData.document_number,
                    birth_date: formData.birth_date,
                    is_human: formData.is_human,
                    honeypot: formData.honeypot,
                };
            }

            const response = await api.post('users/auth/register/', dataToSend);

            if (response.status === 201) {
                setShowSuccess(true);
            }
        } catch (err: any) {
            console.error("Error de registro:", err.response?.data);
            const responseData = err.response?.data;

            if (responseData && typeof responseData === 'object') {
                // El backend usa custom_exception_handler que siempre devuelve:
                // { error: true, message: string, code: string, details: { campo: [errores] } }
                
                const mainMsg = responseData.message; // Siempre es un string legible
                const fieldDetails = responseData.details; // Errores por campo específico

                if (fieldDetails && typeof fieldDetails === 'object' && Object.keys(fieldDetails).length > 0) {
                    // Mostrar errores de campo específicos primero
                    const fieldMessages = Object.entries(fieldDetails)
                        .map(([field, msgs]) => {
                            const label = fieldLabels[field] || field;
                            const message = Array.isArray(msgs) ? msgs[0] : String(msgs);
                            return `${label}: ${message}`;
                        })
                        .join(" | ");
                    setError(fieldMessages);
                } else if (typeof mainMsg === 'string') {
                    // Mensaje general del backend (ej: "Error de validación de datos.")
                    setError(mainMsg);
                } else {
                    setError("Datos inválidos. Revisa el formulario e intenta de nuevo.");
                }
            } else {
                setError("No se pudo conectar con el servidor. Intenta de nuevo.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Indica si el paso actual es el paso final
    const isLastStep = step === 3;

    return (
        <div className="w-full font-[var(--main-font)] flex flex-col items-center">
            {/* Título integrado limpiamente */}
            <div className="text-center mb-6">
                <h2 className="text-2xl font-black text-indigo-900 uppercase tracking-tighter">
                    {step === 1 && "Identidad y Rol"}
                    {step === 2 && "Protección"}
                    {step === 3 && (formData.role === 'VENDEDOR' ? "Perfil Negocio" : "Perfil Personal")}
                </h2>
                <p className="text-[11px] text-indigo-900/60 font-bold mt-1 tracking-widest uppercase">Paso {step} de 3</p>
            </div>

            {/* ERROR */}
            {error && (
                <div className="w-full p-3 mb-5 text-xs bg-red-100/90 text-red-700 border border-red-300 rounded-xl animate-shake font-bold text-center">
                    ⚠️ {error}
                </div>
            )}

            {/* Stepper Premium */}
            <div className="flex items-center justify-center gap-2 mb-8 w-full px-4">
                {[1, 2, 3].map((s) => (
                    <React.Fragment key={s}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-500 shadow-md ${
                            step === s ? 'bg-primary text-white scale-110 shadow-primary/40' :
                            step > s  ? 'bg-green-500 text-white shadow-green-500/40' : 'bg-gray-100 text-gray-400'
                        }`}>
                            {step > s ? <Icon icon="solar:check-read-linear" /> : s}
                        </div>
                        {s < 3 && <div className={`h-1 w-10 md:w-16 rounded-full transition-colors duration-500 ${step > s ? 'bg-green-500' : 'bg-gray-100'}`} />}
                    </React.Fragment>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
                <div className="min-h-[220px] flex flex-col justify-start">
                    {/* ── PASO 1 ── */}
                    {step === 1 && (
                        <div className="flex flex-col gap-4 animate-fade-in">
                            <div>
                                <Label value="Nombre de Usuario" className="text-[11px] font-bold text-gray-600 uppercase tracking-wider ml-1" />
                                <TextInput id="username" required value={formData.username} onChange={handleChange} placeholder="ej: juan.perez" className="mt-1 form-rounded-xl" />
                            </div>
                            <div>
                                <Label value="Correo Electrónico" className="text-[11px] font-bold text-gray-600 uppercase tracking-wider ml-1" />
                                <TextInput id="email" type="email" required value={formData.email} onChange={handleChange} placeholder="tu@correo.com" className="mt-1 form-rounded-xl" />
                            </div>
                            <div>
                                <Label value="¿Cómo quieres registrarte?" className="text-[11px] font-bold text-gray-600 uppercase tracking-wider ml-1" />
                                <Select id="role" value={formData.role} onChange={handleChange} className="mt-1 form-rounded-xl outline-none focus:ring-primary focus:border-primary">
                                    <option value="CLIENTE">👤 Cliente (Quiero comprar)</option>
                                    <option value="VENDEDOR">🏪 Vendedor (Tengo un negocio)</option>
                                </Select>
                            </div>
                        </div>
                    )}

                    {/* ── PASO 2 ── */}
                    {step === 2 && (
                        <div className="flex flex-col gap-4 animate-fade-in">
                            <div>
                                <Label value="Contraseña Segura" className="text-[11px] font-bold text-gray-600 uppercase tracking-wider ml-1" />
                                <TextInput id="password" type="password" required value={formData.password} onChange={handleChange} className="mt-1 form-rounded-xl" placeholder="••••••••" />
                            </div>
                            <div>
                                <Label value="Confirmar Contraseña" className="text-[11px] font-bold text-gray-600 uppercase tracking-wider ml-1" />
                                <TextInput id="password_confirm" type="password" required value={formData.password_confirm} onChange={handleChange} className="mt-1 form-rounded-xl" placeholder="••••••••" />
                            </div>

                            <div className="p-3 bg-gray-50 rounded-2xl grid grid-cols-2 gap-2 mt-2 border border-gray-100">
                                {[
                                    { label: "8+ Caracteres", ok: formData.password.length >= 8 },
                                    { label: "Mayúscula",     ok: /[A-Z]/.test(formData.password) },
                                    { label: "Número",        ok: /[0-9]/.test(formData.password) },
                                    { label: "Símbolo",       ok: /[@#$%^&+=!¡¿?*]/.test(formData.password) },
                                ].map(({ label, ok }) => (
                                    <div key={label} className={`flex items-center gap-1.5 text-[10px] font-bold ${ok ? 'text-green-600' : 'text-gray-400'}`}>
                                        <Icon icon={ok ? "solar:check-circle-bold" : "solar:close-circle-linear"} height={14} />
                                        <span>{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── PASO 3 ── */}
                    {step === 3 && (
                        <div className="flex flex-col gap-4 animate-fade-in">
                            <div>
                                <Label
                                    value={formData.role === 'VENDEDOR' ? "Nombre Legal / Razón Social" : "Nombre Completo"}
                                    className="text-[11px] font-bold text-gray-600 uppercase tracking-wider ml-1"
                                />
                                <TextInput id="full_name" required value={formData.full_name} onChange={handleChange} placeholder={formData.role === 'VENDEDOR' ? "Ej: Variedades S.A." : "Ej: Juan Pérez"} className="mt-1 form-rounded-xl" />
                            </div>

                            {formData.role === 'VENDEDOR' && (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label value="Tipo Doc" className="text-[11px] font-bold text-gray-600 uppercase tracking-wider ml-1" />
                                            <Select id="document_type" value={formData.document_type} onChange={handleChange} className="mt-1 form-rounded-xl">
                                                <option value="CC">Cédula</option>
                                                <option value="NIT">NIT</option>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label value="Número Doc" className="text-[11px] font-bold text-gray-600 uppercase tracking-wider ml-1" />
                                            <TextInput id="document_number" required value={formData.document_number} onChange={handleChange} className="mt-1 form-rounded-xl" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label value="Teléfono" className="text-[11px] font-bold text-gray-600 uppercase tracking-wider ml-1" />
                                            <TextInput id="phone_number" required value={formData.phone_number} onChange={handleChange} placeholder="+... " className="mt-1 form-rounded-xl" />
                                        </div>
                                        <div>
                                            <Label value="Fecha Naci." className="text-[11px] font-bold text-gray-600 uppercase tracking-wider ml-1" />
                                            <TextInput id="birth_date" type="date" required value={formData.birth_date} onChange={handleChange} className="mt-1 form-rounded-xl" />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 mt-2 hover:bg-gray-100 transition-colors">
                                <Checkbox id="is_human" checked={formData.is_human as boolean} onChange={handleChange} required className="text-primary focus:ring-primary" />
                                <Label htmlFor="is_human" className="text-xs font-bold text-gray-700 cursor-pointer">
                                    Confirmo que no soy un robot
                                </Label>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-4 flex flex-col gap-3">
                    <button
                        type={isLastStep ? "submit" : "button"}
                        onClick={isLastStep ? undefined : handleNext}
                        disabled={loading}
                        className={`w-full py-3.5 bg-primary hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        {loading ? <Spinner size="sm" /> : (
                            <>
                                <span>{isLastStep ? "Finalizar Registro" : "Continuar"}</span>
                                {!isLastStep && <Icon icon="solar:arrow-right-bold" />}
                            </>
                        )}
                    </button>

                    {step > 1 && (
                        <button type="button" onClick={handleBack} className="w-full py-2 text-gray-500 font-bold text-xs hover:text-primary transition-colors">
                            ← Volver al paso anterior
                        </button>
                    )}
                </div>
            </form>


            {/* ── MODAL DE ÉXITO (DIFERENTE PARA CLIENTE Y VENDEDOR) ── */}
            {showSuccess && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-[2rem] p-10 max-w-sm w-full text-center shadow-2xl">

                        {formData.role === 'VENDEDOR' ? (
                            // Mensaje para VENDEDOR (estado PENDING, necesita aprobación)
                            <>
                                <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Icon icon="solar:clock-circle-bold" height={48} />
                                </div>
                                <h3 className="text-2xl font-black text-gray-800 mb-2">¡Solicitud Enviada!</h3>
                                <p className="text-gray-500 text-sm mb-2 font-medium">
                                    Tu perfil de vendedor está siendo revisado por nuestro equipo.
                                </p>
                                <p className="text-gray-400 text-xs mb-8">
                                    Te notificaremos por correo cuando tu cuenta sea aprobada y puedas comenzar a vender.
                                </p>
                                <button
                                    onClick={() => navigate("/auth/login")}
                                    className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl transition-all"
                                >
                                    Entendido, volver al inicio
                                </button>
                            </>
                        ) : (
                            // Mensaje para CLIENTE (estado ACTIVE, puede entrar de inmediato)
                            <>
                                <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Icon icon="solar:check-circle-bold" height={48} />
                                </div>
                                <h3 className="text-2xl font-black text-gray-800 mb-2">¡Bienvenido!</h3>
                                <p className="text-gray-500 text-sm mb-8 font-medium">
                                    Tu cuenta está activa y lista. Ya puedes iniciar sesión y explorar miles de productos en ShopStarter.
                                </p>
                                <button
                                    onClick={() => navigate("/auth/login")}
                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all"
                                >
                                    Ir al Inicio de Sesión →
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuthRegister;
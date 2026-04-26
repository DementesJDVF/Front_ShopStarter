import React, { useState } from 'react';
import { Button, Checkbox, Label, TextInput, Select, Modal } from 'flowbite-react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router';
import api from '../../../utils/axios';
import CustomTextInput from 'src/components/shared/CustomTextInput';
import FullLogo from 'src/layouts/full/shared/logo/FullLogo';
import { useTranslation } from 'react-i18next';

const AuthRegister = () => {
    const { t } = useTranslation("register");

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
        role: 'CLIENTE',
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

    const [dateParts, setDateParts] = useState({ day: '', month: '', year: '' });

    React.useEffect(() => {
        if (dateParts.day && dateParts.month && dateParts.year) {
            const formattedDay = dateParts.day.padStart(2, '0');
            const formattedMonth = dateParts.month.padStart(2, '0');
            setFormData(prev => ({
                ...prev,
                birth_date: `${dateParts.year}-${formattedMonth}-${formattedDay}`
            }));
        } else {
            setFormData(prev => ({ ...prev, birth_date: '' }));
        }
    }, [dateParts]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData({ ...formData, [id]: val });
    };

    const validateStep = () => {
        setError(null);
        if (step === 1) {
            if (!formData.username.trim()) { setError(t("errors.usernameRequired")); return false; }
            if (!formData.email.trim()) { setError(t("errors.emailRequired")); return false; }
            if (!/\S+@\S+\.\S+/.test(formData.email)) { setError(t("errors.emailInvalid")); return false; }
        }
        if (step === 2) {
            if (formData.password.length < 8) { setError(t("errors.passwordTooShort")); return false; }
            if (formData.password !== formData.password_confirm) { setError(t("errors.passwordMismatch")); return false; }
        }
        if (step === 3 && formData.role === 'VENDEDOR') {
            if (!formData.birth_date) { setError(t("errors.birthDateRequired")); return false; }
            if (!formData.document_number) { setError(t("errors.documentRequired")); return false; }
            if (!formData.phone_number) { setError(t("errors.phoneRequired")); return false; }
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
        if (!formData.accepted_terms) { setError(t("errors.termsRequired")); return; }

        setLoading(true);
        setError(null);

        try {
            const dataToSend = { ...formData, is_human: true };
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
                            const label = t(`fieldLabels.${field}`, { defaultValue: field });
                            const message = Array.isArray(msgs) ? msgs[0] : String(msgs);
                            return `${label}: ${message}`;
                        }).join(" | ");
                    setError(fieldMessages);
                } else {
                    setError(mainMsg || t("errors.genericRegister"));
                }
            } else {
                setError(t("errors.connectionError"));
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
                <h2 className="text-3xl font-black text-slate-900 mb-4">{t("success.title")}</h2>
                <p className="text-slate-600 mb-8 max-w-sm">{t("success.description")}</p>
                <Link to="/auth/login" className="bg-[#3A17E4] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:shadow-xl transition-all">
                    {t("success.goToLogin")}
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full animate-fade-in">
            <div className="glass-card-premium p-8 sm:p-10 border border-white/50 dark:border-white/10 shadow-2xl">

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-black text-[#0A014A] tracking-tighter mb-2">{t("form.title")}</h2>
                    <p className="text-xs font-bold text-slate-500/80 uppercase tracking-[0.2em]">{t("form.subtitle")}</p>
                </div>

                {/* Barra de Progreso Visual */}
                <div className="flex items-center justify-between mb-8 px-2 relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10 rounded-full"></div>
                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#3A17E4] -z-10 rounded-full transition-all duration-500 shadow-[0_0_10px_#3A17E4]`} style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
                    {[1, 2, 3].map((s) => (
                        <div key={s} className={`w-9 h-9 flex items-center justify-center rounded-full font-black text-xs transition-all duration-300 ${step >= s ? 'bg-[#3A17E4] text-white shadow-lg shadow-[#3A17E4]/40 scale-110' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>
                            {s}
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {step === 1 && (
                        <div className="flex flex-col gap-5 animate-fade-in">
                            <div>
                                <Label value={t("form.labelUsername")} className="text-[11px] font-extrabold text-[#0A014A] dark:text-slate-300 uppercase tracking-wider ml-1 mb-1.5 block" />
                                <TextInput id="username" required value={formData.username} onChange={handleChange} placeholder="ej: juan.perez" className="mt-1 form-rounded-xl" />
                            </div>
                            <div>
                                <Label value={t("form.labelEmail")} className="text-[11px] font-extrabold text-[#0A014A] dark:text-slate-300 uppercase tracking-wider ml-1 mb-1.5 block" />
                                <TextInput id="email" type="email" required value={formData.email} onChange={handleChange} placeholder="tu@correo.com" className="mt-1 form-rounded-xl" />
                            </div>
                            <div>
                                <Label value={t("form.labelRole")} className="text-[11px] font-extrabold text-[#0A014A] dark:text-slate-300 uppercase tracking-wider ml-1 mb-1.5 block" />
                                <Select id="role" value={formData.role} onChange={handleChange} className="mt-1 form-rounded-xl focus:ring-[#3A17E4] focus:border-[#3A17E4] rounded-2xl">
                                    <option value="CLIENTE">{t("form.roleClient")}</option>
                                    <option value="VENDEDOR">{t("form.roleVendor")}</option>
                                </Select>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="flex flex-col gap-5 animate-fade-in">
                            <div>
                                <Label value={t("form.labelPassword")} className="text-[11px] font-extrabold text-[#0A014A] dark:text-slate-300 uppercase tracking-wider ml-1 mb-1.5 block" />
                                <CustomTextInput id="password" isPassword required value={formData.password} onChange={handleChange} className="mt-1 form-rounded-xl" placeholder="••••••••" />
                            </div>
                            <div>
                                <Label value={t("form.labelConfirmPassword")} className="text-[11px] font-extrabold text-[#0A014A] dark:text-slate-300 uppercase tracking-wider ml-1 mb-1.5 block" />
                                <CustomTextInput id="password_confirm" isPassword required value={formData.password_confirm} onChange={handleChange} className={`mt-1 form-rounded-xl transition-all ${passwordMismatch ? 'border-red-400 focus:border-red-500' : ''}`} placeholder="••••••••" />
                                {passwordMismatch && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 animate-fade-in uppercase tracking-tighter">{t("form.passwordMismatchInline")}</p>}
                            </div>

                            {/* MEDIDOR DE FUERZA DE CONTRASEÑA */}
                            <div className="p-5 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-indigo-100 dark:border-white/5 shadow-sm">
                                <div className="flex justify-between items-center mb-3">
                                    <p className="text-[10px] text-indigo-600 dark:text-indigo-300 font-black uppercase tracking-widest flex items-center gap-1.5">
                                        <Icon icon={formData.password.length < 8 ? "solar:shield-warning-bold" : formData.password.length < 12 ? "solar:shield-check-bold" : "solar:shield-star-bold-duotone"} />
                                        {t("form.securityLevel")}
                                    </p>
                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                        formData.password.length === 0 ? 'text-slate-400' :
                                        formData.password.length < 8 ? 'text-red-500 bg-red-50' :
                                        formData.password.length < 12 ? 'text-orange-500 bg-orange-50' : 'text-green-500 bg-green-50'
                                    }`}>
                                        {formData.password.length === 0 ? t("form.strengthEmpty") :
                                         formData.password.length < 8 ? t("form.strengthWeak") :
                                         formData.password.length < 12 ? t("form.strengthMedium") : t("form.strengthStrong")}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1 p-0.5">
                                    <div className={`h-full rounded-full transition-all duration-500 ${formData.password.length > 0 ? (formData.password.length < 8 ? 'w-1/3 bg-red-500 shadow-red-500/50' : formData.password.length < 12 ? 'w-2/3 bg-orange-400 shadow-orange-400/50' : 'w-full bg-green-500 shadow-green-500/50') : 'w-0'} shadow-lg`}></div>
                                </div>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-3 font-medium italic leading-tight">
                                    {formData.password.length < 8 ? t("form.strengthHintWeak") : t("form.strengthHintStrong")}
                                </p>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="flex flex-col gap-5 animate-fade-in">
                            <div>
                                <Label value={t("form.labelFullName")} className="text-[11px] font-extrabold text-[#0A014A] dark:text-slate-300 uppercase tracking-wider ml-1 mb-1.5 block" />
                                <TextInput id="full_name" required value={formData.full_name} onChange={handleChange} placeholder="ej: Juan Pérez" className="mt-1 form-rounded-xl" />
                            </div>

                            {formData.role === 'VENDEDOR' && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label value={t("form.labelDocType")} className="text-[11px] font-extrabold text-[#0A014A] uppercase tracking-wider ml-1 mb-1.5 block" />
                                            <Select id="document_type" value={formData.document_type} onChange={handleChange} className="mt-1 form-rounded-xl rounded-2xl">
                                                <option value="CC">{t("form.optionCC")}</option>
                                                <option value="NIT">{t("form.optionNIT")}</option>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label value={t("form.labelDocNumber")} className="text-[11px] font-extrabold text-[#0A014A] uppercase tracking-wider ml-1 mb-1.5 block" />
                                            <TextInput id="document_number" required value={formData.document_number} onChange={handleChange} placeholder="Número" className="mt-1 form-rounded-xl" />
                                        </div>
                                    </div>

                                    <div>
                                        <Label value={t("form.labelPhone")} className="text-[11px] font-extrabold text-[#0A014A] uppercase tracking-wider ml-1 mb-1.5 block" />
                                        <TextInput id="phone_number" required value={formData.phone_number} onChange={handleChange} placeholder="3xx xxxxxxx" className="mt-1 form-rounded-xl" />
                                    </div>
                                    <div>
                                        <Label value={t("form.labelBirthDate")} className="text-[11px] font-extrabold text-[#0A014A] uppercase tracking-wider ml-1 mb-1.5 block" />
                                        <div className="flex gap-2">
                                            <TextInput placeholder="DD" maxLength={2} value={dateParts.day} onChange={(e) => setDateParts({...dateParts, day: e.target.value.replace(/\D/g, '')})} className="w-16 form-rounded-xl text-center" />
                                            <TextInput placeholder="MM" maxLength={2} value={dateParts.month} onChange={(e) => setDateParts({...dateParts, month: e.target.value.replace(/\D/g, '')})} className="w-16 form-rounded-xl text-center" />
                                            <TextInput placeholder="AAAA" maxLength={4} value={dateParts.year} onChange={(e) => setDateParts({...dateParts, year: e.target.value.replace(/\D/g, '')})} className="flex-1 form-rounded-xl text-center" />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="flex items-start gap-4 p-5 bg-[#3A17E4]/5 rounded-3xl border border-[#3A17E4]/20 mt-2 hover:bg-[#3A17E4]/10 transition-all shadow-sm group">
                                <Checkbox id="accepted_terms" checked={formData.accepted_terms} onChange={handleChange} required className="text-[#3A17E4] focus:ring-[#3A17E4] h-5 w-5 mt-1 cursor-pointer rounded-lg" />
                                <div className="text-xs font-bold text-[#0A014A] leading-relaxed">
                                    {t("form.termsText")} <button type="button" onClick={() => setShowTerms(true)} className="text-[#3A17E4] font-black hover:underline outline-none">{t("form.termsLink")}</button> {t("form.termsText2")}
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
                            <button type="button" onClick={prevStep} className="w-1/3 bg-white border border-slate-200 text-slate-700 rounded-2xl py-4 font-black text-xs uppercase tracking-wider hover:bg-slate-50 transition-all">
                                {t("form.back")}
                            </button>
                        )}
                        <button
                            type={step === 3 ? "submit" : "button"}
                            onClick={step === 3 ? undefined : nextStep}
                            disabled={loading}
                            className={`${step > 1 ? 'w-2/3' : 'w-full'} bg-gradient-to-r from-[#3A17E4] to-[#0A014A] text-white rounded-2xl py-4 font-black text-xs uppercase tracking-[0.2em] hover:shadow-[0_10px_30px_rgba(58,23,228,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-60`}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    <span>{t("form.loading")}</span>
                                </div>
                            ) : (step === 3 ? t("form.submit") : t("form.next"))}
                        </button>
                    </div>
                </form>

                <div className="flex flex-col gap-1 text-center mt-10">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t("form.alreadyMember")}</p>
                    <Link to="/auth/login" className="text-[#3A17E4] dark:text-[#2CD4D9] font-black hover:underline text-sm tracking-tight flex items-center justify-center gap-2 group">
                        {t("form.loginLink")}
                        <Icon icon="solar:arrow-right-up-bold-duotone" className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Link>
                </div>
            </div>

            <Modal show={showTerms} onClose={() => setShowTerms(false)} size="lg">
                <Modal.Header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 p-6 rounded-t-[2.5rem]">
                    <span className="font-black text-xl text-[#0A014A] dark:text-white uppercase tracking-tighter">{t("terms.title")}</span>
                </Modal.Header>
                <Modal.Body className="p-8 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl">
                    <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        <div className="p-5 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 rounded-2xl">
                            <p className="font-black text-red-600 dark:text-red-400 uppercase tracking-tight italic flex items-center gap-2 mb-2">
                                <Icon icon="solar:danger-bold" /> {t("terms.warningTitle")}
                            </p>
                            <p className="text-xs font-bold leading-tight">{t("terms.warningText")}</p>
                        </div>
                        <div className="space-y-4">
                            <p className="flex gap-3"><span className="font-black text-[#3A17E4]">1.</span> <span><strong>{t("terms.item1Label")}</strong> {t("terms.item1Text")}</span></p>
                            <p className="flex gap-3"><span className="font-black text-[#3A17E4]">2.</span> <span><strong>{t("terms.item2Label")}</strong> {t("terms.item2Text")}</span></p>
                            <p className="flex gap-3"><span className="font-black text-[#3A17E4]">3.</span> <span><strong>{t("terms.item3Label")}</strong> {t("terms.item3Text")}</span></p>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="bg-gray-50/50 dark:bg-slate-900/80 justify-end p-6 backdrop-blur-md rounded-b-[2.5rem]">
                    <button onClick={() => setShowTerms(false)} className="glass-button !bg-primary !text-white !px-10">
                        {t("terms.acceptButton")}
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AuthRegister;
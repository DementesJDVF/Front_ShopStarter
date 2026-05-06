import React, { useState } from "react";
import { Button, Label, TextInput, Spinner } from "flowbite-react";
import { toast } from "react-hot-toast";
import api from "../../../utils/axios";
import { useTranslation } from "react-i18next";

const ForgotPassword = () => {
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [email, setEmail] = useState("");
    const { t } = useTranslation("login");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post("auth/password-reset/", { email });
            setSent(true);
            toast.success(t("forgotPassword.toastSuccess"));
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || t("forgotPassword.toastError"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] animate-fade-in font-[var(--main-font)]">
            <div className="w-full max-w-sm">
                {!sent ? (
                    <>
                        <div className="text-center mb-8">
                            <div className="inline-block p-4 bg-indigo-50 text-primary rounded-3xl mb-4">
                                <div className="w-12 h-12 text-indigo-500">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                                </div>
                            </div>
                            <h2 className="text-3xl font-black text-indigo-900 tracking-tighter uppercase italic">
                                {t("forgotPassword.title")}
                            </h2>
                            <p className="text-gray-500 mt-2 font-medium">
                                {t("forgotPassword.description")}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            <div>
                                <Label htmlFor="email" value={t("forgotPassword.labelEmail")} className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500 ml-1" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    placeholder="tu@correo.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="form-rounded-xl"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-primary/30 py-1 transition-all"
                            >
                                {loading ? <Spinner size="sm" className="mr-2" /> : <div className="w-5 h-5"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg></div>}
                                {loading ? t("forgotPassword.loading") : t("forgotPassword.submit")}
                            </Button>

                            <a href="/auth/login" className="text-center text-sm font-bold text-gray-500 hover:text-primary transition-colors mt-2">
                                {t("forgotPassword.backToLogin")}
                            </a>
                        </form>
                    </>
                ) : (
                    <div className="text-center animate-fade-in py-10">
                        <div className="inline-block p-6 bg-green-100 text-green-500 rounded-full mb-6">
                            <div className="w-16 h-16 text-green-500">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-16 h-16"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                        </div>
                        <h2 className="text-2xl font-black text-gray-800 mb-4 tracking-tighter uppercase">{t("forgotPassword.successTitle")}</h2>
                        <p className="text-gray-500 font-medium mb-8">
                            {t("forgotPassword.successDescription")}
                        </p>
                        <a
                            href="/auth/login"
                            className="inline-block w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all"
                        >
                            {t("forgotPassword.backButton")}
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;

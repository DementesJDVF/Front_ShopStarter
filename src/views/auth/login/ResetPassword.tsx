import React, { useState } from "react";
import { Button, Label, Spinner } from "flowbite-react";
import { useSearchParams, useNavigate, Link } from "react-router";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import api from "../../../utils/axios";
import CustomTextInput from "../../../components/shared/CustomTextInput";
import { useTranslation } from "react-i18next";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const { t } = useTranslation("login");

    const uid = searchParams.get("uid");
    const token = searchParams.get("token");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error(t("resetPassword.errorMismatch"));
            return;
        }

        setLoading(true);

        try {
            await api.post("auth/password-reset-confirm/", { uid, token, password });
            toast.success(t("resetPassword.toastSuccess"));
            navigate("/auth/login");
        } catch (err: any) {
            console.error(err);
            const detail = err.response?.data?.error || err.response?.data?.detail || t("resetPassword.toastErrorFallback");
            toast.error(detail);
        } finally {
            setLoading(false);
        }
    };

    if (!uid || !token) {
        return (
            <div className="text-center py-20">
                <h2 className="text-xl font-bold text-red-600">{t("resetPassword.invalidLinkTitle")}</h2>
                <p className="text-gray-500">{t("resetPassword.invalidLinkDescription")}</p>
                <Link to="/auth/forgot-password" className="text-primary font-bold mt-4 block">{t("resetPassword.requestAgain")}</Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] animate-fade-in font-[var(--main-font)]">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="inline-block p-4 bg-indigo-50 text-primary rounded-3xl mb-4">
                        <Icon icon="solar:lock-password-bold-duotone" height={48} />
                    </div>
                    <h2 className="text-3xl font-black text-indigo-900 tracking-tighter uppercase italic">
                        {t("resetPassword.title")}
                    </h2>
                    <p className="text-gray-500 mt-2 font-medium">
                        {t("resetPassword.description")}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                        <Label htmlFor="password" value={t("resetPassword.labelPassword")} className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500 ml-1" />
                        <CustomTextInput
                            id="password"
                            isPassword
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-rounded-xl"
                        />
                    </div>

                    <div>
                        <Label htmlFor="confirmPassword" value={t("resetPassword.labelConfirm")} className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500 ml-1" />
                        <CustomTextInput
                            id="confirmPassword"
                            isPassword
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="form-rounded-xl"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-primary/30 py-1 transition-all"
                    >
                        {loading ? <Spinner size="sm" className="mr-2" /> : <Icon icon="solar:check-read-bold" className="mr-2" />}
                        {loading ? t("resetPassword.loading") : t("resetPassword.submit")}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
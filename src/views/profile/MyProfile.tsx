import { useEffect, useMemo, useState } from "react";
import { ProfileService, MyProfile as MyProfileType } from "../../services/ProfileService";
import { Badge } from 'flowbite-react';
import AvatarUploader from "./components/AvatarUploader";
import ClientProfile from "./components/ClientProfile";
import VendorProfile from "./components/VendorProfile";
import AdminProfile from "./components/AdminProfile";
import { useTranslation } from "react-i18next";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

const MyProfile = () => {
  const [profile, setProfile] = useState<MyProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const { t } = useTranslation("Profile");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await ProfileService.getMyProfile();
      setProfile(data);
      setDrafts({});
    } catch (e: any) {
      setError(e?.message || t("edit.saveError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setDraftField = (field: string, value: string) => {
    setDrafts((prev) => {
      const original = (profile as any)?.[field] ?? "";
      if (value === (original ?? "")) {
        const { [field]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [field]: value };
    });
  };

  const changesCount = Object.keys(drafts).length;
  const hasChanges = useMemo(() => changesCount > 0, [changesCount]);

  const handleSubmitAll = async () => {
    if (!hasChanges) return;
    try {
      setSaving(true);
      await ProfileService.updateMyProfile(drafts as any);
      toast.success(t("edit.savedOk"));
      await fetchProfile();
    } catch (e: any) {
      const data = e?.response?.data;
      let msg = t("edit.saveError");
      if (data) {
        if (typeof data === "string") msg = data;
        else if (data.detail) msg = data.detail;
        else {
          const firstKey = Object.keys(data)[0];
          if (firstKey) msg = Array.isArray(data[firstKey]) ? data[firstKey][0] : String(data[firstKey]);
        }
      }
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="p-12 text-center text-gray-500 font-light tracking-wide">
        {t("loading")}
      </div>
    );
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!profile) return null;

  const fieldProps = { profile, drafts, setDraftField };

  const renderByRole = () => {
    switch (profile.role) {
      case "ADMIN":
        return <AdminProfile {...fieldProps} onUpdated={fetchProfile} />;
      case "VENDEDOR":
        return <VendorProfile {...fieldProps} onUpdated={fetchProfile} />;
      default:
        return <ClientProfile {...fieldProps} onUpdated={fetchProfile} />;
    }
  };

  const pendingText = hasChanges
    ? changesCount === 1
      ? t("edit.pendingOne", { count: changesCount })
      : t("edit.pendingMany", { count: changesCount })
    : t("edit.noPending");

  const getRoleBadge = (role: string) => {
      switch (role) {
        case 'ADMIN':
          return <Badge color="purple" className="border-b border-black rounded-lg px-3 py-1 font-bold">{t(`header.role.${role}`)}</Badge>;
        case 'VENDEDOR':
          return <Badge color="info" className="rounded-lg px-3 py-1 font-bold">{t(`header.role.${role}`)}</Badge>;
        case 'CLIENTE':
          return <Badge color="info" className="rounded-lg px-3 py-1 font-bold">{t(`header.role.${role}`)}</Badge>;
        default:
          return <Badge color="gray">{role}</Badge>;
      }
    };
  
  const getStatusBadge = (status: string) => {
      switch (status) {
        case 'ACTIVE':
          return <Badge color="success" className="rounded-lg px-3 py-1 font-bold">{t(`header.status.${status}`)}</Badge>;
        case 'INACTIVE':
          return <Badge color="warningw" className="rounded-lg px-3 py-1 font-bold text-black">{t(`header.status.${status}`)}</Badge>;
        case 'PENDING':
          return <Badge color="warning" className="rounded-lg px-3 py-1 font-bold text-black">{t(`header.status.${status}`)}</Badge>;
        case 'BLOCKED':
          return <Badge color="failure" className="rounded-lg px-3 py-1 font-bold">{t(`header.status.${status}`)}</Badge>;
        default:
          return <Badge color="gray">{status}</Badge>;
      }
    }; 

  return (
    <div
      className="min-h-screen py-8 px-4 font-[var(--main-font)]
                 bg-gradient-to-br from-primary/10 via-lightprimary/40 to-primary/5
                 dark:from-dark dark:via-darkgray dark:to-dark"
    >
      <div className="max-w-3xl mx-auto">
        {/* HEADER */}
        <div
          className="rounded-2xl shadow-md border border-primary/10 dark:border-gray-800 p-6 md:p-10 mb-6
                     bg-gradient-to-br from-white/80 via-primary/5 to-lightprimary/30
                     dark:from-darkgray dark:via-darkgray/80 dark:to-dark
                     backdrop-blur-sm"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 md:gap-12">
            <div className="flex-shrink-0">
              <AvatarUploader profile={profile} onUpdated={fetchProfile} />
            </div>

            <div className="flex-1 text-center sm:text-left w-full">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
                <h1 className="text-2xl md:text-3xl font-light text-gray-900 dark:text-white">
                  {profile.username}
                </h1>
                <span>
                  {getRoleBadge(profile.role)}
                </span>
              </div>

              <div className="flex justify-center sm:justify-start gap-6 md:gap-10 mb-4 text-sm">
                <div className="text-center sm:text-left">
                  <p className="uppercase font-semibold text-gray-900 dark:text-white">
                    {t("header.stats.status")}
                  </p>
                  <span className="font-semibold text-gray-900 dark:text-white">{getStatusBadge(profile.status)}</span>
                </div>
                <div className="text-center sm:text-left">
                  <p className="uppercase font-semibold text-gray-900 dark:text-white">
                    {t("header.stats.account")}
                  </p>
                  <span className="font-semibold text-gray-700 dark:text-gray-200">
                    {profile.is_active ? t("header.stats.active") : t("header.stats.inactive")}
                  </span>
                </div>
                <div className="text-center sm:text-left">
                  <p className="uppercase font-semibold text-gray-900 dark:text-white">
                    {t("header.stats.reputation")}
                  </p>
                  <span className="font-semibold text-gray-700 dark:text-gray-200">
                    {Number(profile.reputation_score).toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="text-sm">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {profile.full_name || t("header.stats.noName")}
                </p>
                <p className="font-semibold text-gray-700 dark:text-gray-200">{profile.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* EDITAR */}
        <div
          className="rounded-2xl shadow-md border border-primary/10 dark:border-gray-800
                     bg-gradient-to-br from-white/80 via-primary/5 to-lightprimary/30
                     dark:from-darkgray dark:via-darkgray/80 dark:to-dark
                     backdrop-blur-sm"
        >
          <div className="px-6 md:px-10 py-5 border-b border-gray-400 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("edit.title")}
            </h2>
            <p className="text-xs text-gray-900 dark:text-gray-300 mt-1">
              {t("edit.subtitle")}
            </p>
          </div>

          <div className="px-6 md:px-10 py-6">{renderByRole()}</div>

          <div className="px-6 md:px-10 py-5 border-t border-gray-400 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs text-gray-900 dark:text-gray-300">{pendingText}</span>
            <button
              type="button"
              onClick={handleSubmitAll}
              disabled={!hasChanges || saving}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white
                         bg-primary hover:brightness-200 disabled:hover:brightness-100 transition-all disabled:bg-gray-400
                         dark:disabled:bg-gray-700 dark:disabled:text-gray-900
                         disabled:cursor-not-allowed shadow-sm transition"
            >
              {saving ? (
                <>
                  <Icon icon="solar:refresh-bold" width={16} className="animate-spin" />
                  {t("edit.saving")}
                </>
              ) : (
                <>
                  <Icon icon="solar:cloud-upload-bold" width={18} />
                  {t("edit.submit")}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
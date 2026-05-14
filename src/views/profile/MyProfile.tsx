import { useEffect, useMemo, useState } from "react";
import { ProfileService, MyProfile as MyProfileType } from "../../services/ProfileService";
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
                     bg-gradient-to-br from-primary/15 via-white/70 to-lightprimary/50
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
                <span className="inline-block self-center sm:self-auto text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-md bg-primary/20 text-primary border border-primary/30">
                  {profile.role}
                </span>
              </div>

              <div className="flex justify-center sm:justify-start gap-6 md:gap-10 mb-4 text-sm">
                <div className="text-center sm:text-left">
                  <span className="font-semibold text-gray-900 dark:text-white">{profile.status}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t("header.stats.status")}
                  </p>
                </div>
                <div className="text-center sm:text-left">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {Number(profile.reputation_score).toFixed(2)}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t("header.stats.reputation")}
                  </p>
                </div>
                <div className="text-center sm:text-left">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {profile.is_active ? t("header.stats.active") : t("header.stats.inactive")}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t("header.stats.account")}
                  </p>
                </div>
              </div>

              <div className="text-sm">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {profile.full_name || t("header.stats.noName")}
                </p>
                <p className="text-gray-500 dark:text-gray-400">{profile.email}</p>
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
          <div className="px-6 md:px-10 py-5 border-b border-primary/10 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("edit.title")}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t("edit.subtitle")}
            </p>
          </div>

          <div className="px-6 md:px-10 py-6">{renderByRole()}</div>

          <div className="px-6 md:px-10 py-5 border-t border-primary/10 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs text-gray-500 dark:text-gray-400">{pendingText}</span>
            <button
              type="button"
              onClick={handleSubmitAll}
              disabled={!hasChanges || saving}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white
                         bg-primary hover:bg-primary/90 disabled:bg-gray-300 dark:disabled:bg-gray-700
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
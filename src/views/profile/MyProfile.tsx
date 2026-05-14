import { useEffect, useState } from "react";
import { ProfileService, MyProfile as MyProfileType } from "../../services/ProfileService";
import AvatarUploader from "./components/AvatarUploader";
import ClientProfile from "./components/ClientProfile";
import VendorProfile from "./components/VendorProfile";
import AdminProfile from "./components/AdminProfile";
import { useTranslation } from "react-i18next";

const MyProfile = () => {
  const [profile, setProfile] = useState<MyProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation("header");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await ProfileService.getMyProfile();
      setProfile(data);
    } catch (e: any) {
      setError(e?.message || "Error cargando el perfil");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando perfil...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!profile) return null;

  const renderByRole = () => {
    switch (profile.role) {
      case "ADMIN":
        return <AdminProfile profile={profile} onUpdated={fetchProfile} />;
      case "VENDEDOR":
        return <VendorProfile profile={profile} onUpdated={fetchProfile} />;
      default:
        return <ClientProfile profile={profile} onUpdated={fetchProfile} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 font-[var(--main-font)]">
      <div className="bg-white dark:bg-darkgray rounded-2xl shadow-md p-6 mb-6 flex flex-col md:flex-row items-center gap-6">
        <AvatarUploader profile={profile} onUpdated={fetchProfile} />
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {profile.full_name || profile.username}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{profile.email}</p>
          <span className="inline-block mt-2 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-primary/10 text-primary">
            {profile.role}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-darkgray rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {t("profile.myProfile") || "Mi Perfil"}
        </h2>
        {renderByRole()}
      </div>
    </div>
  );
};

export default MyProfile;
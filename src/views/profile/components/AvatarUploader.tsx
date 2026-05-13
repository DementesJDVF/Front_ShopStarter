import { useRef, useState } from "react";
import { ProfileService, MyProfile } from "../../../services/ProfileService";
import { getUserAvatar } from "../../../utils/avatar";
import { Button } from "flowbite-react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

interface Props {
  profile: MyProfile;
  onUpdated: () => void;
}

const AvatarUploader = ({ profile, onUpdated }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const fallback = getUserAvatar(profile.email || profile.username || "guest");
  const currentUrl = profile.profile_picture?.image_url || fallback;

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      await ProfileService.uploadProfilePicture(file);
      toast.success("Foto actualizada");
      onUpdated();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Error al subir la foto");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    if (!profile.profile_picture) return;
    if (!window.confirm("¿Eliminar tu foto de perfil?")) return;
    try {
      await ProfileService.deleteProfilePicture();
      toast.success("Foto eliminada");
      onUpdated();
    } catch {
      toast.error("Error al eliminar la foto");
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <img
        src={currentUrl}
        alt="avatar"
        className="w-28 h-28 rounded-full object-cover border-4 border-primary/30"
      />
      <input
        type="file"
        accept="image/*"
        ref={fileRef}
        onChange={handleSelect}
        className="hidden"
      />
      <div className="flex gap-2">
        <Button
          size="xs"
          color="primary"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          <Icon icon="solar:upload-bold" width={16} className="mr-1" />
          {uploading ? "Subiendo..." : "Cambiar"}
        </Button>
        {profile.profile_picture && (
          <Button size="xs" color="failure" onClick={handleDelete}>
            <Icon icon="solar:trash-bin-trash-bold" width={16} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default AvatarUploader;
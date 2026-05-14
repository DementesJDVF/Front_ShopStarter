import { useRef, useState, useEffect } from "react";
import { ProfileService, MyProfile } from "../../../services/ProfileService";
import { getUserAvatar } from "../../../utils/avatar";
import { Button, Spinner, Tooltip } from "flowbite-react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

// Importamos las utilidades que usas en productos
import { resizeImageForAI } from "../../../utils/clientResizer";
import { optimizeImageUrl } from "../../../utils/imageOptimizer";
import { showSuccessAlert, showErrorAlert } from "../../../utils/Alerts";

interface Props {
  profile: MyProfile;
  onUpdated: () => void;
}

const AvatarUploader = ({ profile, onUpdated }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Fallback de avatar basado en el usuario
  const fallback = getUserAvatar(profile.email || profile.username || "guest");
  
  // Prioridad de imagen: 1. Preview local, 2. Imagen optimizada de Cloudinary, 3. Fallback
  const currentUrl = previewUrl || 
    (profile.profile_picture?.image_url ? optimizeImageUrl(profile.profile_picture.image_url, 400) : fallback);

  // Cleanup del objeto URL para evitar fugas de memoria
  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const originalFile = e.target.files?.[0];
    if (!originalFile) return;

    try {
      setUploading(true);
      
      // 1. Mostrar preview local inmediato para mejor UX
      const localBlob = URL.createObjectURL(originalFile);
      setPreviewUrl(localBlob);

      // 2. REDIMENSIONAMIENTO (Crucial para Railway)
      // Reducimos la resolución en el navegador del usuario.
      const resizedBlob = await resizeImageForAI(originalFile);
      
      // 3. RECONSTRUCCIÓN DEL ARCHIVO
      // Convertimos el Blob optimizado en un File plano que el Service pueda aceptar.
      const fileToUpload = new File([resizedBlob], originalFile.name, {
        type: "image/jpeg",
      });

      // 4. ENVÍO AL BACKEND
      // El backend recibe un archivo de ~100KB en lugar de ~5MB.
      // Railway lo procesa rápido y Cloudinary recibe la versión ya optimizada.
      await ProfileService.uploadProfilePicture(fileToUpload);

      showSuccessAlert("¡Actualizado! Tu nueva foto de perfil ya está lista.");
      onUpdated();
      setPreviewUrl(null); // Limpiamos el preview para usar la URL real de Cloudinary
    } catch (err: any) {
      setPreviewUrl(null);
      const errorMsg = err?.response?.data?.error || "No se pudo subir la imagen";
      showErrorAlert(`Error de subida, ${errorMsg}`);
    } finally {
      setUploading(false);
      // Limpiamos el input para poder subir la misma imagen si se desea
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    if (!profile.profile_picture) return;
    
    // Podrías usar tu context useConfirm aquí si lo prefieres
    if (!window.confirm("¿Deseas eliminar tu foto actual?")) return;

    try {
      setUploading(true);
      await ProfileService.deleteProfilePicture();
      showSuccessAlert("Eliminada: Ahora usas el avatar por defecto");
      onUpdated();
    } catch {
      showErrorAlert("Error: No se pudo eliminar la foto");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <div className="relative w-32 h-32">
          <img
            src={currentUrl}
            alt="avatar"
            className={`w-full h-full rounded-full object-cover border-4 shadow-lg transition-all duration-300 ${
              uploading ? "opacity-40 scale-95 border-gray-300" : "border-primary/20 group-hover:border-primary/50"
            }`}
            onError={(e) => (e.currentTarget.src = fallback)}
          />
          
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner size="xl" color="info" />
            </div>
          )}
        </div>

        {/* Botón flotante de eliminar sobre la imagen (opcional) */}
        {!uploading && profile.profile_picture && (
          <button
            onClick={handleDelete}
            className="absolute -top-1 -right-1 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 transition-colors"
          >
            <Icon icon="solar:trash-bin-trash-bold" width={14} />
          </button>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        ref={fileRef}
        onChange={handleSelect}
        className="hidden"
      />
      
      <div className="flex gap-2">
        <Button
          size="sm"
          gradientDuoTone="purpleToBlue"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center"
        >
          <Icon 
            icon={uploading ? "line-md:uploading-loop" : "solar:camera-add-bold"} 
            width={18} 
            className="mr-2" 
          />
          {uploading ? "Procesando..." : "Cambiar Foto"}
        </Button>
      </div>

      <p className="text-xs text-gray-500 italic">
        Sugerencia: Usa una imagen cuadrada para mejores resultados.
      </p>
    </div>
  );
};

export default AvatarUploader;
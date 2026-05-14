import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Cropper from "react-easy-crop";
import { ProfileService, MyProfile } from "../../../services/ProfileService";
import { getUserAvatar } from "../../../utils/avatar";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

interface Props {
  profile: MyProfile;
  onUpdated: () => void;
}

interface PixelArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const OUTPUT_SIZE = 333;

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });

const getCroppedImage = async (imageSrc: string, area: PixelArea): Promise<Blob> => {
  const img = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No canvas context");

  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("No se pudo generar la imagen"));
      },
      "image/jpeg",
      0.92
    );
  });
};

const AvatarUploader = ({ profile, onUpdated }: Props) => {
  const { t } = useTranslation("Profile");
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelArea | null>(null);
  const [uploading, setUploading] = useState(false);

  const fallback = getUserAvatar(profile.email || profile.username || "guest");
  const currentUrl = profile.profile_picture?.image_url || fallback;

  const onCropComplete = useCallback((_: any, areaPixels: PixelArea) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  useEffect(() => {
    if (imageSrc) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [imageSrc]);

  useEffect(() => {
    if (!imageSrc) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !uploading) handleCloseCropper();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSrc, uploading]);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleCloseCropper = () => {
    setImageSrc(null);
    setCroppedAreaPixels(null);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };

  const handleConfirmCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      setUploading(true);
      const blob = await getCroppedImage(imageSrc, croppedAreaPixels);
      const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
      await ProfileService.uploadProfilePicture(file);
      toast.success(t("avatar.updated"));
      handleCloseCropper();
      onUpdated();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || t("avatar.uploadError"));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!profile.profile_picture) return;
    if (!window.confirm(t("avatar.deleteConfirm"))) return;
    try {
      await ProfileService.deleteProfilePicture();
      toast.success(t("avatar.deleted"));
      onUpdated();
    } catch {
      toast.error(t("avatar.deleteError"));
    }
  };

  const modal = imageSrc
    ? createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !uploading) handleCloseCropper();
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative bg-white dark:bg-darkgray rounded-2xl shadow-2xl w-full max-w-xl max-h-[95vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("avatar.modalTitle")}
              </h3>
              <button
                type="button"
                onClick={handleCloseCropper}
                disabled={uploading}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 disabled:opacity-50"
                aria-label={t("avatar.close")}
              >
                <Icon icon="solar:close-circle-bold" width={22} />
              </button>
            </div>

            <div className="relative w-full h-80 bg-gray-900 flex-shrink-0">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className="px-6 py-4 space-y-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Icon icon="solar:magnifer-zoom-out-linear" width={18} className="text-gray-500" />
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <Icon icon="solar:magnifer-zoom-in-linear" width={18} className="text-gray-500" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {t("avatar.modalHint", { size: OUTPUT_SIZE })}
              </p>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCloseCropper}
                disabled={uploading}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-50"
              >
                {t("avatar.cancel")}
              </button>
              <button
                type="button"
                onClick={handleConfirmCrop}
                disabled={uploading}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary/90 disabled:opacity-60 transition"
              >
                {uploading ? (
                  <>
                    <Icon icon="solar:refresh-bold" width={16} className="animate-spin" />
                    {t("avatar.uploading")}
                  </>
                ) : (
                  <>
                    <Icon icon="solar:check-circle-bold" width={16} />
                    {t("avatar.apply")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <img
            src={currentUrl}
            alt="avatar"
            className="w-32 h-32 md:w-36 md:h-36 rounded-full object-cover border-4 border-primary/30 shadow-md"
          />
        </div>

        <input
          type="file"
          accept="image/*"
          ref={fileRef}
          onChange={handleSelect}
          className="hidden"
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary/90 disabled:opacity-60 transition"
          >
            <Icon icon="solar:camera-bold" width={14} />
            {t("avatar.change")}
          </button>
          {profile.profile_picture && (
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 transition"
            >
              <Icon icon="solar:trash-bin-trash-bold" width={14} />
            </button>
          )}
        </div>
      </div>

      {modal}
    </>
  );
};

export default AvatarUploader;
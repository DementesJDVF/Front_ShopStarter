import { useState } from "react";
import { Button, TextInput, Select } from "flowbite-react";
import { Icon } from "@iconify/react";
import { ProfileService } from "../../../services/ProfileService";
import toast from "react-hot-toast";

interface Props {
  label: string;
  field: string;
  value: string | null | undefined;
  type?: "text" | "email" | "tel" | "date" | "select";
  options?: { value: string; label: string }[];
  editable: boolean;
  onUpdated: () => void;
}

const ProfileFieldRow = ({
  label,
  field,
  value,
  type = "text",
  options,
  editable,
  onUpdated,
}: Props) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await ProfileService.updateMyProfile({ [field]: draft } as any);
      toast.success(`${label} actualizado`);
      setEditing(false);
      onUpdated();
    } catch (e: any) {
      const msg =
        e?.response?.data?.[field]?.[0] ||
        e?.response?.data?.detail ||
        "Error al guardar";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(value || "");
    setEditing(false);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 gap-3">
      <div className="md:w-1/3">
        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
          {label}
        </span>
      </div>
      <div className="flex-1 flex items-center gap-2">
        {editing ? (
          <>
            {type === "select" && options ? (
              <Select
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="flex-1"
              >
                <option value="">— Selecciona —</option>
                {options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            ) : (
              <TextInput
                type={type}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="flex-1"
              />
            )}
            <Button
              size="sm"
              color="success"
              onClick={handleSave}
              disabled={saving}
            >
              <Icon icon="solar:check-circle-bold" width={18} />
            </Button>
            <Button size="sm" color="gray" onClick={handleCancel} disabled={saving}>
              <Icon icon="solar:close-circle-bold" width={18} />
            </Button>
          </>
        ) : (
          <>
            <span className="flex-1 text-gray-800 dark:text-gray-100 break-all">
              {value || <em className="text-gray-400">— sin definir —</em>}
            </span>
            {editable && (
              <Button size="sm" color="light" onClick={() => setEditing(true)}>
                <Icon icon="solar:pen-bold" width={16} className="mr-1" />
                Editar
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileFieldRow;
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";

interface Props {
  label: string;
  field: string;
  originalValue: string | null | undefined;
  draftValue: string | undefined;
  onChange: (field: string, value: string) => void;
  type?: "text" | "email" | "tel" | "date" | "select";
  options?: { value: string; label: string }[];
  editable: boolean;
}

const ProfileFieldRow = ({
  label,
  field,
  originalValue,
  draftValue,
  onChange,
  type = "text",
  options,
  editable,
}: Props) => {
  const { t } = useTranslation("Profile");
  const currentValue = draftValue !== undefined ? draftValue : originalValue || "";
  const isChanged = draftValue !== undefined;

  const baseInputClass =
    "w-full bg-white/70 dark:bg-dark/70 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition disabled:opacity-60 disabled:cursor-not-allowed";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-2 sm:gap-6 items-start sm:items-center py-4 border-b border-primary/10 dark:border-gray-800 last:border-b-0">
      <label className="text-sm font-semibold text-gray-900 dark:text-white sm:text-right flex items-center sm:justify-end gap-1.5">
        {label}
        {isChanged && (
          <span
            title={t("fields.unsavedTooltip")}
            className="inline-block w-2 h-2 rounded-full bg-primary"
          />
        )}
      </label>

      <div className="flex items-center gap-2">
        {type === "select" && options ? (
          <select
            value={currentValue}
            onChange={(e) => onChange(field, e.target.value)}
            disabled={!editable}
            className={baseInputClass}
          >
            <option value="">{t("fields.selectPlaceholder")}</option>
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={currentValue}
            onChange={(e) => onChange(field, e.target.value)}
            disabled={!editable}
            placeholder={
              editable ? `${t("fields.yourFieldPrefix")} ${label.toLowerCase()}` : ""
            }
            className={baseInputClass}
          />
        )}
        {!editable && (
          <Icon
            icon="solar:lock-keyhole-minimalistic-bold"
            width={16}
            className="text-gray-400 flex-shrink-0"
          />
        )}
      </div>
    </div>
  );
};

export default ProfileFieldRow;
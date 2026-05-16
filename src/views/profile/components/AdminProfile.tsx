import { MyProfile } from "../../../services/ProfileService";
import ProfileFieldRow from "./ProfileFieldRow";
import { useTranslation } from "react-i18next";

interface Props {
  profile: MyProfile;
  drafts: Record<string, string>;
  setDraftField: (field: string, value: string) => void;
  onUpdated: () => void;
}

const AdminProfile = ({ profile, drafts, setDraftField }: Props) => {
  const { t } = useTranslation("Profile");
  const isEditable = (f: string) => profile.editable_fields.includes(f);

  const docOptions = [
    { value: "CC", label: t("documents.CC") },
    { value: "CE", label: t("documents.CE") },
    { value: "TI", label: t("documents.TI") },
    { value: "PASS", label: t("documents.PASS") },
  ];

  const row = (label: string, field: string, type: any = "text", extra: any = {}) => (
    <ProfileFieldRow
      label={label}
      field={field}
      originalValue={(profile as any)[field]}
      draftValue={drafts[field]}
      onChange={setDraftField}
      type={type}
      editable={isEditable(field)}
      {...extra}
    />
  );

  return (
    <div>
      {row(t("fields.username"), "username")}
      {row(t("fields.email"), "email", "email")}
      {row(t("fields.fullName"), "full_name")}
      {row(t("fields.phone"), "phone_number", "tel")}
      {row(t("fields.documentType"), "document_type", "select", { options: docOptions })}
      {row(t("fields.documentNumber"), "document_number")}
      {row(t("fields.birthDate"), "birth_date", "date")}
      {row(t("fields.role"), "role")}
      {row(t("fields.status"), "status")}
    </div>
  );
};

export default AdminProfile;
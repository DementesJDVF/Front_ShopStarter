import { MyProfile } from "../../../services/ProfileService";
import ProfileFieldRow from "./ProfileFieldRow";
import { useTranslation } from "react-i18next";

interface Props {
  profile: MyProfile;
  drafts: Record<string, string>;
  setDraftField: (field: string, value: string) => void;
  onUpdated: () => void;
}

const ClientProfile = ({ profile, drafts, setDraftField }: Props) => {
  const { t } = useTranslation("Profile");
  const isEditable = (f: string) => profile.editable_fields.includes(f);

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
    </div>
  );
};

export default ClientProfile;
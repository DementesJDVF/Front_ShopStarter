import { MyProfile } from "../../../services/ProfileService";
import ProfileFieldRow from "./ProfileFieldRow";

interface Props {
  profile: MyProfile;
  onUpdated: () => void;
}

const ClientProfile = ({ profile, onUpdated }: Props) => {
  const isEditable = (f: string) => profile.editable_fields.includes(f);

  return (
    <div>
      <ProfileFieldRow label="Nombre de usuario" field="username" value={profile.username} editable={isEditable("username")} onUpdated={onUpdated} />
      <ProfileFieldRow label="Correo electrónico" field="email" type="email" value={profile.email} editable={isEditable("email")} onUpdated={onUpdated} />
      <ProfileFieldRow label="Nombre completo" field="full_name" value={profile.full_name} editable={isEditable("full_name")} onUpdated={onUpdated} />
      <ProfileFieldRow label="Teléfono" field="phone_number" type="tel" value={profile.phone_number} editable={isEditable("phone_number")} onUpdated={onUpdated} />
    </div>
  );
};

export default ClientProfile;
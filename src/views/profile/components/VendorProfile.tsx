import { MyProfile } from "../../../services/ProfileService";
import ProfileFieldRow from "./ProfileFieldRow";

interface Props {
  profile: MyProfile;
  onUpdated: () => void;
}

const VendorProfile = ({ profile, onUpdated }: Props) => {
  const isEditable = (f: string) => profile.editable_fields.includes(f);

  return (
    <div>
      <ProfileFieldRow label="Nombre de usuario" field="username" value={profile.username} editable={isEditable("username")} onUpdated={onUpdated} />
      <ProfileFieldRow label="Correo electrónico" field="email" type="email" value={profile.email} editable={isEditable("email")} onUpdated={onUpdated} />
      <ProfileFieldRow label="Nombre completo" field="full_name" value={profile.full_name} editable={isEditable("full_name")} onUpdated={onUpdated} />
      <ProfileFieldRow label="Teléfono" field="phone_number" type="tel" value={profile.phone_number} editable={isEditable("phone_number")} onUpdated={onUpdated} />
      <ProfileFieldRow
        label="Tipo de documento"
        field="document_type"
        type="select"
        options={[
          { value: "CC", label: "Cédula de Ciudadanía" },
          { value: "CE", label: "Cédula de Extranjería" },
          { value: "TI", label: "Tarjeta de Identidad" },
          { value: "PASS", label: "Pasaporte" },
        ]}
        value={profile.document_type}
        editable={isEditable("document_type")}
        onUpdated={onUpdated}
      />
      <ProfileFieldRow label="Número de documento" field="document_number" value={profile.document_number} editable={isEditable("document_number")} onUpdated={onUpdated} />
      <ProfileFieldRow label="Fecha de nacimiento" field="birth_date" type="date" value={profile.birth_date} editable={isEditable("birth_date")} onUpdated={onUpdated} />

      {/* Solo lectura */}
      <ProfileFieldRow label="Estado de la cuenta" field="status" value={profile.status} editable={false} onUpdated={onUpdated} />
      <ProfileFieldRow label="Reputación" field="reputation_score" value={String(profile.reputation_score)} editable={false} onUpdated={onUpdated} />
    </div>
  );
};

export default VendorProfile;
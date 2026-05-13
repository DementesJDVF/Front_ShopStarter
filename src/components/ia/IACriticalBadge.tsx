// ===== NUEVO: Sprint IA y Funcionalidad =====
type Severity = "alta" | "media" | "baja";
const COLORES: Record<Severity, string> = { alta: "#ff4d4f", media: "#faad14", baja: "#52c41a" };
const IACriticalBadge = ({ label = "IA Clave", severity = "alta" }: { label?: string; severity?: Severity }) => (
  <span style={{
    background: COLORES[severity] || "#1890ff",
    color: "white", fontSize: 10, fontWeight: "bold",
    padding: "2px 8px", borderRadius: 12, marginLeft: 6
  }}>
    🤖 {label}
  </span>
);
export default IACriticalBadge;
// ===== FIN NUEVO =====

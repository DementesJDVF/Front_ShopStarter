// ===== NUEVO: Sprint IA y Funcionalidad =====
const IAPerformanceIndicator = ({ tiempoMs }) => {
  if (process.env.NODE_ENV !== "development") return null;
  if (!tiempoMs) return null;

  const color = tiempoMs < 500 ? "green" : tiempoMs < 1500 ? "orange" : "red";

  return (
    <span style={{
      fontSize: 10, background: color, color: "white",
      padding: "2px 6px", borderRadius: 4, marginLeft: 8
    }}>
      IA: {tiempoMs}ms
    </span>
  );
};

export default IAPerformanceIndicator;
// ===== FIN NUEVO =====

// ===== NUEVO: Sprint IA y Funcionalidad =====
import { useState, useEffect } from "react";

const IAErrorAlert = ({ mensaje = "El servicio de IA no está disponible temporalmente.", 
                         visible = false, 
                         duracion = 5000 }) => {
  const [mostrar, setMostrar] = useState(visible);

  useEffect(() => {
    setMostrar(visible);
    if (visible && duracion) {
      const timer = setTimeout(() => setMostrar(false), duracion);
      return () => clearTimeout(timer);
    }
  }, [visible, duracion]);

  if (!mostrar) return null;

  return (
    <div style={{
      position: "fixed", top: 20, right: 20, zIndex: 9999,
      background: "#ff4d4f", color: "white", padding: "12px 20px",
      borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
      display: "flex", alignItems: "center", gap: 10
    }}>
      ⚠️ {mensaje}
      <button onClick={() => setMostrar(false)} 
              style={{ background: "none", border: "none", 
                       color: "white", cursor: "pointer", fontSize: 18 }}>
        ×
      </button>
    </div>
  );
};

export default IAErrorAlert;
// ===== FIN NUEVO =====

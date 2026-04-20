import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, Select } from "flowbite-react";
import api from "../../utils/axios";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Legend } from "recharts";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

/* ICONOS MAP */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const AdminDashboard = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [period, setPeriod] = useState("days");
  const [openCard, setOpenCard] = useState<number | null>(null);

  const isMounted = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get("users/list/");
      if (!isMounted.current) return;
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, [fetchData]);

  const filteredUsers = useMemo(
    () => users.filter(u => u.role === "VENDEDOR" || u.role === "CLIENTE"),
    [users]
  );

  const stats = useMemo(() => ({
    total: filteredUsers.length,
    vendors: filteredUsers.filter(u => u.role === "VENDEDOR"),
    clients: filteredUsers.filter(u => u.role === "CLIENTE"),
    active: filteredUsers.filter(u => u.status === "ACTIVE")
  }), [filteredUsers]);

  const growthData = useMemo(() => {
    const map = {};

      if (!filteredUsers.length) return [];

      // =========================
      // 📅 DÍAS COMPLETOS (desde primer registro hasta HOY)
      // =========================
      if (period === "days") {

        filteredUsers.forEach(u => {
          if (!u.created_at) return;

          const d = new Date(u.created_at);
          const key = d.toISOString().split("T")[0]; // YYYY-MM-DD

          map[key] = (map[key] || 0) + 1;
        });

        const keys = Object.keys(map).sort();

        const start = new Date(keys[0]);
        const end = new Date(); // hoy

        const result = [];

        const current = new Date(start);

        while (current <= end) {

          const key = current.toISOString().split("T")[0];

          result.push({
            time: current.toLocaleDateString("es-CO", {
              day: "2-digit",
              month: "short"
            }),
            users: map[key] || 0
          });

          current.setDate(current.getDate() + 1);
        }

        return result;
      }

      // =========================
      // 📆 MESES COMPLETOS (desde primer mes hasta HOY)
      // =========================
      if (period === "months") {

        filteredUsers.forEach(u => {
          if (!u.created_at) return;

          const d = new Date(u.created_at);

          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

          map[key] = (map[key] || 0) + 1;
        });

        const keys = Object.keys(map).sort();

        const [startY, startM] = keys[0].split("-").map(Number);

        const start = new Date(startY, startM - 1, 1);
        const end = new Date(); // mes actual

        const result = [];

        const current = new Date(start);

        while (current <= end) {

          const key =
            `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;

          result.push({
            time: current.toLocaleDateString("es-CO", {
              month: "short",
              year: "numeric"
            }),
            users: map[key] || 0
          });

          current.setMonth(current.getMonth() + 1);
        }

        return result;
      }

      return [];
    }, [filteredUsers, period]);
    
  const kpis = [
    { title: "Usuarios", value: stats.total, data: filteredUsers },
    { title: "Vendedores", value: stats.vendors.length, data: stats.vendors },
    { title: "Clientes", value: stats.clients.length, data: stats.clients },
    { title: "Activos", value: stats.active.length, data: stats.active }
  ];

  return (
    <div
      className="min-h-screen w-full text-white"
      style={{
        background: `
          radial-gradient(circle at top left, rgba(32,133,74,0.56), transparent 40%),
          radial-gradient(circle at top right, rgba(32,133,74,0.56), transparent 40%),
          radial-gradient(circle at bottom left, rgba(68,105,239,0.51), transparent 40%),
          radial-gradient(circle at bottom right, rgba(68,105,239,0.51), transparent 40%),
          #0f172ad9
        `
      }}
    >
      {/* NAVBAR */}
      <header className="bg-[#c0c0c0] px-6 py-4 border-b border-black/40">
        <h1 className="font-bold text-lg text-white">Dashboard Admin</h1>
      </header>

      <main className="p-6 space-y-6">

        {/* OVERLAY */}
        {openCard !== null && (
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => setOpenCard(null)}
          />
        )}

        {/* CARDS KPI */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map((k, i) => (
            <div
              key={i}
              onClick={() => setOpenCard(openCard === i ? null : i)}
              className={`cursor-pointer backdrop-blur-xl rounded-2xl p-5 transition border border-white/30
              ${openCard === i
                ? "fixed top-1/2 left-1/2 z-50 w-[60%] h-[75%] overflow-auto -translate-x-1/2 -translate-y-1/2 bg-[#0f172a] shadow-[0_0_25px_rgba(34,197,94,0.4)] border-green-400 p-8"
                : "bg-white/5 shadow-[0_0_20px_rgba(0,255,255)] hover:scale-[1.03]"
              }`}
            >
              <p className="text-sm text-gray-300">{k.title}</p>
              <h2 className="text-3xl font-bold text-white">{k.value}</h2>

              {/* DETALLE */}
              {openCard === i && (
                <div className="mt-6 space-y-3">
                  <h3 className="text-green-400 font-semibold">
                    Detalle de {k.title}
                  </h3>

                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="max-h-[300px] overflow-auto text-sm">
                      {k.data.length === 0 ? (
                        <p className="text-gray-500">Sin datos</p>
                      ) : (
                        k.data.map((u: any, idx: number) => (
                          <div key={idx} className="border-b border-white/10 py-2">
                            <p><b>ID:</b> {u.id}</p>
                            <p><b>Usuario:</b> {u.username}</p>
                            <p><b>Rol:</b> {u.role}</p>
                            <p><b>Estado:</b> {u.status}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* GRAFICAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <Card className="md:col-span-2 bg-white/5 border border-white/20 shadow-[0_0_20px_rgba(0,255,255)]">
            <div className="flex justify-between mb-3">
              <h2 className="text-white">Crecimiento usuarios</h2>

              <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
                <option value="days">días</option>
                <option value="months">meses</option>
              </Select>
            </div>

            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={growthData}>
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="users"
                  fill="#22c55e"
                  barSize={10}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <div className="flex flex-col gap-4">

            <Card className="bg-white/5 border border-white/20 shadow-[0_0_20px_rgba(0,255,255)]">
              <h2 className="text-white">Usuarios por rol</h2>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Vendedores", value: stats.vendors.length },
                      { name: "Clientes", value: stats.clients.length }
                    ]}
                    dataKey="value"
                    outerRadius={50}
                    innerRadius={30}
                  >
                    <Cell fill="#22c55e" />
                    <Cell fill="#3b82f6" />
                  </Pie>
                  <Legend layout="vertical"
                    verticalAlign="right"
                    align="right" />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="bg-white/5 border border-white/20 shadow-[0_0_20px_rgba(0,255,255)]">
              <h2 className="text-white">Activos e inactivos</h2>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Activos", value: stats.active.length },
                      { name: "Inactivos", value: stats.total - stats.active.length }
                    ]}
                    dataKey="value"
                    outerRadius={50}
                    innerRadius={30}
                    label={({name,value}) =>`${name}: ${value}`}
                  >
                    <Cell fill="#22c55e" />
                    <Cell fill="#ef4444" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </Card>

          </div>
        </div>

        {/* TABLA + MAPA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <Card className="bg-white/5 border border-white/20">
            <h2 className="text-white font-bold mb-4">Usuarios registrados</h2>

            <div className="overflow-auto max-h-[300px]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/20 text-left">
                    <th>ID</th>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th>Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((u, i) => (
                    <tr key={i} className="border-b border-white/10">
                      <td>{u.id}</td>
                      <td>{u.username}</td>
                      <td>{u.role}</td>
                      <td>{u.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="bg-white/5 border border-white/20">
            <h2 className="mb-4 text-white">Mapa de vendedores</h2>

            <div className="h-[300px] rounded-xl overflow-hidden">
              <MapContainer center={[2.4448, -76.6147]} zoom={13} className="h-full w-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {stats.vendors.map((v: any, i: number) => (
                  v.lat && v.lng && (
                    <Marker key={i} position={[v.lat, v.lng]}>
                      <Popup>
                        {v.username}<br />
                        {v.status}
                      </Popup>
                    </Marker>
                  )
                ))}
              </MapContainer>
            </div>
          </Card>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="text-center py-2 text-gray-400 border-t border-white/20">
        © 2026 ShopStarter
      </footer>
    </div>
  );
};

export default AdminDashboard;
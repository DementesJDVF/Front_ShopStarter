import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, Select } from "flowbite-react";
import api from "../../utils/axios";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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

/*iconos map */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const AdminDashboard = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [period, setPeriod] = useState("15d");
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

  const filteredUsers = useMemo(() =>
    users.filter(u => u.role === "VENDEDOR" || u.role === "CLIENTE"),
  [users]);

  const stats = useMemo(() => ({
    total: filteredUsers.length,
    vendors: filteredUsers.filter(u => u.role === "VENDEDOR"),
    clients: filteredUsers.filter(u => u.role === "CLIENTE"),
    active: filteredUsers.filter(u => u.status === "ACTIVE")
  }), [filteredUsers]);

  const growthData = useMemo(() => {
    const map: any = {};
    filteredUsers.forEach(u => {
      if (!u.created_at) return;
      const date = new Date(u.created_at);

      const key =
        period === "15d"
          ? date.toLocaleDateString("es-CO", { day: "2-digit", month: "short" })
          : date.toLocaleDateString("es-CO", { month: "short" });

      map[key] = (map[key] || 0) + 1;
    });

    return Object.keys(map).map(k => ({
      time: k,
      users: map[k]
    }));
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
      {/* nabvar */}
      <header className="bg-[#c0c0c0] px-6 py-4 border-b border-black/40">
        <h1 className="font-bold text-lg text-white">Dashboard Admin</h1>
      </header>

      <main className="p-6 space-y-6">

        
        {openCard !== null && (
          <div className="fixed inset-0 bg-black/60 z-40"></div>
        )}

        {/* los 4 cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map((k, i) => (
            <div
              key={i}
              onClick={() => setOpenCard(openCard === i ? null : i)}
              className={`cursor-pointer backdrop-blur-xl rounded-2xl p-5 transition border border-white/30
              ${openCard === i
                  ? "fixed top-1/2 left-1/2 z-50 w-[55%] h-[75%] overflow-auto -translate-x-1/2 -translate-y-1/2 bg-[#] shadow-[0_0_20px_rgba(255,255,255)] border-blue-400 p-8"
                  : "bg-white/5 shadow-[0_0_20px_rgba(0,255,255)] hover:scale-[1.03]"
                }`}
            >
              <p className="text-sm">{k.title}</p>
              <h2 className="text-3xl font-bold text-white">{k.value}</h2>
            </div>
          ))}
        </div>

        {/* fila2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <Card className="md:col-span-2 bg-white/5 border border-white/20 shadow-[0_0_20px_rgba(0,255,255)]">
            <div className="flex justify-between mb-3">
              <h2 className="text-white">Crecimiento usuarios</h2>
              <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
                <option value="d">dias</option> {/*indicador de crecimiento por dias o por mes */}
                <option value="month">Meses</option>
              </Select>
            </div>

            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={growthData}>
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="users" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <div className="flex flex-col gap-4">
            <Card className="bg-white/5 border border-white/20">
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
                    <Cell fill="#22c55e" />{/*colores de diagrama de pastel */}
                    <Cell fill="#3b82f6" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="bg-white/5 border border-white/20">
              <h2 className="text-white">activos e inactivos</h2>
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
                  >
                    <Cell fill="#22c55e" /> {/*colores de diagrama de pastel */}
                    <Cell fill="#ef4444" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>

        {/*estilo de la fila3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/*tabla para ver usuarios registrados */}
          <Card className="bg-white/5 backdrop-blur-xl border border-white/20 shadow-[0_0_20px_rgba(0,255,255)] flex flex-col">
            <h2 className="text-white font-bold mb-4">Usuarios registrados</h2>

            <div className="overflow-auto flex-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/20 text-left">
                    <th className="py-2 px-2">ID</th>
                    <th className="py-2 px-3">Usuario</th>
                    <th className="py-2 px-7">Rol</th>
                    <th className="py-2 px-2">Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((u, i) => (
                    <tr key={i} className="border-b border-white/10 text-left">
                      <td className="py-2 px-2">{u.id}</td>
                      <td className="py-2 px-2">{u.username}</td>
                      <td className="py-2 px-5">{u.role}</td>
                      <td className="py-2 px-2">{u.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* cuadro para mapa vendedores*/}
          <Card className="bg-white/5 border border-white/20 shadow-[0_0_20px_rgba(0,255,255)]">
            <h2 className="mb-4 text-white">Mapa de vendedores</h2>

            <div className="h-[300px] w-full rounded-xl overflow-hidden">
              <MapContainer
                center={[2.4448, -76.6147]}
                zoom={13}
                className="h-full w-full"
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /> {/*cambiar a mapa oscuro https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png */}

                <Marker position={[2.4448, -76.6147]}>
                  <Popup>ubicación vendedor</Popup>
                </Marker>

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

      <footer className="text-center py-2 text-gray-400 border-t border-white/20">
        © 2026 ShopStarter
      </footer>
    </div>
  );
};

export default AdminDashboard;
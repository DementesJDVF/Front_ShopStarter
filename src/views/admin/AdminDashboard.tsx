import React, { useEffect, useMemo, useState } from "react";
import { Card, Table, Badge } from "flowbite-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import api from "../../utils/axios";

interface User {
  id: string;
  username: string;
  role?: string;
  status?: string;
  created_at?: string;
}

const COLORS = ["#6366F1", "#22C55E", "#F59E0B", "#EF4444"];

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [openCard, setOpenCard] = useState<string | null>(null);

  const toggle = (card: string) => {
    setOpenCard(prev => (prev === card ? null : card));
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("users/list/");
        setUsers(res.data || []);
      } catch (err) {
        console.error(err);
        setUsers([]);
      }
    };

    fetchUsers();
  }, []);

  const normalize = (val?: string) => val?.toLowerCase();

  const vendors = useMemo(
  () =>
    users.filter(u => {
      const role = (u.role || "").toLowerCase();
      return role.includes("vendor") || role.includes("vendedor");
    }),
  [users]
);

const clients = useMemo(
  () =>
    users.filter(u => {
      const role = (u.role || "").toLowerCase();
      return role.includes("client") || role.includes("cliente");
    }),
  [users]
);

const active = useMemo(
  () =>
    users.filter(u => {
      const status = (u.status || "").toLowerCase();
      return status.includes("active") || status.includes("activo");
    }),
  [users]
);

const inactive = useMemo(
  () =>
    users.filter(u => {
      const status = (u.status || "").toLowerCase();
      return status.includes("inactive") || status.includes("inactivo");
    }),
  [users]
);
  // ⚠️ ASEGURAR QUE SIEMPRE HAYA VALORES (evita gráficas vacías)
  const roleData = [
    { name: "Vendedores", value: vendors.length || 0 },
    { name: "Clientes", value: clients.length || 0 }
  ];

  const statusData = [
    { name: "Activos", value: active.length || 0 },
    { name: "Inactivos", value: inactive.length || 0 }
  ];

  const renderDetails = (data: User[]) => (
    <div className="mt-4 max-h-60 overflow-auto">
      {data.length === 0 ? (
        <p className="text-gray-400">Sin datos</p>
      ) : (
        data.map(u => (
          <div key={u.id} className="flex justify-between border-b py-2">
            <span>{u.username}</span>
            <span className="text-xs text-gray-400">{u.role}</span>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-8 bg-gray-50 dark:bg-slate-900 min-h-screen">

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { key: "users", label: "Usuarios", data: users },
          { key: "vendors", label: "Vendedores", data: vendors },
          { key: "clients", label: "Clientes", data: clients },
          { key: "active", label: "Activos", data: active }
        ].map(card => (
          <Card
            key={card.key}
            onClick={() => toggle(card.key)}
            className="cursor-pointer shadow-xl rounded-2xl hover:scale-105 transition"
          >
            <h5 className="text-gray-500">{card.label}</h5>
            <h2 className="text-4xl font-bold">{card.data.length}</h2>
          </Card>
        ))}
      </div>

      {/* MODAL CENTRADO */}
      {openCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-2xl w-[90%] md:w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Detalle</h3>
              <button
                onClick={() => setOpenCard(null)}
                className="text-red-500"
              >
                X
              </button>
            </div>

            {openCard === "users" && renderDetails(users)}
            {openCard === "vendors" && renderDetails(vendors)}
            {openCard === "clients" && renderDetails(clients)}
            {openCard === "active" && renderDetails(active)}
          </div>
        </div>
      )}

      {/* GRAFICAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <Card className="shadow-xl rounded-2xl">
          <h5 className="mb-4">Usuarios por Rol (%)</h5>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={roleData} dataKey="value" nameKey="name" outerRadius={80} label>
                  {roleData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="shadow-xl rounded-2xl">
          <h5 className="mb-4">Estados (%)</h5>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={80} label>
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i + 2]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>

      
      <div className="max-h-60 overflow-y-auto">
        <Card className="p-2 shadow-lg rounded-lg">
          <h5 className="mb-4">Usuarios Registrados</h5>

          <Table>
            <Table.Head>
              <Table.HeadCell>ID</Table.HeadCell>
              <Table.HeadCell>Usuario</Table.HeadCell>
              <Table.HeadCell>Rol</Table.HeadCell>
              <Table.HeadCell>Estado</Table.HeadCell>
            </Table.Head>

            <Table.Body>
              {users.map(u => (
                <Table.Row key={u.id}>
                  <Table.Cell>{u.id}</Table.Cell>
                  <Table.Cell>{u.username}</Table.Cell>

                  <Table.Cell>
                    <Badge color={normalize(u.role) === "vendor" ? "info" : "purple"}>
                      {u.role || "N/A"}
                    </Badge>
                  </Table.Cell>

                  <Table.Cell>
                    <Badge color={normalize(u.status) === "active" ? "success" : "gray"}>
                      {u.status || "N/A"}
                    </Badge>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card>
      </div>
    </div>
  );
}

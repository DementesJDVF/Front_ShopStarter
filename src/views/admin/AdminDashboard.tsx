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

// estilo global de cards
const cardStyle =
  "border-2 border-gray-200 dark:border-slate-700 rounded-2xl shadow-md hover:shadow-xl hover:border-indigo-400 transition-all duration-300 bg-white dark:bg-slate-800";

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [openCard, setOpenCard] = useState<string | null>(null);

  const normalize = (val?: string) =>
    (val || "").toLowerCase().trim();

  const toggle = (card: string) => {
    setOpenCard(prev => (prev === card ? null : card));
  };

  // fetch 
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("users/list/");
        setUsers(res.data?.results || res.data || []);
      } catch (err) {
        console.error(err);
        setUsers([]);
      }
    };
    fetchUsers();
  }, []);

  // filtros
  const vendors = useMemo(
    () =>
      users.filter(u =>
        normalize(u.role).includes("vendor") ||
        normalize(u.role).includes("vendedor")
      ),
    [users]
  );

  const clients = useMemo(
    () =>
      users.filter(u =>
        normalize(u.role).includes("client") ||
        normalize(u.role).includes("cliente")
      ),
    [users]
  );

  const active = useMemo(
    () =>
      users.filter(u =>
        normalize(u.status).includes("active") ||
        normalize(u.status).includes("activo")
      ),
    [users]
  );

  const inactive = useMemo(
    () =>
      users.filter(u =>
        normalize(u.status).includes("inactive") ||
        normalize(u.status).includes("inactivo")
      ),
    [users]
  );

  // datos graficas
  const roleData =
    vendors.length === 0 && clients.length === 0
      ? [{ name: "Sin datos", value: 1 }]
      : [
          { name: "Vendedores", value: vendors.length },
          { name: "Clientes", value: clients.length }
        ];

  const statusData =
    active.length === 0 && inactive.length === 0
      ? [{ name: "Sin datos", value: 1 }]
      : [
          { name: "Activos", value: active.length },
          { name: "Inactivos", value: inactive.length }
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

      {/*cards */}
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
            className={`cursor-pointer ${cardStyle} hover:scale-105`}
          >
            <h5 className="text-gray-500">{card.label}</h5>
            <h2 className="text-4xl font-bold">{card.data.length}</h2>
          </Card>
        ))}
      </div>

      {/*modal */}
      {openCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-2xl w-[90%] md:w-[500px] border-2 border-indigo-400">
            <div className="flex justify-between mb-4">
              <h3 className="font-bold">Detalle</h3>
              <button onClick={() => setOpenCard(null)}>✕</button>
            </div>

            {openCard === "users" && renderDetails(users)}
            {openCard === "vendors" && renderDetails(vendors)}
            {openCard === "clients" && renderDetails(clients)}
            {openCard === "active" && renderDetails(active)}
          </div>
        </div>
      )}

      {/* graficas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <Card className={cardStyle}>
          <h5 className="mb-4">Usuarios por Rol</h5>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={roleData} dataKey="value" outerRadius={80} label>
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

        <Card className={cardStyle}>
          <h5 className="mb-4">Estados</h5>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={statusData} dataKey="value" outerRadius={80} label>
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

      {/*tabla */}
      <div className="max-h-[60vh] overflow-y-auto overflow-x-auto border-2 border-gray-200 dark:border-slate-700 rounded-2xl p-2">

        <Card className={`p-2 ${cardStyle}`}>
          <h5 className="mb-2 text-sm">Usuarios Registrados</h5>

          <Table
            hoverable
            striped
            className="w-full text-sm border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden"
          >

            <Table.Head className="bg-gray-100 dark:bg-slate-800">
              <Table.HeadCell>ID</Table.HeadCell>
              <Table.HeadCell>Usuario</Table.HeadCell>
              <Table.HeadCell>Rol</Table.HeadCell>
              <Table.HeadCell>Estado</Table.HeadCell>
            </Table.Head>

            <Table.Body>
              {users.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={4} className="text-center">
                    Sin datos
                  </Table.Cell>
                </Table.Row>
              ) : (
                users.map(u => (
                  <Table.Row
                    key={u.id}
                    className="border-b border-gray-200 dark:border-slate-700"
                  >
                    <Table.Cell>{u.id}</Table.Cell>
                    <Table.Cell>{u.username}</Table.Cell>

                    <Table.Cell>
                      <Badge
                        color={
                          normalize(u.role).includes("vendor") ||
                          normalize(u.role).includes("vendedor")
                            ? "info"
                            : "purple"
                        }
                      >
                        {u.role || "N/A"}
                      </Badge>
                    </Table.Cell>

                    <Table.Cell>
                      <Badge
                        color={
                          normalize(u.status).includes("active") ||
                          normalize(u.status).includes("activo")
                            ? "success"
                            : "gray"
                        }
                      >
                        {u.status || "N/A"}
                      </Badge>
                    </Table.Cell>

                  </Table.Row>
                ))
              )}
            </Table.Body>

          </Table>
        </Card>
      </div>

    </div>
  );
}
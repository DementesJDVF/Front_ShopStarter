import React, { useEffect, useMemo, useState } from "react";
import { Card, Table, Badge } from "flowbite-react";
import { useTranslation } from "react-i18next";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

import {
  Users,
  UserCheck,
  UserPlus,
  ShieldCheck
} from "lucide-react";

import api from "../../utils/axios";

interface User {
  id: string;
  username: string;
  role?: string;
  status?: string;
  created_at?: string;
}

const COLORS = [
  "#06B6D4",
  "#8B5CF6",
  "#3B82F6",
  "#22C55E"
];

export default function AdminDashboard() {
  const { t, } = useTranslation("admin");

  const [users, setUsers] = useState<User[]>([]);
  const [openCard, setOpenCard] = useState<string | null>(null);

  const normalize = (val?: string) =>
    (val || "").toLowerCase().trim();

  const toggle = (card: string) => {
    setOpenCard(prev =>
      prev === card ? null : card
    );
  };

  // fecth user
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("users/list/");

        setUsers(
          res.data?.results ||
            res.data ||
            []
        );
      } catch (err) {
        console.error(err);
        setUsers([]);
      }
    };

    fetchUsers();
  }, []);

  // filtros info
  const vendors = useMemo(
    () =>
      users.filter(
        u =>
          normalize(u.role).includes(
            "vendor"
          ) ||
          normalize(u.role).includes(
            "vendedor"
          )
      ),
    [users]
  );

  const clients = useMemo(
    () =>
      users.filter(
        u =>
          normalize(u.role).includes(
            "client"
          ) ||
          normalize(u.role).includes(
            "cliente"
          )
      ),
    [users]
  );

  const active = useMemo(
    () =>
      users.filter(
        u =>
          normalize(u.status).includes(
            "active"
          ) ||
          normalize(u.status).includes(
            "activo"
          )
      ),
    [users]
  );

  const inactive = useMemo(
    () =>
      users.filter(
        u =>
          normalize(u.status).includes(
            "inactive"
          ) ||
          normalize(u.status).includes(
            "inactivo"
          )
      ),
    [users]
  );

  //datos
  const roleData =
    vendors.length === 0 &&
    clients.length === 0
      ? [
          {
            name: t("No data"),
            value: 1
          }
        ]
      : [
          {
            name: t("Vendors"),
            value: vendors.length
          },
          {
            name: t("Clients"),
            value: clients.length
          }
        ];

  const statusData =
    active.length === 0 &&
    inactive.length === 0
      ? [
          {
            name: t("No data"),
            value: 1
          }
        ]
      : [
          {
            name: t("Active"),
            value: active.length
          },
          {
            name: t("Inactive"),
            value: inactive.length
          }
        ];

  // detalles modal
  const renderDetails = (
    data: User[]
  ) => (
    <div className="mt-4 max-h-72 overflow-auto space-y-3">

      {data.length === 0 ? (

        <p className="text-slate-400">
          {t("No data")}
        </p>

      ) : (

        data.map(u => (

          <div
            key={u.id}
            className="
              flex
              justify-between
              items-center
              rounded-2xl
              p-4
              border
              border-slate-700
              bg-gradient-to-r
              from-slate-900
              via-blue-950
              to-indigo-950
            "
          >

            <div>

              <p className="text-white font-semibold">
                {u.username}
              </p>

              <p className="text-slate-400 text-sm">
                {u.role}
              </p>

            </div>

            <Badge
              color={
                normalize(
                  u.status
                ).includes("active")
                  ? "success"
                  : "failure"
              }
            >
              {u.status}
            </Badge>

          </div>

        ))

      )}

    </div>
  );

  return (
    <div
      className="
        min-h-screen
        p-6
        bg-gradient-to-br
        from-slate-950
        via-blue-950
        to-indigo-950
      "
    >

      {/* title */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">

        <div>

          <h1
            className="
              text-5xl
              font-black
              bg-gradient-to-r
              from-cyan-400
              via-blue-400
              to-violet-500
              bg-clip-text
              text-transparent
            "
          >
            {t("Admin Dashboard")}
          </h1>

        </div>
      </div>

      {/* estado */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        {[
          {
            key: "users",
            label: t("Users"),
            data: users,
            icon: <Users size={30} />
          },

          {
            key: "vendors",
            label: t("Vendors"),
            data: vendors,
            icon: (
              <UserCheck size={30} />
            )
          },

          {
            key: "clients",
            label: t("Clients"),
            data: clients,
            icon: (
              <UserPlus size={30} />
            )
          },

          {
            key: "active",
            label: t("Active"),
            data: active,
            icon: (
              <ShieldCheck size={30} />
            )
          }

        ].map(card => (

          <Card
            key={card.key}
            onClick={() =>
              toggle(card.key)
            }
            className="
              cursor-pointer
              rounded-3xl
              border
              border-slate-700
              bg-gradient-to-br
              from-slate-900
              via-blue-950
              to-indigo-950
              hover:scale-105
              hover:shadow-cyan-500/20
              transition-all
              duration-300
              shadow-2xl
            "
          >

            <div className="flex justify-between items-center">

              <div>

                <p className="text-slate-300">
                  {card.label}
                </p>

                <h2 className="text-5xl font-black text-white mt-2">
                  {card.data.length}
                </h2>

              </div>

              <div
                className="
                  p-4
                  rounded-2xl
                  bg-gradient-to-r
                  from-cyan-500
                  via-blue-500
                  to-violet-600
                  text-white
                  shadow-lg
                "
              >
                {card.icon}
              </div>

            </div>

          </Card>

        ))}

      </div>

      {/* modal */}
      {openCard && (

        <div
          className="
            fixed
            inset-0
            bg-black/70
            backdrop-blur-sm
            flex
            items-center
            justify-center
            z-50
          "
        >

          <div
            className="
              w-[95%]
              md:w-[600px]
              rounded-3xl
              p-6
              border
              border-slate-700
              bg-gradient-to-br
              from-slate-900
              via-blue-950
              to-indigo-950
              shadow-2xl
            "
          >

            <div className="flex justify-between items-center mb-4">

              <h3 className="text-2xl font-bold text-white">
                {t("Details")}
              </h3>

              <button
                onClick={() =>
                  setOpenCard(null)
                }
                className="
                  text-slate-400
                  hover:text-red-400
                  text-2xl
                "
              >
                ✕
              </button>

            </div>

            {openCard === "users" &&
              renderDetails(users)}

            {openCard === "vendors" &&
              renderDetails(vendors)}

            {openCard === "clients" &&
              renderDetails(clients)}

            {openCard === "active" &&
              renderDetails(active)}

          </div>

        </div>

      )}

      {/* CHARTS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">

        {/* ROLE CHART */}
        <Card
          className="
            rounded-3xl
            border
            border-slate-700
            bg-gradient-to-br
            from-slate-900
            via-blue-950
            to-indigo-950
            shadow-2xl
          "
        >

          <h5 className="text-2xl font-bold text-white mb-4">
            {t("Users by role")}
          </h5>

          <div className="h-72">

            <ResponsiveContainer>

              <PieChart>

                <Pie
                  data={roleData}
                  dataKey="value"
                  outerRadius={100}
                  label
                >

                  {roleData.map(
                    (_, i) => (

                      <Cell
                        key={i}
                        fill={
                          COLORS[
                            i %
                              COLORS.length
                          ]
                        }
                      />

                    )
                  )}

                </Pie>

                <Tooltip />
                <Legend />

              </PieChart>

            </ResponsiveContainer>

          </div>

        </Card>

        {/* starus chart */}
        <Card
          className="
            rounded-3xl
            border
            border-slate-700
            bg-gradient-to-br
            from-slate-900
            via-blue-950
            to-indigo-950
            shadow-2xl
          "
        >

          <h5 className="text-2xl font-bold text-white mb-4">
            {t("User status")}
          </h5>

          <div className="h-72">

            <ResponsiveContainer>

              <PieChart>

                <Pie
                  data={statusData}
                  dataKey="value"
                  outerRadius={100}
                  label
                >

                  {statusData.map(
                    (_, i) => (

                      <Cell
                        key={i}
                        fill={
                          COLORS[
                            i %
                              COLORS.length
                          ]
                        }
                      />

                    )
                  )}

                </Pie>

                <Tooltip />
                <Legend />

              </PieChart>

            </ResponsiveContainer>

          </div>

        </Card>

      </div>

      {/* table */}
      <div className="mt-8 overflow-x-auto">

        <Card
          className="
            p-4
            rounded-3xl
            border
            border-slate-700
            bg-gradient-to-br
            from-slate-900
            via-blue-950
            to-indigo-950
            shadow-2xl
          "
        >

          {/* header */}
          <div className="flex items-center justify-between mb-6">

            <h5 className="text-2xl font-black text-white">
              {t("Registered users")}
            </h5>

            <Badge
              className="px-3 py-1"
              color="info"
            >
              {users.length}{" "}
              {t("Users")}
            </Badge>

          </div>

          {/* table */}
          <div
            className="
              rounded-2xl
              overflow-hidden
              border
              border-slate-700
              bg-slate-900
              max-h-[400px]
              overflow-y-auto
            "
          >

            <Table
              hoverable
              className="
                bg-slate-900
                text-white
              "
            >

              {/* head */}
              <Table.Head
                className="
                  bg-gradient-to-r
                  from-blue-950
                  via-slate-900
                  to-indigo-950
                "
              >

                <Table.HeadCell className="text-cyan-300">
                  ID
                </Table.HeadCell>

                <Table.HeadCell className="text-cyan-300">
                  {t("User")}
                </Table.HeadCell>

                <Table.HeadCell className="text-cyan-300">
                  {t("Role")}
                </Table.HeadCell>

                <Table.HeadCell className="text-cyan-300">
                  {t("Status")}
                </Table.HeadCell>

              </Table.Head>

              {/* body */}
              <Table.Body
                className="
                  divide-y
                  divide-slate-700
                "
              >

                {users.length ===
                0 ? (

                  <Table.Row className="bg-slate-900">

                    <Table.Cell
                      colSpan={4}
                      className="
                        text-center
                        text-slate-300
                        py-8
                      "
                    >
                      {t("No data")}
                    </Table.Cell>

                  </Table.Row>

                ) : (

                  users.map(
                    (u, index) => (

                      <Table.Row
                        key={u.id}
                        className={`
                          transition-all
                          duration-300
                          border-b
                          border-slate-700
                          hover:bg-blue-900/40

                          ${
                            index % 2 === 0
                              ? "bg-slate-900"
                              : "bg-blue-950/60"
                          }
                        `}
                      >

                        {/* id */}
                        <Table.Cell className="text-slate-200">
                          {u.id}
                        </Table.Cell>

                        {/* user */}
                        <Table.Cell className="text-white font-semibold">
                          {u.username}
                        </Table.Cell>

                        {/* role*/}
                        <Table.Cell>

                          <Badge
                            color={
                              normalize(
                                u.role
                              ).includes(
                                "vendor"
                              ) ||
                              normalize(
                                u.role
                              ).includes(
                                "vendedor"
                              )
                                ? "info"
                                : normalize(
                                    u.role
                                  ).includes(
                                    "admin"
                                  )
                                ? "failure"
                                : "purple"
                            }
                          >
                            {u.role ||
                              "N/A"}
                          </Badge>

                        </Table.Cell>

                        {/* status */}
                        <Table.Cell>

                          <Badge
                            color={
                              normalize(
                                u.status
                              ).includes(
                                "active"
                              ) ||
                              normalize(
                                u.status
                              ).includes(
                                "activo"
                              )
                                ? "success"
                                : "failure"
                            }
                          >
                            {u.status ||
                              "N/A"}
                          </Badge>

                        </Table.Cell>

                      </Table.Row>

                    )
                  )

                )}

              </Table.Body>

            </Table>

          </div>

        </Card>

      </div>

    </div>
  );
}
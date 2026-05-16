import React, { useEffect, useState } from 'react';
import { Card, Button, Spinner } from 'flowbite-react';
import { Icon as Iconify } from '@iconify/react';
import api from '../../utils/axios';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getUserAvatar } from '../../utils/avatar';

interface Order {
  id: string;
  client_name: string;
  product_name: string;
  status: string;
  total: number;
  created_at: string;
  payment_notified: boolean;
  client_avatar?: string | null;
  product_image?: string | null;
}

const VendorOrders: React.FC = () => {
  const { t } = useTranslation('vendedor');
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [avatarMap, setAvatarMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // 1. Primero obtenemos las órdenes
      const ordersRes = await api.get('orders/');
      const ordersData = ordersRes.data.results || ordersRes.data;
      setOrders(ordersData);
      // 2. Extraer IDs de clientes únicos (evitamos duplicados)
      // Asumo que el campo es order.client o order.user_id
      const clientIds = Array.from(new Set(
        ordersData.map((o: any) => o.client).filter((id: any) => id !== undefined)
      )) as number[];
      // 3. Consultar los detalles de esos usuarios específicos en paralelo
      const userRequests = clientIds.map(id => 
        api.get(`users/listusers/${id}/`).catch(() => null)
      );
      const usersResponses = await Promise.all(userRequests);
      // 4. Construir el mapa de avatares (usando el nombre del cliente como clave para tu lógica actual)
      const map: Record<string, string> = {};
      usersResponses.forEach((res) => {
        if (res && res.data) {
          const u = res.data;
          const url = u.profile_picture?.image_url || u.avatar_url;
          // Usamos el nombre del cliente como clave para que coincida con tu agrupador
          if (url && u.username) {
            map[u.username] = url;
          }
        }
      });
      setAvatarMap(map);
    } catch (err) {
      console.error('Error cargando pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Agrupar pedidos por cliente.
  const groupedByClient = orders.reduce<Record<string, Order[]>>((acc, order) => {
    const key = order.client_name || t('orders.anonymous');
    if (!acc[key]) acc[key] = [];
    acc[key].push(order);
    return acc;
  }, {});

  const clientNames = Object.keys(groupedByClient);

  const goToClient = (clientName: string) => {
    navigate(`/vendedor/pedidos/${encodeURIComponent(clientName)}`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in font-[var(--main-font)]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-black text-indigo-900 dark:text-white tracking-tighter uppercase mb-1 italic">
            {t('orders.title')}
          </h1>
          <p className="text-black dark:text-white font-bold">{t('orders.subtitle')}</p>
        </div>
        <Button color="light" onClick={fetchOrders} disabled={loading} className="rounded-xl shadow-sm">
          <Iconify icon="solar:refresh-circle-bold-duotone" className="mr-2" height={20} /> {t('orders.refresh')}
        </Button>
      </div>

      <Card className="border-none shadow-xl rounded-3xl overflow-hidden p-2">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner size="xl" color="info" />
          </div>
        ) : clientNames.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-blue-50/50 inline-block p-6 rounded-full mb-4">
              <Iconify icon="solar:box-minimalistic-outline" height={48} className="text-blue-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-700">{t('orders.empty.title')}</h3>
            <p className="text-gray-400 mt-2">{t('orders.empty.msg')}</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-800 dark:divide-gray-200
            bg-gradient-to-br from-gray-50 via-gray-200 to-primary/5
            dark:from-dark dark:via-darkgray dark:to-dark">
            {clientNames.map((clientName) => {
              const clientOrders = groupedByClient[clientName];

              // Prioridad: 1) foto del endpoint orders/ (si llegara) 2) foto de users/list/ 3) dicebear.
              const realAvatar =
                clientOrders.find((o) => o.client_avatar)?.client_avatar ||
                avatarMap[clientName];
              const avatarUrl = realAvatar || getUserAvatar(clientName);

              return (
                <li key={clientName}>
                  <button
                    type="button"
                    onClick={() => goToClient(clientName)}
                    className="w-full flex items-center justify-between gap-4 px-4 py-4 hover:bg-gray-300
                      dark:hover:bg-indigo-50/40 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={avatarUrl}
                        alt={clientName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-primary dark:border-gray-300 shadow-sm bg-white"
                        onError={(e) => {
                          // Si la URL falla, caer al dicebear sin romper el render.
                          (e.currentTarget as HTMLImageElement).src = getUserAvatar(clientName);
                        }}
                      />
                      <div>
                        <p className="font-black text-gray-900 dark:text-gray-100">{clientName}</p>
                        <p className="text-xs text-gray-500">
                          {clientOrders.length}{' '}
                          {clientOrders.length === 1 ? 'pedido' : 'pedidos'}
                        </p>
                      </div>
                    </div>
                    <Iconify
                      icon="solar:alt-arrow-right-bold-duotone"
                      height={24}
                      className="text-indigo-500 dark:text-amber-400"
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default VendorOrders;
import React, { useEffect, useState } from 'react';
import { Card, Badge, Button, Spinner } from 'flowbite-react';
import { Icon as Iconify } from '@iconify/react';
import api from '../../utils/axios';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { getUserAvatar } from '../../utils/avatar';
import { getAbsoluteImageUrl } from '../../utils/urlHelper';

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
  product?: {
    id?: number | string;
    name?: string;
    images?: Array<{ url_image: string; is_main?: boolean }>;
  };
}

// 🆕 Helper: intenta extraer la URL de la foto de perfil desde varios formatos.
const extractAvatarUrl = (u: any): string | null => {
  if (!u) return null;
  return (
    u?.profile_picture?.image_url ||
    u?.profile_picture_url ||
    u?.profile_picture ||
    u?.avatar_url ||
    u?.avatar ||
    u?.image_url ||
    null
  );
};

const VendorOrderDetail: React.FC = () => {
  const { t } = useTranslation('vendedor');
  const navigate = useNavigate();
  const { clientName: clientNameParam } = useParams<{ clientName: string }>();
  const clientName = decodeURIComponent(clientNameParam || '');

  const [orders, setOrders] = useState<Order[]>([]);
  const [avatarMap, setAvatarMap] = useState<Record<string, string>>({});
  const [productImageMap, setProductImageMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      // Pedidos + lista usuarios + productos en paralelo.
      const [ordersRes, usersRes, productsRes] = await Promise.all([
        api.get('orders/'),
        api.get('users/list/').catch(() => ({ data: [] })),
        api.get('products/create/').catch(() => ({ data: [] })),
      ]);

      const ordersData = ordersRes.data.results ? ordersRes.data.results : ordersRes.data;
      setOrders(ordersData);

      const usersData = usersRes.data?.results ? usersRes.data.results : usersRes.data;
      console.log('🧩 users/list/ →', usersData);

      // Mapa username -> id  y  username -> avatar (primer intento desde list).
      const usernameToId: Record<string, string> = {};
      const aMap: Record<string, string> = {};
      if (Array.isArray(usersData)) {
        usersData.forEach((u: any) => {
          if (u?.username && u?.id) usernameToId[u.username] = String(u.id);
          const url = extractAvatarUrl(u);
          if (url && u?.username) aMap[u.username] = url;
        });
      }

      // Para los que aún no tienen foto, pedir el detalle por id.
      const clientNamesInOrders: string[] = Array.from(
        new Set(
          (Array.isArray(ordersData) ? ordersData : [])
            .map((o: any) => o?.client_name)
            .filter(Boolean),
        ),
      );
      const missing = clientNamesInOrders.filter((name) => !aMap[name] && usernameToId[name]);

      console.log('🧩 clientes en pedidos:', clientNamesInOrders);
      console.log('🧩 faltan foto y tienen id:', missing);

      const detailResponses = await Promise.all(
        missing.map((name) =>
          api
            .get(`users/listusers/${usernameToId[name]}/`)
            .then((r) => ({ name, data: r.data }))
            .catch((err) => {
              console.warn(`⚠️ users/listusers/${usernameToId[name]}/ falló:`, err?.response?.status);
              return null;
            }),
        ),
      );

      detailResponses.forEach((res) => {
        if (!res) return;
        const u = res.data?.results
          ? Array.isArray(res.data.results) ? res.data.results[0] : res.data.results
          : res.data;
        const url = extractAvatarUrl(u);
        console.log(`🧩 detalle de ${res.name}:`, u, '→ url:', url);
        if (url) aMap[res.name] = url;
      });

      console.log('🧩 avatarMap final:', aMap);
      setAvatarMap(aMap);

      // Mapa product_name -> imagen principal
      const productsData = productsRes.data?.results ? productsRes.data.results : productsRes.data;
      const pMap: Record<string, string> = {};
      if (Array.isArray(productsData)) {
        productsData.forEach((p: any) => {
          const main = p?.images?.find((i: any) => i?.is_main) || p?.images?.[0];
          if (main?.url_image && p?.name) {
            pMap[p.name] = getAbsoluteImageUrl(main.url_image);
          }
        });
      }
      setProductImageMap(pMap);
    } catch (err) {
      console.error('Error cargando pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAction = async (orderId: string, actionUrl: 'mark-as-paid' | 'cancel') => {
    try {
      setActionLoading(orderId);
      await api.post(`orders/${orderId}/${actionUrl}/`);
      toast.success(actionUrl === 'mark-as-paid' ? '¡Venta completada con éxito!' : 'Reserva cancelada');
      await fetchOrders();
    } catch (err) {
      console.error(`Error al ejecutar ${actionUrl}`, err);
      toast.error('No se pudo completar la acción. Intenta de nuevo.');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge color="success" className="rounded-lg px-3 py-1 font-bold">{t('orders.status.PAID')}</Badge>;
      case 'RESERVED':
        return <Badge color="warning" className="rounded-lg px-3 py-1 font-bold text-black">{t('orders.status.RESERVED')}</Badge>;
      case 'CANCELLED':
        return <Badge color="failure" className="rounded-lg px-3 py-1 font-bold">{t('orders.status.CANCELLED')}</Badge>;
      case 'PENDING':
        return <Badge color="indigo" className="rounded-lg px-3 py-1 font-bold">{t('orders.status.PENDING')}</Badge>;
      default:
        return <Badge color="gray">{status}</Badge>;
    }
  };

  const resolveProductImage = (order: Order): string | null => {
    if (order.product_image) return order.product_image;
    const nestedMain =
      order.product?.images?.find((i) => i?.is_main) || order.product?.images?.[0];
    if (nestedMain?.url_image) return getAbsoluteImageUrl(nestedMain.url_image);
    if (order.product_name && productImageMap[order.product_name]) {
      return productImageMap[order.product_name];
    }
    return null;
  };

  const clientOrders = orders.filter(
    (o) => (o.client_name || t('orders.anonymous')) === clientName,
  );
  const realAvatar =
    clientOrders.find((o) => o.client_avatar)?.client_avatar || avatarMap[clientName];
  const avatarUrl = realAvatar || getUserAvatar(clientName);

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in font-[var(--main-font)]">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <div className="flex items-center gap-4">
          <Button
            color="light"
            onClick={() => navigate('/vendedor/pedidos')}
            className="rounded-xl shadow-sm"
          >
            <Iconify icon="solar:alt-arrow-left-bold-duotone" className="mr-1" height={20} />
            Volver
          </Button>

          <img
            src={avatarUrl}
            alt={clientName}
            className="w-14 h-14 rounded-full object-cover border-2 border-indigo-100 shadow-sm bg-white"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = getUserAvatar(clientName);
            }}
          />

          <div>
            <h1 className="text-2xl md:text-3xl font-black text-indigo-900 dark:text-white tracking-tighter uppercase italic">
              {clientName}
            </h1>
            <p className="text-black dark:text-white font-bold text-sm">
              {clientOrders.length}{' '}
              {clientOrders.length === 1 ? 'pedido' : 'pedidos'}
            </p>
          </div>
        </div>

        <Button color="light" onClick={fetchOrders} disabled={loading} className="rounded-xl shadow-sm">
          <Iconify icon="solar:refresh-circle-bold-duotone" className="mr-2" height={20} />
          {t('orders.refresh')}
        </Button>
      </div>

      <Card className="border-none shadow-xl rounded-3xl overflow-hidden p-4">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner size="xl" color="info" />
          </div>
        ) : clientOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-blue-50/50 inline-block p-6 rounded-full mb-4">
              <Iconify icon="solar:box-minimalistic-outline" height={48} className="text-blue-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-700">{t('orders.empty.title')}</h3>
            <p className="text-gray-400 mt-2">{t('orders.empty.msg')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clientOrders.map((order) => {
              const productImg = resolveProductImage(order);
              return (
                <div
                  key={order.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white rounded-2xl shadow-sm p-4 border border-indigo-50"
                >
                  {productImg ? (
                    <img
                      src={productImg}
                      alt={order.product_name}
                      className="w-20 h-20 rounded-xl object-cover border border-gray-100"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center">
                      <Iconify icon="solar:box-minimalistic-bold-duotone" height={36} className="text-gray-400" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-900 truncate">{order.product_name}</p>

                    <div className="flex flex-wrap gap-1 mt-1">
                      {getStatusBadge(order.status)}
                      {order.status === 'RESERVED' && order.payment_notified && (
                        <Badge color="info" className="animate-pulse rounded-lg font-black text-[10px]">
                          {t('orders.rep_pay')}
                        </Badge>
                      )}
                    </div>

                    <p className="mt-1 font-bold text-indigo-900 dark:text-indigo-400">
                      ${Number(order.total).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    {order.status === 'RESERVED' && (
                      <>
                        <Button
                          size="xs"
                          color="success"
                          className="rounded-lg shadow-sm font-bold"
                          onClick={() => handleAction(order.id, 'mark-as-paid')}
                          disabled={actionLoading === order.id}
                        >
                          {actionLoading === order.id ? <Spinner size="xs" /> : ''}
                          {t('orders.mark')}
                        </Button>
                        <Button
                          size="xs"
                          color="failure"
                          className="rounded-lg shadow-sm font-bold"
                          onClick={() => handleAction(order.id, 'cancel')}
                          disabled={actionLoading === order.id}
                        >
                          {t('orders.cancel')}
                        </Button>
                      </>
                    )}
                    {order.status === 'PAID' && (
                      <span className="text-xs text-green-500 font-bold flex items-center gap-1">
                        <Iconify icon="solar:check-read-linear" /> {t('orders.finished')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default VendorOrderDetail;
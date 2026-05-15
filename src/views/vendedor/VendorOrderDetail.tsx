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
  // Por si el backend devuelve el objeto producto anidado:
  product?: {
    id?: number | string;
    name?: string;
    images?: Array<{ url_image: string; is_main?: boolean }>;
  };
}

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
      const ordersRes = await api.get('orders/');
      const ordersData = ordersRes.data.results || ordersRes.data;
      setOrders(ordersData);
      // 1. Extraer IDs de clientes
      const clientIds = Array.from(new Set(
        ordersData.map((o: any) => o.client).filter(Boolean)
      ));
      // 2. Extraer IDs de productos (Soporta múltiples estructuras)
      const productIds = Array.from(new Set(
        ordersData.flatMap((o: any) => {
          const ids = [];
          if (o.items) o.items.forEach((i: any) => ids.push(i.product));
          if (o.product) ids.push(typeof o.product === 'object' ? o.product.id : o.product);
          return ids;
        })
      )).filter(Boolean);
      // 3. Peticiones en paralelo con manejo de errores para productos borrados
      // ¡ESTA LÍNEA ES LA QUE FALTABA! -> Definir las constantes y esperar el resultado
      const [usersResponses, productsResponses] = await Promise.all([
        // A. Peticiones de usuarios
        Promise.all(clientIds.map(id => api.get(`users/listusers/${id}`).catch(() => null))),
        // B. Peticiones de productos con silenciador de 404
        Promise.all(productIds.map(id => 
          api.get(`products/products/${id}`, {
            validateStatus: (status) => (status >= 200 && status < 300) || status === 404 
          })
          .then((res) => {
            if (res.status === 404) {
              console.warn(`Producto ${id} detectado como borrado (404).`);
              return { data: { id, name: 'Producto no disponible', images: [], is_deleted: true } };
            }
            return res;
          })
          .catch(() => {
            return { data: { id, name: 'Error de carga', images: [], is_deleted: true } };
          })
        ))
      ]);
      // 4. Mapa de Avatares (Ahora sí encontrará usersResponses)
      const aMap: Record<string, string> = {};
      usersResponses.forEach((res: any) => {
        if (res?.data) {
          const u = res.data;
          const url = u.profile_picture?.image_url || u.avatar_url;
          if (url && u.username) aMap[u.username] = url;
        }
      });
      setAvatarMap(aMap);
      // 5. Mapa de Productos (Ahora sí encontrará productsResponses)
      const pMap: Record<string, string> = {};
      productsResponses.forEach((res: any) => {
        if (res?.data) {
          const p = res.data;
          const main = p.images?.find((i: any) => i.is_main) || p.images?.[0];
          if (main?.url_image) {
            const fullUrl = getAbsoluteImageUrl(main.url_image);
            if (p.name) pMap[p.name] = fullUrl;
            if (p.id) pMap[p.id.toString()] = fullUrl;
          } else {
            if (p.name) pMap[p.name] = ''; 
          }
        }
      });
      setProductImageMap(pMap);
    } catch (err) {
      console.error('Error cargando datos:', err);
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
    // 1. Imagen que ya venga grabada en la orden (el "snapshot")
    if (order.product_image) return getAbsoluteImageUrl(order.product_image);
    // 2. Imagen del objeto producto anidado (si el backend lo incluyó)
    const nestedMain = order.product?.images?.find((i) => i?.is_main) || order.product?.images?.[0];
    if (nestedMain?.url_image) return getAbsoluteImageUrl(nestedMain.url_image);
    // 3. Buscar en el mapa global usando el NOMBRE como llave
    if (order.product_name && productImageMap[order.product_name]) {
      return productImageMap[order.product_name];
    }
    // 4. Buscar en el mapa global usando el ID como llave (ideal si el nombre cambió)
    const productId = typeof order.product === 'object' ? order.product.id : order.product;
    if (productId && productImageMap[productId.toString()]) {
      return productImageMap[productId.toString()];
    }
    // 5. Si el producto se borró y no hay rastro, devolvemos null para mostrar el icono de caja
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
            {t('orders.back')}
          </Button>

          <img
            src={avatarUrl}
            alt={clientName}
            className="w-14 h-14 rounded-full object-cover border-2 border-primary dark:border-indigo-100 shadow-sm bg-white"
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
              {clientOrders.length === 1 ? t('orders.pedido') : t('orders.pedido')+"s"}
            </p>
          </div>
        </div>

        <Button color="light" onClick={fetchOrders} disabled={loading} className="rounded-xl shadow-sm">
          <Iconify icon="solar:refresh-circle-bold-duotone" className="mr-2" height={20} />
          {t('orders.refresh')}
        </Button>
      </div>

      <Card className="border-none shadow-xl rounded-3xl overflow-hidden p-4
        bg-gradient-to-br from-primary/10 via-lightprimary/40 to-primary/5
        dark:from-dark dark:via-darkgray dark:to-dark">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner size="xl" color="info" />
          </div>
        ) : clientOrders.length === 0 ? (
          <div className="text-center py-16 ">
            <div className="bg-blue-50/50 inline-block p-6 rounded-full mb-4">
              <Iconify icon="solar:box-minimalistic-outline" height={48} className="text-blue-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-700">{t('orders.empty.title')}</h3>
            <p className="text-gray-400 mt-2">{t('orders.empty.msg')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {clientOrders.map((order) => {
              const productImg = resolveProductImage(order);
              return (
                <div
                  key={order.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white rounded-2xl shadow-sm p-4 border-b
                    bg-gray-300 border-gray-900 dark:bg-gray-700 dark:border-gray-300"
                >
                  {/* Imagen - Tamaño fijo para que no baile */}
                  <div className="shrink-0">
                    {productImg ? (
                      <img
                        src={productImg}
                        alt={order.product_name}
                        className="w-20 h-20 rounded-xl object-cover border border-primary dark:border-gray-300 shadow-sm"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center border border-dashed border-gray-300">
                        <Iconify icon="solar:box-minimalistic-bold-duotone" height={36} className="text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Contenido - min-w-0 es vital para que el truncate funcione */}
                  <div className="flex-1 min-w-0 w-full">
                    <p className="font-black text-gray-900 dark:text-gray-200 truncate text-lg uppercase tracking-tight">
                      {order.product_name || 'Producto eliminado'}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {getStatusBadge(order.status)}
                      {!productImg && (
                        <Badge color="failure" className="rounded-lg font-black text-[10px] uppercase">
                          {t('orders.not_found')}
                        </Badge>
                      )}
                      {order.status === 'RESERVED' && order.payment_notified && (
                        <Badge color="info" className="animate-pulse rounded-lg font-black text-[10px]">
                          {t('orders.rep_pay')}
                        </Badge>
                      )}
                    </div>

                    <p className="mt-2 font-black text-indigo-600 dark:text-indigo-400 text-xl">
                      ${Number(order.total).toLocaleString()}
                    </p>
                  </div>

                  {/* Botones - Ajuste responsivo para que no choquen */}
                  <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
                    {order.status === 'RESERVED' && (
                      <>
                        <Button
                          size="xs"
                          color="success"
                          className="rounded-xl shadow-sm font-bold flex-1 sm:flex-none"
                          onClick={() => handleAction(order.id, 'mark-as-paid')}
                          disabled={actionLoading === order.id}
                        >
                          {actionLoading === order.id ? <Spinner size="xs" /> : <Iconify icon="solar:check-circle-bold" className="mr-1" />}
                          {t('orders.mark')}
                        </Button>
                        <Button
                          size="xs"
                          color="failure"
                          className="rounded-xl shadow-sm font-bold flex-1 sm:flex-none"
                          onClick={() => handleAction(order.id, 'cancel')}
                          disabled={actionLoading === order.id}
                        >
                          <Iconify icon="solar:close-circle-bold" className="mr-1" />
                          {t('orders.cancel')}
                        </Button>
                      </>
                    )}
                    {order.status === 'PAID' && (
                      <span className="text-sm text-green-500 font-black flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
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
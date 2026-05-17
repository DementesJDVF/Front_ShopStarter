import React, { useEffect, useState } from 'react';
import { Card, Table, Badge, Button, Spinner } from 'flowbite-react';
import { Icon as Iconify } from '@iconify/react';
import api from '../../utils/axios';
import { useTranslation } from 'react-i18next';
import { useConfirm } from '../../context/ConfirmContext';
import { showSuccessAlert, showErrorAlert } from '../../utils/Alerts';

interface Order {
  id: string;
  vendor_name: string;
  product_name: string;
  status: string;
  total: number;
  created_at: string;
}

const ClientOrders: React.FC = () => {
  const { t } = useTranslation('client');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const confirm = useConfirm();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('orders/');
      const data = res.data.results ? res.data.results : res.data;
      setOrders(data);
    } catch (err) {
      console.error("Error cargando mis reservas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Refresco automático para ver si el vendedor aceptó el pago
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleNotifyPayment = async (orderId: string) => {
    try {
      setActionLoading(orderId);
      await api.post(`orders/${orderId}/notify-payment/`);
      showSuccessAlert("Notificación de pago enviada al vendedor");
      await fetchOrders();
    } catch (err) {
      showErrorAlert("Error al notificar pago");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (orderId: string) => {
    const confirmed = await confirm("¿Seguro que quieres cancelar esta reserva? El producto volverá al catálogo.", { isDestructive: true });
    if (!confirmed) return;
    try {
      setActionLoading(orderId);
      await api.post(`orders/${orderId}/cancel/`);
      showSuccessAlert("Reserva liberada");
      await fetchOrders();
    } catch (err) {
      showErrorAlert("Error al cancelar");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge color="success" className="rounded-lg px-3 py-1 font-bold">{t("reservas.s.COMPLETED")}</Badge>;
      case 'RESERVED':
        return <Badge color="warning" className="rounded-lg px-3 py-1 font-bold text-black">{t("reservas.s.RESERVED")}</Badge>;
      case 'CANCELLED':
        return <Badge color="failure" className="rounded-lg px-3 py-1 font-bold">{t("reservas.s.CANCELLED")}</Badge>;
      default:
        return <Badge color="gray">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in font-[var(--main-font)]">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-indigo-900 dark:text-white tracking-tighter uppercase mb-1 italic">{t("reservas.title")}</h1>
        <p className="text-black dark:text-white font-bold">{t("reservas.description")}</p>
      </div>

      {loading && orders.length === 0 ? (
        <div className="flex justify-center items-center py-20 bg-white dark:bg-white/5 rounded-3xl shadow-xl">
          <Spinner size="xl" color="info" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-white/5 rounded-3xl shadow-xl border border-gray-50 dark:border-white/5">
          <Iconify icon="solar:cart-large-minimalistic-linear" height={80} className="mx-auto text-gray-200 dark:text-white/20 mb-4" />
          <h3 className="text-xl font-bold text-gray-400 dark:text-gray-500 uppercase">{t("reservas.no_res")}</h3>
        </div>
      ) : (
        <>
          {/* 🖥️ Vista Desktop (Tabla) */}
          <div className="hidden md:block">
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden p-2">
              <div className="overflow-x-auto">
                <Table hoverable>
                  <Table.Head className="bg-gray-200 dark:bg-gray-50/50 border-gray-100">
                    <Table.HeadCell className="py-4 dark:text-black">{t("reservas.product")}</Table.HeadCell>
                    <Table.HeadCell className="py-4 dark:text-black">{t("reservas.vendor")}</Table.HeadCell>
                    <Table.HeadCell className="py-4 dark:text-black">{t("reservas.status")}</Table.HeadCell>
                    <Table.HeadCell className="py-4 dark:text-black">Total</Table.HeadCell>
                    <Table.HeadCell className="text-center py-4 dark:text-black">{t("reservas.actions")}</Table.HeadCell>
                  </Table.Head>
                  <Table.Body>
                    {orders.map((order) => (
                      <Table.Row key={order.id} className="bg-white hover:bg-indigo-50/30 transition-colors">
                        <Table.Cell className="font-black text-gray-900 dark:text-gray-100 py-5">{order.product_name}</Table.Cell>
                        <Table.Cell className="font-medium text-gray-700 dark:text-gray-300">{order.vendor_name}</Table.Cell>
                        <Table.Cell>{getStatusBadge(order.status)}</Table.Cell>
                        <Table.Cell className="font-bold text-indigo-900 dark:text-indigo-400">${Number(order.total).toLocaleString()}</Table.Cell>
                        <Table.Cell className="flex justify-center gap-2">
                          {order.status === 'RESERVED' && (
                            <>
                              <Button 
                                size="sm" 
                                color="success" 
                                className="rounded-xl shadow-lg font-black italic tracking-tighter"
                                onClick={() => handleNotifyPayment(order.id)}
                                disabled={actionLoading === order.id}
                              >
                                {actionLoading === order.id ? <Spinner size="xs" /> : <Iconify icon="solar:dollar-minimalistic-bold" className="mr-1" />}
                                {t("reservas.alr_paid")}
                              </Button>
                              <Button 
                                size="sm" 
                                color="failure" 
                                outline
                                className="rounded-xl"
                                onClick={() => handleCancel(order.id)}
                                disabled={actionLoading === order.id}
                              >
                                {t("reservas.discard")}
                              </Button>
                            </>
                          )}
                          {order.status === 'PAID' && (
                            <Badge color="success" className="px-4 py-2 rounded-full font-black">{t("reservas.ship")}</Badge>
                          )}
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            </Card>
          </div>

          {/* 📱 Vista Móvil (Tarjetas Premium) */}
          <div className="block md:hidden space-y-4">
            {orders.map((order) => (
              <div 
                key={order.id} 
                className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/10 rounded-3xl p-5 shadow-xl transition-all duration-300 relative overflow-hidden"
              >
                {/* Aura de fondo sutil según el estado */}
                {order.status === 'RESERVED' && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/5 rounded-full blur-2xl -mr-6 -mt-6"></div>
                )}
                {order.status === 'PAID' && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-green-400/5 rounded-full blur-2xl -mr-6 -mt-6"></div>
                )}
                {order.status === 'CANCELLED' && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-400/5 rounded-full blur-2xl -mr-6 -mt-6"></div>
                )}

                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 pr-2">
                    <span className="text-xs uppercase font-black text-gray-400 dark:text-gray-500 tracking-wider block mb-0.5">
                      {t("reservas.product")}
                    </span>
                    <h3 className="text-lg font-black text-indigo-900 dark:text-white tracking-tight uppercase leading-snug">
                      {order.product_name}
                    </h3>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-gray-100 dark:border-white/10 mb-4">
                  <div>
                    <span className="text-xs font-black text-gray-400 dark:text-gray-500 tracking-wider block mb-1">
                      {t("reservas.vendor")}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Iconify icon="solar:shop-bold-duotone" className="text-indigo-600 dark:text-indigo-400 w-4 h-4" />
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        {order.vendor_name}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-black text-gray-400 dark:text-gray-500 tracking-wider block mb-1">
                      Total
                    </span>
                    <span className="text-base font-black text-indigo-950 dark:text-indigo-400">
                      ${Number(order.total).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Acciones para móvil */}
                <div className="flex flex-col gap-2">
                  {order.status === 'RESERVED' && (
                    <div className="flex gap-2 w-full">
                      <Button 
                        color="success" 
                        className="flex-1 rounded-2xl shadow-lg font-black italic tracking-tighter py-1"
                        onClick={() => handleNotifyPayment(order.id)}
                        disabled={actionLoading === order.id}
                      >
                        {actionLoading === order.id ? (
                          <Spinner size="xs" />
                        ) : (
                          <Iconify icon="solar:dollar-minimalistic-bold" className="mr-1.5 w-4 h-4" />
                        )}
                        {t("reservas.alr_paid")}
                      </Button>
                      <Button 
                        color="failure" 
                        outline
                        className="flex-1 rounded-2xl font-bold py-1"
                        onClick={() => handleCancel(order.id)}
                        disabled={actionLoading === order.id}
                      >
                        {t("reservas.discard")}
                      </Button>
                    </div>
                  )}
                  {order.status === 'PAID' && (
                    <div className="flex items-center justify-center gap-2 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 py-3 px-4 rounded-2xl font-black text-sm border border-green-100 dark:border-green-900/30 uppercase tracking-wider">
                      <Iconify icon="solar:verified-check-bold" className="w-5 h-5 text-green-500" />
                      {t("reservas.ship")}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <div className="mt-6 p-4 bg-yellow-50 rounded-2xl border border-yellow-100 flex gap-4 items-center">
        <Iconify icon="solar:info-circle-bold" className="text-yellow-500" height={32} />
        <p className="text-sm text-yellow-800 font-medium">
          <b>{t("reservas.advise1")}:</b> {t("reservas.advise2")}
        </p>
      </div>
    </div>
  );
};

export default ClientOrders;

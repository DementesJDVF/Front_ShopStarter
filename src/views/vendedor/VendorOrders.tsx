import React, { useEffect, useState } from 'react';
import { Card, Table, Badge, Button, Spinner } from 'flowbite-react';
import { Icon as Iconify } from '@iconify/react';
import api from '../../utils/axios';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  client_name: string;
  product_name: string;
  status: string;
  total: number;
  created_at: string;
}

const VendorOrders: React.FC = () => {
  const { t } = useTranslation('vendedor');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('orders/');
      const data = res.data.results ? res.data.results : res.data;
      setOrders(data);
    } catch (err) {
      console.error("Error cargando pedidos:", err);
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
      toast.success(actionUrl === 'mark-as-paid' ? "¡Venta completada con éxito!" : "Reserva cancelada");
      await fetchOrders();
    } catch (err) {
      console.error(`Error al ejecutar ${actionUrl}`, err);
      toast.error("No se pudo completar la acción. Intenta de nuevo.");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge color="success" className="rounded-lg px-3 py-1 font-bold">VENDIDO</Badge>;
      case 'RESERVED':
        return <Badge color="warning" className="rounded-lg px-3 py-1 font-bold">RESERVADO</Badge>;
      case 'CANCELLED':
        return <Badge color="failure" className="rounded-lg px-3 py-1 font-bold">CANCELADO</Badge>;
      case 'PENDING':
        return <Badge color="indigo" className="rounded-lg px-3 py-1 font-bold">PENDIENTE</Badge>;
      default:
        return <Badge color="gray">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in font-[var(--main-font)]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-black text-indigo-900 tracking-tighter uppercase mb-1">
            {t('orders.title')}
          </h1>
          <p className="text-gray-500 font-medium">{t('orders.subtitle')}</p>
        </div>
        <Button color="light" onClick={fetchOrders} disabled={loading} className="rounded-xl shadow-sm">
          <Iconify icon="solar:refresh-circle-bold-duotone" className="mr-2" height={20} /> {t('orders.refresh')}
        </Button>
      </div>

      <Card className="border-none shadow-xl rounded-3xl overflow-hidden p-2">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Spinner size="xl" color="info" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-blue-50/50 inline-block p-6 rounded-full mb-4">
                <Iconify icon="solar:box-minimalistic-outline" height={48} className="text-blue-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-700">{t('orders.empty.title')}</h3>
              <p className="text-gray-400 mt-2">{t('orders.empty.msg')}</p>
            </div>
          ) : (
            <Table hoverable>
              <Table.Head className="bg-gray-50/50 border-b border-gray-100">
                <Table.HeadCell className="py-4">Producto</Table.HeadCell>
                <Table.HeadCell>Cliente</Table.HeadCell>
                <Table.HeadCell>Estado</Table.HeadCell>
                <Table.HeadCell>Total</Table.HeadCell>
                <Table.HeadCell className="text-center">Acciones Reales</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <Table.Row key={order.id} className="bg-white hover:bg-indigo-50/30 transition-colors">
                    <Table.Cell className="font-black text-gray-900 py-5">{order.product_name}</Table.Cell>
                    <Table.Cell className="font-medium text-gray-500">{order.client_name}</Table.Cell>
                    <Table.Cell>{getStatusBadge(order.status)}</Table.Cell>
                    <Table.Cell className="font-bold text-indigo-600">${Number(order.total).toLocaleString()}</Table.Cell>
                    <Table.Cell className="flex justify-center gap-2">
                      {order.status === 'RESERVED' && (
                        <>
                          <Button 
                            size="xs" 
                            color="success" 
                            className="rounded-lg shadow-sm font-bold"
                            onClick={() => handleAction(order.id, 'mark-as-paid')}
                            disabled={actionLoading === order.id}
                          >
                            {actionLoading === order.id ? <Spinner size="xs" /> : "Marcar PAGADO"}
                          </Button>
                          <Button 
                            size="xs" 
                            color="failure" 
                            className="rounded-lg shadow-sm font-bold"
                            onClick={() => handleAction(order.id, 'cancel')}
                            disabled={actionLoading === order.id}
                          >
                            Cancelar
                          </Button>
                        </>
                      )}
                      {order.status === 'PAID' && (
                        <span className="text-xs text-green-500 font-bold flex items-center gap-1">
                          <Iconify icon="solar:check-read-linear" /> Venta Finalizada
                        </span>
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </div>
      </Card>
    </div>
  );
};

export default VendorOrders;
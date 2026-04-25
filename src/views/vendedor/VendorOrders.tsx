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
      // Manejar la posible respuesta paginada o lista directa
      const data = res.data.results ? res.data.results : res.data;
      setOrders(data);
    } catch (err) {
      console.error("Error cargando pedidos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadOrders = async () => {
      try {
        if (isMounted) setLoading(true);
        const res = await api.get('orders/');
        const data = res.data.results ? res.data.results : res.data;
        if (isMounted) setOrders(data);
      } catch (err) {
        console.error("Error cargando pedidos:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadOrders();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAction = async (orderId: string, actionUrl: 'complete' | 'cancel') => {
    try {
      setActionLoading(orderId);
      await api.post(`orders/${orderId}/${actionUrl}/`);
      // Refrescar órdenes tras estado exitoso
      await fetchOrders();
    } catch (err) {
      console.error(`Error al ejecutar ${actionUrl}`, err);
      const actionLabel = actionUrl === 'complete' ? t('orders.actionLabel.complete') : t('orders.actionLabel.cancel');
      toast.error(t('orders.alert.problems', { action: actionLabel }));
    } finally {
      setActionLoading(null);
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
            <Table hoverable className="text-center w-full">
              <Table.Head className="bg-gray-50 dark:bg-darkgray">
                <Table.HeadCell className="py-4">{t('orders.table.client')}</Table.HeadCell>
                <Table.HeadCell>{t('orders.table.product')}</Table.HeadCell>
                <Table.HeadCell>{t('orders.table.created')}</Table.HeadCell>
                <Table.HeadCell>{t('orders.table.total')}</Table.HeadCell>
                <Table.HeadCell>{t('orders.table.status')}</Table.HeadCell>
                <Table.HeadCell>{t('orders.table.actions')}</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {orders.map((order) => (
                  <Table.Row key={order.id} className="bg-white dark:bg-darkgray hover:bg-gray-50/50 transition">
                    <Table.Cell className="font-bold text-gray-900 dark:text-white capitalize">
                      {order.client_name || t('orders.anonymous')}
                    </Table.Cell>
                    <Table.Cell className="text-indigo-900 dark:text-indigo-400 font-semibold truncate max-w-[200px]" title={order.product_name}>
                      {order.product_name}
                    </Table.Cell>
                    <Table.Cell className="text-xs text-gray-500 font-medium">
                      {new Date(order.created_at).toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell className="font-black text-green-600">
                      ${parseFloat(order.total.toString()).toLocaleString()}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge 
                        color={
                          order.status === 'PENDING' ? 'warning' :
                          order.status === 'COMPLETED' ? 'success' : 'failure'
                        }
                        className="inline-flex w-24 justify-center"
                      >
                        {order.status === 'PENDING' ? `${t('orders.status.pending')}` :
                         order.status === 'COMPLETED' ? `${t('orders.status.completed')}` : `${t('orders.status.cancelled')}`}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      {order.status === 'PENDING' ? (
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            size="xs" 
                            color="success" 
                            className="rounded-lg font-bold"
                            disabled={actionLoading === order.id}
                            onClick={() => handleAction(order.id, 'complete')}
                          >
                            <Iconify icon="solar:check-circle-bold" className="mr-1" />
                            {t('orders.action.delivered')}
                          </Button>
                          <Button 
                            size="xs" 
                            color="failure" 
                            className="rounded-lg font-bold"
                            disabled={actionLoading === order.id}
                            onClick={() => handleAction(order.id, 'cancel')}
                          >
                            <Iconify icon="solar:close-circle-bold" className="mr-1" />
                            {t('orders.action.failed')}
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 font-bold tracking-widest break-words overflow-hidden text-ellipsis whitespace-nowrap pl-4">{order.id.split('-')[0]}</span>
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
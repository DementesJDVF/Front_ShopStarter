import React, { useEffect, useState } from 'react';
import { Card, Table, Badge, Button, Spinner } from 'flowbite-react';
import { Icon as Iconify } from '@iconify/react';
import api from '../../utils/axios';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

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
      toast.success("Notificación de pago enviada al vendedor");
      await fetchOrders();
    } catch (err) {
      toast.error("Error al notificar pago");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (orderId: string) => {
    if (!window.confirm("¿Seguro que quieres cancelar esta reserva? El producto volverá al catálogo.")) return;
    try {
      setActionLoading(orderId);
      await api.post(`orders/${orderId}/cancel/`);
      toast.success("Reserva liberada");
      await fetchOrders();
    } catch (err) {
      toast.error("Error al cancelar");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge color="success" className="rounded-lg px-3 py-1 font-bold">COMPRADO</Badge>;
      case 'RESERVED':
        return <Badge color="warning" className="rounded-lg px-3 py-1 font-bold text-black">RESERVADO</Badge>;
      case 'CANCELLED':
        return <Badge color="failure" className="rounded-lg px-3 py-1 font-bold">CANCELADO</Badge>;
      default:
        return <Badge color="gray">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in font-[var(--main-font)]">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-indigo-900 tracking-tighter uppercase mb-2 italic">Mis Reservas</h1>
        <p className="text-gray-500 font-medium">Gestiona tus productos apartados y notifica tus pagos en tiempo real.</p>
      </div>

      <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden p-2 bg-white/80 backdrop-blur-md">
        <div className="overflow-x-auto">
          {loading && orders.length === 0 ? (
            <div className="flex justify-center items-center py-20">
              <Spinner size="xl" color="info" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20">
               <Iconify icon="solar:cart-large-minimalistic-linear" height={80} className="mx-auto text-gray-200 mb-4" />
               <h3 className="text-xl font-bold text-gray-400 uppercase">No tienes reservas activas</h3>
            </div>
          ) : (
            <Table hoverable>
              <Table.Head className="bg-indigo-50/50">
                <Table.HeadCell className="py-5">Producto</Table.HeadCell>
                <Table.HeadCell>Vendedor</Table.HeadCell>
                <Table.HeadCell>Estado</Table.HeadCell>
                <Table.HeadCell>Total</Table.HeadCell>
                <Table.HeadCell className="text-center">Acciones</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {orders.map((order) => (
                  <Table.Row key={order.id} className="bg-white hover:bg-indigo-50/20 transition-all">
                    <Table.Cell className="font-black text-slate-800 text-lg">{order.product_name}</Table.Cell>
                    <Table.Cell className="font-bold text-indigo-500 uppercase">{order.vendor_name}</Table.Cell>
                    <Table.Cell>{getStatusBadge(order.status)}</Table.Cell>
                    <Table.Cell className="font-black text-indigo-600 text-xl">${Number(order.total).toLocaleString()}</Table.Cell>
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
                            YA PAGUÉ
                          </Button>
                          <Button 
                            size="sm" 
                            color="gray" 
                            outline
                            className="rounded-xl"
                            onClick={() => handleCancel(order.id)}
                            disabled={actionLoading === order.id}
                          >
                            LIBERAR
                          </Button>
                        </>
                      )}
                      {order.status === 'PAID' && (
                         <Badge color="success" className="px-4 py-2 rounded-full font-black">ENTREGA PENDIENTE</Badge>
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </div>
      </Card>
      <div className="mt-6 p-4 bg-yellow-50 rounded-2xl border border-yellow-100 flex gap-4 items-center">
         <Iconify icon="solar:info-circle-bold" className="text-yellow-500" height={32} />
         <p className="text-sm text-yellow-800 font-medium">
           <b>Importante:</b> Al presionar "YA PAGUÉ", el vendedor recibirá una alerta inmediata para validar tu pago y entregarte el producto.
         </p>
      </div>
    </div>
  );
};

export default ClientOrders;

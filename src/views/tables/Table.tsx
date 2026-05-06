import React, { useEffect, useState } from 'react';
import CardBox from '../../components/shared/CardBox';
import { Table as FlowTable, Badge, Button, Spinner } from "flowbite-react";
import api from "../../utils/axios";
import { useTranslation } from "react-i18next";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
}

interface Order {
  id: string;
  client_name: string;
  status: string;
  total: string;
  items: OrderItem[];
  created_at: string;
}

interface UserProfile {
  username: string;
  reputation_score: string;
}

const TableView = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const results = await Promise.allSettled([
          api.get('orders/'),
          api.get('users/auth/me/')
        ]);
        
        const orders = results[0].status === 'fulfilled' 
          ? results[0].value.data.results || results[0].value.data
          : [];
        const user = results[1].status === 'fulfilled' 
          ? results[1].value.data
          : null;
          
        if (mounted) {
          setOrders(orders);
          setUserProfile(user);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error al cargar datos del vendedor:", error);
        if (mounted) setLoading(false);
      }
    };
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const handleAction = async (id: string, action: 'complete' | 'cancel') => {
    const confirmMsg = action === 'complete' ? "¿Confirmas que el cliente ya pagó y retiró el producto?" : "¿Confirmas que el cliente NO se presentó a la cita?";
    if (!window.confirm(confirmMsg)) return;

    try {
      if (action === 'complete') {
        await api.post(`orders/${id}/complete/`);
      } else {
        await api.post(`orders/${id}/cancel/`);
      }
      alert("Operación realizada con éxito. Tu reputación ha sido actualizada.");
      const results = await Promise.allSettled([
        api.get('orders/'),
        api.get('users/auth/me/')
      ]);
      
      const orders = results[0].status === 'fulfilled' 
        ? results[0].value.data.results || results[0].value.data
        : [];
      const user = results[1].status === 'fulfilled' 
        ? results[1].value.data
        : null;
        
      setOrders(orders);
      setUserProfile(user);
    } catch (error) {
      alert("Error al procesar la solicitud.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <Badge color="warning">Pendiente de Entrega</Badge>;
      case 'COMPLETED': return <Badge color="success">Venta Finalizada</Badge>;
      case 'CANCELLED': return <Badge color="failure">Cancelada / No Show</Badge>;
      default: return <Badge color="gray">{status}</Badge>;
    }
  };

  return (
    <CardBox>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 font-[var(--main-font)] gap-4">
        <div>
          <h5 className="card-title text-2xl font-bold text-primary">Gestión de Reservas (Vendedor)</h5>
          {userProfile && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-gray-500 text-sm">Tu nivel de confianza como vendedor:</span>
              <div className="flex items-center text-yellow-500 font-bold bg-yellow-50 px-2 py-0.5 rounded-full">
                <div className="w-4 h-4 mr-1">
                  <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                </div>
                {parseFloat(userProfile.reputation_score).toFixed(1)}
              </div>
            </div>
          )}
        </div>
        <Button color="light" onClick={() => {
          setLoading(true);
          Promise.allSettled([api.get('orders/'), api.get('users/auth/me/')])
            .then(([ordersRes, userRes]) => {
              const orders = ordersRes.status === 'fulfilled' 
                ? ordersRes.value.data.results || ordersRes.value.data
                : [];
              const user = userRes.status === 'fulfilled' 
                ? userRes.value.data
                : null;
              setOrders(orders);
              setUserProfile(user);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
        }}>
          <div className="w-4 h-4 mr-2">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </div>
          Actualizar Panel
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-10"><Spinner size="xl" /></div>
      ) : orders.length === 0 ? (
        <div className="text-center p-12 text-gray-500 italic bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          No tienes pedidos pendientes por entregar en este momento.
        </div>
      ) : (
        <div className="overflow-x-auto font-[var(--main-font)] shadow-sm rounded-xl">
          <FlowTable hoverable>
            <FlowTable.Head className="bg-gray-50">
              <FlowTable.HeadCell>Reserva</FlowTable.HeadCell>
              <FlowTable.HeadCell>Cliente</FlowTable.HeadCell>
              <FlowTable.HeadCell>Detalle</FlowTable.HeadCell>
              <FlowTable.HeadCell>Monto</FlowTable.HeadCell>
              <FlowTable.HeadCell>Estado</FlowTable.HeadCell>
              <FlowTable.HeadCell>Gestión</FlowTable.HeadCell>
            </FlowTable.Head>
            <FlowTable.Body className="divide-y">
              {orders.map((order) => (
                <FlowTable.Row key={order.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <FlowTable.Cell className="text-[10px] font-mono text-gray-400">#{order.id.substring(0,6)}</FlowTable.Cell>
                  <FlowTable.Cell className="font-bold text-gray-800">{order.client_name}</FlowTable.Cell>
                  <FlowTable.Cell className="max-w-xs truncate">
                    {order.items.map(item => item.product_name).join(", ")}
                  </FlowTable.Cell>
                  <FlowTable.Cell className="font-bold text-green-600">${parseFloat(order.total).toLocaleString()}</FlowTable.Cell>
                  <FlowTable.Cell>{getStatusBadge(order.status)}</FlowTable.Cell>
                  <FlowTable.Cell>
                    {order.status === 'PENDING' && (
                      <div className="flex gap-3">
                        <button className="text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded-md text-xs font-bold transition-all" onClick={() => handleAction(order.id, 'complete')}>Vendido</button>
                        <button className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md text-xs font-bold transition-all" onClick={() => handleAction(order.id, 'cancel')}>No vino</button>
                      </div>
                    )}
                  </FlowTable.Cell>
                </FlowTable.Row>
              ))}
            </FlowTable.Body>
          </FlowTable>
        </div>
      )}
    </CardBox>
  );
};

export default TableView;

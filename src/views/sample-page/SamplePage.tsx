import React, { useEffect, useState } from 'react';
import CardBox from '../../components/shared/CardBox';
import { Table, Badge, Button, Spinner } from "flowbite-react";
import api from "../../utils/axios";
import { useTranslation } from "react-i18next";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price_at_purchase: string;
}

interface Order {
  id: string;
  vendor_name: string;
  status: string;
  total: string;
  items: OrderItem[];
  created_at: string;
}

interface UserProfile {
  username: string;
  reputation_score: string;
}

const SamplePage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation("samplePage");

  const fetchData = async () => {
    try {
      setLoading(true);
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
    } catch (err) {
      // error handled in UI
    } finally {
      setLoading(false);
    }
  };

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
      } catch (err) {
        if (mounted) setLoading(false);
      }
    };
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const handleCancel = async (id: string) => {
    if (!window.confirm(t("confirmCancel"))) return;
    try {
      await api.post(`orders/${id}/cancel/`);
      alert(t("cancelSuccess"));
      fetchData();
    } catch (error) {
      alert(t("cancelError"));
    }
  };

  const handleReport = async (id: string) => {
    if (!window.confirm(t("confirmReport"))) return;
    try {
      await api.post(`orders/${id}/report_vendor/`);
      alert(t("reportSent"));
      fetchData();
    } catch (error) {
      alert(t("reportError"));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <Badge color="warning">{t("status.PENDING")}</Badge>;
      case 'COMPLETED': return <Badge color="success">{t("status.COMPLETED")}</Badge>;
      case 'CANCELLED': return <Badge color="failure">{t("status.CANCELLED")}</Badge>;
      default: return <Badge color="gray">{status}</Badge>;
    }
  };

  return (
    <CardBox>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 font-[var(--main-font)] gap-4">
        <div>
          <h5 className="card-title text-2xl font-bold text-primary">{t("myBookings")}</h5>
          {userProfile && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-gray-500 text-sm">{t("yourReputation")}</span>
              <div className="flex items-center text-yellow-500 font-bold">
                <div className="w-4 h-4 mr-1">
                  <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                </div>
                {parseFloat(userProfile.reputation_score).toFixed(1)}
              </div>
            </div>
          )}
        </div>
        <Button color="light" onClick={fetchData}>
          <div className="w-4 h-4 mr-2">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </div>
          {t("update")}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-10"><Spinner size="xl" /></div>
      ) : orders.length === 0 ? (
        <div className="text-center p-10 text-gray-500 italic bg-gray-50 rounded-xl">{t("noBookings")}</div>
      ) : (
        <div className="overflow-x-auto font-[var(--main-font)]">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>{t("table.date")}</Table.HeadCell>
              <Table.HeadCell>{t("table.product")}</Table.HeadCell>
              <Table.HeadCell>{t("table.vendor")}</Table.HeadCell>
              <Table.HeadCell>{t("table.amount")}</Table.HeadCell>
              <Table.HeadCell>{t("table.status")}</Table.HeadCell>
              <Table.HeadCell>{t("table.actions")}</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {orders.map((order) => (
                <Table.Row key={order.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {new Date(order.created_at).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>
                    {order.items.map(item => item.product_name).join(", ")}
                  </Table.Cell>
                  <Table.Cell>{order.vendor_name}</Table.Cell>
                  <Table.Cell className="font-bold text-primary">${parseFloat(order.total).toLocaleString()}</Table.Cell>
                  <Table.Cell>{getStatusBadge(order.status)}</Table.Cell>
                  <Table.Cell>
                    {order.status === 'PENDING' && (
                      <div className="flex gap-4">
                        <button 
                          className="text-red-500 hover:text-red-700 font-bold text-sm"
                          onClick={() => handleCancel(order.id)}
                        >
                          {t("cancel")}
                        </button>
                        <button 
                          className="text-orange-600 hover:text-orange-800 font-bold text-sm border-l pl-4"
                          onClick={() => handleReport(order.id)}
                        >
                          {t("report")}
                        </button>
                      </div>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      )}
    </CardBox>
  );
};

export default SamplePage;

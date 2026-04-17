import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import api from '../../utils/axios';

interface AIHistoryEvent {
  id: number;
  product_name: string;
  buyer: string;
  user_query: string;
  ai_reasoning: string;
  created_at: string;
}

const AIRecommendationsHistory: React.FC = () => {
  const [history, setHistory] = useState<AIHistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('chat/history/');
        setHistory(response.data);
      } catch (error) {
        console.error('Error fetching AI history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="bg-white dark:bg-darkgray p-6 rounded-2xl shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
          <Icon icon="solar:smart-home-line-duotone" width={28} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Auditoría de IA</h2>
          <p className="text-gray-500 text-sm">Historial de tus productos recomendados por el Asistente Inteligente.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center p-12 py-20 bg-gray-50 dark:bg-dark rounded-2xl border border-dashed border-gray-200">
          <Icon icon="solar:ghost-bold-duotone" width={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-bold text-gray-600 dark:text-gray-300">¡Aún no hay recomendaciones!</h3>
          <p className="text-gray-500">Pronto la IA empezará a ofrecer tus productos a los clientes interesados.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-dark text-gray-600 dark:text-gray-400 text-sm border-b border-gray-100 dark:border-gray-800">
                <th className="p-4 font-semibold rounded-tl-xl">Fecha</th>
                <th className="p-4 font-semibold">Producto Sugerido</th>
                <th className="p-4 font-semibold">Cliente Buscaba...</th>
                <th className="p-4 font-semibold rounded-tr-xl">Razonamiento IA</th>
              </tr>
            </thead>
            <tbody>
              {history.map((event) => (
                <tr key={event.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-dark/50 transition-colors">
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(event.created_at).toLocaleDateString()} <br/>
                    <span className="text-xs">{new Date(event.created_at).toLocaleTimeString()}</span>
                  </td>
                  <td className="p-4 font-bold text-gray-800 dark:text-white">
                    {event.product_name}
                  </td>
                  <td className="p-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs">
                    <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-lg inline-block break-words w-full">
                      "{event.user_query}"
                    </div>
                  </td>
                  <td className="p-4 text-xs text-gray-500 max-w-sm truncate whitespace-pre-line" title={event.ai_reasoning}>
                    {event.ai_reasoning}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AIRecommendationsHistory;

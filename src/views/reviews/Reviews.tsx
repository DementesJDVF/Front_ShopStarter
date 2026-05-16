import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { getVendorReviews, Review, ReviewsData } from '../../services/reviewsService';
import api from '../../utils/axios';
import { Spinner } from 'flowbite-react';
import { getUserAvatar } from '../../utils/avatar';

const Stars: React.FC<{ value: number; size?: number }> = ({ value, size = 18 }) => {
  const full = Math.floor(value);
  const hasHalf = value - full >= 0.25 && value - full < 0.75;
  const totalFull = hasHalf ? full : Math.round(value);
  return (
    <div className="flex items-center gap-0.5 text-amber-400
      drop-shadow-[0_0_2px_rgba(0,0,0,1)] dark:drop-shadow-[0_0_2px_rgba(255,255,255,1)]">
      {Array.from({ length: 5 }).map((_, i) => {
        let icon = 'solar:star-line-duotone';
        if (i < totalFull) icon = 'solar:star-bold';
        else if (i === full && hasHalf) icon = 'solar:star-half-bold';
        return <Icon key={i} icon={icon} width={size} />;
      })}
    </div>
  );
};

const Reviews: React.FC = () => {
  const { t, i18n } = useTranslation('Reviews');
  const { user, loading: authLoading } = useAuth();

  const [data, setData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarMap, setAvatarMap] = useState<Record<string, string>>({});

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      const locale = i18n.language || undefined;
      return `${d.toLocaleDateString(locale)} · ${d.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } catch {
      return iso;
    }
  };

  useEffect(() => {
    if (authLoading) return;

    // Seguridad extra en cliente: solo VENDEDOR y con id válido
    if (!user || user.role !== 'VENDEDOR' || !user.id) {
      setLoading(false);
      setError(t('errorState.onlyVendors'));
      return;
    }
    let cancelled = false;
      const fetchReviews = async () => {
      // Si usas un flag de cancelación, asegúrate de tener el "let cancelled = false" 
      // en el cuerpo del useEffect, o usa una referencia.
      try {
        setLoading(true);
        setError(null);
        const result = await getVendorReviews(user.id);
        // Si manejas un flag externo (ej: del useEffect cleanup), asegúrate de que exista.
        // Si no lo usas, puedes borrar los "if (cancelled) return;"
        if (typeof cancelled !== 'undefined' && cancelled) return;
        // Filtro defensivo: si el backend incluyera datos de otros vendedores,
        // dejamos solo las reseñas que correspondan a este vendedor.
        const safe: ReviewsData = {
          average: Number(result?.average ?? 0),
          total: Number(result?.total ?? (result?.reviews?.length ?? 0)),
          reviews: Array.isArray(result?.reviews)
            ? result.reviews.filter((r: any) =>
                r?.vendor ? String(r.vendor) === String(user.id) : true
              )
            : [],
        };
        // 2. Extraer IDs de clientes únicos (CORREGIDO: Ahora usa safe.reviews)
        // También asegúrate de si tu backend devuelve "client_id" o "client" o "user_id".
        const clientIds = Array.from(new Set(
          safe.reviews.map((r: any) => r.client_id || r.client).filter(Boolean)
        )) as number[];
        // 3. Consultar los detalles de esos usuarios específicos en paralelo
        // Después (Optimizado)
        const userRequests = clientIds.map(id => 
          api.get(`users/listusers/${id}/`).catch(() => null) 
        );
        const usersResponses = await Promise.all(userRequests);
        // 4. Construir el mapa de avatares
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
        // Validaciones finales de montaje
        if (typeof cancelled !== 'undefined' && cancelled) return;
        setAvatarMap(map);
        setData(safe);
      } catch (err: any) {
        if (typeof cancelled === 'undefined' || !cancelled) {
          setError(err?.message || t('errorState.fetchError'));
        }
      } finally {
        if (typeof cancelled === 'undefined' || !cancelled) {
          setLoading(false);
        }
      }
    };
    fetchReviews();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const distribution = useMemo(() => {
    const buckets = [0, 0, 0, 0, 0]; // 1..5
    (data?.reviews ?? []).forEach((r: Review) => {
      const idx = Math.max(1, Math.min(5, Math.round(r.rating))) - 1;
      buckets[idx] += 1;
    });
    const total = buckets.reduce((a, b) => a + b, 0) || 1;
    return buckets.map((count, i) => ({
      stars: i + 1,
      count,
      percent: Math.round((count / total) * 100),
    }));
  }, [data]);

  if (error) {
    return (
      <div className="bg-white dark:bg-darkgray p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
            <Icon icon="solar:danger-triangle-bold-duotone" width={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              {t('errorState.title')}
            </h2>
            <p className="text-gray-500 text-sm">{t('errorState.subtitle')}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      </div>
    );
  }

  const reviews = data?.reviews ?? [];
  const total = data?.total ?? reviews.length;
  const average = data?.average ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {loading ? (
        /* 1. ESTADO DE CARGA: Ocupa toda la pantalla */
        <div className="flex justify-center items-center py-20 bg-gray-100 dark:bg-darkgray rounded-2xl shadow-sm">
          <Spinner size="xl" color="info" />
        </div>
      ) : reviews.length === 0 ? (
        /* 2. ESTADO VACÍO: Si no hay reseñas, muestra este bloque limpio */
        <div className="text-center py-16 bg-gray-100 dark:bg-darkgray rounded-2xl shadow-sm">
          <div className="bg-blue-50/50 inline-block p-6 rounded-full mb-4">
            <Icon icon="solar:chat-square-like-bold-duotone" height={48} className="text-blue-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">{t('empty.title')}</h3>
          <p className="text-gray-400 mt-2">{t('empty.subtitle')}</p>
        </div>
      ) : (
        /* 3. ESTADO CON DATOS: Muestra el Header del promedio Y la lista de reseñas */
        <>
          {/* Header de Promedios y Distribución */}
          <div className="bg-gray-100 dark:bg-darkgray p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                <Icon 
                  icon="solar:star-fall-2-bold-duotone"
                  className="text-amber-400 drop-shadow-[0_0_2px_rgba(0,0,0,1)] dark:drop-shadow-[0_0_2px_rgba(255,255,255,1)]" 
                  width={28} 
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {t('header.title')}
                </h2>
                <p className="text-gray-800 dark:text-gray-200 text-sm">{t('header.subtitle')}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Tarjeta de Promedio */}
              <div className="md:col-span-1 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                <span className="text-5xl font-extrabold text-gray-800 dark:text-white">
                  {average ? average.toFixed(1) : '0.0'}
                </span>
                <Stars value={average || 0} size={22} />
                <span className="mt-2 text-sm text-gray-500">
                  {total === 1
                    ? t('summary.totalOne', { count: total })
                    : t('summary.totalOther', { count: total })}
                </span>
              </div>
              {/* Barras de Distribución */}
              <div className="md:col-span-2 flex flex-col gap-2 justify-center">
                {distribution
                  .slice()
                  .reverse()
                  .map((b) => (
                    <div key={b.stars} className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 w-10">
                        {t('summary.stars', { count: b.stars })}
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden border border-gray-600 dark:border-gray-400">
                        <div className="h-full bg-amber-400" style={{ width: `${b.percent}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-10 text-right">
                        {b.count}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          {/* Bloque de la Lista de Reseñas */}
          <div className="bg-gray-100 dark:bg-darkgray p-6 rounded-2xl shadow-sm">
            <ul className="flex flex-col gap-4">
              {reviews.map((r) => {
                // Lógica de Avatar dinámico por si usas el mapa de avatares que armamos antes
                const avatarUrl = avatarMap[r.client] || getUserAvatar(r.client);
                return (
                  <li
                    key={r.id}
                    className="border border-gray-300 dark:border-gray-900 rounded-2xl p-4 bg-white dark:bg-dark hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={avatarUrl}
                          alt={r.client}
                          className="w-10 h-10 rounded-full object-cover border-2 border-primary dark:border-gray-200 shadow-sm bg-white"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = getUserAvatar(r.client);
                          }}
                        />
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-white">
                            {r.client || t('review.defaultClient')}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {formatDate(r.created_at)}
                          </p>
                        </div>
                      </div>
                      <Stars value={r.rating} />
                    </div>
                    {r.review_text ? (
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                        {r.review_text}
                      </p>
                    ) : (
                      <p className="text-sm italic text-gray-400">
                        {t('review.noComment')}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default Reviews;

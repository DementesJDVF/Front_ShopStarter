import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { getVendorReviews, Review, ReviewsData } from '../../services/reviewsService';

const Stars: React.FC<{ value: number; size?: number }> = ({ value, size = 18 }) => {
  const full = Math.floor(value);
  const hasHalf = value - full >= 0.25 && value - full < 0.75;
  const totalFull = hasHalf ? full : Math.round(value);
  return (
    <div className="flex items-center gap-0.5 text-amber-400">
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
      try {
        setLoading(true);
        setError(null);
        const result = await getVendorReviews(user.id);
        if (cancelled) return;

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
        setData(safe);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || t('errorState.fetchError'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchReviews();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, t]);

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

  if (loading || authLoading) {
    return (
      <div className="bg-white dark:bg-darkgray p-6 rounded-2xl shadow-sm flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

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
      {/* Header */}
      <div className="bg-white dark:bg-darkgray p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <Icon icon="solar:star-fall-2-bold-duotone" width={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              {t('header.title')}
            </h2>
            <p className="text-gray-500 text-sm">{t('header.subtitle')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Promedio */}
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

          {/* Distribución */}
          <div className="md:col-span-2 flex flex-col gap-2 justify-center">
            {distribution
              .slice()
              .reverse()
              .map((b) => (
                <div key={b.stars} className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 w-10">
                    {t('summary.stars', { count: b.stars })}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-400"
                      style={{ width: `${b.percent}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-10 text-right">
                    {b.count}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Lista de reseñas */}
      <div className="bg-white dark:bg-darkgray p-6 rounded-2xl shadow-sm">
        {reviews.length === 0 ? (
          <div className="text-center p-12 py-20 bg-gray-50 dark:bg-dark rounded-2xl border border-dashed border-gray-200">
            <Icon
              icon="solar:chat-square-like-bold-duotone"
              width={48}
              className="mx-auto text-gray-400 mb-4"
            />
            <h3 className="text-lg font-bold text-gray-600 dark:text-gray-300">
              {t('empty.title')}
            </h3>
            <p className="text-gray-500">{t('empty.subtitle')}</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {reviews.map((r) => (
              <li
                key={r.id}
                className="border border-gray-100 dark:border-gray-800 rounded-2xl p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold uppercase">
                      {(r.client || '?').charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white">
                        {r.client || t('review.defaultClient')}
                      </p>
                      <p className="text-xs text-gray-500">
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
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Reviews;
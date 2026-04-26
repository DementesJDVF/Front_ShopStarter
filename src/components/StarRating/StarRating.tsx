import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { getVendorReviews, submitReview, updateReview, Review } from '../../services/reviewsService';
import './StarRating.css';

interface StarRatingProps {
  vendorId: string;
  interactive: boolean;
  token?: string;
  username?: string;
}

const StarRating: React.FC<StarRatingProps> = ({ vendorId, interactive, token, username }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [average, setAverage] = useState(0);
  const [total, setTotal] = useState(0);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determinar si el usuario tiene permiso para interactuar (Los Admins son neutros)
  const canInteract = interactive && user?.role !== 'ADMIN';

  // States para crear nueva reseña
  const [showNewReviewForm, setShowNewReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newReviewText, setNewReviewText] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  // States para editar reseña
  const [isEditing, setIsEditing] = useState(false);
  const [editRating, setEditRating] = useState(0);
  const [editReviewText, setEditReviewText] = useState('');
  const [editHoverRating, setEditHoverRating] = useState(0);

  // Cargar reseñas
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        const data = await getVendorReviews(vendorId);
        setAverage(data?.average || 0);
        setTotal(data?.total || 0);
        setReviews(Array.isArray(data?.reviews) ? data.reviews : []);

        // Buscar la reseña del usuario actual
        if (username) {
          const found = (Array.isArray(data?.reviews) ? data.reviews : []).find((r) => r.client === username);
          if (found) {
            setUserReview(found);
          }
        }
      } catch (err) {
        console.error('Error cargando reseñas:', err);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [vendorId, username]);

  // Enviar nueva reseña
  const handleSubmitReview = async () => {
    if (newRating === 0) {
      setError('Por favor selecciona una puntuación');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const newReviewData = await submitReview(vendorId, newRating, newReviewText, token);
      
      // Actualizar la lista de reseñas
      const data = await getVendorReviews(vendorId);
      setAverage(data?.average || 0);
      setTotal(data?.total || 0);
      setReviews(Array.isArray(data?.reviews) ? data.reviews : []);
      
      // Actualizar reseña del usuario
      if (username) {
        const found = (Array.isArray(data?.reviews) ? data.reviews : []).find((r) => r.client === username);
        if (found) {
          setUserReview(found);
        }
      }

      // Limpiar formulario
      setNewRating(0);
      setNewReviewText('');
      setShowNewReviewForm(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Actualizar reseña existente
  const handleUpdateReview = async () => {
    if (!userReview || editRating === 0) {
      setError('Por favor selecciona una puntuación');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await updateReview(userReview.id, editRating, editReviewText, token);

      // Recargar reseñas
      const data = await getVendorReviews(vendorId);
      setAverage(data?.average || 0);
      setTotal(data?.total || 0);
      setReviews(Array.isArray(data?.reviews) ? data.reviews : []);

      // Actualizar reseña del usuario
      if (username) {
        const found = (Array.isArray(data?.reviews) ? data.reviews : []).find((r) => r.client === username);
        if (found) {
          setUserReview(found);
        }
      }

      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Entrar en modo edición
  const handleStartEdit = () => {
    if (userReview) {
      setEditRating(userReview.rating);
      setEditReviewText(userReview.review_text || '');
      setIsEditing(true);
    }
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditRating(0);
    setEditReviewText('');
    setError(null);
  };

  // Formatear fecha en español
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Renderizar estrellas (5 máximo)
  const renderStars = (rating: number, maxRating: number = 5, partial: boolean = false) => {
    const stars = [];
    for (let i = 1; i <= maxRating; i++) {
      const isFilled = i <= Math.floor(rating);
      const isPartial = partial && i === Math.ceil(rating) && rating % 1 !== 0;
      const fillPercentage = isPartial ? (rating % 1) * 100 : 0;

      stars.push(
        <span
          key={i}
          className={`star ${isFilled ? 'filled' : isPartial ? 'partial' : 'empty'}`}
          style={isPartial ? { '--fill-percentage': `${fillPercentage}%` } as React.CSSProperties : {}}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  // Renderizar estrellas interactivas (para crear reseña)
  const renderInteractiveStars = (
    rating: number,
    hover: number,
    onHover: (val: number) => void,
    onClick: (val: number) => void
  ) => {
    const stars = [];
    const displayRating = hover || rating;
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= displayRating;
      stars.push(
        <span
          key={i}
          className={`interactive-star ${isFilled ? 'filled' : 'empty'}`}
          onMouseEnter={() => onHover(i)}
          onClick={() => onClick(i)}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Cargando reseñas...</div>;
  }

  return (
    <div className="star-rating-container">
      {/* Resumen de reseñas (lectura) */}
      {!isEditing && !showNewReviewForm && (
        <div className="reviews-summary">
          <div className="average-section">
            <div className="stars-display">
              {renderStars(average, 5, true)}
            </div>
            <span className="review-count">({total} reseña{total !== 1 ? 's' : ''})</span>
          </div>
        </div>
      )}

      {/* Reseña del usuario actual */}
      {userReview && !showNewReviewForm && (
        <div className="user-review-card">
          <div className="review-header">
            <div className="user-avatar">
              {userReview.client[0].toUpperCase()}
            </div>
            <div className="review-info">
              <h4 className="username">{userReview.client}</h4>
              <p className="review-date">{formatDate(userReview.created_at)}</p>
            </div>
            {canInteract && (
              <button
                className="edit-btn"
                onClick={handleStartEdit}
                title="Editar reseña"
                disabled={submitting}
              >
                <Icon icon="solar:pen-bold" height={18} />
              </button>
            )}
          </div>
          <div className="stars-review">
            {renderStars(userReview.rating)}
          </div>
          {userReview.review_text && (
            <p className="review-text">{userReview.review_text}</p>
          )}
        </div>
      )}

      {/* Modo edición */}
      {isEditing && userReview && (
        <div className="edit-review-form">
          <h4 className="form-title">Editar tu reseña</h4>
          {error && <div className="error-message">{error}</div>}
          
          <div className="stars-interactive">
            {renderInteractiveStars(
              editRating,
              editHoverRating,
              setEditHoverRating,
              setEditRating
            )}
          </div>

          <textarea
            className="review-textarea"
            placeholder="Comparte tu experiencia (opcional)..."
            value={editReviewText}
            onChange={(e) => setEditReviewText(e.target.value)}
            maxLength={500}
            rows={3}
            disabled={submitting}
          />
          <div className="char-count">
            {editReviewText.length}/500
          </div>

          <div className="form-actions">
            <button
              className="cancel-btn"
              onClick={handleCancelEdit}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              className="submit-btn"
              onClick={handleUpdateReview}
              disabled={submitting || editRating === 0}
            >
              {submitting ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </div>
      )}

      {/* Formulario para nueva reseña */}
      {canInteract && !userReview && !isEditing && (
        <>
          {!showNewReviewForm ? (
            <button
              className="create-review-btn"
              onClick={() => setShowNewReviewForm(true)}
            >
              <Icon icon="solar:star-broken" height={18} />
              Añadir tu reseña
            </button>
          ) : (
            <div className="new-review-form">
              <h4 className="form-title">Tu reseña</h4>
              {error && <div className="error-message">{error}</div>}

              <div className="stars-interactive">
                {renderInteractiveStars(
                  newRating,
                  hoverRating,
                  setHoverRating,
                  setNewRating
                )}
              </div>

              <textarea
                className="review-textarea"
                placeholder="Comparte tu experiencia (opcional)..."
                value={newReviewText}
                onChange={(e) => setNewReviewText(e.target.value)}
                maxLength={500}
                rows={3}
                disabled={submitting}
              />
              <div className="char-count">
                {newReviewText.length}/500
              </div>

              <div className="form-actions">
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setShowNewReviewForm(false);
                    setNewRating(0);
                    setNewReviewText('');
                    setError(null);
                  }}
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  className="submit-btn"
                  onClick={handleSubmitReview}
                  disabled={submitting || newRating === 0}
                >
                  {submitting ? 'Enviando...' : 'Enviar reseña'}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Lista de otras reseñas */}
      {(reviews?.length || 0) > 0 && (
        <div className="other-reviews">
          <h4 className="reviews-title">Otras reseñas</h4>
          {reviews
            .filter((r) => !userReview || r.id !== userReview.id)
            .map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="user-avatar">
                    {review.client[0].toUpperCase()}
                  </div>
                  <div className="review-info">
                    <h5 className="username">{review.client}</h5>
                    <p className="review-date">{formatDate(review.created_at)}</p>
                  </div>
                </div>
                <div className="stars-review">
                  {renderStars(review.rating)}
                </div>
                {review.review_text && (
                  <p className="review-text">{review.review_text}</p>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default StarRating;

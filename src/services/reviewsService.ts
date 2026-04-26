import api from '../utils/axios';

export interface Review {
  id: string;
  client: string;
  rating: number;
  review_text?: string;
  created_at: string;
}

export interface ReviewsData {
  average: number;
  total: number;
  reviews: Review[];
}

export const getVendorReviews = async (vendorId: string): Promise<ReviewsData> => {
  try {
    const response = await api.get(`vendors/${vendorId}/reviews/`);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Error al obtener reseñas';
    throw new Error(message);
  }
};

export const submitReview = async (
  vendorId: string,
  rating: number,
  reviewText?: string
): Promise<Review> => {
  try {
    const response = await api.post(
      `vendors/${vendorId}/reviews/`,
      {
        rating,
        review_text: reviewText || '',
      }
    );
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Error al enviar la reseña';
    throw new Error(message);
  }
};

export const updateReview = async (
  reviewId: string,
  rating: number,
  reviewText?: string
): Promise<Review> => {
  try {
    const response = await api.patch(
      `reviews/edit/${reviewId}/`,
      {
        rating,
        review_text: reviewText || '',
      }
    );
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Error al actualizar la reseña';
    throw new Error(message);
  }
};
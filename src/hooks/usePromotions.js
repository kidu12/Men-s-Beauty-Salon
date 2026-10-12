import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

export const usePromotions = () => {
  const [promotions, setPromotions] = useState([]);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/promotions`);
      const data = await response.json();
      setPromotions(data);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    }
  };

  const addPromotion = async (formData) => {
    try {
      // formData should be an instance of FormData for file uploads
      const response = await fetch(`${API_BASE_URL}/api/promotions`, {
        method: 'POST',
        body: formData, // No need for Content-Type header with FormData
      });
      const newPromo = await response.json();
      setPromotions([newPromo, ...promotions]);
      return newPromo;
    } catch (error) {
      console.error('Error adding promotion:', error);
    }
  };

  const deletePromotion = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/promotions/${id}`, {
        method: 'DELETE',
      });
      setPromotions(promotions.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting promotion:', error);
    }
  };

  return { promotions, addPromotion, deletePromotion };
};

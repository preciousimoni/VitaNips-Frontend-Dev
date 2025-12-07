import axiosInstance from './axiosInstance';

export const activatePharmacySubscription = async () => {
  const response = await axiosInstance.post('/payments/subscriptions/pharmacy/activate/');
  return response.data;
};

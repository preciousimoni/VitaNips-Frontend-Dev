import axiosInstance from './axiosInstance';

export const getHealthRecommendations = async () => {
    const response = await axiosInstance.get('/health/recommendations/');
    return response.data;
};

export const getHealthTrends = async (metricType: string, days: number = 30) => {
    const response = await axiosInstance.get(`/health/trends/${metricType}/`, {
        params: { days }
    });
    return response.data;
};


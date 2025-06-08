import axios from './axios';

export const createFeature = (year_id,data) => axios.post(`/api/features/create-feature/${year_id}`, data);
export const fetchFeatures = (year_id) => axios.get(`/api/features/${year_id}`);

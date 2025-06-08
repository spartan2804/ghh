import axios from './axios';

export const createYear = (module_id,data) => axios.post(`/api/years/create-year/${module_id}`, data);
export const fetchYears = (module_id) => axios.get(`/years/${module_id}`);

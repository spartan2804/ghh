import axios from './axios';

export const createModule = (data) => axios.post(`/api/modules/create-module/`, data);
export const fetchModules = () => axios.get(`/api/modules/`);

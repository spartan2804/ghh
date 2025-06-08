import api from './axios';

// Get all testcases (optionally by feature_id)
export const getTestcases = (feature_id) =>
  api.get('/testcases', { params: feature_id ? { feature_id } : {} }).then(res => res.data);

// Get testcase by ID
export const getTestcaseById = (id) =>
  api.get(`/testcases/${id}`).then(res => res.data);

// Create testcase
export const createTestcase = (formData) =>
  api.post('/testcases', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data);

// Update testcase
export const updateTestcase = (id, data) =>
  api.put(`/testcases/${id}`, data).then(res => res.data);

// Delete testcase
export const deleteTestcase = (id) =>
  api.delete(`/testcases/${id}`).then(res => res.data);

// Download testcase file by ID
export const downloadTestcaseFile = (id) =>
  api.get(`/testcases/${id}/download`, { responseType: 'blob' }).then(res => res.data);

// Download testcase file by file path
export const downloadTestcaseFileByPath = (filePath) =>
  api.get('/testcases/download-by-path', { params: { filePath }, responseType: 'blob' }).then(res => res.data);

// View testcase file content by file path
export const viewTestcaseFileByPath = (filePath) =>
  api.get('/testcases/view-by-path', { params: { filePath } }).then(res => res.data);

// Save (edit) testcase file content by file path
export const saveTestcaseFileByPath = (filePath, content) =>
  api.post('/testcases/save-by-path', { filePath, content }).then(res => res.data);

// Import testcases from previous year
export const importTestcasesFromPreviousYear = (testcase_ids, target_feature_id) =>
  api.post('/testcases/import', { testcase_ids, target_feature_id }).then(res => res.data);

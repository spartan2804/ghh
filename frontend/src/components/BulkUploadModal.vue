<template>
  <div class="modal">
    <div class="modal-content bulk-modal">
      <h2>Bulk Upload Testcases</h2>
      <form @submit.prevent="submitUpload">
        <div class="form-group">
          <label>Files:</label>
          <input type="file" multiple @change="onFileChange" />
        </div>
        <div class="file-list-scroll">
          <div v-for="(file, idx) in files" :key="file.name" class="form-group file-desc">
            <label>Description for <span class="file-name">{{ file.name }}</span>:</label>
            <input v-model="descriptions[idx]" placeholder="Optional description" />
          </div>
        </div>
        <div class="modal-actions">
          <button type="submit" :disabled="!files.length || uploading">Upload</button>
          <button type="button" class="cancel-btn" @click="$emit('close')">Cancel</button>
        </div>
      </form>
      <div v-if="uploading" class="uploading">Uploading...</div>
      <div v-if="results.length">
        <h4>Results:</h4>
        <ul class="results-list">
          <li v-for="r in results" :key="r.file">
            <span class="file-name">{{ r.file }}</span> - <span :class="r.status">{{ r.status }}</span>
            <span v-if="r.error" class="error">: {{ r.error }}</span>
          </li>
        </ul>
      </div>
      <div v-if="error" class="error">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../api/axios.js'
const props = defineProps({
  featureId: [String, Number, null],
  moduleName: String,
  yearName: String,
  featureName: String
})
const emit = defineEmits(['close', 'uploaded'])
const files = ref([])
const descriptions = ref([])
const uploading = ref(false)
const results = ref([])
const error = ref('')

function onFileChange(e) {
  files.value = Array.from(e.target.files)
  descriptions.value = files.value.map(() => '')
}
async function submitUpload() {
  if (!files.value.length) return
  uploading.value = true
  error.value = ''
  results.value = []
  const formData = new FormData()
  files.value.forEach(f => formData.append('files', f))
  formData.append('feature_id', props.featureId)
  formData.append('module_name', props.moduleName)
  formData.append('year_name', props.yearName)
  formData.append('feature_name', props.featureName)
  descriptions.value.forEach(d => formData.append('description', d))
  try {
    const res = await api.post('/testcases/bulk-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    results.value = res.data.results || []
    emit('uploaded')
  } catch (e) {
    error.value = e.response?.data?.error || 'Bulk upload failed'
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.bulk-modal {
  background: #fff;
  padding: 2.5rem 2rem 2rem 2rem;
  border-radius: 16px;
  min-width: 400px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
  font-family: 'Roboto', sans-serif;
}
.bulk-modal h2 {
  color: #1976d2;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: center;
}
.form-group {
  margin-bottom: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.file-list-scroll {
  max-height: 250px;
  overflow-y: auto;
  margin-bottom: 1.2rem;
  padding-right: 0.5rem;
}
.file-desc {
  margin-bottom: 0.7rem;
}
.file-name {
  color: #1976d2;
  font-weight: 600;
}
.bulk-modal input[type="file"] {
  padding: 0.5rem 0;
}
.bulk-modal input[type="text"],
.bulk-modal input[type="file"],
.bulk-modal input {
  padding: 0.6rem 1rem;
  border-radius: 8px;
  border: 1.5px solid #1976d2;
  font-size: 1rem;
  background: #f5f8ff;
  color: #1976d2;
  font-weight: 500;
  transition: border 0.2s;
}
.bulk-modal input:focus {
  border: 2px solid #1565c0;
  outline: none;
}
.modal-actions {
  display: flex;
  gap: 1.2rem;
  justify-content: center;
  margin-top: 1.2rem;
}
.bulk-modal button {
  padding: 0.7rem 2rem;
  border: none;
  border-radius: 8px;
  background: #1976d2;
  color: #fff;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.bulk-modal button:disabled {
  background: #b0b8c1;
  cursor: not-allowed;
}
.bulk-modal .cancel-btn {
  background: #e0e7fa;
  color: #1976d2;
}
.bulk-modal .cancel-btn:hover {
  background: #b0b8c1;
  color: #fff;
}
.bulk-modal button:hover:not(:disabled) {
  background: #1565c0;
}
.uploading {
  color: #1976d2;
  font-weight: 600;
  margin-top: 1rem;
  text-align: center;
}
.results-list {
  margin-top: 1rem;
  padding-left: 1.2rem;
}
.results-list .success { color: #388e3c; font-weight: 600; }
.results-list .error { color: #d32f2f; font-weight: 600; }
.error { color: #d32f2f; margin-top: 0.5rem; text-align: center; }
</style> 
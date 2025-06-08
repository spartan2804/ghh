<template>
  <div class="modal">
    <div class="modal-content import-modal">
      <h2>Import Features & Testcases</h2>
      <div class="form-group">
        <label>Source Year:</label>
        <select v-model="sourceYearId" @change="fetchFeatures" :disabled="loadingYears">
          <option value="" disabled>Select Year</option>
          <option v-for="year in years" :key="year.year_id" :value="year.year_id">{{ year.year_name }}</option>
        </select>
      </div>
      <div v-if="loadingFeatures" class="loading">Loading features...</div>
      <div v-else-if="features.length" class="feature-list-scroll">
        <label class="feature-list-label">Select Features to Import:</label>
        <div class="feature-checklist">
          <div v-for="feat in features" :key="feat.feature_id" class="feature-item">
            <input type="checkbox" :id="'feat-' + feat.feature_id" :value="feat.feature_id" v-model="selectedFeatures" />
            <label :for="'feat-' + feat.feature_id">{{ feat.feature_name }}</label>
          </div>
        </div>
      </div>
      <div v-else-if="sourceYearId && !loadingFeatures" class="no-features">No features found for this year.</div>
      <div class="modal-actions">
        <button @click="importSelected" :disabled="!canImport || importing">Import</button>
        <button type="button" class="cancel-btn" @click="$emit('close')">Cancel</button>
      </div>
      <div v-if="importing" class="loading">Importing...</div>
      <div v-if="msg" :class="{success: importSuccess, error: !importSuccess}">{{ msg }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import api from '../api/axios.js'
const props = defineProps({ targetYearId: Number, moduleId: Number })
const emit = defineEmits(['close', 'imported'])

const years = ref([])
const features = ref([])
const sourceYearId = ref('')
const selectedFeatures = ref([])
const msg = ref('')
const importSuccess = ref(false)
const loadingYears = ref(false)
const loadingFeatures = ref(false)
const importing = ref(false)

const fetchYears = async () => {
  loadingYears.value = true
  years.value = []
  if (!props.moduleId) return
  const res = await api.get('/years', { params: { module_id: props.moduleId } })
  years.value = res.data.filter(y => y.year_id !== props.targetYearId)
  loadingYears.value = false
}
const fetchFeatures = async () => {
  features.value = []
  selectedFeatures.value = []
  if (!sourceYearId.value) return
  loadingFeatures.value = true
  const res = await api.get('/features', { params: { year_id: sourceYearId.value } })
  features.value = res.data
  loadingFeatures.value = false
}
const importSelected = async () => {
  if (!sourceYearId.value || !props.targetYearId || selectedFeatures.value.length === 0) return
  importing.value = true
  msg.value = ''
  importSuccess.value = false
  try {
    await api.post('/testcases/import', {
      source_year_id: sourceYearId.value,
      target_year_id: props.targetYearId,
      feature_ids: selectedFeatures.value
    })
    msg.value = 'Import successful!'
    importSuccess.value = true
    // Emit both imported event and a refresh event to trigger feature list reload
    emit('imported')
    emit('refresh-features')
    setTimeout(() => emit('close'), 1200)
  } catch (e) {
    msg.value = e.response?.data?.message || 'Import failed'
    importSuccess.value = false
  } finally {
    importing.value = false
  }
}
const canImport = computed(() => sourceYearId.value && selectedFeatures.value.length > 0)
onMounted(fetchYears)
watch(() => props.moduleId, fetchYears)
</script>

<style scoped>
.modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.import-modal {
  background: #fff;
  padding: 2.5rem 2rem 2rem 2rem;
  border-radius: 16px;
  min-width: 400px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
  font-family: 'Roboto', sans-serif;
}
.import-modal h2 {
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
.import-modal select {
  padding: 0.7rem 1.2rem;
  border-radius: 8px;
  border: 1.5px solid #1976d2;
  font-size: 1.1rem;
  background: #f5f8ff;
  color: #1976d2;
  font-weight: 500;
  min-width: 180px;
  transition: border 0.2s;
}
.import-modal select:focus {
  border: 2px solid #1565c0;
  outline: none;
}
.feature-list-label {
  font-weight: 600;
  color: #1976d2;
  margin-bottom: 0.5rem;
  display: block;
}
.feature-list-scroll {
  max-height: 220px;
  overflow-y: auto;
  margin-bottom: 1.2rem;
  padding-right: 0.5rem;
  background: #f5f8ff;
  border-radius: 8px;
  border: 1px solid #e0e7fa;
}
.feature-checklist {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem 0.5rem 0.5rem 0.5rem;
}
.feature-item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}
.feature-item input[type="checkbox"] {
  accent-color: #1976d2;
  width: 1.1rem;
  height: 1.1rem;
}
.modal-actions {
  display: flex;
  gap: 1.2rem;
  justify-content: center;
  margin-top: 1.2rem;
}
.import-modal button {
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
.import-modal button:disabled {
  background: #b0b8c1;
  cursor: not-allowed;
}
.import-modal .cancel-btn {
  background: #e0e7fa;
  color: #1976d2;
}
.import-modal .cancel-btn:hover {
  background: #b0b8c1;
  color: #fff;
}
.import-modal button:hover:not(:disabled) {
  background: #1565c0;
}
.loading {
  color: #1976d2;
  font-weight: 600;
  margin: 1rem 0;
  text-align: center;
}
.no-features {
  color: #d32f2f;
  font-weight: 600;
  margin: 1rem 0;
  text-align: center;
}
.success {
  color: #388e3c;
  font-weight: 600;
  margin-top: 1rem;
  text-align: center;
}
.error {
  color: #d32f2f;
  font-weight: 600;
  margin-top: 1rem;
  text-align: center;
}
</style> 
<template>
  <div>
    <div>
      <label>Select Year to Import From:</label>
      <select v-model="importYear" @change="fetchFeatures">
        <option value="" disabled>Select Year</option>
        <option v-for="yr in years" :key="yr.year_id" :value="yr.year_id">{{ yr.year_name }}</option>
      </select>
    </div>
    <div v-if="importYear">
      <label>Select Feature to Import From:</label>
      <select v-model="importFeature" @change="fetchTCs">
        <option value="" disabled>Select Feature</option>
        <option v-for="feat in features" :key="feat.feature_id" :value="feat.feature_id">{{ feat.feature_name }}</option>
      </select>
    </div>
    <div v-if="importFeature">
      <label>Select Test Cases to Import:</label>
      <div v-if="loading">Loading...</div>
      <div v-else-if="tcs.length === 0">No test cases found.</div>
      <div v-else>
        <div v-for="tc in tcs" :key="tc.id">
          <input type="checkbox" :value="tc.id" v-model="selectedTCs" />
          {{ tc.name }}
        </div>
      </div>
      <button @click="importSelected" :disabled="selectedTCs.length === 0 || importing">Import Selected</button>
      <div v-if="msg" :class="{success: success, error: !success}">{{ msg }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
const props = defineProps({ targetFeatureId: [String, Number, null] })
const years = ref([])
const features = ref([])
const tcs = ref([])
const importYear = ref('')
const importFeature = ref('')
const selectedTCs = ref([])
const loading = ref(false)
const importing = ref(false)
const msg = ref('')
const success = ref(false)

const fetchYears = async () => {
  const res = await axios.get('/api/years')
  years.value = res.data
}
onMounted(fetchYears)

const fetchFeatures = async () => {
  if (!importYear.value) { features.value = []; return }
  const res = await axios.get(`/api/features?year_id=${importYear.value}`)
  features.value = res.data
}

const fetchTCs = async () => {
  if (!importFeature.value) { tcs.value = []; return }
  loading.value = true
  const res = await axios.get(`/api/testcases?feature_id=${importFeature.value}`)
  tcs.value = res.data
  loading.value = false
}

const importSelected = async () => {
  if (!props.targetFeatureId) { msg.value = 'Select a target feature first.'; success.value = false; return }
  importing.value = true
  try {
    await axios.post('/api/testcases/import', {
      testcase_ids: selectedTCs.value,
      target_feature_id: props.targetFeatureId
    })
    msg.value = 'Test cases imported!'
    success.value = true
    selectedTCs.value = []
  } catch (e) {
    msg.value = e.response?.data?.error || 'Error importing test cases.'
    success.value = false
  }
  importing.value = false
}
</script>

<style scoped>
label { display: block; margin-top: 1rem; }
select { padding: 0.5rem; border-radius: 6px; margin-bottom: 0.5rem; }
button { margin-top: 1rem; padding: 0.5rem 1.5rem; border-radius: 6px; border: none; background: #1976d2; color: #fff; cursor: pointer; }
.success { color: green; margin-top: 0.5rem; }
.error { color: red; margin-top: 0.5rem; }
</style> 
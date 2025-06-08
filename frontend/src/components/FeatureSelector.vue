<template>
  <div>
    <select v-if="yearId" v-model="selected" @change="handleChange">
      <option value="" disabled>Select Feature</option>
      <option v-for="feat in features" :key="feat.feature_id" :value="feat.feature_id">{{ feat.feature_name }}</option>
      <option value="__create">+ Create New Feature</option>
      <option value="__import">⇪ Import Features</option>
    </select>
    <div v-if="showDialog" class="modal">
      <div class="modal-content">
        <h3>Create New Feature</h3>
        <input v-model="newFeatureName" placeholder="Feature Name" />
        <button @click="createFeature">Create</button>
        <button @click="closeDialog">Cancel</button>
        <div v-if="error" class="error">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import api from '../api/axios.js'
const props = defineProps({ modelValue: [String, Number, null], yearId: [String, Number, null] })
const emit = defineEmits(['update:modelValue', 'import-features'])
const selected = ref(props.modelValue)
const features = ref([])
const showDialog = ref(false)
const newFeatureName = ref('')
const error = ref('')

const fetchFeatures = async () => {
  if (!props.yearId) { features.value = []; return }
  const res = await api.get('/features', { params: { year_id: props.yearId } })
  features.value = res.data
}
watch(() => props.yearId, fetchFeatures, { immediate: true })
watch(() => props.modelValue, v => { selected.value = v })

function handleChange() {
  if (selected.value === '__create') {
    showDialog.value = true
    newFeatureName.value = ''
    error.value = ''
  } else if (selected.value === '__import') {
    emit('import-features')
    selected.value = ''
  } else {
    emit('update:modelValue', selected.value)
  }
}
function closeDialog() {
  showDialog.value = false
  selected.value = ''
}
async function createFeature() {
  if (!newFeatureName.value.trim()) {
    error.value = 'Feature name required'
    return
  }
  try {
    const res = await api.post(`/features/${props.yearId}`, { feature_name: newFeatureName.value })
    await fetchFeatures()
    selected.value = res.data.feature_id
    emit('update:modelValue', selected.value)
    showDialog.value = false
  } catch (e) {
    error.value = e.response?.data?.error || 'Error creating feature'
  }
}
</script>

<style scoped>
.modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; }
.modal-content { background: #fff; padding: 2rem; border-radius: 8px; min-width: 300px; }
.error { color: red; margin-top: 0.5rem; }
select { padding: 0.5rem; border-radius: 6px; }
</style> 
<template>
  <div>
    <select v-if="moduleId" v-model="selected" @change="handleChange">
      <option value="" disabled>Select Year</option>
      <option v-for="yr in years" :key="yr.year_id" :value="yr.year_id">{{ yr.year_name }}</option>
      <option value="__create">+ Create New Year</option>
    </select>
    <div v-if="showDialog" class="modal">
      <div class="modal-content">
        <h3>Create New Year</h3>
        <input v-model="newYearName" placeholder="Year Name" />
        <button @click="createYear">Create</button>
        <button @click="closeDialog">Cancel</button>
        <div v-if="error" class="error">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import api from '../api/axios.js'
const props = defineProps({ modelValue: [String, Number, null], moduleId: [String, Number, null] })
const emit = defineEmits(['update:modelValue'])
const selected = ref(props.modelValue)
const years = ref([])
const showDialog = ref(false)
const newYearName = ref('')
const error = ref('')

const fetchYears = async () => {
  if (!props.moduleId) { years.value = []; return }
  const res = await api.get('/years', { params: { module_id: props.moduleId } })
  years.value = res.data
}
watch(() => props.moduleId, fetchYears, { immediate: true })
watch(() => props.modelValue, v => { selected.value = v })

function handleChange() {
  if (selected.value === '__create') {
    showDialog.value = true
    newYearName.value = ''
    error.value = ''
  } else {
    emit('update:modelValue', selected.value)
  }
}
function closeDialog() {
  showDialog.value = false
  selected.value = ''
}
async function createYear() {
  if (!newYearName.value.trim()) {
    error.value = 'Year name required'
    return
  }
  try {
    const res = await api.post(`/years/${props.moduleId}`, { year_name: newYearName.value })
    await fetchYears()
    selected.value = res.data.year_id
    emit('update:modelValue', selected.value)
    showDialog.value = false
  } catch (e) {
    error.value = e.response?.data?.error || 'Error creating year'
  }
}
</script>

<style scoped>
.modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; }
.modal-content { background: #fff; padding: 2rem; border-radius: 8px; min-width: 300px; }
.error { color: red; margin-top: 0.5rem; }
select { padding: 0.5rem; border-radius: 6px; }
</style> 
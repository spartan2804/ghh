<template>
  <div>
    <select v-model="selected" @change="handleChange">
      <option value="" disabled>Select Module</option>
      <option v-for="mod in modules" :key="mod.module_id" :value="mod.module_id">{{ mod.module_name }}</option>
      <option value="__create">+ Create New Module</option>
    </select>
    <div v-if="showDialog" class="modal">
      <div class="modal-content">
        <h3>Create New Module</h3>
        <input v-model="newModuleName" placeholder="Module Name" />
        <button @click="createModule">Create</button>
        <button @click="closeDialog">Cancel</button>
        <div v-if="error" class="error">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import api from '../api/axios.js'
const props = defineProps({ modelValue: [String, Number, null] })
const emit = defineEmits(['update:modelValue'])
const selected = ref(props.modelValue)
const modules = ref([])
const showDialog = ref(false)
const newModuleName = ref('')
const error = ref('')

const fetchModules = async () => {
  const res = await api.get('/modules')
  modules.value = res.data
}
onMounted(fetchModules)
watch(() => props.modelValue, v => { selected.value = v })

function handleChange() {
  if (selected.value === '__create') {
    showDialog.value = true
    newModuleName.value = ''
    error.value = ''
  } else {
    emit('update:modelValue', selected.value)
  }
}
function closeDialog() {
  showDialog.value = false
  selected.value = ''
}
async function createModule() {
  if (!newModuleName.value.trim()) {
    error.value = 'Module name required'
    return
  }
  try {
    const res = await api.post('/modules', { module_name: newModuleName.value })
    await fetchModules()
    selected.value = res.data.module_id
    emit('update:modelValue', selected.value)
    showDialog.value = false
  } catch (e) {
    error.value = e.response?.data?.error || 'Error creating module'
  }
}
</script>

<style scoped>
.modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; }
.modal-content { background: #fff; padding: 2rem; border-radius: 8px; min-width: 300px; }
.error { color: red; margin-top: 0.5rem; }
select { padding: 0.5rem; border-radius: 6px; }
</style> 
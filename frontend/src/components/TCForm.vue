<template>
  <form @submit.prevent="submit">
    <div>
      <label>Name:</label>
      <input v-model="name" required />
    </div>
    <div>
      <label>Description:</label>
      <textarea v-model="description" />
    </div>
    <div>
      <label>File:</label>
      <input type="file" @change="onFileChange" required />
    </div>
    <button type="submit" :disabled="loading">Add Test Case</button>
    <div v-if="msg" :class="{success: success, error: !success}">{{ msg }}</div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'
const props = defineProps({
  featureId: [String, Number, null],
  moduleName: String,
  yearName: String,
  featureName: String
})
const name = ref('')
const description = ref('')
const file = ref(null)
const loading = ref(false)
const msg = ref('')
const success = ref(false)

watch(() => props.featureId, () => { name.value = ''; description.value = ''; file.value = null; msg.value = '' })

function onFileChange(e) {
  file.value = e.target.files[0]
}

const submit = async () => {
  if (!props.featureId || !file.value) { msg.value = 'Select a feature and file.'; success.value = false; return }
  loading.value = true
  try {
    const formData = new FormData()
    formData.append('name', name.value)
    formData.append('description', description.value)
    formData.append('file', file.value)
    formData.append('feature_id', props.featureId)
    formData.append('module_name', props.moduleName || '')
    formData.append('year_name', props.yearName || '')
    formData.append('feature_name', props.featureName || '')
    await axios.post('/api/testcases', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    msg.value = 'Test case added!'
    success.value = true
    name.value = ''
    description.value = ''
    file.value = null
  } catch (e) {
    msg.value = e.response?.data?.error || 'Error adding test case.'
    success.value = false
  }
  loading.value = false
}
</script>

<style scoped>
form > div { margin-bottom: 1rem; }
input, textarea { width: 100%; padding: 0.5rem; border-radius: 6px; border: 1px solid #ccc; }
button { padding: 0.5rem 1.5rem; border-radius: 6px; border: none; background: #1976d2; color: #fff; cursor: pointer; }
.success { color: green; margin-top: 0.5rem; }
.error { color: red; margin-top: 0.5rem; }
</style> 
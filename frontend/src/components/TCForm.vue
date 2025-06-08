<template>
  <form class="tc-form" @submit.prevent="submit">
    <div class="form-group">
      <label>Name:</label>
      <input v-model="name" required />
    </div>
    <div class="form-group">
      <label>Description:</label>
      <textarea v-model="description" rows="3" />
    </div>
    <div class="form-group">
      <label>File:</label>
      <input type="file" @change="onFileChange" required />
    </div>
    <div class="form-actions">
      <button type="submit" :disabled="loading">Add Test Case</button>
    </div>
    <div v-if="msg" :class="{success: success, error: !success}">{{ msg }}</div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'
import api from '../api/axios.js'
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

async function submit() {
  if (!props.featureId || !file.value) return
  loading.value = true
  msg.value = ''
  success.value = false
  const formData = new FormData()
  formData.append('name', name.value)
  formData.append('description', description.value)
  formData.append('file', file.value)
  formData.append('module_name', props.moduleName)
  formData.append('year_name', props.yearName)
  formData.append('feature_name', props.featureName)
  try {
    await api.post(`/testcases/create/${props.featureId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    msg.value = 'Test case added!'
    success.value = true
    name.value = ''
    description.value = ''
    file.value = null
  } catch (e) {
    msg.value = e.response?.data?.error || 'Error adding test case.'
    success.value = false
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.tc-form {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
  padding: 2rem 2rem 1.5rem 2rem;
  max-width: 500px;
  margin: 0 auto 2rem auto;
  font-family: 'Roboto', sans-serif;
}
.form-group {
  margin-bottom: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.tc-form label {
  font-weight: 600;
  color: #1976d2;
  margin-bottom: 0.2rem;
}
.tc-form input[type="text"],
.tc-form input[type="file"],
.tc-form textarea {
  padding: 0.7rem 1rem;
  border-radius: 8px;
  border: 1.5px solid #1976d2;
  font-size: 1rem;
  background: #f5f8ff;
  color: #1976d2;
  font-weight: 500;
  transition: border 0.2s;
}
.tc-form input:focus, .tc-form textarea:focus {
  border: 2px solid #1565c0;
  outline: none;
}
.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 1.2rem;
}
.tc-form button {
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
.tc-form button:disabled {
  background: #b0b8c1;
  cursor: not-allowed;
}
.tc-form button:hover:not(:disabled) {
  background: #1565c0;
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
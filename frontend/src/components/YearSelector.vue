<template>
  <select v-model="selected" @change="emitChange">
    <option value="" disabled>Select Year</option>
    <option v-for="yr in years" :key="yr.year_id" :value="yr.year_id">
      {{ yr.year_name }}
    </option>
  </select>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import axios from 'axios'
const props = defineProps({
  modelValue: [String, Number, null],
  moduleId: [String, Number, null, undefined],
  module_id: [String, Number, null, undefined]
})
const emit = defineEmits(['update:modelValue'])
const selected = ref(props.modelValue)
const years = ref([])

const fetchYears = async () => {
  if (!props.moduleId && !props.module_id) { years.value = []; return }
  const modId = props.moduleId || props.module_id
  const res = await axios.get(`/api/years?module_id=${modId}`)
  years.value = res.data
}
watch(() => props.moduleId || props.module_id, fetchYears, { immediate: true })
watch(() => props.modelValue, v => { selected.value = v })
function emitChange() { emit('update:modelValue', selected.value) }
</script>

<style scoped>
select { padding: 0.5rem; border-radius: 6px; }
</style> 
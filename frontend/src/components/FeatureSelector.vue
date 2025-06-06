<template>
  <select v-model="selected" @change="emitChange">
    <option value="" disabled>Select Feature</option>
    <option v-for="feat in features" :key="feat.feature_id" :value="feat.feature_id">
      {{ feat.feature_name }}
    </option>
    <option value="__create">+ Create New Feature</option>
    <option value="__import">⇪ Import Feature from Past Year</option>
  </select>
</template>

<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'
const props = defineProps({
  modelValue: [String, Number, null],
  yearId: [String, Number, null, undefined],
  year_id: [String, Number, null, undefined]
})
const emit = defineEmits(['update:modelValue'])
const selected = ref(props.modelValue)
const features = ref([])

const fetchFeatures = async () => {
  if (!props.yearId && !props.year_id) { features.value = []; return }
  const yrId = props.yearId || props.year_id
  const res = await axios.get(`/api/features?year_id=${yrId}`)
  features.value = res.data
}
watch(() => props.yearId || props.year_id, fetchFeatures, { immediate: true })
watch(() => props.modelValue, v => { selected.value = v })
function emitChange() { emit('update:modelValue', selected.value) }
</script>

<style scoped>
select { padding: 0.5rem; border-radius: 6px; }
</style> 
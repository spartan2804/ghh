<template>
  <select v-model="selected" @change="emitChange">
    <option value="" disabled>Select Module</option>
    <option v-for="mod in modules" :key="mod.module_id" :value="mod.module_id">
      {{ mod.module_name }}
    </option>
  </select>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import axios from 'axios'
const props = defineProps({
  modelValue: [String, Number, null]
})
const emit = defineEmits(['update:modelValue'])
const selected = ref(props.modelValue)
const modules = ref([])

const fetchModules = async () => {
  const res = await axios.get('/api/modules')
  modules.value = res.data
}
onMounted(fetchModules)
watch(() => props.modelValue, v => { selected.value = v })
function emitChange() { emit('update:modelValue', selected.value) }
</script>

<style scoped>
select { padding: 0.5rem; border-radius: 6px; }
</style> 
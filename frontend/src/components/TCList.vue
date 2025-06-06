<template>
  <div>
    <div v-if="!featureId">Select a feature to view test cases.</div>
    <div v-else>
      <div v-if="loading">Loading...</div>
      <div v-else-if="testcases.length === 0">No test cases found.</div>
      <ul v-else>
        <li v-for="tc in testcases" :key="tc.id" class="tc-item">
          <div>
            <strong>{{ tc.name }}</strong> <br />
            <span>{{ tc.description }}</span>
          </div>
          <a :href="`/api/testcases/${tc.id}/download`" target="_blank">Download</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'
const props = defineProps({ featureId: [String, Number, null] })
const testcases = ref([])
const loading = ref(false)

const fetchTCs = async () => {
  if (!props.featureId) { testcases.value = []; return }
  loading.value = true
  const res = await axios.get(`/api/testcases?feature_id=${props.featureId}`)
  testcases.value = res.data
  loading.value = false
}
watch(() => props.featureId, fetchTCs, { immediate: true })
</script>

<style scoped>
.tc-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}
</style> 
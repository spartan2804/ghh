<template>
  <div class="testcase-manager">
    <header class="main-header">
      <h1>TestCase Management</h1>
    </header>
    <!-- Top selectors -->
    <div class="selectors">
      <ModuleSelector v-model="selectedModule" />
      <YearSelector v-if="selectedModule" v-model="selectedYear" :module-id="selectedModule" />
      <FeatureSelector
        v-if="selectedYear"
        v-model="selectedFeature"
        :year-id="selectedYear"
        @import-features="showImportModal = true"
        :key="featureSelectorKey"
      />
    </div>

    <!-- Toggle Search/Add -->
    <div class="toggle-section">
      <button :class="{active: mode==='search'}" @click="mode='search'">Search TCs</button>
      <button :class="{active: mode==='add'}" @click="mode='add'">Add TC</button>
    </div>

    <!-- Main content -->
    <div v-if="mode==='search'">
      <TCList
        v-if="selectedFeature"
        :feature-id="selectedFeature"
        :module-name="moduleName"
        :year-name="yearName"
        :feature-name="featureName"
      />
    </div>
    <div v-else>
      <div class="add-tabs">
        <button :class="{active: addTab==='form'}" @click="addTab='form'">Add New TC</button>
        <button :class="{active: addTab==='bulk'}" @click="addTab='bulk'">Bulk Upload TCs</button>
      </div>
      <div v-if="addTab==='form'">
        <TCForm :feature-id="selectedFeature" :module-name="moduleName" :year-name="yearName" :feature-name="featureName" />
      </div>
      <div v-else>
        <BulkUploadModal
          v-if="selectedFeature"
          :feature-id="selectedFeature"
          :module-name="moduleName"
          :year-name="yearName"
          :feature-name="featureName"
          @close="addTab = 'form'"
          @uploaded="onBulkUploaded"
        />
      </div>
    </div>

    <ImportFeaturesModal
      v-if="showImportModal && selectedModule && selectedYear"
      :targetYearId="selectedYear"
      :moduleId="selectedModule"
      @close="showImportModal = false"
      @imported="onFeaturesImported"
    />

  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import ModuleSelector from '../components/ModuleSelector.vue'
import YearSelector from '../components/YearSelector.vue'
import FeatureSelector from '../components/FeatureSelector.vue'
import TCList from '../components/TCList.vue'
import TCForm from '../components/TCForm.vue'
import ImportFeaturesModal from '../components/ImportFeaturesModal.vue'
import BulkUploadModal from '../components/BulkUploadModal.vue'
import api from '../api/axios.js'

const selectedModule = ref(null)
const selectedYear = ref(null)
const selectedFeature = ref(null)
const mode = ref('search')
const addTab = ref('form')
const showImportModal = ref(false)
const featureSelectorKey = ref(0)

const moduleName = ref('')
const yearName = ref('')
const featureName = ref('')

watch(selectedModule, async (id) => {
  selectedYear.value = null
  selectedFeature.value = null
  moduleName.value = ''
  if (id) {
    const res = await api.get('/modules')
    const mod = res.data.find(m => m.module_id == id)
    moduleName.value = mod ? mod.module_name : ''
  }
})
watch(selectedYear, async (id) => {
  selectedFeature.value = null
  yearName.value = ''
  if (id) {
    const res = await api.get('/years', { params: { module_id: selectedModule.value } })
    const yr = res.data.find(y => y.year_id == id)
    yearName.value = yr ? yr.year_name : ''
  }
})
watch(selectedFeature, async (id) => {
  featureName.value = ''
  if (id) {
    const res = await api.get('/features', { params: { year_id: selectedYear.value } })
    const feat = res.data.find(f => f.feature_id == id)
    featureName.value = feat ? feat.feature_name : ''
  }
})
function onFeaturesImported() {
  showImportModal.value = false
  refetchFeatures()
}
function onBulkUploaded() {
  addTab.value = 'form'
}
function refetchFeatures() {
  // Bump the key to force FeatureSelector to reload
  featureSelectorKey.value++
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
.testcase-manager {
  max-width: 1000px;
  margin: 2rem auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
  padding: 2.5rem 2rem 2rem 2rem;
  font-family: 'Roboto', sans-serif;
}
.main-header {
  text-align: center;
  margin-bottom: 2.5rem;
}
.main-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1976d2;
  letter-spacing: 1px;
  margin: 0;
}
.selectors {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  align-items: flex-end;
  justify-content: center;
}
.selectors select {
  padding: 0.7rem 1.2rem;
  border-radius: 8px;
  border: 1.5px solid #1976d2;
  font-size: 1.1rem;
  background: #f5f8ff;
  color: #1976d2;
  font-weight: 500;
  min-width: 180px;
  transition: border 0.2s;
}
.selectors select:focus {
  border: 2px solid #1565c0;
  outline: none;
}
.toggle-section {
  display: flex;
  gap: 1.2rem;
  margin-bottom: 2rem;
  justify-content: center;
}
.toggle-section button {
  padding: 0.7rem 2rem;
  border: none;
  border-radius: 8px;
  background: #e3eafc;
  color: #1976d2;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.1rem;
  transition: background 0.2s, color 0.2s;
}
.toggle-section button.active {
  background: #1976d2;
  color: #fff;
}
.add-tabs {
  display: flex;
  gap: 1.2rem;
  margin-bottom: 1.5rem;
  justify-content: center;
}
.add-tabs button {
  padding: 0.6rem 1.8rem;
  border: none;
  border-radius: 8px;
  background: #e0e7fa;
  color: #1976d2;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.05rem;
  transition: background 0.2s, color 0.2s;
}
.add-tabs button.active {
  background: #1976d2;
  color: #fff;
}
.testcase-area {
  margin-top: 2rem;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fafbfc;
}
</style> 
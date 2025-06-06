<template>
  <div class="testcase-manager">
    <!-- Top selectors -->
    <div class="selectors">
      <ProductSelector v-model="selectedModule" />
      <YearSelector v-model="selectedYear" :module-id="selectedModule" />
      <FeatureSelector v-model="selectedFeature" :year-id="selectedYear" />
      <button @click="showCreateFeature = true">Create New Feature</button>
      <button @click="showImportFeature = true">Import Feature from Past Year</button>
    </div>

    <!-- Toggle Search/Add -->
    <div class="toggle-section">
      <button :class="{active: mode==='search'}" @click="mode='search'">Search TCs</button>
      <button :class="{active: mode==='add'}" @click="mode='add'">Add TC</button>
    </div>

    <!-- Main content -->
    <div v-if="mode==='search'">
      <TCList :feature-id="selectedFeature" />
    </div>
    <div v-else>
      <div class="add-tabs">
        <button :class="{active: addTab==='form'}" @click="addTab='form'">Add New TC</button>
        <button :class="{active: addTab==='import'}" @click="addTab='import'">Import TCs from Past Year</button>
      </div>
      <div v-if="addTab==='form'">
        <TCForm :feature-id="selectedFeature" />
      </div>
      <div v-else>
        <ImportFromDB :target-feature-id="selectedFeature" />
      </div>
    </div>

    <!-- Modals for create/import feature (placeholders) -->
    <div v-if="showCreateFeature" class="modal">[Create Feature Modal]</div>
    <div v-if="showImportFeature" class="modal">[Import Feature Modal]</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ProductSelector from '../components/ProductSelector.vue'
import YearSelector from '../components/YearSelector.vue'
import FeatureSelector from '../components/FeatureSelector.vue'
import TCList from '../components/TCList.vue'
import TCForm from '../components/TCForm.vue'
import ImportFromDB from '../components/ImportFromDB.vue'

const selectedModule = ref(null)
const selectedYear = ref(null)
const selectedFeature = ref(null)
const mode = ref('search')
const addTab = ref('form')
const showCreateFeature = ref(false)
const showImportFeature = ref(false)
</script>

<style scoped>
.testcase-manager {
  max-width: 900px;
  margin: 2rem auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.08);
  padding: 2rem;
}
.selectors {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
}
.toggle-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.toggle-section button {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 6px;
  background: #f0f0f0;
  cursor: pointer;
  font-weight: 500;
}
.toggle-section button.active {
  background: #1976d2;
  color: #fff;
}
.add-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}
.add-tabs button {
  padding: 0.4rem 1.2rem;
  border: none;
  border-radius: 6px;
  background: #e0e0e0;
  cursor: pointer;
}
.add-tabs button.active {
  background: #1976d2;
  color: #fff;
}
.modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
</style> 
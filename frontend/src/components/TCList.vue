<template>
  <div>
    <div v-if="!featureId">Select a feature to view test cases.</div>
    <div v-else>
      <div class="search-bar">
        <input v-model="search" @keyup.enter="doSearch" placeholder="Search testcases..." />
        <button @click="doSearch"><i class="fas fa-search"></i></button>
        <button v-if="search" @click="clearSearch"><i class="fas fa-times"></i></button>
      </div>
      <div v-if="loading">Loading...</div>
      <div v-else>
        <table class="tc-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tc in testcases" :key="tc.id">
              <td>{{ tc.name }}</td>
              <td>{{ tc.description }}</td>
              <td>
                <button @click="viewTestcase(tc)" title="View"><i class="fas fa-eye"></i></button>
                <button @click="editTestcase(tc)" title="Edit"><i class="fas fa-pencil-alt"></i></button>
                <button @click="downloadTestcase(tc)" title="Download"><i class="fas fa-download"></i></button>
                <button @click="deleteTestcase(tc)" title="Delete"><i class="fas fa-trash"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
        <!-- Pagination Controls -->
        <div class="pagination">
          <button :disabled="page === 1" @click="page--">Prev</button>
          <span>Page {{ page }} of {{ totalPages }}</span>
          <button :disabled="page === totalPages" @click="page++">Next</button>
        </div>
        <!-- Code Viewer/Editor Modal -->
        <div v-if="showModal" :class="['modal', { fullscreen: isFullscreen }]">
          <div :class="['modal-content', 'code-modal', { fullscreen: isFullscreen }]">
            <div class="modal-header">
              <span>{{ modalTitle }}</span>
              <div class="modal-header-actions">
                <button @click="toggleFullscreen" class="fullscreen-btn" :title="isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'">
                  <i :class="isFullscreen ? 'fas fa-compress' : 'fas fa-expand'"></i>
                </button>
                <button @click="closeModal" class="close-btn">&times;</button>
              </div>
            </div>
            <MonacoEditor
              v-if="showEditor"
              v-model:value="modalContent"
              :language="detectLanguage(editingTestcase?.file_path)"
              theme="vs-dark"
              :options="{ readOnly: !isEditing, fontSize: 16 }"
              :style="isFullscreen ? 'height: 80vh;' : 'height: 400px;'"
            />
            <div class="modal-actions">
              <button v-if="!isEditing" @click="isEditing = true"><i class="fas fa-pencil-alt"></i> Edit</button>
              <button v-if="isEditing" @click="saveEdit">Save</button>
              <button v-if="isEditing" @click="cancelEdit">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import api from '../api/axios.js'
import MonacoEditor from '@guolao/vue-monaco-editor'
const props = defineProps({ featureId: [String, Number] })

const testcases = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = 5
const total = ref(0)
const showModal = ref(false)
const showEditor = ref(false)
const isEditing = ref(false)
const modalContent = ref('')
const modalTitle = ref('')
const editingTestcase = ref(null)
const search = ref('')
const isSearching = ref(false)
const isFullscreen = ref(false)

const totalPages = computed(() => Math.ceil(total.value / pageSize))

const fetchTCs = async () => {
  if (!props.featureId) { testcases.value = []; total.value = 0; return }
  loading.value = true
  const params = { page: page.value, limit: pageSize }
  if (props.featureId) params.feature_id = props.featureId
  if (isSearching.value && search.value) params.search = search.value
  const url = isSearching.value && search.value ? '/testcases/search' : '/testcases'
  const res = await api.get(url, { params })
  testcases.value = res.data.testcases || []
  total.value = res.data.total || 0
  loading.value = false
}
watch(() => [props.featureId, page.value], fetchTCs, { immediate: true })

function doSearch() {
  isSearching.value = !!search.value
  page.value = 1
  fetchTCs()
}
function clearSearch() {
  search.value = ''
  isSearching.value = false
  page.value = 1
  fetchTCs()
}

async function viewTestcase(tc) {
  modalTitle.value = tc.name
  editingTestcase.value = tc
  showModal.value = true
  showEditor.value = true
  isEditing.value = false
  isFullscreen.value = false
  // Fetch file content
  api.get('/testcases/view-by-path', { params: { filePath: tc.file_path } })
    .then(res => { modalContent.value = res.data || '' })
    .catch(() => { modalContent.value = 'Error loading file.' })
}
async function editTestcase(tc) {
  await viewTestcase(tc)
  isEditing.value = true
}
async function saveEdit() {
  api.post('/testcases/save-by-path', {
    filePath: editingTestcase.value.file_path,
    content: modalContent.value
  }).then(() => {
    isEditing.value = false
    alert('Saved!')
  }).catch(() => alert('Save failed'))
}
function cancelEdit() {
  isEditing.value = false
  // Reload content
  viewTestcase(editingTestcase.value)
}
function closeModal() {
  showModal.value = false
  isEditing.value = false
  isFullscreen.value = false
}
function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
}
async function downloadTestcase(tc) {
  if (!tc.file_path) {
    alert('No file path available for download')
    return
  }
  try {
    const response = await api.get(`/testcases/download/${tc.id}`, {
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', tc.file_path.split('/').pop() || 'testcase.txt')
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (e) {
    alert('Error downloading testcase')
  }
}
async function deleteTestcase(tc) {
  if (!confirm('Delete this testcase?')) return
  try {
    await api.delete(`/testcases/delete/${tc.id}`)
    await fetchTCs()
  } catch (e) {
    alert('Error deleting testcase')
  }
}

function detectLanguage(filePath) {
  if (!filePath) return 'plaintext'
  if (filePath.endsWith('.py')) return 'python'
  if (filePath.endsWith('.js')) return 'javascript'
  if (filePath.endsWith('.java')) return 'java'
  if (filePath.endsWith('.txt')) return 'plaintext'
  if (filePath.endsWith('.cpp')) return 'cpp'
  if (filePath.endsWith('.c')) return 'c'
  if (filePath.endsWith('.html')) return 'html'
  if (filePath.endsWith('.css')) return 'css'
  if (filePath.endsWith('.php')) return 'php'
  if (filePath.endsWith('.sql')) return 'sql'
  if (filePath.endsWith('.json')) return 'json'
  return 'plaintext'
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
.tc-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  font-family: 'Roboto', sans-serif;
  font-size: 1rem;
}
.tc-table th, .tc-table td {
  border: 1px solid #eee;
  padding: 0.75rem 1.2rem;
  text-align: left;
}
.tc-table th {
  background: #1976d2;
  color: #fff;
  font-weight: 700;
}
.tc-table tr:nth-child(even) {
  background: #f5f8ff;
}
.tc-table tr:hover {
  background: #e3f2fd;
}
.tc-table button, .tc-table i {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  margin-right: 0.5rem;
}
.tc-table i.fa-eye { color: #1976d2; }
.tc-table i.fa-pencil-alt { color: #ffa000; }
.tc-table i.fa-download { color: #388e3c; }
.tc-table i.fa-trash { color: #d32f2f; }
.pagination {
  margin: 1rem 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-family: 'Roboto', sans-serif;
}
.modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  transition: background 0.2s;
}
.modal.fullscreen {
  background: #181c24;
  z-index: 2000;
}
.modal-content.code-modal {
  background: #fff;
  padding: 2rem;
  border-radius: 16px;
  min-width: 600px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
  font-family: 'Roboto', sans-serif;
  max-width: 900px;
  width: 90vw;
  transition: all 0.2s;
}
.modal-content.code-modal.fullscreen {
  min-width: 100vw;
  min-height: 100vh;
  width: 100vw;
  height: 100vh;
  border-radius: 0;
  padding: 2.5rem 2rem 2rem 2rem;
  background: #181c24;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 1rem;
}
.modal-header-actions {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}
.fullscreen-btn {
  background: none;
  border: none;
  font-size: 1.3rem;
  color: #1976d2;
  cursor: pointer;
  margin-right: 0.5rem;
  transition: color 0.2s;
}
.fullscreen-btn:hover {
  color: #1565c0;
}
.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #d32f2f;
}
.modal-actions {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
}
.search-bar {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.search-bar input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.search-bar button {
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.search-bar button:hover {
  background-color: #0056b3;
}
</style> 
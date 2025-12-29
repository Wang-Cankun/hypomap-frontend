<template>
  <div class="knowledge">
    <div class="ad-drug-resource">
      <h1>NDD Related Drug Resources</h1>
      <p>This section will provide information and links to resources related to drugs for Alzheimer's Disease, including clinical trials, drug databases, and research initiatives.</p>
      <ul>
        <li><a href="#" target="_blank">Clinical Trials for AD</a></li>
        <li><a href="#" target="_blank">AD Drug Database</a></li>
        <li><a href="#" target="_blank">Latest Research on AD Drugs</a></li>
      </ul>
    </div>
    <div class="search-section">
      <h1>Knowledge Base</h1>
      <div class="search-bar">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search articles, tutorials, or documentation..."
          @input="handleSearch"
        >
      </div>
      <div class="category-tabs">
        <button 
          v-for="category in categories" 
          :key="category.id"
          :class="{ active: selectedCategory === category.id }"
          @click="selectCategory(category.id)"
        >
          {{ category.name }}
        </button>
      </div>
    </div>

    <div class="content-grid">
      <div class="main-content">
        <div class="article-list">
          <article 
            v-for="article in filteredArticles" 
            :key="article.id"
            class="article-card"
          >
            <div class="article-header">
              <h2>{{ article.title }}</h2>
              <span class="category-tag">{{ article.category }}</span>
            </div>
            <p class="article-excerpt">{{ article.excerpt }}</p>
            <div class="article-meta">
              <span class="date">{{ formatDate(article.date) }}</span>
              <span class="author">By {{ article.author }}</span>
            </div>
            <button @click="viewArticle(article)" class="read-more">Read More</button>
          </article>
        </div>
      </div>

      <div class="sidebar">
        <div class="sidebar-section">
          <h3>Popular Topics</h3>
          <ul class="topic-list">
            <li v-for="topic in popularTopics" :key="topic.id">
              <a href="#" @click.prevent="filterByTopic(topic)">{{ topic.name }}</a>
              <span class="topic-count">({{ topic.count }})</span>
            </li>
          </ul>
        </div>

        <div class="sidebar-section">
          <h3>Recent Updates</h3>
          <ul class="update-list">
            <li v-for="update in recentUpdates" :key="update.id">
              <span class="update-date">{{ formatDate(update.date) }}</span>
              <a href="#" @click.prevent="viewArticle(update)">{{ update.title }}</a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-if="showArticleModal" class="article-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ selectedArticle.title }}</h2>
          <button @click="closeModal" class="close-button">&times;</button>
        </div>
        <div class="modal-body">
          <div class="article-meta">
            <span class="date">{{ formatDate(selectedArticle.date) }}</span>
            <span class="author">By {{ selectedArticle.author }}</span>
            <span class="category-tag">{{ selectedArticle.category }}</span>
          </div>
          <div class="article-content" v-html="selectedArticle.content"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Mock data - replace with actual data fetching
const categories = [
  { id: 'all', name: 'All' },
  { id: 'tutorials', name: 'Tutorials' },
  { id: 'documentation', name: 'Documentation' },
  { id: 'research', name: 'Research' },
  { id: 'news', name: 'News' }
]

const articles = ref([
  {
    id: 1,
    title: 'Getting Started with Single-Cell Analysis',
    category: 'Tutorials',
    excerpt: 'Learn the basics of single-cell RNA sequencing analysis and how to use our platform effectively.',
    content: '<p>Detailed content about single-cell analysis...</p>',
    date: '2024-03-15',
    author: 'Dr. Jane Smith'
  },
  {
    id: 2,
    title: 'Understanding Cell Type Classification',
    category: 'Documentation',
    excerpt: 'A comprehensive guide to cell type classification methods and best practices.',
    content: '<p>Detailed content about cell type classification...</p>',
    date: '2024-03-10',
    author: 'Dr. John Doe'
  },
  // Add more articles as needed
])

const popularTopics = [
  { id: 1, name: 'Single-Cell Analysis', count: 25 },
  { id: 2, name: 'Cell Type Classification', count: 18 },
  { id: 3, name: 'Differential Expression', count: 15 },
  { id: 4, name: 'Spatial Transcriptomics', count: 12 }
]

const recentUpdates = [
  {
    id: 1,
    title: 'New Feature: Interactive Cell Type Explorer',
    date: '2024-03-15'
  },
  {
    id: 2,
    title: 'Updated Documentation: API Reference',
    date: '2024-03-14'
  }
]

const searchQuery = ref('')
const selectedCategory = ref('all')
const showArticleModal = ref(false)
const selectedArticle = ref(null)

const filteredArticles = computed(() => {
  return articles.value.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = selectedCategory.value === 'all' || 
                           article.category.toLowerCase() === selectedCategory.value
    return matchesSearch && matchesCategory
  })
})

const handleSearch = () => {
  // Implement search functionality
  console.log('Searching for:', searchQuery.value)
}

const selectCategory = (categoryId) => {
  selectedCategory.value = categoryId
}

const filterByTopic = (topic) => {
  searchQuery.value = topic.name
}

const viewArticle = (article) => {
  selectedArticle.value = article
  showArticleModal.value = true
}

const closeModal = () => {
  showArticleModal.value = false
  selectedArticle.value = null
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.knowledge {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.ad-drug-resource {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.ad-drug-resource h1 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.ad-drug-resource ul {
  list-style: disc;
  margin-left: 1.5rem;
}

.ad-drug-resource li {
  margin-bottom: 0.5rem;
}

.ad-drug-resource a {
  color: #42b983;
  text-decoration: none;
}

.ad-drug-resource a:hover {
  text-decoration: underline;
}

.search-section {
  margin-bottom: 2rem;
}

h1 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.search-bar {
  margin-bottom: 1.5rem;
}

.search-bar input {
  width: 100%;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.category-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.category-tabs button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: #f8f9fa;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.category-tabs button.active {
  background: #42b983;
  color: white;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.article-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.article-header h2 {
  color: #2c3e50;
  margin: 0;
}

.category-tag {
  background: #e9ecef;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #666;
}

.article-excerpt {
  color: #666;
  margin-bottom: 1rem;
}

.article-meta {
  display: flex;
  gap: 1rem;
  color: #666;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.read-more {
  background: #42b983;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.read-more:hover {
  background: #3aa876;
}

.sidebar-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.sidebar-section h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.topic-list, .update-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.topic-list li, .update-list li {
  margin-bottom: 0.5rem;
}

.topic-list a, .update-list a {
  color: #42b983;
  text-decoration: none;
}

.topic-list a:hover, .update-list a:hover {
  text-decoration: underline;
}

.topic-count {
  color: #666;
  font-size: 0.875rem;
}

.update-date {
  color: #666;
  font-size: 0.875rem;
  margin-right: 0.5rem;
}

.article-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem;
}

.article-content {
  line-height: 1.6;
  color: #2c3e50;
}
</style> 
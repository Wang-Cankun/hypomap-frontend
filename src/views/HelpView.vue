<template>
  <div class="help-content-wrapper">
    <main class="help-content">
      <div v-html="renderedMarkdown"></div>
    </main>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { marked } from 'marked'
import { useRoute } from 'vue-router'

const route = useRoute()
const renderedMarkdown = ref('')

const loadMarkdown = async (topicPath) => {
  try {
    const response = await fetch(`/markdown/${topicPath}.md`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const markdown = await response.text()
    renderedMarkdown.value = marked.parse(markdown)
  } catch (error) {
    console.error('Error loading markdown:', error)
    renderedMarkdown.value = '<p>Error loading content.</p>'
  }
}

// Watch for changes in the route path and load corresponding markdown
watch(() => route.params.topic, (newTopic) => {
  const topic = newTopic || 'methods'; // Get the topic from the route, default to methods
  loadMarkdown(topic);
}, { immediate: true }); // Load on initial mount as well

</script>

<style scoped>
.help-content-wrapper {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.help-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.help-content h1,
.help-content h2,
.help-content h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.help-content p {
  line-height: 1.6;
  margin-bottom: 1rem;
}

.help-content ul,
.help-content ol {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}
</style> 
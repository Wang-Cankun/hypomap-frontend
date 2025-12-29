<template>
  <div
    class="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 flex flex-col"
  >
    <!-- Header -->
    <div class="bg-white border-b border-secondary-200 px-6 py-4 shadow-sm">
      <h1 class="text-2xl font-bold text-secondary-900">Knowledge Graph</h1>
      <p class="text-sm text-secondary-600 mt-1">
        Explore relationships between datasets, papers, genes, and diseases
      </p>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Left Sidebar - Filters -->
      <aside
        class="w-80 bg-white border-r border-secondary-200 overflow-y-auto shadow-sm"
      >
        <div class="p-4 space-y-4">
          <!-- Search -->
          <div>
            <label class="block text-sm font-semibold text-secondary-700 mb-2">
              Search Entities
            </label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search nodes..."
              class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <!-- Entity Type Filters -->
          <div>
            <label class="block text-sm font-semibold text-secondary-700 mb-2">
              Entity Types
            </label>
            <div class="space-y-2">
              <label
                v-for="type in entityTypes"
                :key="type.id"
                class="flex items-center gap-2 p-2 hover:bg-secondary-50 rounded cursor-pointer"
              >
                <input
                  v-model="selectedEntityTypes"
                  type="checkbox"
                  :value="type.id"
                  class="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                />
                <span class="text-sm text-secondary-700">{{ type.label }}</span>
                <span
                  class="ml-auto px-2 py-0.5 text-xs font-medium rounded-full"
                  :class="type.color"
                >
                  {{ type.count }}
                </span>
              </label>
            </div>
          </div>

          <!-- Relationship Filters -->
          <div>
            <label class="block text-sm font-semibold text-secondary-700 mb-2">
              Relationships
            </label>
            <div class="space-y-2">
              <label
                v-for="rel in relationshipTypes"
                :key="rel.id"
                class="flex items-center gap-2 p-2 hover:bg-secondary-50 rounded cursor-pointer"
              >
                <input
                  v-model="selectedRelationships"
                  type="checkbox"
                  :value="rel.id"
                  class="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                />
                <span class="text-sm text-secondary-700">{{ rel.label }}</span>
                <span
                  class="ml-auto px-2 py-0.5 text-xs font-medium rounded-full"
                  :class="rel.color"
                >
                  {{ rel.count }}
                </span>
              </label>
            </div>
          </div>

          <!-- Layout Options -->
          <div>
            <label class="block text-sm font-semibold text-secondary-700 mb-2">
              Layout
            </label>
            <select
              v-model="layoutType"
              class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="hierarchical">Hierarchical</option>
              <option value="force">Force-Directed</option>
              <option value="circular">Circular</option>
            </select>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-2 pt-4 border-t border-secondary-200">
            <button
              @click="resetFilters"
              class="flex-1 px-4 py-2 text-sm font-medium text-secondary-700 bg-secondary-100 border border-secondary-300 rounded-lg hover:bg-secondary-200 transition-colors"
            >
              Reset
            </button>
            <button
              @click="applyFilters"
              class="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Graph Area -->
      <main class="flex-1 flex flex-col relative">
        <!-- Graph Container -->
        <div ref="graphContainer" class="flex-1 bg-white"></div>

        <!-- Graph Controls -->
        <div class="absolute top-4 right-4 flex gap-2">
          <button
            @click="fitGraph"
            class="px-3 py-2 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-lg hover:bg-secondary-50 shadow-sm transition-colors flex items-center gap-1"
            title="Fit to screen"
          >
            <AppIcon name="expand" size="sm" /> Fit
          </button>
          <button
            @click="zoomIn"
            class="px-3 py-2 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-lg hover:bg-secondary-50 shadow-sm transition-colors"
            title="Zoom in"
          >
            <AppIcon name="plus" size="sm" />
          </button>
          <button
            @click="zoomOut"
            class="px-3 py-2 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-lg hover:bg-secondary-50 shadow-sm transition-colors"
            title="Zoom out"
          >
            <AppIcon name="minus" size="sm" />
          </button>
          <button
            @click="resetGraph"
            class="px-3 py-2 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-lg hover:bg-secondary-50 shadow-sm transition-colors flex items-center gap-1"
            title="Reset view"
          >
            <AppIcon name="refresh" size="sm" /> Reset
          </button>
        </div>
      </main>
    </div>

    <!-- Bottom AI Chat Panel -->
    <div
      class="h-96 bg-white border-t border-secondary-200 shadow-lg flex flex-col"
      :class="{ 'h-[500px]': chatExpanded }"
    >
      <div
        class="px-6 py-3 bg-gradient-to-r from-primary-50 to-secondary-50 border-b border-secondary-200 flex items-center justify-between cursor-pointer"
        @click="chatExpanded = !chatExpanded"
      >
        <div class="flex items-center gap-2">
          <svg
            class="w-5 h-5 text-primary-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            ></path>
          </svg>
          <span class="font-semibold text-secondary-900">AI Assistant</span>
          <span class="text-sm text-secondary-600"
            >Ask questions about the knowledge graph</span
          >
        </div>
        <svg
          class="w-5 h-5 text-secondary-600 transform transition-transform"
          :class="{ 'rotate-180': chatExpanded }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </div>

      <div v-if="chatExpanded" class="flex-1 flex flex-col overflow-hidden">
        <!-- Messages -->
        <div
          ref="chatMessagesContainer"
          class="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-secondary-50 to-white"
        >
          <div
            v-for="(message, index) in chatMessages"
            :key="index"
            :class="[
              'flex gap-3',
              message.type === 'user' ? 'justify-end' : 'justify-start',
            ]"
          >
            <div
              v-if="message.type === 'bot'"
              class="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0"
            >
              <svg
                class="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                ></path>
              </svg>
            </div>
            <div
              :class="[
                'px-4 py-2 rounded-lg max-w-[70%]',
                message.type === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-secondary-200 text-secondary-800',
              ]"
            >
              <p class="text-sm leading-relaxed">{{ message.text }}</p>
            </div>
            <div
              v-if="message.type === 'user'"
              class="w-8 h-8 bg-gradient-to-r from-secondary-400 to-secondary-500 rounded-full flex items-center justify-center flex-shrink-0"
            >
              <span class="text-white text-xs font-semibold">U</span>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="p-4 border-t border-secondary-200 bg-white">
          <div class="flex gap-3">
            <input
              v-model="newChatMessage"
              @keyup.enter="sendChatMessage"
              type="text"
              placeholder="Ask about relationships, entities, or explore the graph..."
              class="flex-1 px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              @click="sendChatMessage"
              class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import { Network } from "vis-network";
import AppIcon from "@/components/icons/AppIcon.vue";

// Graph state
const graphContainer = ref(null);
const network = ref(null);
const nodes = ref([]);
const edges = ref([]);
const searchQuery = ref("");
const layoutType = ref("hierarchical");
const chatExpanded = ref(true);
const chatMessages = ref([
  {
    type: "bot",
    text: "Hello! I can help you explore the knowledge graph. Ask me about relationships between entities, search for specific nodes, or learn about connections in the graph.",
  },
]);
const newChatMessage = ref("");
const chatMessagesContainer = ref(null);

// Entity types
const entityTypes = ref([
  {
    id: "dataset",
    label: "Datasets",
    count: 150,
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: "paper",
    label: "Papers",
    count: 45,
    color: "bg-green-100 text-green-700",
  },
  {
    id: "gene",
    label: "Genes",
    count: 1200,
    color: "bg-purple-100 text-purple-700",
  },
  {
    id: "disease",
    label: "Diseases",
    count: 25,
    color: "bg-red-100 text-red-700",
  },
  {
    id: "cell_type",
    label: "Cell Types",
    count: 85,
    color: "bg-yellow-100 text-yellow-700",
  },
]);

const relationshipTypes = ref([
  {
    id: "cites",
    label: "Cites",
    count: 120,
    color: "bg-indigo-100 text-indigo-700",
  },
  {
    id: "contains",
    label: "Contains",
    count: 450,
    color: "bg-cyan-100 text-cyan-700",
  },
  {
    id: "associated_with",
    label: "Associated With",
    count: 235,
    color: "bg-pink-100 text-pink-700",
  },
  {
    id: "regulates",
    label: "Regulates",
    count: 180,
    color: "bg-orange-100 text-orange-700",
  },
]);

const selectedEntityTypes = ref([]);
const selectedRelationships = ref([]);

// Initialize with all types selected
onMounted(() => {
  selectedEntityTypes.value = entityTypes.value.map((t) => t.id);
  selectedRelationships.value = relationshipTypes.value.map((r) => r.id);
  initializeGraph();
});

onBeforeUnmount(() => {
  if (network.value) {
    network.value.off("click");
    network.value.off("hoverNode");
    network.value.destroy();
    network.value = null;
  }
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
});

// Initialize graph with sample data
const initializeGraph = () => {
  if (!graphContainer.value) return;

  // Destroy existing network if it exists
  if (network.value) {
    network.value.destroy();
    network.value = null;
  }

  // Sample knowledge graph data
  const sampleNodes = [
    { id: 1, label: "AD001", group: "dataset", title: "Dataset: AD001" },
    { id: 2, label: "ST024001", group: "dataset", title: "Dataset: ST024001" },
    {
      id: 3,
      label: "Paper-2024-001",
      group: "paper",
      title: "Paper: Alzheimer's Disease Study",
    },
    { id: 4, label: "APOE", group: "gene", title: "Gene: APOE" },
    {
      id: 5,
      label: "Alzheimer's Disease",
      group: "disease",
      title: "Disease: Alzheimer's Disease",
    },
    { id: 6, label: "Neuron", group: "cell_type", title: "Cell Type: Neuron" },
    {
      id: 7,
      label: "Astrocyte",
      group: "cell_type",
      title: "Cell Type: Astrocyte",
    },
    {
      id: 8,
      label: "Paper-2024-002",
      group: "paper",
      title: "Paper: Neurodegeneration Study",
    },
    { id: 9, label: "TAU", group: "gene", title: "Gene: TAU" },
    {
      id: 10,
      label: "Parkinson's Disease",
      group: "disease",
      title: "Disease: Parkinson's Disease",
    },
  ];

  const sampleEdges = [
    { from: 1, to: 3, label: "cites", arrows: "to" },
    { from: 2, to: 3, label: "cites", arrows: "to" },
    { from: 3, to: 5, label: "associated_with", arrows: "to" },
    { from: 3, to: 4, label: "contains", arrows: "to" },
    { from: 1, to: 4, label: "contains", arrows: "to" },
    { from: 1, to: 6, label: "contains", arrows: "to" },
    { from: 1, to: 7, label: "contains", arrows: "to" },
    { from: 4, to: 5, label: "associated_with", arrows: "to" },
    { from: 8, to: 10, label: "associated_with", arrows: "to" },
    { from: 8, to: 9, label: "contains", arrows: "to" },
    { from: 9, to: 10, label: "regulates", arrows: "to" },
  ];

  nodes.value = sampleNodes;
  edges.value = sampleEdges;

  const data = {
    nodes: nodes.value,
    edges: edges.value,
  };

  const options = {
    nodes: {
      shape: "dot",
      size: 25,
      font: { size: 12, face: "Arial" },
      borderWidth: 2,
      shadow: true,
    },
    edges: {
      width: 2,
      color: { color: "#848484" },
      smooth: { type: "continuous" },
      arrows: {
        to: { enabled: true, scaleFactor: 0.5 },
      },
      font: {
        size: 10,
        align: "middle",
        strokeWidth: 2,
        strokeColor: "#ffffff",
      },
    },
    groups: {
      dataset: {
        color: { background: "#3B82F6", border: "#1E40AF" },
        font: { color: "#FFFFFF" },
      },
      paper: {
        color: { background: "#10B981", border: "#047857" },
        font: { color: "#FFFFFF" },
      },
      gene: {
        color: { background: "#8B5CF6", border: "#6D28D9" },
        font: { color: "#FFFFFF" },
      },
      disease: {
        color: { background: "#EF4444", border: "#B91C1C" },
        font: { color: "#FFFFFF" },
      },
      cell_type: {
        color: { background: "#F59E0B", border: "#D97706" },
        font: { color: "#FFFFFF" },
      },
    },
    physics: {
      enabled: true,
      hierarchicalRepulsion: {
        centralGravity: 0.0,
        springLength: 100,
        springConstant: 0.01,
        nodeDistance: 120,
        damping: 0.09,
      },
      stabilization: {
        iterations: 200,
      },
    },
    layout: {
      hierarchical: {
        enabled: layoutType.value === "hierarchical",
        direction: "UD",
        sortMethod: "directed",
        levelSeparation: 150,
        nodeSpacing: 100,
      },
      improvedLayout: layoutType.value === "circular",
      randomSeed: layoutType.value === "circular" ? 2 : undefined,
    },
    interaction: {
      hover: false,
      tooltipDelay: 5000,
      zoomView: true,
      dragView: true,
      selectConnectedEdges: false,
    },
  };

  network.value = new Network(graphContainer.value, data, options);

  // Event listeners - only handle click events, not hover
  network.value.on("click", (params) => {
    // Only trigger on actual click, not hover
    if (params.nodes.length > 0) {
      const nodeId = params.nodes[0];
      const currentNode = nodes.value.find((n) => n.id === nodeId);
      if (currentNode) {
        // Simply add a demo message - no scrolling, no complex logic
        const message = {
          type: "bot",
          text: `You clicked on ${currentNode.label} (${currentNode.group}). ${
            currentNode.title || ""
          }`,
        };
        chatMessages.value.push(message);
        // Auto-scroll to show the new message
        nextTick(() => {
          if (chatMessagesContainer.value) {
            chatMessagesContainer.value.scrollTop =
              chatMessagesContainer.value.scrollHeight;
          }
        });
      }
    }
  });

  // Explicitly prevent hover events from triggering anything
  network.value.on("hoverNode", () => {
    // Do nothing - just prevent any hover-related bugs
  });
};

// Filter functions
const applyFilters = () => {
  if (!network.value) return;

  let filteredNodes = nodes.value.filter((node) => {
    // Entity type filter
    if (selectedEntityTypes.value.length > 0) {
      if (!selectedEntityTypes.value.includes(node.group)) {
        return false;
      }
    }
    // Search filter
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase();
      if (
        !node.label.toLowerCase().includes(query) &&
        !(node.title && node.title.toLowerCase().includes(query))
      ) {
        return false;
      }
    }
    return true;
  });

  // Filter edges based on selected relationships and visible nodes
  const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));
  const filteredEdges = edges.value.filter((edge) => {
    // Relationship filter
    if (selectedRelationships.value.length > 0) {
      if (!selectedRelationships.value.includes(edge.label)) {
        return false;
      }
    }
    // Only include edges where both nodes are visible
    return filteredNodeIds.has(edge.from) && filteredNodeIds.has(edge.to);
  });

  // Update graph
  network.value.setData({
    nodes: filteredNodes,
    edges: filteredEdges,
  });

  // Auto-fit after filtering
  setTimeout(() => {
    network.value.fit({ animation: true });
  }, 100);
};

const resetFilters = () => {
  searchQuery.value = "";
  selectedEntityTypes.value = entityTypes.value.map((t) => t.id);
  selectedRelationships.value = relationshipTypes.value.map((r) => r.id);
  if (network.value) {
    network.value.setData({ nodes: nodes.value, edges: edges.value });
    network.value.fit({ animation: true });
  }
};

// Graph control functions
const fitGraph = () => {
  if (network.value) {
    network.value.fit({ animation: true });
  }
};

const zoomIn = () => {
  if (network.value) {
    const scale = network.value.getScale();
    network.value.moveTo({ scale: scale * 1.2, animation: true });
  }
};

const zoomOut = () => {
  if (network.value) {
    const scale = network.value.getScale();
    network.value.moveTo({ scale: scale * 0.8, animation: true });
  }
};

const resetGraph = () => {
  if (network.value) {
    network.value.fit({ animation: true });
    network.value.moveTo({ scale: 1, animation: true });
  }
};

// Chat functions
const sendChatMessage = async () => {
  if (!newChatMessage.value.trim()) return;

  addChatMessage("user", newChatMessage.value);
  const query = newChatMessage.value;
  newChatMessage.value = "";

  // Simulate AI response
  setTimeout(() => {
    const response = generateAIResponse(query);
    addChatMessage("bot", response);
  }, 500);
};

const addChatMessage = async (type, text) => {
  chatMessages.value.push({ type, text });
  await nextTick();
  // Auto-scroll to bottom to show last message
  if (chatMessagesContainer.value) {
    chatMessagesContainer.value.scrollTop =
      chatMessagesContainer.value.scrollHeight;
  }
};

const generateAIResponse = (query) => {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes("relationship") || lowerQuery.includes("connect")) {
    return "You can explore relationships by clicking on nodes in the graph. Different colored edges represent different relationship types. Use the filters on the left to focus on specific relationship types.";
  } else if (lowerQuery.includes("search") || lowerQuery.includes("find")) {
    return "Use the search box in the left sidebar to find specific entities. You can also filter by entity type or relationship type to narrow down your search.";
  } else if (lowerQuery.includes("dataset") || lowerQuery.includes("data")) {
    return "Datasets are shown as blue nodes in the graph. They can be connected to papers, genes, diseases, and cell types. Click on a dataset node to see its connections.";
  } else if (lowerQuery.includes("paper")) {
    return "Papers are shown as green nodes. They connect to datasets they cite and entities they study. Papers provide the source of knowledge relationships.";
  } else {
    return "I can help you explore the knowledge graph. Try clicking on nodes to see their connections, or use the filters to focus on specific entity types or relationships. What would you like to learn more about?";
  }
};

// Watch search query - debounce to prevent excessive filtering
let searchTimeout = null;
watch(searchQuery, () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(() => {
    applyFilters();
  }, 300);
});
watch(layoutType, (newLayout) => {
  if (network.value) {
    const options = network.value.getOptions();
    options.layout.hierarchical.enabled = newLayout === "hierarchical";
    options.layout.improvedLayout = newLayout === "circular";

    // Update physics based on layout
    if (newLayout === "force") {
      options.physics.enabled = true;
      options.physics.barnesHut = {
        gravitationalConstant: -8000,
        centralGravity: 0.3,
        springLength: 200,
        springConstant: 0.04,
        damping: 0.09,
      };
      delete options.physics.hierarchicalRepulsion;
    } else if (newLayout === "circular") {
      options.physics.enabled = false;
    } else {
      options.physics.enabled = true;
      options.physics.hierarchicalRepulsion = {
        centralGravity: 0.0,
        springLength: 100,
        springConstant: 0.01,
        nodeDistance: 120,
        damping: 0.09,
      };
      delete options.physics.barnesHut;
    }

    network.value.setOptions(options);
    network.value.fit({ animation: true });
  }
});
</script>

<style scoped>
/* Additional custom styles if needed */
</style>

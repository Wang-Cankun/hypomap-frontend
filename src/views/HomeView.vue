<script setup>
import { ref, onMounted, onUnmounted } from "vue";

// Neural Network Canvas
const canvasRef = ref(null);
const canvasContainer = ref(null);
let animationFrameId = null;
let nodes = [];
let mouse = { x: null, y: null };

// Neural network animation
const initNeuralNetwork = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const container = canvasContainer.value;

  const resizeCanvas = () => {
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    initNodes();
  };

  const initNodes = () => {
    nodes = [];
    const nodeCount = Math.floor((canvas.width * canvas.height) / 15000);
    for (let i = 0; i < Math.min(nodeCount, 80); i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        baseX: 0,
        baseY: 0,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 3 + 2,
        opacity: Math.random() * 0.5 + 0.3,
        pulsePhase: Math.random() * Math.PI * 2,
      });
      nodes[i].baseX = nodes[i].x;
      nodes[i].baseY = nodes[i].y;
    }
  };

  const drawNetwork = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const connectionDistance = 150;
    const mouseInfluenceRadius = 200;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouseInfluenceRadius) {
          const force = (mouseInfluenceRadius - dist) / mouseInfluenceRadius;
          node.x += dx * force * 0.02;
          node.y += dy * force * 0.02;
        }
      }

      node.x += (node.baseX - node.x) * 0.01;
      node.y += (node.baseY - node.y) * 0.01;
      node.baseX += node.vx;
      node.baseY += node.vy;

      if (node.baseX < 0 || node.baseX > canvas.width) node.vx *= -1;
      if (node.baseY < 0 || node.baseY > canvas.height) node.vy *= -1;
      node.baseX = Math.max(0, Math.min(canvas.width, node.baseX));
      node.baseY = Math.max(0, Math.min(canvas.height, node.baseY));

      node.pulsePhase += 0.02;
      const pulse = Math.sin(node.pulsePhase) * 0.2 + 1;

      for (let j = i + 1; j < nodes.length; j++) {
        const other = nodes[j];
        const cdist = Math.sqrt(
          (node.x - other.x) ** 2 + (node.y - other.y) ** 2
        );
        if (cdist < connectionDistance) {
          let lineOpacity = (1 - cdist / connectionDistance) * 0.3;
          if (mouse.x !== null && mouse.y !== null) {
            const midX = (node.x + other.x) / 2;
            const midY = (node.y + other.y) / 2;
            const mouseDist = Math.sqrt(
              (mouse.x - midX) ** 2 + (mouse.y - midY) ** 2
            );
            if (mouseDist < mouseInfluenceRadius) {
              lineOpacity += (1 - mouseDist / mouseInfluenceRadius) * 0.4;
            }
          }
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(other.x, other.y);
          ctx.strokeStyle = `rgba(139, 92, 246, ${lineOpacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      let nodeOpacity = node.opacity;
      let nodeRadius = node.radius * pulse;

      if (mouse.x !== null && mouse.y !== null) {
        const mouseDist = Math.sqrt(
          (mouse.x - node.x) ** 2 + (mouse.y - node.y) ** 2
        );
        if (mouseDist < mouseInfluenceRadius) {
          const glow = 1 - mouseDist / mouseInfluenceRadius;
          nodeOpacity = Math.min(1, node.opacity + glow * 0.5);
          nodeRadius = node.radius * pulse * (1 + glow * 0.3);
          const gradient = ctx.createRadialGradient(
            node.x,
            node.y,
            0,
            node.x,
            node.y,
            nodeRadius * 3
          );
          gradient.addColorStop(0, `rgba(139, 92, 246, ${glow * 0.3})`);
          gradient.addColorStop(1, "rgba(139, 92, 246, 0)");
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeRadius * 3, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(139, 92, 246, ${nodeOpacity})`;
      ctx.fill();
    }
    animationFrameId = requestAnimationFrame(drawNetwork);
  };

  resizeCanvas();
  drawNetwork();
  window.addEventListener("resize", resizeCanvas);

  return () => {
    window.removeEventListener("resize", resizeCanvas);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  };
};

const handleMouseMove = (e) => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
};

const handleMouseLeave = () => {
  mouse.x = null;
  mouse.y = null;
};

let cleanup = null;

onMounted(() => {
  cleanup = initNeuralNetwork();
});

onUnmounted(() => {
  if (cleanup) cleanup();
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
});

// Features data
const features = [
  {
    icon: "upload",
    title: "Upload Your Data",
    description:
      "Upload scRNA-seq data in h5ad format. HypoMap processes your dataset and extracts cell embeddings using contrastive learning.",
  },
  {
    icon: "cluster",
    title: "Explore Clusters",
    description:
      "Visualize cell populations with interactive UMAP plots. Identify cell types and explore gene expression patterns across clusters.",
  },
  {
    icon: "hypothesis",
    title: "Generate Hypotheses",
    description:
      "AI-powered hypothesis generation helps you uncover hidden biological signals and discover novel insights from your data.",
  },
];

// Workflow steps
const workflowSteps = [
  {
    step: 1,
    title: "Upload h5ad",
    description: "Upload your preprocessed single-cell RNA-seq data",
  },
  {
    step: 2,
    title: "Contrastive Learning",
    description: "HypoMap applies multilevel contrastive learning to extract cell embeddings",
  },
  {
    step: 3,
    title: "Visualization",
    description: "Explore UMAP projections, gene expression, and cluster analysis",
  },
  {
    step: 4,
    title: "AI Analysis",
    description: "Get AI-powered insights and hypothesis suggestions",
  },
];
</script>

<template>
  <div class="min-h-screen bg-white font-sans text-secondary-800">
    <!-- Hero Section -->
    <section
      ref="canvasContainer"
      class="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-white via-pink-50/30 to-pink-50"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
    >
      <canvas
        ref="canvasRef"
        class="absolute inset-0 w-full h-full pointer-events-none"
      />

      <div class="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-24">
        <div class="max-w-4xl mx-auto text-center">
          <!-- Primary Title -->
          <h1
            class="text-7xl sm:text-8xl lg:text-9xl font-black tracking-tighter mb-6 animate-fade-in drop-shadow-sm"
          >
            <span
              class="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-400 to-rose-400"
            >
              HypoMap
            </span>
          </h1>

          <!-- Tagline -->
          <h2
            class="text-xl sm:text-2xl lg:text-3xl font-semibold text-secondary-700 leading-relaxed mb-5 animate-slide-up"
            style="animation-delay: 100ms"
          >
            Multilevel Contrastive Learning for Uncovering Hidden Biological Hypotheses
          </h2>

          <p
            class="text-base sm:text-lg text-secondary-500 max-w-2xl mx-auto leading-relaxed mb-10 animate-slide-up"
            style="animation-delay: 150ms"
          >
            Upload your scRNA-seq data and let HypoMap extract hidden biological signals using advanced contrastive learning. Generate novel hypotheses with AI-powered analysis.
          </p>

          <div
            class="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up"
            style="animation-delay: 200ms"
          >
            <router-link
              to="/upload"
              class="inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold shadow-xl shadow-pink-200 hover:shadow-pink-200 hover:-translate-y-1 transition-all duration-300"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
              </svg>
              <span>Upload Data</span>
            </router-link>
            <router-link
              to="/demo"
              class="inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-xl bg-white text-secondary-700 font-medium border border-secondary-200 shadow-sm hover:bg-secondary-50 hover:border-secondary-300 transition-all duration-200"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
              <span>Try Demo</span>
            </router-link>
          </div>
        </div>
      </div>

      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg
          class="w-6 h-6 text-secondary-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-24 bg-gradient-to-b from-secondary-50/50 to-white">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <p class="text-sm font-semibold text-rose-500 uppercase tracking-wide mb-3">
            Platform Features
          </p>
          <h2 class="text-3xl sm:text-4xl font-bold tracking-tight text-secondary-900 mb-6">
            Powerful Single-Cell Analysis
          </h2>
          <p class="text-lg text-secondary-600 leading-relaxed">
            HypoMap combines state-of-the-art contrastive learning with intuitive visualization tools to accelerate your research.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="bg-white rounded-2xl p-8 border border-secondary-100 shadow-sm hover:shadow-lg transition-shadow duration-300"
          >
            <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center mb-6">
              <!-- Upload Icon -->
              <svg v-if="feature.icon === 'upload'" class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
              </svg>
              <!-- Cluster Icon -->
              <svg v-else-if="feature.icon === 'cluster'" class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"></path>
              </svg>
              <!-- Hypothesis Icon -->
              <svg v-else class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-secondary-900 mb-3">{{ feature.title }}</h3>
            <p class="text-secondary-600 leading-relaxed">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Workflow Section -->
    <section class="py-24 bg-gradient-to-br from-pink-50 via-white to-pink-50">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <p class="text-sm font-semibold text-rose-500 uppercase tracking-wide mb-3">
            How It Works
          </p>
          <h2 class="text-3xl sm:text-4xl font-bold tracking-tight text-secondary-900 mb-6">
            From Data to Discovery
          </h2>
          <p class="text-lg text-secondary-600 leading-relaxed">
            A streamlined workflow that takes you from raw data to actionable biological hypotheses.
          </p>
        </div>

        <div class="relative">
          <!-- Connection line -->
          <div class="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-200 via-pink-300 to-rose-200 -translate-y-1/2"></div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div
              v-for="step in workflowSteps"
              :key="step.step"
              class="relative bg-white rounded-2xl p-6 border border-secondary-100 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div class="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 text-white font-bold text-lg mb-4 mx-auto relative z-10">
                {{ step.step }}
              </div>
              <h3 class="text-lg font-bold text-secondary-900 mb-2 text-center">{{ step.title }}</h3>
              <p class="text-sm text-secondary-500 text-center">{{ step.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-24 bg-gradient-to-br from-rose-500 to-pink-600">
      <div class="max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <h2 class="text-3xl sm:text-4xl font-bold text-white mb-6">
          Ready to Uncover Hidden Hypotheses?
        </h2>
        <p class="text-lg text-pink-100 mb-10 max-w-2xl mx-auto">
          Upload your single-cell data and let HypoMap's contrastive learning reveal insights you might have missed.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link
            to="/upload"
            class="inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-xl bg-white text-rose-600 font-semibold shadow-xl hover:bg-pink-50 hover:-translate-y-1 transition-all duration-300"
          >
            <span>Get Started</span>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </router-link>
          <router-link
            to="/help/methods"
            class="inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-xl bg-rose-400/30 text-white font-medium border border-rose-300/50 hover:bg-rose-400/50 transition-all duration-200"
          >
            <span>Learn More</span>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-12 bg-secondary-900">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="flex flex-col md:flex-row justify-between items-center gap-6">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-lg bg-rose-500 flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
            <span class="text-xl font-bold text-white">HypoMap</span>
          </div>
          <div class="text-secondary-400 text-sm">
            Developed by BMBL - Biomedical Big Data Lab
          </div>
          <div class="flex items-center space-x-6">
            <router-link to="/help/contact" class="text-secondary-400 hover:text-white transition-colors">
              Contact
            </router-link>
            <a href="https://github.com/Wang-Cankun/hypomap-frontend" target="_blank" class="text-secondary-400 hover:text-white transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.8s ease-out;
}

.animate-slide-up {
  animation: slide-up 0.6s ease-out forwards;
  opacity: 0;
}
</style>

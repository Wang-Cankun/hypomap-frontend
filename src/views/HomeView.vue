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
          ctx.strokeStyle = `rgba(244, 63, 94, ${lineOpacity})`;
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
          gradient.addColorStop(0, `rgba(244, 63, 94, ${glow * 0.3})`);
          gradient.addColorStop(1, "rgba(244, 63, 94, 0)");
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeRadius * 3, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(244, 63, 94, ${nodeOpacity})`;
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

// Dynamic year
const currentYear = new Date().getFullYear();
</script>

<template>
  <div
    ref="canvasContainer"
    class="h-screen flex flex-col bg-gradient-to-br from-white via-pink-50/30 to-pink-50 overflow-hidden"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  >
    <!-- Background Canvas -->
    <canvas
      ref="canvasRef"
      class="absolute inset-0 w-full h-full pointer-events-none"
    />

    <!-- Main Content -->
    <div class="relative z-10 flex-1 flex items-center justify-center">
      <div class="max-w-4xl mx-auto px-6 text-center">
        <!-- Title -->
        <h1
          class="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter mb-6 animate-fade-in"
        >
          <span
            class="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-400 to-rose-400"
          >
            HypoMap
          </span>
        </h1>

        <!-- Tagline -->
        <h2
          class="text-lg sm:text-xl lg:text-2xl font-semibold text-secondary-700 leading-relaxed mb-4 animate-slide-up"
          style="animation-delay: 100ms"
        >
          Multilevel Contrastive Learning for Uncovering Hidden Biological Hypotheses
        </h2>

        <p
          class="text-base text-secondary-500 max-w-2xl mx-auto leading-relaxed mb-8 animate-slide-up"
          style="animation-delay: 150ms"
        >
          A contrastive learning framework that transforms single-cell transcriptome data into a multi-condition hypothesis discovery system, enabling systematic identification of latent, testable hypotheses.
        </p>

        <!-- Buttons -->
        <div
          class="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up"
          style="animation-delay: 200ms"
        >
          <router-link
            to="/upload"
            class="inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold shadow-xl shadow-pink-200 hover:shadow-pink-300 hover:-translate-y-1 transition-all duration-300"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
            </svg>
            <span>Upload Data</span>
          </router-link>
          <router-link
            to="/atlas/hypomap_demo"
            class="inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-xl bg-white text-secondary-700 font-medium border border-secondary-200 shadow-sm hover:bg-secondary-50 hover:border-secondary-300 transition-all duration-200"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
            <span>Explore Demo</span>
          </router-link>
          <a
            href="https://github.com/Wang-Cankun/hypomap-frontend"
            target="_blank"
            class="inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-xl bg-white text-secondary-700 font-medium border border-secondary-200 shadow-sm hover:bg-secondary-50 hover:border-secondary-300 transition-all duration-200"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"></path>
            </svg>
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="relative z-10 py-6 border-t border-secondary-200/50 bg-white/50 backdrop-blur-sm">
      <div class="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
          </div>
          <span class="font-semibold text-secondary-800">HypoMap</span>
        </div>

        <div class="text-center">
          <a
            href="https://u.osu.edu/bmbl/"
            target="_blank"
            class="text-secondary-600 hover:text-rose-600 transition-colors"
          >
            <span class="font-medium">BMBL</span>
            <span class="text-secondary-400"> - Bioinformatics and Mathematical Biosciences Lab</span>
          </a>
          <div class="text-sm text-secondary-400">
            The Ohio State University
          </div>
        </div>

        <div class="text-sm text-secondary-400">
          &copy; {{ currentYear }} HypoMap
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

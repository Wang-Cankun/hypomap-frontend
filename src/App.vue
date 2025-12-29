<script setup>
import { ref } from "vue";
import { RouterLink, RouterView } from "vue-router";
import { useGeneCart } from "@/composables/useGeneCart";
import { GeneCartDrawer } from "@/components/single-cell";

const isMobileMenuOpen = ref(false);
const isHelpDropdownOpen = ref(false);
const showHelpDropdown = ref(false);
const isGeneCartOpen = ref(false);

// Gene Cart
const { cartItems, addItem, removeItem, clearCart, getItemById } =
  useGeneCart();

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
  if (isMobileMenuOpen.value) {
    isHelpDropdownOpen.value = false;
  }
};

const toggleHelpDropdown = () => {
  isHelpDropdownOpen.value = !isHelpDropdownOpen.value;
};

const toggleHelpDropdownMobile = () => {
  isHelpDropdownOpen.value = !isHelpDropdownOpen.value;
};

// Gene Cart handlers
const handleCartAdd = ({ label, genes, source }) => {
  const geneList = genes
    .split(/[\s,]+/)
    .map((g) => g.trim().toUpperCase())
    .filter((g) => g.length > 0);
  if (geneList.length === 0) {
    alert("Please enter at least one gene.");
    return;
  }
  addItem({
    label: label || "Untitled",
    genes: geneList,
    source: source || "Custom",
  });
};

const handleCartRemove = (id) => {
  removeItem(id);
};

const handleCartClearAll = () => {
  clearCart();
};

const handleCartCopy = async (id) => {
  const item = getItemById(id);
  if (!item) return;
  const genesText = item.genes.join(", ");
  try {
    await navigator.clipboard.writeText(genesText);
    alert(`Copied ${item.genes.length} genes to clipboard!`);
  } catch (err) {
    const textarea = document.createElement("textarea");
    textarea.value = genesText;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    alert(`Copied ${item.genes.length} genes to clipboard!`);
  }
};

const handleCartUse = ({ id, target }) => {
  const item = getItemById(id);
  if (!item) return;
  window.dispatchEvent(
    new CustomEvent("gene-cart-use", {
      detail: { id, target, genes: item.genes, label: item.label },
    })
  );
  isGeneCartOpen.value = false;
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50">
    <nav
      class="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-rose-500 to-pink-600 shadow-lg backdrop-blur-sm"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Mobile menu button -->
          <div class="flex items-center space-x-4">
            <button
              @click="toggleMobileMenu"
              class="md:hidden p-2 rounded-lg text-white hover:bg-rose-400 transition-colors duration-200"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </button>

            <!-- Logo and Brand -->
            <router-link to="/" class="flex items-center space-x-3 group">
              <div class="relative">
                <div
                  class="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-200"
                >
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                </div>
              </div>
              <span
                class="text-2xl font-bold text-white group-hover:text-pink-200 transition-colors duration-200"
              >
                HypoMap
              </span>
            </router-link>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center space-x-1">
            <router-link
              to="/"
              class="nav-link"
              :class="{ 'nav-link-active': $route.path === '/' }"
            >
              <svg
                class="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                ></path>
              </svg>
              Home
            </router-link>

            <router-link
              to="/upload"
              class="nav-link"
              :class="{ 'nav-link-active': $route.path === '/upload' }"
            >
              <svg
                class="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                ></path>
              </svg>
              Upload
            </router-link>

            <router-link
              to="/demo"
              class="nav-link"
              :class="{ 'nav-link-active': $route.path === '/demo' }"
            >
              <svg
                class="w-4 h-4 mr-2"
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
              Demo
            </router-link>

            <!-- Help Dropdown -->
            <div
              class="relative group"
              @mouseenter="showHelpDropdown = true"
              @mouseleave="showHelpDropdown = false"
            >
              <button class="nav-link flex items-center">
                <svg
                  class="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                Help
                <svg
                  class="w-4 h-4 ml-1 transition-transform duration-200 group-hover:rotate-180"
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
              </button>

              <div v-if="showHelpDropdown" class="dropdown-menu">
                <router-link
                  to="/help/methods"
                  class="dropdown-item"
                  @click="toggleHelpDropdown"
                >
                  <svg
                    class="w-4 h-4 mr-2"
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
                  Methods
                </router-link>
                <router-link
                  to="/help/usage"
                  class="dropdown-item"
                  @click="toggleHelpDropdown"
                >
                  <svg
                    class="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    ></path>
                  </svg>
                  Usage
                </router-link>
                <router-link
                  to="/help/faq"
                  class="dropdown-item"
                  @click="toggleHelpDropdown"
                >
                  <svg
                    class="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  FAQ
                </router-link>
                <router-link
                  to="/help/contact"
                  class="dropdown-item"
                  @click="toggleHelpDropdown"
                >
                  <svg
                    class="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    ></path>
                  </svg>
                  Contact
                </router-link>
                <router-link
                  to="/help/news"
                  class="dropdown-item"
                  @click="toggleHelpDropdown"
                >
                  <svg
                    class="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5h-2.5"
                    ></path>
                  </svg>
                  News
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Mobile Menu Overlay -->
    <div
      v-if="isMobileMenuOpen"
      class="fixed inset-0 z-50 bg-gradient-to-br from-rose-500 to-pink-600"
    >
      <div class="flex flex-col h-full">
        <!-- Mobile Header -->
        <div
          class="flex justify-between items-center p-6 border-b border-rose-400"
        >
          <div class="flex items-center space-x-3">
            <div class="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
            <span class="text-2xl font-bold text-white">HypoMap</span>
          </div>
          <button
            @click="toggleMobileMenu"
            class="p-2 rounded-lg text-white hover:bg-rose-400 transition-colors duration-200"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <!-- Mobile Navigation Links -->
        <div class="flex-1 overflow-y-auto p-6 space-y-2">
          <router-link to="/" class="mobile-nav-link" @click="toggleMobileMenu">
            <svg
              class="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              ></path>
            </svg>
            Home
          </router-link>

          <router-link
            to="/upload"
            class="mobile-nav-link"
            @click="toggleMobileMenu"
          >
            <svg
              class="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              ></path>
            </svg>
            Upload
          </router-link>

          <router-link
            to="/demo"
            class="mobile-nav-link"
            @click="toggleMobileMenu"
          >
            <svg
              class="w-5 h-5 mr-3"
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
            Demo
          </router-link>

          <!-- Help Mobile Dropdown -->
          <div class="space-y-1">
            <button
              @click="toggleHelpDropdownMobile"
              class="mobile-nav-link w-full flex items-center justify-between"
            >
              <div class="flex items-center">
                <svg
                  class="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                Help
              </div>
              <svg
                class="w-4 h-4 transition-transform duration-200"
                :class="{ 'rotate-180': isHelpDropdownOpen }"
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
            </button>

            <div v-if="isHelpDropdownOpen" class="ml-8 space-y-1">
              <router-link
                to="/help/methods"
                class="mobile-nav-sub-link"
                @click="toggleMobileMenu"
              >
                Methods
              </router-link>
              <router-link
                to="/help/usage"
                class="mobile-nav-sub-link"
                @click="toggleMobileMenu"
              >
                Usage
              </router-link>
              <router-link
                to="/help/faq"
                class="mobile-nav-sub-link"
                @click="toggleMobileMenu"
              >
                FAQ
              </router-link>
              <router-link
                to="/help/contact"
                class="mobile-nav-sub-link"
                @click="toggleMobileMenu"
              >
                Contact
              </router-link>
              <router-link
                to="/help/news"
                class="mobile-nav-sub-link"
                @click="toggleMobileMenu"
              >
                News
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="pt-16 min-h-screen">
      <router-view></router-view>
    </main>

    <!-- Floating Gene Cart Button -->
    <button
      @click="isGeneCartOpen = true"
      class="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 group"
      :class="{
        'pr-3': cartItems.length > 0,
        'gene-cart-pulse': cartItems.length > 0,
      }"
      title="Open Gene Cart"
    >
      <svg
        class="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
        ></path>
      </svg>
      <span class="font-medium text-sm group-hover:block hidden sm:block"
        >Gene Cart</span
      >
      <span
        v-if="cartItems.length > 0"
        class="flex items-center justify-center min-w-[22px] h-[22px] bg-amber-400 text-pink-900 text-xs font-bold rounded-full px-1.5"
      >
        {{ cartItems.length }}
      </span>
    </button>

    <!-- Gene Cart Drawer -->
    <GeneCartDrawer
      :open="isGeneCartOpen"
      :items="cartItems"
      @close="isGeneCartOpen = false"
      @add="handleCartAdd"
      @remove="handleCartRemove"
      @apply="handleCartUse"
      @copy="handleCartCopy"
      @clearAll="handleCartClearAll"
    />
  </div>
</template>

<style>
/* Custom Tailwind Components */
.nav-link {
  @apply text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-rose-400 hover:text-white flex items-center;
}

.nav-link-active {
  @apply bg-rose-400 text-white shadow-md;
}

.dropdown-menu {
  @apply absolute top-full left-0 z-50 bg-white shadow-xl rounded-lg border border-secondary-200 min-w-48 py-2 opacity-0 invisible transition-all duration-200 group-hover:opacity-100 group-hover:visible;
}

.dropdown-item {
  @apply block px-4 py-2 text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900 transition-colors duration-200 flex items-center;
}

.mobile-nav-link {
  @apply block text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 hover:bg-rose-400 hover:text-white flex items-center text-lg;
}

.mobile-nav-sub-link {
  @apply block text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-rose-400 hover:text-white flex items-center text-base;
}

/* Custom animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.3s ease-out;
}

/* Smooth transitions for dropdowns */
.group:hover .dropdown-menu {
  @apply opacity-100 visible;
}

/* Floating Gene Cart Button pulse animation */
@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.4;
  }
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
}

.gene-cart-pulse::before {
  content: "";
  position: absolute;
  inset: -3px;
  border-radius: 9999px;
  background: linear-gradient(
    135deg,
    var(--color-rose-300),
    var(--color-amber-400)
  );
  z-index: -1;
  animation: pulse-ring 2s ease-in-out infinite;
}
</style>

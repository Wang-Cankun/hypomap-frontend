<template>
  <div
    class="fixed bg-white rounded-xl shadow-2xl z-50 border border-secondary-200 overflow-hidden transition-all duration-300"
    :class="{ 'shadow-3xl': isExpanded }"
    :style="{
      left: `${x}px`,
      bottom: `${bottomPosition}px`,
      width: `${width}px`,
      height: isExpanded ? `${height}px` : 'auto',
    }"
  >
    <button
      class="w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white border-none rounded-t-xl cursor-grab hover:from-primary-700 hover:to-primary-800 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
      @click="toggleChat"
      @mousedown="startDrag"
    >
      e
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
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        ></path>
      </svg>
      {{ isExpanded ? "Close Chat" : "Open Chat (AI agent assistant)" }}
    </button>

    <div v-if="isExpanded" class="flex flex-col h-full">
      <div
        class="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-secondary-50 to-white"
        ref="messagesContainer"
      >
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="[
            'mb-4 p-4 rounded-2xl max-w-[80%] shadow-sm',
            message.type === 'user'
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white ml-auto'
              : 'bg-white border border-secondary-200 text-secondary-800 mr-auto',
          ]"
        >
          <div class="flex items-start gap-3">
            <div
              v-if="message.type === 'bot'"
              class="w-8 h-8 bg-gradient-to-r from-accent-400 to-accent-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
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
            <div class="flex-1">
              <div class="text-sm leading-relaxed">{{ message.text }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="p-4 border-t border-secondary-200 bg-white">
        <div class="flex gap-3">
          <input
            v-model="newMessage"
            @keyup.enter="sendMessage"
            placeholder="Type your message..."
            type="text"
            class="flex-1 px-4 py-3 border border-secondary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-secondary-50 focus:bg-white"
          />
          <button
            @click="sendMessage"
            class="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white border-none rounded-xl cursor-pointer hover:from-primary-600 hover:to-primary-700 transition-all duration-200 font-medium flex items-center gap-2"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              ></path>
            </svg>
            Send
          </button>
        </div>
      </div>
      <div
        class="absolute bottom-0 right-0 w-4 h-4 bg-transparent z-50 cursor-se-resize"
        @mousedown.stop="startResize('bottom-right')"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";

const isExpanded = ref(false);
const messages = ref([
  {
    type: "bot",
    text: "Hello! Welcome to HypoMap – your AI-powered assistant for exploring single-cell datasets, uncovering hidden biological hypotheses, and navigating analysis workflows through natural language.",
  },
]);
const newMessage = ref("");
const messagesContainer = ref(null);

const x = ref(window.innerWidth - 520); // Default right position for left
const bottomPosition = ref(20); // Default bottom position (approx 20px for 2rem)
const width = ref(500);
const height = ref(400);

let isDragging = false;
let dragOffsetX, dragOffsetY;
let isResizing = false;
let resizeHandle = "";

const toggleChat = () => {
  isExpanded.value = !isExpanded.value;
};

const startDrag = (event) => {
  // Only drag if not clicking on the resize handle
  if (event.target.classList.contains("resize-handle")) {
    return;
  }
  isDragging = true;
  dragOffsetX = event.clientX - x.value;
  // Calculate offset from bottom edge for dragging
  dragOffsetY = window.innerHeight - event.clientY - bottomPosition.value;
  document.addEventListener("mousemove", dragChatBox);
  document.addEventListener("mouseup", stopDrag);
};

const dragChatBox = (event) => {
  if (!isDragging) return;
  x.value = event.clientX - dragOffsetX;
  // Update bottom position based on new mouse Y and initial offset
  bottomPosition.value = window.innerHeight - event.clientY - dragOffsetY;
};

const stopDrag = () => {
  isDragging = false;
  document.removeEventListener("mousemove", dragChatBox);
  document.removeEventListener("mouseup", stopDrag);
};

const startResize = (handle) => {
  isResizing = true;
  resizeHandle = handle;
  document.addEventListener("mousemove", resizeChatBox);
  document.addEventListener("mouseup", stopResize);
};

const resizeChatBox = (event) => {
  if (!isResizing) return;

  const minWidth = 300;
  const minHeight = 200;

  if (resizeHandle === "bottom-right") {
    const newWidth = event.clientX - x.value;
    // Calculate new height based on current mouse Y and current bottom position
    const newHeight = window.innerHeight - event.clientY - bottomPosition.value;
    width.value = Math.max(newWidth, minWidth);
    height.value = Math.max(newHeight, minHeight);
  }
};

const stopResize = () => {
  isResizing = false;
  resizeHandle = "";
  document.removeEventListener("mousemove", resizeChatBox);
  document.removeEventListener("mouseup", stopResize);
};

const sendMessage = async () => {
  if (!newMessage.value.trim()) return;

  messages.value.push({ type: "user", text: newMessage.value });
  newMessage.value = "";

  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }

  // Simulate bot response
  setTimeout(() => {
    messages.value.push({
      type: "bot",
      text: "I received your message. How can I assist you further?",
    });
  }, 1000);
};
</script>

<style scoped>
/* Custom Tailwind Components for ChatBox */
</style>

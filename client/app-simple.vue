<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold text-red-400 mb-4">Visual Editor Demo</h1>

    <div class="bg-gray-50 rounded-lg p-4 mb-4">
      <h2 class="text-lg font-semibold mb-2">Simple Visual Editor</h2>
      <p class="text-gray-700 mb-4">
        Click on elements in the React app below to select and edit them.
        Changes are preview-only and don't modify the source code.
      </p>
      <div class="flex gap-2 flex-wrap">
        <button
          @click="toggleEditMode"
          class="px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          :class="
            isEditModeEnabled
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          "
        >
          {{ isEditModeEnabled ? "Exit Edit Mode" : "Enable Edit Mode" }}
        </button>

        <button
          v-if="selectedElement"
          @click="clearSelection"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Clear Selection
        </button>
      </div>
    </div>

    <!-- Element Editor Panel -->
    <div
      v-if="selectedElement"
      class="bg-white border border-gray-300 rounded-lg p-4 mb-4 shadow-sm"
    >
      <h3 class="text-lg font-semibold mb-3">Edit Selected Element</h3>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Element Info -->
        <div>
          <h4 class="font-medium text-gray-700 mb-2">Element Info</h4>
          <div class="text-sm text-gray-600 space-y-1">
            <p>
              <span class="font-medium">Tag:</span>
              {{ selectedElement.tagName }}
            </p>
            <p>
              <span class="font-medium">Text:</span>
              {{
                selectedElement.textContent
                  ? selectedElement.textContent.substring(0, 50) + "..."
                  : "No text"
              }}
            </p>
            <p>
              <span class="font-medium">Classes:</span>
              {{ selectedElement.className || "None" }}
            </p>
          </div>
        </div>

        <!-- Text Editor -->
        <div>
          <h4 class="font-medium text-gray-700 mb-2">Text Content</h4>
          <div class="space-y-2">
            <textarea
              v-model="editingText"
              @input="updateElementText"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              rows="3"
              placeholder="Element text content"
            ></textarea>
          </div>
        </div>

        <!-- Style Controls -->
        <div>
          <h4 class="font-medium text-gray-700 mb-2">Quick Styles</h4>
          <div class="space-y-2">
            <!-- Text Color -->
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1"
                >Text Color</label
              >
              <div class="flex gap-1 flex-wrap">
                <button
                  v-for="color in colorOptions"
                  :key="color.value"
                  @click="updateStyle('color', color.value)"
                  class="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                  :style="{ backgroundColor: color.value }"
                  :title="color.name"
                ></button>
              </div>
            </div>

            <!-- Background Color -->
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1"
                >Background</label
              >
              <div class="flex gap-1 flex-wrap">
                <button
                  v-for="color in backgroundOptions"
                  :key="color.value"
                  @click="updateStyle('backgroundColor', color.value)"
                  class="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                  :style="{ backgroundColor: color.value }"
                  :title="color.name"
                ></button>
              </div>
            </div>

            <!-- Font Size -->
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1"
                >Font Size</label
              >
              <select
                @change="updateStyle('fontSize', $event.target.value)"
                class="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="">Default</option>
                <option value="12px">12px</option>
                <option value="14px">14px</option>
                <option value="16px">16px</option>
                <option value="18px">18px</option>
                <option value="20px">20px</option>
                <option value="24px">24px</option>
                <option value="32px">32px</option>
                <option value="48px">48px</option>
              </select>
            </div>

            <!-- Padding -->
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1"
                >Padding</label
              >
              <select
                @change="updateStyle('padding', $event.target.value)"
                class="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="">Default</option>
                <option value="4px">4px</option>
                <option value="8px">8px</option>
                <option value="12px">12px</option>
                <option value="16px">16px</option>
                <option value="20px">20px</option>
                <option value="24px">24px</option>
                <option value="32px">32px</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Reset Button -->
      <div class="mt-4 pt-4 border-t border-gray-200">
        <button
          @click="resetElement"
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
        >
          Reset to Original
        </button>
      </div>
    </div>

    <!-- React App Iframe -->
    <div class="border border-gray-300 rounded-lg overflow-hidden">
      <div class="bg-gray-100 p-2 flex justify-between items-center">
        <span class="font-medium">React App Preview</span>
        <div class="flex gap-2 items-center">
          <span v-if="isEditModeEnabled" class="text-sm text-green-600">
            ✓ Edit Mode Active
          </span>
          <a
            href="http://localhost:5173"
            target="_blank"
            class="text-blue-500 hover:underline text-sm"
            >Open in new tab</a
          >
        </div>
      </div>
      <iframe
        src="http://localhost:5173"
        class="w-full h-[600px] border-0"
        title="React App Preview"
        ref="reactFrame"
        @load="onIframeLoad"
      ></iframe>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";

const reactFrame = ref(null);
const isEditModeEnabled = ref(false);
const selectedElement = ref(null);
const editingText = ref("");
const originalStyles = ref(new Map());

// Color options
const colorOptions = [
  { name: "Black", value: "#000000" },
  { name: "Dark Gray", value: "#374151" },
  { name: "Gray", value: "#6B7280" },
  { name: "Red", value: "#EF4444" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Green", value: "#10B981" },
  { name: "Yellow", value: "#F59E0B" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Pink", value: "#EC4899" },
  { name: "Indigo", value: "#6366F1" },
];

const backgroundOptions = [
  { name: "Transparent", value: "transparent" },
  { name: "White", value: "#FFFFFF" },
  { name: "Light Gray", value: "#F3F4F6" },
  { name: "Gray", value: "#E5E7EB" },
  { name: "Red", value: "#FEE2E2" },
  { name: "Blue", value: "#DBEAFE" },
  { name: "Green", value: "#D1FAE5" },
  { name: "Yellow", value: "#FEF3C7" },
  { name: "Purple", value: "#E9D5FF" },
  { name: "Pink", value: "#FCE7F3" },
];

const toggleEditMode = () => {
  isEditModeEnabled.value = !isEditModeEnabled.value;

  if (!isEditModeEnabled.value) {
    clearSelection();
    removeEditListeners();
  } else {
    setupEditMode();
  }
};

const clearSelection = () => {
  if (selectedElement.value) {
    // Remove selection styling
    selectedElement.value.style.outline = "";
    selectedElement.value.style.outlineOffset = "";
  }
  selectedElement.value = null;
  editingText.value = "";
};

const removeEditListeners = () => {
  if (!reactFrame.value?.contentDocument) return;

  const iframeDoc = reactFrame.value.contentDocument;
  iframeDoc.body.style.cursor = "";

  // Note: In a real implementation, you'd want to store the event listeners
  // so you can properly remove them. For this demo, we'll just reload the iframe
  // when edit mode is disabled to clean up the listeners.
};

const setupEditMode = () => {
  if (!reactFrame.value?.contentDocument) return;

  const iframeDoc = reactFrame.value.contentDocument;

  // Add click event listener to iframe document
  iframeDoc.addEventListener("click", handleElementClick, true);

  // Add hover effects
  iframeDoc.addEventListener("mouseover", handleElementHover, true);
  iframeDoc.addEventListener("mouseout", handleElementHoverOut, true);

  // Add cursor style for edit mode
  iframeDoc.body.style.cursor = "crosshair";
};

const handleElementClick = (event) => {
  if (!isEditModeEnabled.value) return;

  event.preventDefault();
  event.stopPropagation();

  const element = event.target;
  selectElement(element);
};

const handleElementHover = (event) => {
  if (!isEditModeEnabled.value || event.target === selectedElement.value)
    return;

  event.target.style.outline = "2px dashed #FFB800";
  event.target.style.outlineOffset = "2px";
};

const handleElementHoverOut = (event) => {
  if (!isEditModeEnabled.value || event.target === selectedElement.value)
    return;

  event.target.style.outline = "";
  event.target.style.outlineOffset = "";
};

const selectElement = (element) => {
  // Clear previous selection
  clearSelection();

  // Select new element
  selectedElement.value = element;
  editingText.value = element.textContent || "";

  // Store original styles if not already stored
  if (!originalStyles.value.has(element)) {
    const computedStyle = window.getComputedStyle(element);
    originalStyles.value.set(element, {
      color: computedStyle.color,
      backgroundColor: computedStyle.backgroundColor,
      fontSize: computedStyle.fontSize,
      padding: computedStyle.padding,
      textContent: element.textContent,
    });
  }

  // Add selection styling
  element.style.outline = "2px solid #00A3FF";
  element.style.outlineOffset = "2px";
};

const updateElementText = () => {
  if (!selectedElement.value) return;

  selectedElement.value.textContent = editingText.value;
};

const updateStyle = (property, value) => {
  if (!selectedElement.value) return;

  selectedElement.value.style[property] = value;
};

const resetElement = () => {
  if (!selectedElement.value) return;

  const original = originalStyles.value.get(selectedElement.value);
  if (original) {
    selectedElement.value.style.color = original.color;
    selectedElement.value.style.backgroundColor = original.backgroundColor;
    selectedElement.value.style.fontSize = original.fontSize;
    selectedElement.value.style.padding = original.padding;
    selectedElement.value.textContent = original.textContent;
    editingText.value = original.textContent || "";
  }
};

const onIframeLoad = () => {
  console.log("Iframe loaded");

  if (isEditModeEnabled.value) {
    nextTick(() => {
      setupEditMode();
    });
  }
};

onMounted(() => {
  console.log("Visual editor mounted");
});
</script>

<style scoped>
/* Add any additional styling here */
</style>

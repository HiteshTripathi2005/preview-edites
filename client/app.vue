<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold text-red-400 mb-4">React Element Inspector Demo</h1>

    <div class="bg-gray-50 rounded-lg p-4 mb-4">
      <h2 class="text-lg font-semibold mb-2">Built-in Element Inspector</h2>
      <p class="text-gray-700 mb-4">
        The React app now has a built-in element inspector similar to browser dev tools. 
        Look for the blue 🔍 button in the top-right corner of the React app below.
      </p>
      <div class="bg-blue-50 border border-blue-200 rounded p-3">
        <h3 class="font-medium text-blue-800 mb-2">How to use:</h3>
        <ul class="text-sm text-blue-700 space-y-1">
          <li>• Click the 🔍 button in the React app to open the inspector</li>
          <li>• Click "Inspect Element" to enter inspection mode</li>
          <li>• Click on any element to select and edit it</li>
          <li>• Use the inspector panel to change text, colors, and styles</li>
          <li>• Press <kbd class="bg-blue-100 px-1 rounded">Ctrl+Shift+I</kbd> to toggle the inspector</li>
          <li>• Press <kbd class="bg-blue-100 px-1 rounded">Escape</kbd> to exit inspection mode</li>
        </ul>
      </div>
    </div>

    <!-- React App Iframe -->
    <div class="border border-gray-300 rounded-lg overflow-hidden">
      <div class="bg-gray-100 p-2 flex justify-between items-center">
        <span class="font-medium">React App with Element Inspector</span>
        <a
          href="http://localhost:5173"
          target="_blank"
          class="text-blue-500 hover:underline text-sm"
        >Open in new tab</a>
      </div>
      <iframe
        src="http://localhost:5173"
        class="w-full h-[700px] border-0"
        title="React App with Element Inspector"
        ref="reactFrame"
      ></iframe>
    </div>    <div class="mt-4 text-sm text-gray-600">
      <p><strong>Note:</strong> All changes are preview-only and don't modify the source code. 
      This is perfect for design iteration and prototyping.</p>
    </div>

    <!-- Array Context Information Panel -->
    <div v-if="selectedElementInfo || lastUpdate" class="mt-6 space-y-4">      <!-- Selected Element Info -->
      <div v-if="selectedElementInfo" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 class="font-medium text-blue-800 mb-2">🎯 Selected Element</h3>
        <div class="text-sm text-blue-700 space-y-1">
          <p><strong>Element ID:</strong> {{ selectedElementInfo.id }}</p>
          <p><strong>Tag:</strong> {{ selectedElementInfo.elementInfo?.tagName }}</p>
          <p><strong>Time:</strong> {{ selectedElementInfo.timestamp }}</p>
          
          <!-- Component Context -->
          <div v-if="selectedElementInfo.componentContext" class="mt-2 p-2 bg-purple-100 rounded">
            <p class="font-medium text-purple-800">🧩 Component Context:</p>
            <ul class="mt-1 space-y-1">
              <li><strong>Component:</strong> {{ selectedElementInfo.componentContext.componentName }}</li>
              <li><strong>File:</strong> {{ selectedElementInfo.componentContext.fileName }}</li>
              <li v-if="selectedElementInfo.componentContext.arrayName"><strong>Array:</strong> {{ selectedElementInfo.componentContext.arrayName }}[{{ selectedElementInfo.componentContext.arrayIndex }}]</li>
            </ul>
          </div>
          
          <div v-if="selectedElementInfo.arrayContext?.isArrayElement" class="mt-2 p-2 bg-blue-100 rounded">
            <p class="font-medium text-blue-800">📋 Array Context:</p>
            <ul class="mt-1 space-y-1">
              <li><strong>Array Name:</strong> {{ selectedElementInfo.arrayContext.arrayName }}</li>
              <li><strong>Index:</strong> {{ selectedElementInfo.arrayContext.index }}</li>
              <li><strong>Property:</strong> {{ selectedElementInfo.arrayContext.property }}</li>
            </ul>
          </div>
          
          <div v-else class="mt-2 p-2 bg-gray-100 rounded">
            <p class="text-gray-600">Not an array element</p>
          </div>
        </div>
      </div>

      <!-- Last Update Info -->
      <div v-if="lastUpdate" class="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 class="font-medium text-green-800 mb-2">🔄 Last Update</h3>
        <div class="text-sm text-green-700 space-y-1">
          <p><strong>Element ID:</strong> {{ lastUpdate.id }}</p>
          <p><strong>Property:</strong> {{ lastUpdate.property }}</p>
          <p><strong>New Value:</strong> {{ lastUpdate.value }}</p>
          <p><strong>Time:</strong> {{ lastUpdate.timestamp }}</p>
          
          <!-- Component Context -->
          <div v-if="lastUpdate.componentContext" class="mt-2 p-2 bg-purple-100 rounded">
            <p class="font-medium text-purple-800">🧩 Component Context:</p>
            <ul class="mt-1 space-y-1">
              <li><strong>Component:</strong> {{ lastUpdate.componentContext.componentName }}</li>
              <li><strong>File:</strong> {{ lastUpdate.componentContext.fileName }}</li>
              <li v-if="lastUpdate.componentContext.arrayName"><strong>Array:</strong> {{ lastUpdate.componentContext.arrayName }}[{{ lastUpdate.componentContext.arrayIndex }}]</li>
            </ul>
          </div>
          
          <div v-if="lastUpdate.arrayContext?.isArrayElement" class="mt-2 p-2 bg-green-100 rounded">
            <p class="font-medium text-green-800">📋 Array Context:</p>
            <ul class="mt-1 space-y-1">
              <li><strong>Array Name:</strong> {{ lastUpdate.arrayContext.arrayName }}</li>
              <li><strong>Index:</strong> {{ lastUpdate.arrayContext.index }}</li>
              <li><strong>Property:</strong> {{ lastUpdate.arrayContext.property }}</li>
            </ul>
            <p class="mt-2 text-green-600 font-medium">
              ✅ Updated: {{ lastUpdate.componentContext?.componentName }}.{{ lastUpdate.arrayContext.arrayName }}[{{ lastUpdate.arrayContext.index }}].{{ lastUpdate.arrayContext.property }}
            </p>
          </div>
          
          <div v-else class="mt-2 p-2 bg-green-100 rounded">
            <p class="mt-2 text-green-600 font-medium">
              ✅ Updated: {{ lastUpdate.componentContext?.componentName }}.{{ lastUpdate.property }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const reactFrame = ref(null);
const selectedElementInfo = ref(null);
const lastUpdate = ref(null);

onMounted(() => {
  console.log("React app with element inspector loaded");

  // Add message listener for cross-origin communication from React app
  window.addEventListener("message", (event) => {
    // Ensure the message is from the trusted React app origin
    if (event.origin === "http://localhost:5173") {
      const message = event.data;
        if (message.type === "ELEMENT_SELECTED" && message.id) {
        selectedElementInfo.value = {
          id: message.id,
          arrayContext: message.arrayContext,
          componentContext: message.componentContext,
          elementInfo: message.elementInfo,
          timestamp: new Date().toLocaleTimeString()
        };
        
        console.log("Enhanced element selection with component info:", message);
        
        if (message.arrayContext?.isArrayElement) {
          console.log(`🎯 Array Element Selected:
            Component: ${message.componentContext?.componentName} (${message.componentContext?.fileName})
            Array Name: ${message.arrayContext.arrayName}
            Index: ${message.arrayContext.index}
            Property: ${message.arrayContext.property}
            Element ID: ${message.id}`);
        } else {
          console.log(`🎯 Element Selected:
            Component: ${message.componentContext?.componentName} (${message.componentContext?.fileName})
            Element ID: ${message.id}`);
        }
        
      } else if (message.type === "ELEMENT_UPDATED" && message.id && message.property) {
        lastUpdate.value = {
          id: message.id,
          property: message.property,
          value: message.value,
          arrayContext: message.arrayContext,
          componentContext: message.componentContext,
          timestamp: new Date().toLocaleTimeString()
        };
        
        console.log("Enhanced element update with component info:", message);
        
        if (message.arrayContext?.isArrayElement) {
          console.log(`🔄 Array Element Updated:
            Component: ${message.componentContext?.componentName} (${message.componentContext?.fileName})
            Array Name: ${message.arrayContext.arrayName}
            Index: ${message.arrayContext.index}
            Property: ${message.arrayContext.property}
            Element Property: ${message.property}
            New Value: ${message.value}`);
        } else {
          console.log(`🔄 Element Updated:
            Component: ${message.componentContext?.componentName} (${message.componentContext?.fileName})
            Element Property: ${message.property}
            New Value: ${message.value}`);
        }
      }
    }
  });
});
</script>

<style scoped>
kbd {
  font-family: monospace;
  font-size: 0.9em;
}
</style>

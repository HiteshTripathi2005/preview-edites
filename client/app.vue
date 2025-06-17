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
    </div>

    <div class="mt-4 text-sm text-gray-600">
      <p><strong>Note:</strong> All changes are preview-only and don't modify the source code. 
      This is perfect for design iteration and prototyping.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const reactFrame = ref(null);

onMounted(() => {
  console.log("React app with element inspector loaded");
});
</script>

<style scoped>
kbd {
  font-family: monospace;
  font-size: 0.9em;
}
</style>

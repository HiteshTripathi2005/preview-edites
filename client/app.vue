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
    <div v-if="selectedElementInfo || lastUpdate" class="mt-6 space-y-4">      <!-- Selected Element Info -->      <div v-if="selectedElementInfo" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 class="font-medium text-blue-800 mb-2">🎯 Selected Element</h3>        <div class="text-sm text-blue-700 space-y-1">
          <p><strong>Element ID:</strong> {{ selectedElementInfo.id }}</p>
          <p v-if="selectedElementInfo.elementInfo?.attributes['data-static-id']"><strong>Static ID:</strong> {{ selectedElementInfo.elementInfo.attributes['data-static-id'] }}</p>
          <p><strong>Tag:</strong> {{ selectedElementInfo.elementInfo?.tagName }}</p>
          <p><strong>Classes:</strong> {{ selectedElementInfo.elementInfo?.className || 'None' }}</p>
          <p><strong>Text:</strong> "{{ selectedElementInfo.elementInfo?.textContent?.substring(0, 50) }}{{ selectedElementInfo.elementInfo?.textContent?.length > 50 ? '...' : '' }}"</p>
          <p><strong>Selected at:</strong> {{ selectedElementInfo.timestamp }}</p>
          
          <!-- Element Position & Size -->
          <div v-if="selectedElementInfo.elementInfo?.position" class="mt-2 p-2 bg-blue-100 rounded">
            <p class="font-medium text-blue-800">📐 Position & Size:</p>
            <div class="mt-1 grid grid-cols-2 gap-2 text-xs">
              <div>
                <p><strong>Top:</strong> {{ selectedElementInfo.elementInfo.position.offsetTop }}px</p>
                <p><strong>Left:</strong> {{ selectedElementInfo.elementInfo.position.offsetLeft }}px</p>
              </div>
              <div>
                <p><strong>Width:</strong> {{ selectedElementInfo.elementInfo.position.offsetWidth }}px</p>
                <p><strong>Height:</strong> {{ selectedElementInfo.elementInfo.position.offsetHeight }}px</p>
              </div>
            </div>
          </div>
          
          <!-- Component Context -->
          <div v-if="selectedElementInfo.componentContext" class="mt-2 p-2 bg-purple-100 rounded">
            <p class="font-medium text-purple-800">🧩 Component Context:</p>
            <ul class="mt-1 space-y-1 text-xs">
              <li><strong>Component:</strong> {{ selectedElementInfo.componentContext.componentName }}</li>
              <li><strong>File:</strong> {{ selectedElementInfo.componentContext.fileName }}</li>
              <li v-if="selectedElementInfo.componentContext.arrayName"><strong>Array:</strong> {{ selectedElementInfo.componentContext.arrayName }}[{{ selectedElementInfo.componentContext.arrayIndex }}]</li>
            </ul>
          </div>
            <div v-if="selectedElementInfo.arrayContext?.isArrayElement" class="mt-2 p-2 bg-blue-100 rounded">
            <p class="font-medium text-blue-800">📋 Array Context:</p>
            <ul class="mt-1 space-y-1 text-xs">
              <li><strong>Array Name:</strong> {{ selectedElementInfo.arrayContext.arrayName }}</li>
              <li><strong>Index:</strong> {{ selectedElementInfo.arrayContext.index }}</li>
              <li><strong>Total Elements:</strong> {{ selectedElementInfo.arrayContext.totalElements }}</li>
            </ul>
            
            <!-- Dual ID System for Array Elements -->
            <div v-if="selectedElementInfo.elementInfo?.attributes['data-static-id']" class="mt-2 p-2 bg-yellow-100 rounded border border-yellow-300">
              <p class="font-medium text-yellow-800">🔗 Dual ID System:</p>
              <ul class="mt-1 space-y-1 text-xs">
                <li><strong>Dynamic ID:</strong> {{ selectedElementInfo.id }} <span class="text-yellow-600">(for individual styling)</span></li>
                <li><strong>Static ID:</strong> {{ selectedElementInfo.elementInfo.attributes['data-static-id'] }} <span class="text-yellow-600">(for styling all similar elements)</span></li>
              </ul>
              <p class="mt-2 text-xs text-yellow-700">
                💡 Use the dynamic ID to style individual items, or the static ID to style all items in this array.
              </p>
            </div>
          </div>
          
          <div v-else class="mt-2 p-2 bg-gray-100 rounded">
            <p class="text-gray-600 text-xs">Not an array element</p>
          </div>
        </div>
      </div><!-- Last Update Info -->
      <div v-if="lastUpdate" class="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 class="font-medium text-green-800 mb-2">🔄 Last Change</h3>        <div class="text-sm text-green-700 space-y-1">
          <p><strong>Element ID:</strong> {{ lastUpdate.id }}</p>
          <p v-if="lastUpdate.element?.attributes && lastUpdate.element.attributes['data-static-id']"><strong>Static ID:</strong> {{ lastUpdate.element.attributes['data-static-id'] }}</p>
          <p><strong>Change Type:</strong> {{ lastUpdate.changeType || lastUpdate.property }}</p>
          <p><strong>New Value:</strong> {{ lastUpdate.value }}</p>
          <p><strong>Time:</strong> {{ lastUpdate.timestamp }}</p>
          
          <!-- Change Details -->
          <div v-if="lastUpdate.changeData" class="mt-2 p-2 bg-green-100 rounded">
            <p class="font-medium text-green-800">📝 Change Details:</p>
            <div class="mt-1 space-y-1 text-xs">
              <div v-if="lastUpdate.changeType === 'text'">
                <p><strong>Old Text:</strong> "{{ lastUpdate.changeData.oldText }}"</p>
                <p><strong>New Text:</strong> "{{ lastUpdate.changeData.newText }}"</p>
              </div>
              <div v-else-if="lastUpdate.changeType === 'textColor' || lastUpdate.changeType === 'backgroundColor'">
                <p><strong>Color:</strong> {{ lastUpdate.changeData.colorData?.name }} ({{ lastUpdate.changeData.colorData?.value }})</p>
                <p><strong>Tailwind Class:</strong> {{ lastUpdate.changeData.colorData?.tailwind }}</p>
              </div>
              <div v-else-if="lastUpdate.changeType === 'style'">
                <p><strong>Property:</strong> {{ lastUpdate.changeData.property }}</p>
                <p><strong>New Class:</strong> {{ lastUpdate.changeData.newClass }}</p>
                <p v-if="lastUpdate.changeData.removedClasses?.length"><strong>Removed Classes:</strong> {{ lastUpdate.changeData.removedClasses.join(', ') }}</p>
              </div>
              <div v-else-if="lastUpdate.changeType === 'reset'">
                <p><strong>Action:</strong> Element reset to original state</p>
                <p v-if="lastUpdate.changeData.affectedElementsCount > 1"><strong>Affected Elements:</strong> {{ lastUpdate.changeData.affectedElementsCount }}</p>
              </div>
            </div>
          </div>
          
          <!-- Similar Elements Info -->
          <div v-if="lastUpdate.similarElementsCount > 0" class="mt-2 p-2 bg-blue-100 rounded">
            <p class="font-medium text-blue-800">🔗 Similar Elements:</p>
            <p class="text-xs mt-1">{{ lastUpdate.similarElementsCount }} similar elements were updated simultaneously</p>
          </div>
          
          <!-- Component Context -->
          <div v-if="lastUpdate.componentContext" class="mt-2 p-2 bg-purple-100 rounded">
            <p class="font-medium text-purple-800">🧩 Component Context:</p>
            <ul class="mt-1 space-y-1 text-xs">
              <li><strong>Component:</strong> {{ lastUpdate.componentContext.componentName }}</li>
              <li><strong>File:</strong> {{ lastUpdate.componentContext.fileName }}</li>
              <li v-if="lastUpdate.componentContext.arrayName"><strong>Array:</strong> {{ lastUpdate.componentContext.arrayName }}[{{ lastUpdate.componentContext.arrayIndex }}]</li>
            </ul>
          </div>
          
          <div v-if="lastUpdate.arrayContext?.isArrayElement" class="mt-2 p-2 bg-green-100 rounded">
            <p class="font-medium text-green-800">📋 Array Context:</p>
            <ul class="mt-1 space-y-1 text-xs">
              <li><strong>Array Name:</strong> {{ lastUpdate.arrayContext.arrayName }}</li>
              <li><strong>Index:</strong> {{ lastUpdate.arrayContext.index }}</li>
              <li><strong>Total Elements:</strong> {{ lastUpdate.arrayContext.totalElements }}</li>
            </ul>
            <p class="mt-2 text-green-600 font-medium text-xs">
              ✅ Updated: {{ lastUpdate.componentContext?.componentName }}.{{ lastUpdate.arrayContext.arrayName }}[{{ lastUpdate.arrayContext.index }}]
            </p>
          </div>
          
          <div v-else class="mt-2 p-2 bg-green-100 rounded">
            <p class="mt-2 text-green-600 font-medium text-xs">
              ✅ Updated: {{ lastUpdate.componentContext?.componentName }}.{{ lastUpdate.changeType || lastUpdate.property }}
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
      
      // Handle new ElementInspector changes
      if (message.type === "ELEMENT_INSPECTOR_CHANGE" && message.data) {
        const { changeType, changeData, element, arrayInfo, similarElements } = message.data;
        
        // Update selected element info
        selectedElementInfo.value = {
          id: element.id,
          elementInfo: {
            tagName: element.tagName,
            className: element.className,
            textContent: element.textContent,
            attributes: element.attributes,
            styles: element.styles,
            position: element.position,
            boundingRect: element.boundingRect
          },
          arrayContext: arrayInfo ? {
            isArrayElement: true,
            arrayName: arrayInfo.arrayName,
            index: arrayInfo.arrayIndex,
            totalElements: arrayInfo.totalElements,
            property: element.tagName
          } : {
            isArrayElement: false
          },
          componentContext: {
            componentName: element.attributes['data-component'],
            fileName: element.attributes['data-file'],
            arrayName: element.attributes['data-array'],
            arrayIndex: element.attributes['data-array-index']
          },
          timestamp: new Date(message.data.timestamp).toLocaleTimeString()
        };
          // Update last change info
        lastUpdate.value = {
          id: element.id,
          changeType,
          changeData,
          element: element, // Include full element info
          property: changeData.property || changeType,
          value: getChangeValue(changeType, changeData),
          arrayContext: arrayInfo ? {
            isArrayElement: true,
            arrayName: arrayInfo.arrayName,
            index: arrayInfo.arrayIndex,
            property: element.tagName
          } : {
            isArrayElement: false
          },
          componentContext: {
            componentName: element.attributes['data-component'],
            fileName: element.attributes['data-file'],
            arrayName: element.attributes['data-array'],
            arrayIndex: element.attributes['data-array-index']
          },
          timestamp: new Date(message.data.timestamp).toLocaleTimeString(),
          similarElementsCount: similarElements.length
        };
        
        console.log("� ElementInspector Change:", {
          changeType,
          element: element.id,
          component: element.attributes['data-component'],
          file: element.attributes['data-file'],
          changeData,
          arrayInfo,
          similarElementsCount: similarElements.length
        });
        
      } else if (message.type === "ELEMENT_SELECTED" && message.id) {
        // Handle legacy element selection (for backward compatibility)
        selectedElementInfo.value = {
          id: message.id,
          arrayContext: message.arrayContext,
          componentContext: message.componentContext,
          elementInfo: message.elementInfo,
          timestamp: new Date().toLocaleTimeString()
        };
        
      } else if (message.type === "ELEMENT_UPDATED" && message.id && message.property) {
        // Handle legacy element updates (for backward compatibility)
        lastUpdate.value = {
          id: message.id,
          property: message.property,
          value: message.value,
          arrayContext: message.arrayContext,
          componentContext: message.componentContext,
          timestamp: new Date().toLocaleTimeString()
        };
      }
    }
  });
});

// Helper function to extract readable value from change data
const getChangeValue = (changeType, changeData) => {
  switch (changeType) {
    case 'text':
      return changeData.newText;
    case 'textColor':
    case 'backgroundColor':
      return `${changeData.colorData?.name} (${changeData.colorData?.value})`;
    case 'style':
      return `${changeData.property}: ${changeData.newClass}`;
    case 'reset':
      return 'Element reset to original state';
    default:
      return JSON.stringify(changeData);
  }
};
</script>

<style scoped>
kbd {
  font-family: monospace;
  font-size: 0.9em;
}
</style>

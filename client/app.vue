<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold text-red-400 mb-4">React Element Inspector Demo</h1>    <div class="bg-gray-50 rounded-lg p-4 mb-4">
      <h2 class="text-lg font-semibold mb-2">Remote Element Inspector Control</h2>
      <p class="text-gray-700 mb-4">
        Control the React app's element inspector from here. The inspector allows you to visually select and edit elements with real-time feedback.
      </p>
        <!-- Inspector Status -->
      <div class="bg-white border border-gray-200 rounded p-3 mb-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 rounded-full" :class="inspectorStatus.active ? 'bg-green-500 animate-pulse' : 'bg-gray-300'"></div>
              <span class="text-sm font-medium">Status:</span>
              <span class="text-sm" :class="inspectorStatus.active ? 'text-green-600' : 'text-gray-500'">
                {{ inspectorStatus.message }}
              </span>
            </div>
            <div v-if="selectedElementInfo" class="flex items-center space-x-2">
              <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span class="text-xs text-blue-700 font-medium">
                {{ selectedElementInfo.elementInfo?.tagName }}<span v-if="selectedElementInfo.elementInfo?.className" class="text-blue-500">.{{ selectedElementInfo.elementInfo.className.split(' ')[0] }}</span>
              </span>
            </div>
          </div>
          <div class="flex space-x-2">
            <button 
              @click="startInspector"
              class="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1.5 rounded transition-colors flex items-center space-x-1"
              title="Start Element Inspector"
              :disabled="inspectorStatus.active"
              :class="{ 'opacity-50 cursor-not-allowed': inspectorStatus.active }"
            >
              <span>🔍</span>
              <span>Start</span>
            </button>
            <button 
              @click="stopInspector"
              class="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1.5 rounded transition-colors flex items-center space-x-1"
              title="Stop Element Inspector"
              :disabled="!inspectorStatus.active"
              :class="{ 'opacity-50 cursor-not-allowed': !inspectorStatus.active }"
            >
              <span>⏹️</span>
              <span>Stop</span>
            </button>
          </div>
        </div>
      </div>
      
      <div class="bg-blue-50 border border-blue-200 rounded p-3">
        <h3 class="font-medium text-blue-800 mb-2">How to use:</h3>
        <ul class="text-sm text-blue-700 space-y-1">
          <li>• Click "Start Inspector" to activate the element selector</li>
          <li>• Click on any element in the React app to select and edit it</li>
          <li>• Use the inspector panel to change text, colors, and styles</li>
          <li>• View real-time updates and element information below</li>
          <li>• Click "Stop" to deactivate the inspector</li>
        </ul>
      </div>
    </div><!-- React App Iframe -->
    <div class="border border-gray-300 rounded-lg overflow-hidden">      <div class="bg-gray-100 p-2 flex justify-between items-center">
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
        <h3 class="font-medium text-blue-800 mb-3">🎯 Selected Element</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Basic Info -->
          <div class="space-y-2">
            <div class="text-sm">
              <span class="font-medium text-blue-800">Element:</span>
              <span class="ml-2 font-mono text-blue-700">
                {{ selectedElementInfo.elementInfo?.tagName }}<span v-if="selectedElementInfo.elementInfo?.className" class="text-blue-500">.{{ selectedElementInfo.elementInfo.className.split(' ')[0] }}</span>
              </span>
            </div>
            
            <div v-if="selectedElementInfo.elementInfo?.textContent" class="text-sm">
              <span class="font-medium text-blue-800">Text:</span>
              <span class="ml-2 text-blue-700">"{{ selectedElementInfo.elementInfo.textContent.substring(0, 30) }}{{ selectedElementInfo.elementInfo.textContent.length > 30 ? '...' : '' }}"</span>
            </div>
            
            <div class="text-sm">
              <span class="font-medium text-blue-800">Component:</span>
              <span class="ml-2 text-blue-700">{{ selectedElementInfo.componentContext?.componentName }}</span>
            </div>
          </div>
          
          <!-- Dimensions -->
          <div v-if="selectedElementInfo.elementInfo?.position" class="space-y-2">
            <div class="text-sm">
              <span class="font-medium text-blue-800">Size:</span>
              <span class="ml-2 text-blue-700">{{ selectedElementInfo.elementInfo.position.offsetWidth }}×{{ selectedElementInfo.elementInfo.position.offsetHeight }}px</span>
            </div>
            
            <div class="text-sm">
              <span class="font-medium text-blue-800">Position:</span>
              <span class="ml-2 text-blue-700">{{ selectedElementInfo.elementInfo.position.offsetLeft }}, {{ selectedElementInfo.elementInfo.position.offsetTop }}px</span>
            </div>
          </div>
        </div>
        
        <!-- Array Info (if applicable) -->
        <div v-if="selectedElementInfo.arrayContext?.isArrayElement" class="mt-3 p-3 bg-yellow-50 rounded border border-yellow-200">
          <div class="flex items-center justify-between">
            <div>
              <span class="font-medium text-yellow-800">� Array Element</span>
              <span class="ml-2 text-sm text-yellow-700">{{ selectedElementInfo.arrayContext.arrayName }}[{{ selectedElementInfo.arrayContext.index }}]</span>
            </div>
            <span class="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">{{ selectedElementInfo.arrayContext.totalElements }} items</span>
          </div>
          
          <div v-if="selectedElementInfo.elementInfo?.attributes['data-static-id']" class="mt-2 text-xs text-yellow-700">
            <span class="font-medium">Styling IDs:</span>
            <span class="ml-1">Individual: <code class="bg-yellow-100 px-1 rounded">{{ selectedElementInfo.id }}</code></span>
            <span class="ml-2">All items: <code class="bg-yellow-100 px-1 rounded">{{ selectedElementInfo.elementInfo.attributes['data-static-id'] }}</code></span>
          </div>
        </div>
      </div>      <!-- Last Update Info -->
      <div v-if="lastUpdate" class="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 class="font-medium text-green-800 mb-3">🔄 Last Change</h3>
        
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-3">
            <div class="text-sm">
              <span class="font-medium text-green-800">Type:</span>
              <span class="ml-2 text-green-700 capitalize">{{ lastUpdate.changeType || lastUpdate.property }}</span>
            </div>
            <div class="text-sm">
              <span class="font-medium text-green-800">Value:</span>
              <span class="ml-2 text-green-700">{{ lastUpdate.value }}</span>
            </div>
          </div>
          <span class="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">{{ lastUpdate.timestamp }}</span>
        </div>
        
        <!-- Change Details -->
        <div v-if="lastUpdate.changeData" class="bg-green-100 rounded p-3">
          <div v-if="lastUpdate.changeType === 'textColor' || lastUpdate.changeType === 'backgroundColor'" class="text-sm">
            <span class="font-medium text-green-800">Applied:</span>
            <span class="ml-2 text-green-700">{{ lastUpdate.changeData.colorData?.name }}</span>
            <code class="ml-2 bg-green-200 text-green-800 px-1 rounded text-xs">{{ lastUpdate.changeData.colorData?.tailwind }}</code>
          </div>
          
          <div v-else-if="lastUpdate.changeType === 'style'" class="text-sm">
            <span class="font-medium text-green-800">Property:</span>
            <span class="ml-2 text-green-700">{{ lastUpdate.changeData.property }}</span>
            <code class="ml-2 bg-green-200 text-green-800 px-1 rounded text-xs">{{ lastUpdate.changeData.newClass }}</code>
          </div>
          
          <div v-else-if="lastUpdate.changeType === 'text'" class="text-sm space-y-1">
            <div>
              <span class="font-medium text-green-800">Old:</span>
              <span class="ml-2 text-green-600">"{{ lastUpdate.changeData.oldText }}"</span>
            </div>
            <div>
              <span class="font-medium text-green-800">New:</span>
              <span class="ml-2 text-green-700">"{{ lastUpdate.changeData.newText }}"</span>
            </div>
          </div>
          
          <div v-else-if="lastUpdate.changeType === 'reset'" class="text-sm">
            <span class="text-green-700">Element reset to original state</span>
            <span v-if="lastUpdate.changeData.affectedElementsCount > 1" class="ml-2 text-green-600">({{ lastUpdate.changeData.affectedElementsCount }} elements affected)</span>
          </div>
        </div>
        
        <!-- Similar Elements Info -->
        <div v-if="lastUpdate.similarElementsCount > 0" class="mt-3 text-sm">
          <span class="font-medium text-green-800">🔗 Updated {{ lastUpdate.similarElementsCount }} similar elements simultaneously</span>
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
const inspectorStatus = ref({ active: false, message: "Ready" });

// Functions to control the React inspector
const startInspector = () => {
  if (reactFrame.value?.contentWindow) {
    reactFrame.value.contentWindow.postMessage({
      type: "START_INSPECTOR",
      action: "start"
    }, "http://localhost:5173");
    console.log("📤 Sent START_INSPECTOR message to React app");
    inspectorStatus.value = { active: true, message: "Starting inspector..." };
  }
};

const stopInspector = () => {
  if (reactFrame.value?.contentWindow) {
    reactFrame.value.contentWindow.postMessage({
      type: "STOP_INSPECTOR", 
      action: "stop"
    }, "http://localhost:5173");
    console.log("📤 Sent STOP_INSPECTOR message to React app");
    inspectorStatus.value = { active: false, message: "Stopping inspector..." };
  }
};

onMounted(() => {
  console.log("React app with element inspector loaded");

  // Add message listener for cross-origin communication from React app
  window.addEventListener("message", (event) => {
    // Ensure the message is from the trusted React app origin
    if (event.origin === "http://localhost:5173") {      const message = event.data;
      
      // Handle inspector status updates
      if (message.type === "INSPECTOR_STATUS") {
        inspectorStatus.value = {
          active: message.status === "started",
          message: message.message
        };
        console.log("📥 Inspector Status:", message.status, "-", message.message);
        
      // Handle new ElementInspector changes
      } else if (message.type === "ELEMENT_INSPECTOR_CHANGE" && message.data) {
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

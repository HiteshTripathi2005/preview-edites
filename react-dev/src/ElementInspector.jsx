import React, { useState, useEffect, useRef } from "react";
import "./ElementInspector.css";

const ElementInspector = () => {
  const [isInspecting, setIsInspecting] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [originalStyles, setOriginalStyles] = useState(new Map());
  const [isVisible, setIsVisible] = useState(false);
  const inspectorRef = useRef(null);

  // Design options
  const colorOptions = [
  { name: "Black", value: "#000000", tailwind: "text-black" },
  { name: "Dark Gray", value: "#374151", tailwind: "text-gray-700" },
  { name: "Gray", value: "#6B7280", tailwind: "text-gray-500" },
  { name: "Red", value: "#EF4444", tailwind: "text-red-500" },
  { name: "Blue", value: "#3B82F6", tailwind: "text-blue-500" },
  { name: "Green", value: "#10B981", tailwind: "text-green-500" },
  { name: "Yellow", value: "#F59E0B", tailwind: "text-yellow-500" },
  { name: "Purple", value: "#8B5CF6", tailwind: "text-purple-500" },
  { name: "Pink", value: "#EC4899", tailwind: "text-pink-500" },
  { name: "Indigo", value: "#6366F1", tailwind: "text-indigo-500" }];


  const backgroundOptions = [
  { name: "None", value: "transparent", tailwind: "bg-transparent" },
  { name: "White", value: "#FFFFFF", tailwind: "bg-white" },
  { name: "Light Gray", value: "#F3F4F6", tailwind: "bg-gray-100" },
  { name: "Gray", value: "#E5E7EB", tailwind: "bg-gray-200" },
  { name: "Light Red", value: "#FEE2E2", tailwind: "bg-red-100" },
  { name: "Light Blue", value: "#DBEAFE", tailwind: "bg-blue-100" },
  { name: "Light Green", value: "#D1FAE5", tailwind: "bg-green-100" },
  { name: "Light Yellow", value: "#FEF3C7", tailwind: "bg-yellow-100" },
  { name: "Light Purple", value: "#E9D5FF", tailwind: "bg-purple-100" },
  { name: "Light Pink", value: "#FCE7F3", tailwind: "bg-pink-100" }];


  const animationOptions = [
  { name: "None", value: "" },
  { name: "Bounce", value: "animate-bounce" },
  { name: "Pulse", value: "animate-pulse" },
  { name: "Ping", value: "animate-ping" },
  { name: "Spin", value: "animate-spin" }];


  const fontSizeOptions = [
  { name: "Tiny", value: "text-xs" },
  { name: "Small", value: "text-sm" },
  { name: "Normal", value: "text-base" },
  { name: "Large", value: "text-lg" },
  { name: "XL", value: "text-xl" },
  { name: "2XL", value: "text-2xl" },
  { name: "3XL", value: "text-3xl" }];


  const spacingOptions = [
  { name: "None", value: "p-0" },
  { name: "Small", value: "p-2" },
  { name: "Medium", value: "p-4" },
  { name: "Large", value: "p-6" },
  { name: "XL", value: "p-8" }];


  const roundingOptions = [
  { name: "None", value: "rounded-none" },
  { name: "Small", value: "rounded-sm" },
  { name: "Medium", value: "rounded-md" },
  { name: "Large", value: "rounded-lg" },
  { name: "XL", value: "rounded-xl" },
  { name: "Full", value: "rounded-full" }];


  // Helper functions
  const isMapElement = (element) => {
    return element && (
    element.getAttribute('data-dynamic') === 'true' ||
    element.getAttribute('data-array') !== null ||
    element.closest('[data-array]') !== null);

  };

  const isTextEditingAllowed = (element) => {
    if (!element) return false;
    return !isMapElement(element);
  };

  const getMapInfo = (element) => {
    if (!element) return null;

    const arrayName = element.getAttribute('data-array');
    const arrayIndex = element.getAttribute('data-array-index');

    if (arrayName && arrayIndex !== null) {
      return {
        arrayName,
        arrayIndex: parseInt(arrayIndex),
        isMapElement: true
      };
    }

    // Check if it's inside a mapped element
    const parentArray = element.closest('[data-array]');
    if (parentArray) {
      return {
        arrayName: parentArray.getAttribute('data-array'),
        arrayIndex: parseInt(parentArray.getAttribute('data-array-index')),
        isMapElement: true,
        isChildOfMapped: true
      };
    }

    return { isMapElement: false };
  };

  const getAllSimilarElements = () => {
    if (!selectedElement) return [selectedElement];

    const mapInfo = getMapInfo(selectedElement);
    if (!mapInfo.isMapElement) {
      return [selectedElement];
    }

    // Find all elements with the same array name and similar structure
    const arrayName = mapInfo.arrayName;
    const baseId = selectedElement.id;
    const currentIndex = mapInfo.arrayIndex;

    // Remove the index from the ID to get the base pattern
    const basePattern = baseId.replace(`-${currentIndex}`, '');

    // Find all similar elements
    const allArrayElements = Array.from(document.querySelectorAll(`[data-array="${arrayName}"]`));
    const similarElements = allArrayElements.filter((element) => {
      const elementIndex = element.getAttribute('data-array-index');
      const elementId = element.id;

      // Include elements that match the base pattern but have different indices
      return elementId && elementId.startsWith(basePattern) && elementIndex !== currentIndex.toString();
    });

    return [selectedElement, ...similarElements];
  };

  // Apply Tailwind class to element(s)
  const applyTailwindClass = (property, newClass, removeClasses = []) => {
    const elements = getAllSimilarElements();

    elements.forEach((element) => {
      // Remove old classes
      const validClassesToRemove = removeClasses.filter((className) => className !== '');
      if (validClassesToRemove.length > 0) {
        element.classList.remove(...validClassesToRemove);
      }

      // Add new class
      if (newClass && newClass !== '') {
        element.classList.add(newClass);
      }
    });
  };

  // Apply text color
  const applyTextColor = (colorData) => {
    const textColorClasses = colorOptions.map((c) => c.tailwind);
    applyTailwindClass('textColor', colorData.tailwind, textColorClasses);
  };

  // Apply background color
  const applyBackgroundColor = (bgData) => {
    const bgColorClasses = backgroundOptions.map((b) => b.tailwind);
    applyTailwindClass('backgroundColor', bgData.tailwind, bgColorClasses);
  };

  // Toggle inspector visibility
  const toggleInspector = () => {
    setIsVisible(!isVisible);
    if (isVisible) {
      exitInspectMode();
    }
  };

  // Toggle inspect mode
  const toggleInspectMode = () => {
    if (isInspecting) {
      exitInspectMode();
    } else {
      enterInspectMode();
    }
  };

  const enterInspectMode = () => {
    setIsInspecting(true);
    document.body.style.cursor = "crosshair";

    // Add event listeners
    document.addEventListener("click", handleElementClick, true);
    document.addEventListener("mouseover", handleElementHover, true);
    document.addEventListener("mouseout", handleElementHoverOut, true);
  };

  const exitInspectMode = () => {
    setIsInspecting(false);
    document.body.style.cursor = "";

    // Remove event listeners
    document.removeEventListener("click", handleElementClick, true);
    document.removeEventListener("mouseover", handleElementHover, true);
    document.removeEventListener("mouseout", handleElementHoverOut, true);

    // Clear all hover effects
    clearAllHighlights();
  };

  const handleElementClick = (event) => {
    // Don't inspect the inspector itself
    if (inspectorRef.current?.contains(event.target)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    selectElement(event.target);
    exitInspectMode();
  };

  const handleElementHover = (event) => {
    // Don't highlight the inspector itself or already selected elements
    if (
    inspectorRef.current?.contains(event.target) ||
    event.target === selectedElement ||
    event.target.classList.contains("inspector-selected"))
    {
      return;
    }

    event.stopPropagation();
    event.target.classList.add("inspector-hover");

    // For map elements, show preview of similar elements
    const mapInfo = getMapInfo(event.target);
    if (mapInfo.isMapElement) {
      const arrayName = mapInfo.arrayName;
      const baseId = event.target.id;
      const currentIndex = mapInfo.arrayIndex;
      const basePattern = baseId.replace(`-${currentIndex}`, '');

      const similarElements = Array.from(document.querySelectorAll(`[data-array="${arrayName}"]`)).
      filter((element) => {
        const elementIndex = element.getAttribute('data-array-index');
        const elementId = element.id;
        return elementId && elementId.startsWith(basePattern) &&
        elementIndex !== currentIndex.toString() &&
        element !== event.target;
      });

      similarElements.forEach((element) => {
        element.classList.add("inspector-hover-array");
      });
    }
  };

  const handleElementHoverOut = (event) => {
    event.stopPropagation();
    event.target.classList.remove("inspector-hover");

    // Remove array hover highlights
    document.querySelectorAll('.inspector-hover-array').forEach((el) => {
      el.classList.remove('inspector-hover-array');
    });
  };

  const clearAllHighlights = () => {
    if (selectedElement) {
      selectedElement.classList.remove("inspector-selected");
    }

    // Remove all highlight classes
    document.querySelectorAll('.inspector-hover, .inspector-hover-array, .inspector-array-highlight').
    forEach((el) => {
      el.classList.remove('inspector-hover', 'inspector-hover-array', 'inspector-array-highlight');
    });
  };

  const selectElement = (element) => {
    clearAllHighlights();

    setSelectedElement(element);
    element.classList.add("inspector-selected");

    // Check map element status for debugging (can be removed in production)
    const isMap = isMapElement(element);
    const mapInfo = getMapInfo(element);

    // Store original state
    if (!originalStyles.has(element)) {
      const newOriginalStyles = new Map(originalStyles);
      newOriginalStyles.set(element, {
        classes: [...element.classList].filter((c) => c !== "inspector-selected"),
        text: element.textContent || "",
        style: { ...element.style }
      });
      setOriginalStyles(newOriginalStyles);
    }

    // Set editing text only for non-map elements
    if (isTextEditingAllowed(element)) {
      setEditingText(element.textContent || "");
    } else {
      setEditingText("");
    }

    // Highlight similar elements if it's a map element
    if (mapInfo && mapInfo.isMapElement) {
      const similarElements = getAllSimilarElements().filter((el) => el !== element);
      similarElements.forEach((el) => {
        el.classList.add('inspector-array-highlight');
      });
    }
  };

  const updateElementText = (newText) => {
    if (!selectedElement || !isTextEditingAllowed(selectedElement)) {
      console.warn('Text editing is disabled for map elements to preserve functionality.');
      return;
    }

    selectedElement.textContent = newText;
    setEditingText(newText);
  };

  const resetElement = () => {
    if (!selectedElement) return;

    const elements = getAllSimilarElements();
    elements.forEach((element) => {
      const originalState = originalStyles.get(element);
      if (originalState) {
        // Reset classes
        element.className = '';
        originalState.classes.forEach((cls) => {
          element.classList.add(cls);
        });

        // Reset text content only for non-map elements
        if (isTextEditingAllowed(element)) {
          element.textContent = originalState.text;
        }

        // Reset inline styles
        element.removeAttribute('style');
        Object.assign(element.style, originalState.style);
      }
    });

    clearSelection();
  };

  const clearSelection = () => {
    clearAllHighlights();
    setSelectedElement(null);
    setEditingText("");
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Escape') {
        exitInspectMode();
        setIsVisible(false);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  const mapInfo = selectedElement ? getMapInfo(selectedElement) : null;
  const similarElementsCount = mapInfo?.isMapElement ? getAllSimilarElements().length : 1;
  


  return (
    <>
      {/* Toggle Button */}
      <div id="div-1" data-component="ElementInspector" data-file="src/ElementInspector.jsx" className="inspector-toggle">
        <button id="button-2" data-component="ElementInspector" data-file="src/ElementInspector.jsx" data-dynamic="true"
        onClick={toggleInspector}
        className="inspector-toggle-btn"
        title="Toggle Element Inspector">

          🔍
        </button>
      </div>

      {/* Inspector Panel */}
      {isVisible &&
      <div id="div-3" data-component="ElementInspector" data-file="src/ElementInspector.jsx" data-dynamic="true" ref={inspectorRef} className="element-inspector">
          {/* Header */}
          <div id="div-4" data-component="ElementInspector" data-file="src/ElementInspector.jsx" className="inspector-header">
            <h3 id="h3-5" data-component="ElementInspector" data-file="src/ElementInspector.jsx" className="m-0 text-sm font-semibold text-gray-800">
              Element Inspector
            </h3>
            <button id="button-6" data-component="ElementInspector" data-file="src/ElementInspector.jsx" data-dynamic="true"
          onClick={toggleInspector}
          className="ml-auto text-gray-400 hover:text-gray-600 text-lg">

              ×
            </button>
          </div>

          {/* Inspect Button */}
          <div id="div-7" data-component="ElementInspector" data-file="src/ElementInspector.jsx" className="p-4 border-b border-gray-200">
            <button id="button-8" data-component="ElementInspector" data-file="src/ElementInspector.jsx" data-dynamic="true"
          onClick={toggleInspectMode}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
          isInspecting ?
          'bg-red-100 text-red-700 hover:bg-red-200' :
          'bg-blue-100 text-blue-700 hover:bg-blue-200'}`
          }>

              {isInspecting ? '🔴 Stop Inspecting' : '🎯 Inspect Element'}
            </button>
          </div>

          {/* Main Content */}
          {selectedElement ?
        <div id="div-9" data-component="ElementInspector" data-file="src/ElementInspector.jsx" data-dynamic="true" className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Element Type Info */}
              <div id="div-10" data-component="ElementInspector" data-file="src/ElementInspector.jsx" data-dynamic="true" className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                {(mapInfo?.isMapElement || (selectedElement?.getAttribute('data-dynamic') === 'true' && selectedElement?.getAttribute('data-array'))) ?
            <div id="div-11" data-component="ElementInspector" data-file="src/ElementInspector.jsx" className="flex items-center space-x-2">
                    <div id="div-12" data-component="ElementInspector" data-file="src/ElementInspector.jsx" className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                    <div id="div-13" data-component="ElementInspector" data-file="src/ElementInspector.jsx">
                      <h4 id="h4-14" data-component="ElementInspector" data-file="src/ElementInspector.jsx" className="font-semibold text-gray-800">🗂️ Map Element</h4>
                      <p id="p-15" data-component="ElementInspector" data-file="src/ElementInspector.jsx" data-dynamic="true" className="text-sm text-gray-600">
                        From "{mapInfo?.arrayName || selectedElement?.getAttribute('data-array')}" array • Affects {similarElementsCount} similar elements
                      </p>
                      <p id="p-16" data-component="ElementInspector" data-file="src/ElementInspector.jsx" className="text-xs text-orange-600 mt-1">
                        ⚠️ Text editing blocked to preserve dynamic content
                      </p>
                    </div>
                  </div> :

            <div id="div-17" data-component="ElementInspector" data-file="src/ElementInspector.jsx" className="flex items-center space-x-2">
                    <div id="div-18" data-component="ElementInspector" data-file="src/ElementInspector.jsx" className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div id="div-19" data-component="ElementInspector" data-file="src/ElementInspector.jsx">
                      <h4 id="h4-20" data-component="ElementInspector" data-file="src/ElementInspector.jsx" className="font-semibold text-gray-800">📄 Static Element</h4>
                      <p id="p-21" data-component="ElementInspector" data-file="src/ElementInspector.jsx" data-dynamic="true" className="text-sm text-gray-600">
                        Independent {selectedElement.tagName.toLowerCase()} • Fully editable
                      </p>
                    </div>
                  </div>
            }
              </div>

              {/* Text Editing - Only for non-map elements */}
              {!(mapInfo?.isMapElement || (selectedElement?.getAttribute('data-dynamic') === 'true' && selectedElement?.getAttribute('data-array'))) &&
          <div id="div-22" data-component="ElementInspector" data-file="src/ElementInspector.jsx" className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <h4 id="h4-23" data-component="ElementInspector" data-file="src/ElementInspector.jsx" className="flex items-center space-x-2 mb-3">
                    <span id="span-24" data-component="ElementInspector" data-file="src/ElementInspector.jsx" className="text-lg">✏️</span>
                    <span id="span-25" data-component="ElementInspector" data-file="src/ElementInspector.jsx" className="font-semibold text-gray-800">Edit Text</span>
                  </h4>
                  <textarea id="textarea-26" data-component="ElementInspector" data-file="src/ElementInspector.jsx" data-dynamic="true"
            value={editingText}
            onChange={(e) => updateElementText(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Type your text here..."
            rows="3" />

                </div>
          }

              {/* Map Element Info */}
              {(mapInfo?.isMapElement || (selectedElement?.getAttribute('data-dynamic') === 'true' && selectedElement?.getAttribute('data-array'))) &&
          <div id="div-27" data-component="ElementInspector" data-file="src/ElementInspector.jsx" className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                  <div id="div-28" data-component="ElementInspector" data-file="src/ElementInspector.jsx" className="flex items-center space-x-3">
                    <span id="span-29" data-component="ElementInspector" data-file="src/ElementInspector.jsx" className="text-2xl">🔒</span>
                    <div id="div-30" data-component="ElementInspector" data-file="src/ElementInspector.jsx">
                      <h4 id="h4-31" data-component="ElementInspector" data-file="src/ElementInspector.jsx" className="font-bold text-amber-800 text-base">Text Editing Blocked</h4>
                      <p id="p-32" data-component="ElementInspector" data-file="src/ElementInspector.jsx" className="text-amber-700 text-sm">
                        This element is generated by a map function. Text content is managed by your data/state. 
                        Only styling changes are available.
                      </p>
                    </div>
                  </div>
                </div>
          }

              {/* Colors */}
              <div id="div-33" data-component="ElementInspector" data-file="src/ElementInspector.jsx" data-dynamic="true" className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h4 id="h4-34" data-component="ElementInspector" data-file="src/ElementInspector.jsx" className="flex items-center space-x-2 mb-4">
                  <span id="span-35" data-component="ElementInspector" data-file="src/ElementInspector.jsx" className="text-lg">🎨</span>
                  <span id="span-36" data-component="ElementInspector" data-file="src/ElementInspector.jsx" className="font-semibold text-gray-800">Colors</span>
                </h4>
                
                {/* Text Colors */}
                <div id="div-37" data-component="ElementInspector" data-file="src/ElementInspector.jsx" className="mb-4">
                  <label id="label-38" data-component="ElementInspector" data-file="src/ElementInspector.jsx" className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                  <div id="div-39" data-component="ElementInspector" data-file="src/ElementInspector.jsx" data-dynamic="true" className="grid grid-cols-5 gap-2">
                    {colorOptions.map((color, index) =>
                <button id="button-40" data-component="ElementInspector" data-file="src/ElementInspector.jsx" data-dynamic="true"
                key={index}
                onClick={() => applyTextColor(color)}
                className="group relative w-10 h-10 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-all duration-200 hover:scale-110 focus:ring-2 focus:ring-blue-500"
                style={{ backgroundColor: color.value }}
                title={color.name}>

                        <span id="span-41" data-component="ElementInspector" data-file="src/ElementInspector.jsx" data-dynamic="true" className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {color.name}
                        </span>
                      </button>
                )}
                  </div>
                </div>

                {/* Background Colors */}
                <div id="div-42" data-component="ElementInspector" data-file="src/ElementInspector.jsx">
                  <label id="label-43" data-component="ElementInspector" data-file="src/ElementInspector.jsx" className="block text-sm font-medium text-gray-700 mb-2">Background</label>
                  <div id="div-44" data-component="ElementInspector" data-file="src/ElementInspector.jsx" data-dynamic="true" className="grid grid-cols-5 gap-2">
                    {backgroundOptions.map((bg, index) =>
                <button id="button-45" data-component="ElementInspector" data-file="src/ElementInspector.jsx" data-dynamic="true"
                key={index}
                onClick={() => applyBackgroundColor(bg)}
                className="group relative w-10 h-10 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-all duration-200 hover:scale-110 focus:ring-2 focus:ring-blue-500"
                style={{
                  backgroundColor: bg.value === 'transparent' ? '#ffffff' : bg.value,
                  backgroundImage: bg.value === 'transparent' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : 'none',
                  backgroundSize: bg.value === 'transparent' ? '8px 8px' : 'auto',
                  backgroundPosition: bg.value === 'transparent' ? '0 0, 0 4px, 4px -4px, -4px 0px' : 'initial'
                }}
                title={bg.name}>

                        <span id="span-46" data-component="ElementInspector" data-file="src/ElementInspector.jsx" data-dynamic="true" className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {bg.name}
                        </span>
                      </button>
                )}
                  </div>
                </div>
              </div>

              {/* Typography */}
              <div id="div-47" data-component="ElementInspector" data-file="src/ElementInspector.jsx" className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h4 id="h4-48" data-component="ElementInspector" data-file="src/ElementInspector.jsx" className="flex items-center space-x-2 mb-4">
                  <span id="span-49" data-component="ElementInspector" data-file="src/ElementInspector.jsx" className="text-lg">🔤</span>
                  <span id="span-50" data-component="ElementInspector" data-file="src/ElementInspector.jsx" className="font-semibold text-gray-800">Typography</span>
                </h4>
                <div id="div-51" data-component="ElementInspector" data-file="src/ElementInspector.jsx" data-dynamic="true" className="grid grid-cols-2 gap-3">
                  {fontSizeOptions.map((size, index) =>
              <button id="button-52" data-component="ElementInspector" data-file="src/ElementInspector.jsx" data-dynamic="true"
              key={index}
              onClick={() => applyTailwindClass('fontSize', size.value, fontSizeOptions.map((s) => s.value))}
              className="p-2 text-sm border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all">

                      {size.name}
                    </button>
              )}
                </div>
              </div>

              {/* Reset Button */}
              <div id="div-53" data-component="ElementInspector" data-file="src/ElementInspector.jsx" className="pt-4 border-t">
                <button id="button-54" data-component="ElementInspector" data-file="src/ElementInspector.jsx" data-dynamic="true"
            onClick={resetElement}
            className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all">

                  🔄 Reset to Original
                </button>
              </div>
            </div> :

        <div id="div-55" data-component="ElementInspector" data-file="src/ElementInspector.jsx" className="p-8 text-center text-gray-500">
              <div id="div-56" data-component="ElementInspector" data-file="src/ElementInspector.jsx" className="text-4xl mb-4">🎯</div>
              <p id="p-57" data-component="ElementInspector" data-file="src/ElementInspector.jsx">Click "Inspect Element" and then click on any element to start editing</p>
              <div id="div-58" data-component="ElementInspector" data-file="src/ElementInspector.jsx" className="mt-4 text-sm">
                <p id="p-59" data-component="ElementInspector" data-file="src/ElementInspector.jsx" className="mb-2">🗂️ <strong id="strong-60" data-component="ElementInspector" data-file="src/ElementInspector.jsx">Map Elements</strong>: Styling only (text editing blocked)</p>
                <p id="p-61" data-component="ElementInspector" data-file="src/ElementInspector.jsx">📄 <strong id="strong-62" data-component="ElementInspector" data-file="src/ElementInspector.jsx">Static Elements</strong>: Full editing (text + styling)</p>
              </div>
            </div>
        }
        </div>
      }
    </>);

};

export default ElementInspector;
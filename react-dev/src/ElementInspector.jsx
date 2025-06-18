import React, { useState, useEffect, useRef } from "react";
import "./ElementInspector.css";

const LOCAL_STORAGE_KEY = 'inspector_saved_changes';

const ElementInspector = () => {
  const [isInspecting, setIsInspecting] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [originalStyles, setOriginalStyles] = useState(new Map());
  const [isVisible, setIsVisible] = useState(false);
  const [saveToLocalStorage, setSaveToLocalStorage] = useState(true);
  const inspectorRef = useRef(null);

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

    // Clear hover effects
    document.querySelectorAll(".inspector-hover").forEach((el) => {
      el.classList.remove("inspector-hover");
    });
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
    // Don't highlight the inspector itself
    if (
      inspectorRef.current?.contains(event.target) ||
      event.target === selectedElement ||
      event.target.classList.contains("inspector-selected")
    ) {
      return;
    }

    event.target.classList.add("inspector-hover");
  };

  const handleElementHoverOut = (event) => {
    event.target.classList.remove("inspector-hover");
  };

  const selectElement = (element) => {
    // Clear previous selection
    if (selectedElement) {
      selectedElement.classList.remove("inspector-selected");
    }

    // Select new element
    setSelectedElement(element);
    element.classList.add("inspector-selected");

    // Send message to parent (Nuxt) with the selected element's ID
    if (element.id && window.parent) {
      window.parent.postMessage({ type: 'ELEMENT_SELECTED', id: element.id }, 'http://localhost:3000');
    }

    // Set editing text
    setEditingText(element.textContent || "");

    // Store original styles if not already stored
    if (!originalStyles.has(element)) {
      const computedStyle = window.getComputedStyle(element);
      const newOriginalStyles = new Map(originalStyles);
      newOriginalStyles.set(element, {
        color: computedStyle.color,
        backgroundColor: computedStyle.backgroundColor,
        fontSize: computedStyle.fontSize,
        padding: computedStyle.padding,
        margin: computedStyle.margin,
        textContent: element.textContent,
      });
      setOriginalStyles(newOriginalStyles);
    }
  };

  const saveElementChange = (id, property, value) => {
    try {
      const storedChanges = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
      if (!storedChanges[id]) {
        storedChanges[id] = {};
      }
      storedChanges[id][property] = value;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(storedChanges));
      console.log(`Saved change for ${id}: ${property} = ${value}`);
    } catch (e) {
      console.error("Error saving to localStorage:", e);
    }
  };

  const updateElementText = (newText) => {
    if (!selectedElement) return;

    setEditingText(newText);
    selectedElement.textContent = newText;

    // Send update message to parent (Nuxt)
    if (selectedElement.id && window.parent) {
      window.parent.postMessage(
        { type: 'ELEMENT_UPDATED', id: selectedElement.id, property: 'textContent', value: newText },
        'http://localhost:3000'
      );
    }

    // Save change to localStorage only if enabled
    if (saveToLocalStorage && selectedElement.id) {
      saveElementChange(selectedElement.id, 'textContent', newText);
    }
  };

  const updateElementStyle = (property, value) => {
    if (!selectedElement) return;
    
    // Handle "Default" option - reset to original style
    if (value === "" || value === "Default") {
      const original = originalStyles.get(selectedElement);
      if (original) {
        // Remove existing Tailwind classes for this property
        const removeExistingClasses = (property) => {
          switch (property) {
            case 'color':
              selectedElement.className = selectedElement.className.replace(/text-(black|gray-\d+|red-\d+|blue-\d+|green-\d+|yellow-\d+|purple-\d+|pink-\d+|indigo-\d+)/g, '').trim();
              break;
            case 'backgroundColor':
              selectedElement.className = selectedElement.className.replace(/bg-(transparent|white|gray-\d+|red-\d+|blue-\d+|green-\d+|yellow-\d+|purple-\d+|pink-\d+)/g, '').trim();
              break;
            case 'fontSize':
              selectedElement.className = selectedElement.className.replace(/text-(xs|sm|base|lg|xl|2xl|3xl)/g, '').trim();
              break;
            case 'padding':
              selectedElement.className = selectedElement.className.replace(/p-\d+/g, '').trim();
              break;
          }
        };

        removeExistingClasses(property);
        
        // Reset to original computed style
        selectedElement.style[property] = original[property];
        
        // Remove from localStorage
        if (saveToLocalStorage && selectedElement.id) {
          try {
            const storedChanges = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
            if (storedChanges[selectedElement.id]) {
              delete storedChanges[selectedElement.id][property];
              // If no more changes for this element, remove the element entry
              if (Object.keys(storedChanges[selectedElement.id]).length === 0) {
                delete storedChanges[selectedElement.id];
              }
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(storedChanges));
            }
          } catch (e) {
            console.error("Error updating localStorage:", e);
          }
        }

        // Send update message to parent (Nuxt)
        if (selectedElement.id && window.parent) {
          window.parent.postMessage(
            { type: 'ELEMENT_UPDATED', id: selectedElement.id, property: property, value: 'default' },
            'http://localhost:3000'
          );
        }
      }
      return;
    }
    
    // Convert CSS values to Tailwind classes
    const getTailwindClass = (property, value) => {
      switch (property) {
        case 'color':
          const colorMap = {
            '#000000': 'text-black',
            '#374151': 'text-gray-700',
            '#6B7280': 'text-gray-500',
            '#EF4444': 'text-red-500',
            '#3B82F6': 'text-blue-500',
            '#10B981': 'text-green-500',
            '#F59E0B': 'text-yellow-500',
            '#8B5CF6': 'text-purple-500',
            '#EC4899': 'text-pink-500',
            '#6366F1': 'text-indigo-500'
          };
          return colorMap[value] || null;
          
        case 'backgroundColor':
          const bgColorMap = {
            'transparent': 'bg-transparent',
            '#FFFFFF': 'bg-white',
            '#F3F4F6': 'bg-gray-100',
            '#E5E7EB': 'bg-gray-200',
            '#FEE2E2': 'bg-red-100',
            '#DBEAFE': 'bg-blue-100',
            '#D1FAE5': 'bg-green-100',
            '#FEF3C7': 'bg-yellow-100',
            '#E9D5FF': 'bg-purple-100',
            '#FCE7F3': 'bg-pink-100'
          };
          return bgColorMap[value] || null;
          
        case 'fontSize':
          const fontSizeMap = {
            '12px': 'text-xs',
            '14px': 'text-sm',
            '16px': 'text-base',
            '18px': 'text-lg',
            '20px': 'text-xl',
            '24px': 'text-2xl',
            '32px': 'text-3xl'
          };
          return fontSizeMap[value] || null;
          
        case 'padding':
          const paddingMap = {
            '4px': 'p-1',
            '8px': 'p-2',
            '12px': 'p-3',
            '16px': 'p-4',
            '20px': 'p-5',
            '24px': 'p-6'
          };
          return paddingMap[value] || null;
          
        default:
          return null;
      }
    };

    const tailwindClass = getTailwindClass(property, value);
    
    if (tailwindClass) {
      // Remove existing classes for this property
      const removeExistingClasses = (property) => {
        switch (property) {
          case 'color':
            selectedElement.className = selectedElement.className.replace(/text-(black|gray-\d+|red-\d+|blue-\d+|green-\d+|yellow-\d+|purple-\d+|pink-\d+|indigo-\d+)/g, '').trim();
            break;
          case 'backgroundColor':
            selectedElement.className = selectedElement.className.replace(/bg-(transparent|white|gray-\d+|red-\d+|blue-\d+|green-\d+|yellow-\d+|purple-\d+|pink-\d+)/g, '').trim();
            break;
          case 'fontSize':
            selectedElement.className = selectedElement.className.replace(/text-(xs|sm|base|lg|xl|2xl|3xl)/g, '').trim();
            break;
          case 'padding':
            selectedElement.className = selectedElement.className.replace(/p-\d+/g, '').trim();
            break;
        }
      };

      removeExistingClasses(property);
      
      // Add the new Tailwind class
      selectedElement.classList.add(tailwindClass);
    } else {
      // Fallback to inline styles for values not mapped to Tailwind
      selectedElement.style[property] = value;
    }

    // Send update message to parent (Nuxt)
    if (selectedElement.id && window.parent) {
      window.parent.postMessage(
        { type: 'ELEMENT_UPDATED', id: selectedElement.id, property: property, value: tailwindClass || value },
        'http://localhost:3000'
      );
    }

    // Save change to localStorage only if enabled
    if (saveToLocalStorage && selectedElement.id) {
      saveElementChange(selectedElement.id, property, tailwindClass || value);
    }
  };

  const resetElement = () => {
    if (!selectedElement) return;

    const original = originalStyles.get(selectedElement);
    if (original) {
      // Remove all inspector-added Tailwind classes
      selectedElement.className = selectedElement.className
        .replace(/text-(black|gray-\d+|red-\d+|blue-\d+|green-\d+|yellow-\d+|purple-\d+|pink-\d+|indigo-\d+)/g, '')
        .replace(/bg-(transparent|white|gray-\d+|red-\d+|blue-\d+|green-\d+|yellow-\d+|purple-\d+|pink-\d+)/g, '')
        .replace(/text-(xs|sm|base|lg|xl|2xl|3xl)/g, '')
        .replace(/p-\d+/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      // Reset inline styles to original computed values
      selectedElement.style.color = original.color;
      selectedElement.style.backgroundColor = original.backgroundColor;
      selectedElement.style.fontSize = original.fontSize;
      selectedElement.style.padding = original.padding;
      selectedElement.style.margin = original.margin;
      selectedElement.textContent = original.textContent;
      setEditingText(original.textContent || "");
    }

    // Also remove from localStorage if element has an ID and saving is enabled
    if (saveToLocalStorage && selectedElement && selectedElement.id) {
      try {
        const storedChanges = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
        delete storedChanges[selectedElement.id]; // Remove all changes for this element
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(storedChanges));
        console.log(`Removed saved changes for ${selectedElement.id} from localStorage.`);
      } catch (e) {
        console.error("Error removing from localStorage on reset:", e);
      }
    }
  };

  const clearSelection = () => {
    if (selectedElement) {
      selectedElement.classList.remove("inspector-selected");
      setSelectedElement(null);
      setEditingText("");
    }
  };

  // Function to clear all localStorage when toggle is turned off
  const handleSaveToggle = (enabled) => {
    setSaveToLocalStorage(enabled);
    
    if (!enabled) {
      // Optionally clear all saved changes when turning off
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        console.log("Cleared all saved changes from localStorage.");
      } catch (e) {
        console.error("Error clearing localStorage:", e);
      }
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Toggle inspector with Ctrl/Cmd + Shift + I
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key === "I"
      ) {
        event.preventDefault();
        toggleInspector();
      }

      // Exit inspect mode with Escape
      if (event.key === "Escape") {
        if (isInspecting) {
          exitInspectMode();
        } else if (selectedElement) {
          clearSelection();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isInspecting, selectedElement]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      exitInspectMode();
    };
  }, []);

  const colorOptions = [
    "#000000",
    "#374151",
    "#6B7280",
    "#EF4444",
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#EC4899",
    "#6366F1",
  ];

  const backgroundOptions = [
    "transparent",
    "#FFFFFF",
    "#F3F4F6",
    "#E5E7EB",
    "#FEE2E2",
    "#DBEAFE",
    "#D1FAE5",
    "#FEF3C7",
    "#E9D5FF",
    "#FCE7F3",
  ];

  if (!isVisible) {
    return (
      <div className="fixed top-5 right-5 z-[10000]">
        <button
          onClick={toggleInspector}
          className="w-12 h-12 rounded-full bg-blue-500 text-white border-none text-xl cursor-pointer shadow-lg transition-all duration-200 hover:bg-blue-600 hover:scale-105"
          title="Open Element Inspector (Ctrl+Shift+I)"
        >
          🔍
        </button>
      </div>
    );
  }

  return (
    <div ref={inspectorRef} className="fixed top-5 right-5 w-[350px] max-h-[calc(100vh-40px)] bg-white border border-gray-200 rounded-lg shadow-xl font-sans text-sm z-[10000] overflow-hidden flex flex-col">
      <div className="bg-slate-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="m-0 text-base font-semibold text-gray-800">Element Inspector</h3>
        <div className="flex gap-2 items-center">
          <button
            onClick={toggleInspectMode}
            className={`px-3 py-1.5 border border-gray-300 rounded text-xs cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
              isInspecting ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-700"
            }`}
          >
            {isInspecting ? "Exit Inspect" : "Inspect Element"}
          </button>
          <button 
            onClick={toggleInspector} 
            className="w-6 h-6 border-none bg-none text-gray-500 cursor-pointer rounded flex items-center justify-center text-lg hover:bg-gray-100 hover:text-gray-700"
          >
            ×
          </button>
        </div>
      </div>

      {/* Save to localStorage Toggle */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-700">Save changes</span>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={saveToLocalStorage}
            onChange={(e) => handleSaveToggle(e.target.checked)}
            className="sr-only"
          />
          <div className={`relative w-8 h-4 rounded-full transition-colors duration-200 ${
            saveToLocalStorage ? 'bg-blue-500' : 'bg-gray-300'
          }`}>
            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform duration-200 ${
              saveToLocalStorage ? 'translate-x-4' : 'translate-x-0.5'
            }`}></div>
          </div>
          <span className="ml-2 text-xs text-gray-600">
            {saveToLocalStorage ? 'On' : 'Off'}
          </span>
        </label>
      </div>

      {selectedElement ? (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <h4 className="m-0 mb-2 text-sm font-semibold text-gray-800">Selected Element</h4>
            <p className="my-1 text-gray-600 text-xs">
              <strong>Tag:</strong> {selectedElement.tagName.toLowerCase()}
            </p>
            <p className="my-1 text-gray-600 text-xs">
              <strong>Classes:</strong> {selectedElement.className || "None"}
            </p>
            <p className="my-1 text-gray-600 text-xs">
              <strong>ID:</strong> {selectedElement.id || "None"}
            </p>
          </div>

          <div className="mb-4">
            <h4 className="m-0 mb-2 text-sm font-semibold text-gray-800">Edit Text</h4>
            <textarea
              value={editingText}
              onChange={(e) => updateElementText(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-xs font-inherit resize-y min-h-[60px] focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
              placeholder="Element text content..."
            />
          </div>

          <div className="mb-4">
            <h4 className="m-0 mb-3 text-sm font-semibold text-gray-800">Style Controls</h4>

            <div className="mb-3">
              <label className="block mb-1.5 text-xs font-medium text-gray-700">Text Color</label>
              <div className="grid grid-cols-5 gap-1">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateElementStyle("color", color)}
                    className="w-6 h-6 border border-gray-300 rounded cursor-pointer transition-transform duration-100 hover:scale-110 hover:border-gray-700"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="block mb-1.5 text-xs font-medium text-gray-700">Background Color</label>
              <div className="grid grid-cols-5 gap-1">
                {backgroundOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateElementStyle("backgroundColor", color)}
                    className="w-6 h-6 border border-gray-300 rounded cursor-pointer transition-transform duration-100 hover:scale-110 hover:border-gray-700"
                    style={{ backgroundColor: color === "transparent" ? "#ffffff" : color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="block mb-1.5 text-xs font-medium text-gray-700">Font Size</label>
              <select
                onChange={(e) => updateElementStyle("fontSize", e.target.value)}
                className="w-full py-1.5 px-2 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
              >
                <option value="">Default</option>
                <option value="12px">12px</option>
                <option value="14px">14px</option>
                <option value="16px">16px</option>
                <option value="18px">18px</option>
                <option value="20px">20px</option>
                <option value="24px">24px</option>
                <option value="32px">32px</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="block mb-1.5 text-xs font-medium text-gray-700">Padding</label>
              <select
                onChange={(e) => updateElementStyle("padding", e.target.value)}
                className="w-full py-1.5 px-2 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
              >
                <option value="">Default</option>
                <option value="4px">4px</option>
                <option value="8px">8px</option>
                <option value="12px">12px</option>
                <option value="16px">16px</option>
                <option value="20px">20px</option>
                <option value="24px">24px</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={resetElement}
              className="flex-1 py-2 px-3 border border-gray-300 rounded bg-white text-gray-700 cursor-pointer text-xs transition-all duration-200 hover:bg-gray-50"
            >
              Reset Element
            </button>
            <button
              onClick={clearSelection}
              className="flex-1 py-2 px-3 border border-gray-300 rounded bg-white text-gray-700 cursor-pointer text-xs transition-all duration-200 hover:bg-gray-50"
            >
              Clear Selection
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-center text-gray-500 italic my-5">
            {isInspecting
              ? "Click on an element to select it"
              : "Click 'Inspect Element' to start selecting elements"}
          </div>
        </div>
      )}
    </div>
  );
};

export default ElementInspector;

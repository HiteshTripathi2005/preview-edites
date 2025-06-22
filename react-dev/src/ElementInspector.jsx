import React, { useState, useEffect, useRef, useCallback } from "react";
import "./ElementInspector.css";

// Design options moved outside the component to prevent re-rendering
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
  { name: "Indigo", value: "#6366F1", tailwind: "text-indigo-500" },
];

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
  { name: "Light Pink", value: "#FCE7F3", tailwind: "bg-pink-100" },
];

const animationOptions = [
  { name: "None", value: "" },
  { name: "Bounce", value: "animate-bounce" },
  { name: "Pulse", value: "animate-pulse" },
  { name: "Ping", value: "animate-ping" },
  { name: "Spin", value: "animate-spin" },
];

const fontSizeOptions = [
  { name: "Tiny", value: "text-xs" },
  { name: "Small", value: "text-sm" },
  { name: "Normal", value: "text-base" },
  { name: "Large", value: "text-lg" },
  { name: "XL", value: "text-xl" },
  { name: "2XL", value: "text-2xl" },
  { name: "3XL", value: "text-3xl" },
];

const spacingOptions = [
  { name: "None", value: "p-0" },
  { name: "Small", value: "p-2" },
  { name: "Medium", value: "p-4" },
  { name: "Large", value: "p-6" },
  { name: "XL", value: "p-8" },
];

const roundingOptions = [
  { name: "None", value: "rounded-none" },
  { name: "Small", value: "rounded-sm" },
  { name: "Medium", value: "rounded-md" },
  { name: "Large", value: "rounded-lg" },
  { name: "XL", value: "rounded-xl" },
  { name: "Full", value: "rounded-full" },
];

const ElementInspector = () => {
  const [isInspecting, setIsInspecting] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [originalStyles, setOriginalStyles] = useState(new Map());
  const [isVisible, setIsVisible] = useState(false);
  const inspectorRef = useRef(null);

  // Helper functions
  const isMapElement = (element) => {
    return (
      element &&
      (element.getAttribute("data-dynamic") === "true" ||
        element.getAttribute("data-array") !== null ||
        element.closest("[data-array]") !== null)
    );
  };

  const isTextEditingAllowed = (element) => {
    if (!element) return false;
    return !isMapElement(element);
  };

  const getMapInfo = (element) => {
    if (!element) return null;

    const arrayName = element.getAttribute("data-array");
    const arrayIndex = element.getAttribute("data-array-index");

    if (arrayName && arrayIndex !== null) {
      return {
        arrayName,
        arrayIndex: parseInt(arrayIndex),
        isMapElement: true,
      };
    }

    // Check if it's inside a mapped element
    const parentArray = element.closest("[data-array]");
    if (parentArray) {
      return {
        arrayName: parentArray.getAttribute("data-array"),
        arrayIndex: parseInt(parentArray.getAttribute("data-array-index")),
        isMapElement: true,
        isChildOfMapped: true,
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
    const basePattern = baseId.replace(`-${currentIndex}`, "");

    // Find all similar elements
    const allArrayElements = Array.from(
      document.querySelectorAll(`[data-array="${arrayName}"]`)
    );
    const similarElements = allArrayElements.filter((element) => {
      const elementIndex = element.getAttribute("data-array-index");
      const elementId = element.id;

      // Include elements that match the base pattern but have different indices
      return (
        elementId &&
        elementId.startsWith(basePattern) &&
        elementIndex !== currentIndex.toString()
      );
    });

    return [selectedElement, ...similarElements];
  };

  // Apply Tailwind class to element(s)
  const applyTailwindClass = (property, newClass, removeClasses = []) => {
    const elements = getAllSimilarElements();

    elements.forEach((element) => {
      // Remove old classes
      const validClassesToRemove = removeClasses.filter(
        (className) => className !== ""
      );
      if (validClassesToRemove.length > 0) {
        element.classList.remove(...validClassesToRemove);
      }

      // Add new class
      if (newClass && newClass !== "") {
        element.classList.add(newClass);
      }
    });
  };

  // Apply text color
  const applyTextColor = (colorData) => {
    const textColorClasses = colorOptions.map((c) => c.tailwind);
    applyTailwindClass("textColor", colorData.tailwind, textColorClasses);
  };
  // Apply background color
  const applyBackgroundColor = (bgData) => {
    const bgColorClasses = backgroundOptions.map((b) => b.tailwind);
    applyTailwindClass("backgroundColor", bgData.tailwind, bgColorClasses);
  };

  // Create refs to store the current handler functions
  const handlersRef = useRef({});

  // Event handlers defined first (with useCallback for stable references)
  const handleElementClick = useCallback((event) => {
    // Don't inspect the inspector itself
    if (inspectorRef.current?.contains(event.target)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    // Stop inspect mode IMMEDIATELY
    setIsInspecting(false);
    document.body.style.cursor = "";

    // Remove event listeners using the stored refs
    try {
      if (handlersRef.current.click) {
        document.removeEventListener("click", handlersRef.current.click, true);
      }
      if (handlersRef.current.mouseover) {
        document.removeEventListener(
          "mouseover",
          handlersRef.current.mouseover,
          true
        );
      }
      if (handlersRef.current.mouseout) {
        document.removeEventListener(
          "mouseout",
          handlersRef.current.mouseout,
          true
        );
      }
      // Clear the refs
      handlersRef.current = {};
    } catch (error) {
      console.warn("Error removing event listeners:", error);
    }

    // Select the element and handle highlighting
    const targetElement = event.target;

    // Clear any existing highlights
    document
      .querySelectorAll(
        ".inspector-selected, .inspector-hover, .inspector-hover-array, .inspector-array-highlight"
      )
      .forEach((el) => {
        el.classList.remove(
          "inspector-selected",
          "inspector-hover",
          "inspector-hover-array",
          "inspector-array-highlight"
        );
      }); // Set the selected element state
    setSelectedElement(targetElement);
    targetElement.classList.add("inspector-selected");

    // Store original styles for undo functionality - handle similar elements for dynamic content
    const isTargetDynamic =
      targetElement.getAttribute("data-dynamic") === "true" ||
      targetElement.getAttribute("data-array") !== null ||
      targetElement.closest("[data-array]") !== null;

    // For dynamic content, we need to store styles for all similar elements
    let elementsToStore = [targetElement];
    if (isTargetDynamic) {
      // Temporarily set selectedElement to use getAllSimilarElements
      const tempSelected = selectedElement;
      setSelectedElement(targetElement);

      // Get similar elements (this will work now that selectedElement is set)
      const mapInfo = getMapInfo(targetElement);
      if (mapInfo && mapInfo.isMapElement) {
        const arrayName = mapInfo.arrayName;
        const baseId = targetElement.id;
        const currentIndex = mapInfo.arrayIndex;
        const basePattern = baseId.replace(`-${currentIndex}`, "");

        const allArrayElements = Array.from(
          document.querySelectorAll(`[data-array="${arrayName}"]`)
        );
        const similarElements = allArrayElements.filter((element) => {
          const elementIndex = element.getAttribute("data-array-index");
          const elementId = element.id;
          return (
            elementId &&
            elementId.startsWith(basePattern) &&
            elementIndex !== currentIndex.toString()
          );
        });
        elementsToStore = [targetElement, ...similarElements];
      }

      // Restore previous selectedElement temporarily
      if (tempSelected) setSelectedElement(tempSelected);
    }

    // Store original state for all elements that need it
    const newOriginalStyles = new Map(originalStyles);
    elementsToStore.forEach((element) => {
      const elementKey =
        element.id || `element-${Math.random().toString(36).substr(2, 9)}`;
      if (!element.id) {
        element.setAttribute("data-temp-id", elementKey);
      }

      if (!originalStyles.has(elementKey)) {
        newOriginalStyles.set(elementKey, {
          classes: [...element.classList].filter(
            (c) => !c.startsWith("inspector-")
          ),
          text: element.textContent || "",
          style: { ...element.style },
        });
      }
    });

    setOriginalStyles(newOriginalStyles);

    // Finally set the correct selected element
    setSelectedElement(targetElement);

    // Set editing text if allowed
    const isTextAllowed =
      targetElement &&
      !(
        targetElement.getAttribute("data-dynamic") === "true" ||
        targetElement.getAttribute("data-array") !== null ||
        targetElement.closest("[data-array]") !== null
      );

    if (isTextAllowed) {
      setEditingText(targetElement.textContent || "");
    } else {
      setEditingText("");
    }
  }, []);

  const handleElementHover = useCallback(
    (event) => {
      // Don't highlight the inspector itself or already selected elements
      if (
        inspectorRef.current?.contains(event.target) ||
        event.target === selectedElement ||
        event.target.classList.contains("inspector-selected")
      ) {
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
        const basePattern = baseId.replace(`-${currentIndex}`, "");

        const similarElements = Array.from(
          document.querySelectorAll(`[data-array="${arrayName}"]`)
        ).filter((element) => {
          const elementIndex = element.getAttribute("data-array-index");
          const elementId = element.id;
          return (
            elementId &&
            elementId.startsWith(basePattern) &&
            elementIndex !== currentIndex.toString() &&
            element !== event.target
          );
        });

        similarElements.forEach((element) => {
          element.classList.add("inspector-hover-array");
        });
      }
    },
    [selectedElement]
  );

  const handleElementHoverOut = useCallback((event) => {
    event.stopPropagation();
    event.target.classList.remove("inspector-hover");

    // Remove array hover highlights
    document.querySelectorAll(".inspector-hover-array").forEach((el) => {
      el.classList.remove("inspector-hover-array");
    });
  }, []);
  // Mode control functions
  const exitInspectMode = useCallback(() => {
    setIsInspecting(false);
    document.body.style.cursor = "";

    // Remove event listeners using stored refs
    try {
      if (handlersRef.current.click) {
        document.removeEventListener("click", handlersRef.current.click, true);
      }
      if (handlersRef.current.mouseover) {
        document.removeEventListener(
          "mouseover",
          handlersRef.current.mouseover,
          true
        );
      }
      if (handlersRef.current.mouseout) {
        document.removeEventListener(
          "mouseout",
          handlersRef.current.mouseout,
          true
        );
      }
      // Clear the refs
      handlersRef.current = {};
    } catch (error) {
      console.warn("Error removing event listeners:", error);
    }

    // Clear all hover effects
    clearAllHighlights();
  }, []);
  const enterInspectMode = useCallback(() => {
    setIsInspecting(true);
    document.body.style.cursor = "crosshair";

    // Store handler references for cleanup
    handlersRef.current = {
      click: handleElementClick,
      mouseover: handleElementHover,
      mouseout: handleElementHoverOut,
    };

    // Add event listeners
    document.addEventListener("click", handleElementClick, true);
    document.addEventListener("mouseover", handleElementHover, true);
    document.addEventListener("mouseout", handleElementHoverOut, true);
  }, [handleElementClick, handleElementHover, handleElementHoverOut]);

  // Toggle inspect mode
  const toggleInspectMode = useCallback(() => {
    if (isInspecting) {
      exitInspectMode();
    } else {
      enterInspectMode();
    }
  }, [isInspecting, exitInspectMode, enterInspectMode]);

  // Toggle inspector visibility
  const toggleInspector = () => {
    if (isVisible) {
      // When closing inspector, make sure to stop everything
      setIsInspecting(false);
      exitInspectMode();
      clearSelection(); // Clear selection when closing inspector
    }
    setIsVisible(!isVisible);
  };

  const clearAllHighlights = () => {
    if (selectedElement) {
      selectedElement.classList.remove("inspector-selected");
    }

    // Remove all highlight classes
    document
      .querySelectorAll(
        ".inspector-hover, .inspector-hover-array, .inspector-array-highlight"
      )
      .forEach((el) => {
        el.classList.remove(
          "inspector-hover",
          "inspector-hover-array",
          "inspector-array-highlight"
        );
      });
  };
  const selectElement = (element) => {
    clearAllHighlights();

    setSelectedElement(element);
    element.classList.add("inspector-selected");

    // Check map element status for debugging (can be removed in production)
    const isMap = isMapElement(element);
    const mapInfo = getMapInfo(element);

    // Store original state for all similar elements
    const elementsToStore = getAllSimilarElements();
    const newOriginalStyles = new Map(originalStyles);

    elementsToStore.forEach((el) => {
      const elementKey =
        el.id || `element-${Math.random().toString(36).substr(2, 9)}`;
      if (!el.id) el.setAttribute("data-temp-id", elementKey);

      if (!originalStyles.has(elementKey)) {
        newOriginalStyles.set(elementKey, {
          classes: [...el.classList].filter((c) => !c.startsWith("inspector-")),
          text: el.textContent || "",
          style: { ...el.style },
        });
      }
    });

    setOriginalStyles(newOriginalStyles); // Set editing text only for non-map elements
    if (isTextEditingAllowed(element)) {
      setEditingText(element.textContent || "");
    } else {
      setEditingText("");
    }
  };

  const updateElementText = (newText) => {
    if (!selectedElement || !isTextEditingAllowed(selectedElement)) {
      console.warn(
        "Text editing is disabled for map elements to preserve functionality."
      );
      return;
    }

    selectedElement.textContent = newText;
    setEditingText(newText);
  };
  const resetElement = () => {
    if (!selectedElement) return;

    // For dynamic content, we need to reset all similar elements
    const elements = getAllSimilarElements();
    const newOriginalStyles = new Map(originalStyles);

    elements.forEach((element) => {
      // Get element key (ID or temp ID)
      const elementKey = element.id || element.getAttribute("data-temp-id");
      if (!elementKey) return; // Cannot reset without a key

      const originalState = originalStyles.get(elementKey);
      if (originalState) {
        // Reset classes
        element.className = "";
        originalState.classes.forEach((cls) => {
          element.classList.add(cls);
        });

        // Reset text content only for non-map elements
        if (isTextEditingAllowed(element)) {
          element.textContent = originalState.text;
          if (element === selectedElement) {
            setEditingText(originalState.text);
          }
        }

        // Reset inline styles
        element.removeAttribute("style");
        Object.assign(element.style, originalState.style);

        // Clean up temp ID
        if (element.getAttribute("data-temp-id")) {
          element.removeAttribute("data-temp-id");
        }

        // Remove the stored original state since we've reset it
        newOriginalStyles.delete(elementKey);
      }
    });

    setOriginalStyles(newOriginalStyles);
    clearSelection();
  };

  const clearSelection = () => {
    clearAllHighlights();
    setSelectedElement(null);
    setEditingText("");
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "Escape") {
        exitInspectMode();
        setIsVisible(false);
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []); // Safety cleanup for event listeners on component unmount

  useEffect(() => {
    return () => {
      // Force cleanup everything when component unmounts
      setIsInspecting(false);
      document.body.style.cursor = "";
      try {
        // Clean up any remaining event listeners using stored refs
        if (handlersRef.current.click) {
          document.removeEventListener(
            "click",
            handlersRef.current.click,
            true
          );
        }
        if (handlersRef.current.mouseover) {
          document.removeEventListener(
            "mouseover",
            handlersRef.current.mouseover,
            true
          );
        }
        if (handlersRef.current.mouseout) {
          document.removeEventListener(
            "mouseout",
            handlersRef.current.mouseout,
            true
          );
        }
      } catch (error) {
        // Ignore errors during cleanup
      }
    };
  }, []); // Only run on mount/unmount

  const mapInfo = selectedElement ? getMapInfo(selectedElement) : null;
  const similarElementsCount = mapInfo?.isMapElement
    ? getAllSimilarElements().length
    : 1;

  return (
    <>
      {/* Toggle Button */}
      <div
        id="div-1"
        data-component="ElementInspector"
        data-file="src/ElementInspector.jsx"
        className="inspector-toggle"
      >
        <button
          id="button-2"
          data-component="ElementInspector"
          data-file="src/ElementInspector.jsx"
          data-dynamic="true"
          onClick={toggleInspector}
          className="inspector-toggle-btn"
          title="Toggle Element Inspector"
        >
          🖱️
        </button>
      </div>

      {/* Inspector Panel */}
      {isVisible && (
        <div
          id="div-3"
          data-component="ElementInspector"
          data-file="src/ElementInspector.jsx"
          data-dynamic="true"
          ref={inspectorRef}
          className="element-inspector"
        >
          {/* Header */}
          <div
            id="div-4"
            data-component="ElementInspector"
            data-file="src/ElementInspector.jsx"
            className="inspector-header"
          >
            <h3
              id="h3-5"
              data-component="ElementInspector"
              data-file="src/ElementInspector.jsx"
              className="m-0 text-sm font-semibold text-gray-800"
            >
              Page Editor
            </h3>
            <button
              id="button-6"
              data-component="ElementInspector"
              data-file="src/ElementInspector.jsx"
              data-dynamic="true"
              onClick={toggleInspector}
              className="ml-auto text-gray-400 hover:text-gray-600 text-lg"
            >
              ×
            </button>
          </div>

          {/* Inspect Button */}
          <div
            id="div-7"
            data-component="ElementInspector"
            data-file="src/ElementInspector.jsx"
            className="p-4 border-b border-gray-200"
          >
            <button
              id="button-8"
              data-component="ElementInspector"
              data-file="src/ElementInspector.jsx"
              data-dynamic="true"
              onClick={toggleInspectMode}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
                isInspecting
                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
            >
              {isInspecting ? "Stop Selecting" : "Select Something to Edit"}
            </button>
          </div>

          {/* Main Content */}
          {selectedElement ? (
            <div
              id="div-9"
              data-component="ElementInspector"
              data-file="src/ElementInspector.jsx"
              data-dynamic="true"
              className="flex-1 overflow-y-auto p-4 space-y-6"
            >
              {/* Text Editing - Only for non-dynamic elements */}
              {!(
                mapInfo?.isMapElement ||
                selectedElement?.getAttribute("data-dynamic") === "true"
              ) && (
                <div
                  id="div-22"
                  data-component="ElementInspector"
                  data-file="src/ElementInspector.jsx"
                  className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                >
                  <h4
                    id="h4-23"
                    data-component="ElementInspector"
                    data-file="src/ElementInspector.jsx"
                    className="flex items-center space-x-2 mb-3"
                  >
                    <span
                      id="span-24"
                      data-component="ElementInspector"
                      data-file="src/ElementInspector.jsx"
                      className="text-lg"
                    >
                      ✏️
                    </span>
                    <span
                      id="span-25"
                      data-component="ElementInspector"
                      data-file="src/ElementInspector.jsx"
                      className="font-semibold text-gray-800"
                    >
                      Change Text
                    </span>
                  </h4>
                  <textarea
                    id="textarea-26"
                    data-component="ElementInspector"
                    data-file="src/ElementInspector.jsx"
                    data-dynamic="true"
                    value={editingText}
                    onChange={(e) => updateElementText(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Type your new text here..."
                    rows="3"
                  />
                </div>
              )}{" "}
              {/* Dynamic Element Info */}
              {(mapInfo?.isMapElement ||
                selectedElement?.getAttribute("data-dynamic") === "true") && (
                <div
                  id="div-27"
                  data-component="ElementInspector"
                  data-file="src/ElementInspector.jsx"
                  className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4"
                >
                  <div
                    id="div-28"
                    data-component="ElementInspector"
                    data-file="src/ElementInspector.jsx"
                    className="flex items-center space-x-3"
                  >
                    <span
                      id="span-29"
                      data-component="ElementInspector"
                      data-file="src/ElementInspector.jsx"
                      className="text-2xl"
                    >
                      🔒
                    </span>
                    <div
                      id="div-30"
                      data-component="ElementInspector"
                      data-file="src/ElementInspector.jsx"
                    >
                      <h4
                        id="h4-31"
                        data-component="ElementInspector"
                        data-file="src/ElementInspector.jsx"
                        className="font-bold text-amber-800 text-base"
                      >
                        Text Locked
                      </h4>
                      <p
                        id="p-32"
                        data-component="ElementInspector"
                        data-file="src/ElementInspector.jsx"
                        className="text-amber-700 text-sm"
                      >
                        This part is filled in for you. You can still change the
                        style!
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {/* Colors */}
              <div
                id="div-33"
                data-component="ElementInspector"
                data-file="src/ElementInspector.jsx"
                data-dynamic="true"
                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
              >
                <h4
                  id="h4-34"
                  data-component="ElementInspector"
                  data-file="src/ElementInspector.jsx"
                  className="flex items-center space-x-2 mb-4"
                >
                  <span
                    id="span-35"
                    data-component="ElementInspector"
                    data-file="src/ElementInspector.jsx"
                    className="text-lg"
                  >
                    🎨
                  </span>
                  <span
                    id="span-36"
                    data-component="ElementInspector"
                    data-file="src/ElementInspector.jsx"
                    className="font-semibold text-gray-800"
                  >
                    Style
                  </span>
                </h4>
                {/* Text Colors */}
                <div
                  id="div-37"
                  data-component="ElementInspector"
                  data-file="src/ElementInspector.jsx"
                  className="mb-4"
                >
                  <label
                    id="label-38"
                    data-component="ElementInspector"
                    data-file="src/ElementInspector.jsx"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Text Color
                  </label>
                  <div
                    id="div-39"
                    data-component="ElementInspector"
                    data-file="src/ElementInspector.jsx"
                    data-dynamic="true"
                    className="grid grid-cols-5 gap-2"
                  >
                    {colorOptions.map((color, index) => (
                      <button
                        id="button-40"
                        data-component="ElementInspector"
                        data-file="src/ElementInspector.jsx"
                        data-dynamic="true"
                        key={index}
                        onClick={() => applyTextColor(color)}
                        className="group relative w-10 h-10 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-all duration-200 hover:scale-110 focus:ring-2 focus:ring-blue-500"
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      >
                        <span
                          id="span-41"
                          data-component="ElementInspector"
                          data-file="src/ElementInspector.jsx"
                          data-dynamic="true"
                          className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                        >
                          {color.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                {/* Background Colors */}
                <div
                  id="div-42"
                  data-component="ElementInspector"
                  data-file="src/ElementInspector.jsx"
                >
                  <label
                    id="label-43"
                    data-component="ElementInspector"
                    data-file="src/ElementInspector.jsx"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Background
                  </label>
                  <div
                    id="div-44"
                    data-component="ElementInspector"
                    data-file="src/ElementInspector.jsx"
                    data-dynamic="true"
                    className="grid grid-cols-5 gap-2"
                  >
                    {backgroundOptions.map((bg, index) => (
                      <button
                        id="button-45"
                        data-component="ElementInspector"
                        data-file="src/ElementInspector.jsx"
                        data-dynamic="true"
                        key={index}
                        onClick={() => applyBackgroundColor(bg)}
                        className="group relative w-10 h-10 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-all duration-200 hover:scale-110 focus:ring-2 focus:ring-blue-500"
                        style={{
                          backgroundColor:
                            bg.value === "transparent" ? "#ffffff" : bg.value,
                          backgroundImage:
                            bg.value === "transparent"
                              ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)"
                              : "none",
                          backgroundSize:
                            bg.value === "transparent" ? "8px 8px" : "auto",
                          backgroundPosition:
                            bg.value === "transparent"
                              ? "0 0, 0 4px, 4px -4px, -4px 0px"
                              : "initial",
                        }}
                        title={bg.name}
                      >
                        <span
                          id="span-46"
                          data-component="ElementInspector"
                          data-file="src/ElementInspector.jsx"
                          data-dynamic="true"
                          className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                        >
                          {bg.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {/* Typography */}
              <div
                id="div-47"
                data-component="ElementInspector"
                data-file="src/ElementInspector.jsx"
                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
              >
                <h4
                  id="h4-48"
                  data-component="ElementInspector"
                  data-file="src/ElementInspector.jsx"
                  className="flex items-center space-x-2 mb-4"
                >
                  <span
                    id="span-49"
                    data-component="ElementInspector"
                    data-file="src/ElementInspector.jsx"
                    className="text-lg"
                  >
                    🔤
                  </span>
                  <span
                    id="span-50"
                    data-component="ElementInspector"
                    data-file="src/ElementInspector.jsx"
                    className="font-semibold text-gray-800"
                  >
                    Text Size
                  </span>
                </h4>
                <div
                  id="div-51"
                  data-component="ElementInspector"
                  data-file="src/ElementInspector.jsx"
                  data-dynamic="true"
                  className="grid grid-cols-2 gap-3"
                >
                  {fontSizeOptions.map((size, index) => (
                    <button
                      id="button-52"
                      data-component="ElementInspector"
                      data-file="src/ElementInspector.jsx"
                      data-dynamic="true"
                      key={index}
                      onClick={() =>
                        applyTailwindClass(
                          "fontSize",
                          size.value,
                          fontSizeOptions.map((s) => s.value)
                        )
                      }
                      className="p-2 text-sm border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all"
                    >
                      {size.name}
                    </button>
                  ))}
                </div>
              </div>
              {/* Spacing */}
              <div
                id="div-spacing"
                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
              >
                <h4
                  id="h4-spacing"
                  className="flex items-center space-x-2 mb-4"
                >
                  <span id="span-spacing-icon" className="text-lg">
                    📏
                  </span>
                  <span
                    id="span-spacing-title"
                    className="font-semibold text-gray-800"
                  >
                    Spacing
                  </span>
                </h4>
                <div
                  id="div-spacing-options"
                  className="grid grid-cols-2 gap-3"
                >
                  {spacingOptions.map((size, index) => (
                    <button
                      id={`button-spacing-${index}`}
                      key={index}
                      onClick={() =>
                        applyTailwindClass(
                          "padding",
                          size.value,
                          spacingOptions.map((s) => s.value)
                        )
                      }
                      className="p-2 text-sm border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all"
                    >
                      {size.name}
                    </button>
                  ))}
                </div>
              </div>
              {/* Rounding */}
              <div
                id="div-rounding"
                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
              >
                <h4
                  id="h4-rounding"
                  className="flex items-center space-x-2 mb-4"
                >
                  <span id="span-rounding-icon" className="text-lg">
                    🔄
                  </span>
                  <span
                    id="span-rounding-title"
                    className="font-semibold text-gray-800"
                  >
                    Rounding
                  </span>
                </h4>
                <div
                  id="div-rounding-options"
                  className="grid grid-cols-2 gap-3"
                >
                  {roundingOptions.map((size, index) => (
                    <button
                      id={`button-rounding-${index}`}
                      key={index}
                      onClick={() =>
                        applyTailwindClass(
                          "borderRadius",
                          size.value,
                          roundingOptions.map((s) => s.value)
                        )
                      }
                      className="p-2 text-sm border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all"
                    >
                      {size.name}
                    </button>
                  ))}
                </div>
              </div>
              {/* Reset Button */}
              <div
                id="div-53"
                data-component="ElementInspector"
                data-file="src/ElementInspector.jsx"
                className="pt-4 border-t"
              >
                <button
                  id="button-54"
                  data-component="ElementInspector"
                  data-file="src/ElementInspector.jsx"
                  data-dynamic="true"
                  onClick={resetElement}
                  className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                >
                  Undo Changes
                </button>
              </div>
            </div>
          ) : (
            <div
              id="div-55"
              data-component="ElementInspector"
              data-file="src/ElementInspector.jsx"
              className="p-8 text-center text-gray-500"
            >
              <div
                id="div-56"
                data-component="ElementInspector"
                data-file="src/ElementInspector.jsx"
                className="text-4xl mb-4"
              >
                👆
              </div>
              <p
                id="p-57"
                data-component="ElementInspector"
                data-file="src/ElementInspector.jsx"
              >
                Click "Select Something to Edit" and then click on any part of
                the page
              </p>
              <div
                id="div-58"
                data-component="ElementInspector"
                data-file="src/ElementInspector.jsx"
                className="mt-4 text-sm"
              >
                <p
                  id="p-59"
                  data-component="ElementInspector"
                  data-file="src/ElementInspector.jsx"
                  className="mb-2"
                >
                  Some parts can only be styled, not changed.
                </p>
                <p
                  id="p-61"
                  data-component="ElementInspector"
                  data-file="src/ElementInspector.jsx"
                >
                  Other parts let you change both the text and the style.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ElementInspector;

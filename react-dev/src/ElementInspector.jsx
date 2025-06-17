import React, { useState, useEffect, useRef } from "react";
import "./ElementInspector.css";

const ElementInspector = () => {
  const [isInspecting, setIsInspecting] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [originalStyles, setOriginalStyles] = useState(new Map());
  const [isVisible, setIsVisible] = useState(false);
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

  const updateElementText = (newText) => {
    if (!selectedElement) return;

    setEditingText(newText);
    selectedElement.textContent = newText;
  };

  const updateElementStyle = (property, value) => {
    if (!selectedElement) return;
    selectedElement.style[property] = value;
  };

  const resetElement = () => {
    if (!selectedElement) return;

    const original = originalStyles.get(selectedElement);
    if (original) {
      selectedElement.style.color = original.color;
      selectedElement.style.backgroundColor = original.backgroundColor;
      selectedElement.style.fontSize = original.fontSize;
      selectedElement.style.padding = original.padding;
      selectedElement.style.margin = original.margin;
      selectedElement.textContent = original.textContent;
      setEditingText(original.textContent || "");
    }
  };

  const clearSelection = () => {
    if (selectedElement) {
      selectedElement.classList.remove("inspector-selected");
      setSelectedElement(null);
      setEditingText("");
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
      <div className="inspector-toggle">
        <button
          onClick={toggleInspector}
          className="inspector-toggle-btn"
          title="Open Element Inspector (Ctrl+Shift+I)"
        >
          🔍
        </button>
      </div>
    );
  }

  return (
    <div ref={inspectorRef} className="element-inspector">
      <div className="inspector-header">
        <h3>Element Inspector</h3>
        <div className="inspector-controls">
          <button
            onClick={toggleInspectMode}
            className={`inspect-btn ${isInspecting ? "active" : ""}`}
          >
            {isInspecting ? "Exit Inspect" : "Inspect Element"}
          </button>
          <button onClick={toggleInspector} className="close-btn">
            ×
          </button>
        </div>
      </div>

      {selectedElement ? (
        <div className="inspector-content">
          <div className="element-info">
            <h4>Selected Element</h4>
            <p>
              <strong>Tag:</strong> {selectedElement.tagName.toLowerCase()}
            </p>
            <p>
              <strong>Classes:</strong> {selectedElement.className || "None"}
            </p>
          </div>

          <div className="text-editor">
            <h4>Text Content</h4>
            <textarea
              value={editingText}
              onChange={(e) => updateElementText(e.target.value)}
              placeholder="Element text content"
              rows="3"
            />
          </div>

          <div className="style-controls">
            <h4>Styles</h4>

            <div className="style-group">
              <label>Text Color</label>
              <div className="color-grid">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    className="color-btn"
                    style={{ backgroundColor: color }}
                    onClick={() => updateElementStyle("color", color)}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div className="style-group">
              <label>Background</label>
              <div className="color-grid">
                {backgroundOptions.map((color) => (
                  <button
                    key={color}
                    className="color-btn"
                    style={{
                      backgroundColor: color,
                      border:
                        color === "transparent"
                          ? "1px dashed #ccc"
                          : "1px solid #ddd",
                    }}
                    onClick={() => updateElementStyle("backgroundColor", color)}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div className="style-group">
              <label>Font Size</label>
              <select
                onChange={(e) => updateElementStyle("fontSize", e.target.value)}
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

            <div className="style-group">
              <label>Padding</label>
              <select
                onChange={(e) => updateElementStyle("padding", e.target.value)}
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

          <div className="inspector-actions">
            <button onClick={resetElement} className="reset-btn">
              Reset to Original
            </button>
            <button onClick={clearSelection} className="clear-btn">
              Clear Selection
            </button>
          </div>
        </div>
      ) : (
        <div className="inspector-content">
          <p className="no-selection">
            {isInspecting
              ? "Click on an element to inspect it"
              : 'Click "Inspect Element" to start selecting elements'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ElementInspector;

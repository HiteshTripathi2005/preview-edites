/**
 * ESLint rule to automatically add IDs and data attributes for element inspector
 * @fileoverview Adds missing IDs and data attributes to JSX elements for inspector functionality
 */

const path = require('path');

// Counter for generating unique IDs
let elementCounter = 0;

// Helper function to generate element ID
function generateElementId(elementType, arrayContext = null) {
  if (arrayContext) {
    return `${arrayContext.arrayName}-\${${arrayContext.itemVar}.id || ${arrayContext.index}}`;
  }
  
  elementCounter++;
  return `${elementType}-${elementCounter}`;
}

// Helper function to get component name from filename
function getComponentName(filename) {
  if (!filename) return 'UnknownComponent';
  const basename = path.basename(filename, path.extname(filename));
  return basename;
}

// Helper function to get relative file path
function getRelativeFilePath(filename) {
  if (!filename) return 'unknown.jsx';
  const relativePath = path.relative(process.cwd(), filename);
  return relativePath.replace(/\\/g, '/'); // Normalize path separators
}

// Helper function to detect if element is inside a map function
function detectArrayContext(node, context) {
  let current = node.parent;
  
  while (current) {
    // Check if we're inside a map call expression
    if (current.type === 'CallExpression' && 
        current.callee && 
        current.callee.property && 
        current.callee.property.name === 'map') {
      
      // Get the array name
      let arrayName = 'items';
      if (current.callee.object && current.callee.object.name) {
        arrayName = current.callee.object.name;
      }
      
      // Get the callback function parameters
      const callback = current.arguments[0];
      if (callback && callback.params && callback.params.length > 0) {
        const itemParam = callback.params[0];
        const indexParam = callback.params[1];
        
        return {
          arrayName,
          itemVar: itemParam.name || 'item',
          indexVar: indexParam ? indexParam.name : 'index',
          index: indexParam ? indexParam.name : 'index'
        };
      }
    }
    current = current.parent;
  }
  
  return null;
}

// Helper function to create JSX attribute
function createJSXAttribute(name, value, isLiteral = true) {
  return {
    type: 'JSXAttribute',
    name: {
      type: 'JSXIdentifier',
      name: name
    },
    value: isLiteral ? {
      type: 'Literal',
      value: value,
      raw: `"${value}"`
    } : {
      type: 'JSXExpressionContainer',
      expression: value
    }
  };
}

// Helper function to create template literal for dynamic IDs
function createTemplateLiteral(parts) {
  return {
    type: 'TemplateLiteral',
    quasis: parts.quasis,
    expressions: parts.expressions
  };
}

module.exports = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Automatically add IDs and data attributes for element inspector',
      category: 'Stylistic Issues',
      recommended: true,
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          skipElements: {
            type: 'array',
            items: { type: 'string' },
            default: ['Fragment', 'React.Fragment']
          },
          autoGenerateIds: {
            type: 'boolean',
            default: true
          },
          addDataAttributes: {
            type: 'boolean',
            default: true
          }
        },
        additionalProperties: false
      }
    ]
  },

  create(context) {
    const options = context.options[0] || {};
    const skipElements = options.skipElements || ['Fragment', 'React.Fragment'];
    const autoGenerateIds = options.autoGenerateIds !== false;
    const addDataAttributes = options.addDataAttributes !== false;
    
    const filename = context.getFilename();
    const componentName = getComponentName(filename);
    const filePath = getRelativeFilePath(filename);

    return {
      JSXOpeningElement(node) {
        // Skip fragments and specified elements
        if (node.name && skipElements.includes(node.name.name)) {
          return;
        }

        // Only process HTML elements and custom components
        if (!node.name || !node.name.name) {
          return;
        }

        const elementName = node.name.name;
        
        // Skip if it's not a DOM element or component
        if (elementName[0] === elementName[0].toUpperCase() && elementName !== componentName) {
          return; // Skip other React components
        }

        // Check existing attributes
        const existingAttrs = {};
        node.attributes.forEach(attr => {
          if (attr.type === 'JSXAttribute' && attr.name) {
            existingAttrs[attr.name.name] = attr;
          }
        });

        const missingAttrs = [];
        const arrayContext = detectArrayContext(node, context);

        // Check for missing ID
        if (autoGenerateIds && !existingAttrs.id) {
          const idValue = generateElementId(elementName.toLowerCase(), arrayContext);
          
          if (arrayContext) {
            // Create template literal for dynamic ID
            const templateLiteral = {
              type: 'TemplateLiteral',
              quasis: [
                {
                  type: 'TemplateElement',
                  value: { raw: `${arrayContext.arrayName}-`, cooked: `${arrayContext.arrayName}-` },
                  tail: false
                },
                {
                  type: 'TemplateElement',
                  value: { raw: '', cooked: '' },
                  tail: true
                }
              ],
              expressions: [
                {
                  type: 'LogicalExpression',
                  operator: '||',
                  left: {
                    type: 'MemberExpression',
                    object: { type: 'Identifier', name: arrayContext.itemVar },
                    property: { type: 'Identifier', name: 'id' },
                    computed: false
                  },
                  right: { type: 'Identifier', name: arrayContext.indexVar || 'index' }
                }
              ]
            };

            missingAttrs.push(createJSXAttribute('id', templateLiteral, false));
          } else {
            missingAttrs.push(createJSXAttribute('id', idValue));
          }
        }

        // Check for missing data attributes
        if (addDataAttributes) {
          if (!existingAttrs['data-component']) {
            missingAttrs.push(createJSXAttribute('data-component', componentName));
          }
          
          if (!existingAttrs['data-file']) {
            missingAttrs.push(createJSXAttribute('data-file', filePath));
          }

          if (arrayContext) {
            if (!existingAttrs['data-array']) {
              missingAttrs.push(createJSXAttribute('data-array', arrayContext.arrayName));
            }
            
            if (!existingAttrs['data-array-index']) {
              const indexExpression = {
                type: 'Identifier',
                name: arrayContext.indexVar || 'index'
              };
              missingAttrs.push(createJSXAttribute('data-array-index', indexExpression, false));
            }
          }
        }        // Report and fix if attributes are missing
        if (missingAttrs.length > 0) {
          context.report({
            node,
            message: `Missing inspector attributes on <${elementName}> element`,
            fix(fixer) {
              const sourceCode = context.getSourceCode();
              const fixes = [];

              missingAttrs.forEach(attr => {
                let attrText;
                
                if (attr.value.type === 'JSXExpressionContainer') {
                  // Handle template literals and expressions
                  if (attr.value.expression.type === 'TemplateLiteral') {
                    const templateLiteral = attr.value.expression;
                    let templateStr = '`';
                    
                    templateLiteral.quasis.forEach((quasi, index) => {
                      templateStr += quasi.value.raw;
                      if (templateLiteral.expressions[index]) {
                        templateStr += '${';
                        if (templateLiteral.expressions[index].type === 'LogicalExpression') {
                          const expr = templateLiteral.expressions[index];
                          templateStr += `${expr.left.object.name}.${expr.left.property.name} || ${expr.right.name}`;
                        } else {
                          templateStr += templateLiteral.expressions[index].name || 'index';
                        }
                        templateStr += '}';
                      }
                    });
                    templateStr += '`';
                    attrText = `${attr.name.name}={${templateStr}}`;
                  } else {
                    // Simple identifier expression
                    attrText = `${attr.name.name}={${attr.value.expression.name}}`;
                  }
                } else {
                  // Literal value
                  attrText = `${attr.name.name}="${attr.value.value}"`;
                }
                
                // Insert after the element name
                const insertPosition = node.name.range[1];
                fixes.push(fixer.insertTextAfterRange([insertPosition, insertPosition], ` ${attrText}`));
              });

              return fixes;
            }
          });
        }
      }
    };
  }
};

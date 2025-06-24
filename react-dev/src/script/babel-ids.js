import { parse } from '@babel/parser';
import _generate from '@babel/generator';
import _traverse from '@babel/traverse';
import * as t from '@babel/types';
import fs from 'fs';
import path from 'path';

const traverse = _traverse.default || _traverse;
const generate = _generate.default || _generate;

// Set to track all generated IDs globally to ensure uniqueness
let globalIdSet = new Set();

function generateRandomId(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateUniqueId(tagName, arrayInfo = null, filePath) {
  let baseId;
  let finalId;
  let attempts = 0;
  const maxAttempts = 100;
  
  if (arrayInfo) {
    // Generate base ID for array elements - use random suffix
    const randomSuffix = generateRandomId(4);
    baseId = `${arrayInfo.name}-${tagName}-${randomSuffix}`;
    return baseId; // We'll handle the index separately
  }
  
  // Generate truly unique random ID for regular elements
  do {
    const randomSuffix = generateRandomId(5);
    finalId = `${tagName}-${randomSuffix}`;
    attempts++;
    
    if (attempts >= maxAttempts) {
      // Fallback: use timestamp + random
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substr(2, 4);
      finalId = `${tagName}-${timestamp}-${random}`;
      break;
    }
  } while (globalIdSet.has(finalId));
  
  // Track this ID as used
  globalIdSet.add(finalId);
  
  return finalId;
}

function getComponentName(filePath) {
  const fileName = path.basename(filePath, path.extname(filePath));
  return fileName;
}

function getRelativeFilePath(filePath) {
  return filePath.replace(process.cwd() + path.sep, '').replace(/\\/g, '/');
}

function findArrayContext(path) {
  // Traverse up the AST to find if we're inside a map function
  let currentPath = path.parentPath;
  
  while (currentPath) {
    // Check for .map() call expressions
    if (currentPath.isCallExpression()) {
      const callee = currentPath.node.callee;
      
      if (t.isMemberExpression(callee) && 
          t.isIdentifier(callee.property) && 
          callee.property.name === 'map') {
        
        const arrayObject = callee.object;
        const mapFunction = currentPath.node.arguments[0];
        
        if (t.isArrowFunctionExpression(mapFunction) || t.isFunctionExpression(mapFunction)) {
          const params = mapFunction.params;
          const itemParam = params[0];
          const indexParam = params[1];
          
          // Get array name - handle different cases
          let arrayName = 'items'; // default
          if (t.isIdentifier(arrayObject)) {
            arrayName = arrayObject.name;
          } else if (t.isMemberExpression(arrayObject) && t.isIdentifier(arrayObject.property)) {
            arrayName = arrayObject.property.name;
          }
          
          return {
            name: arrayName,
            item: itemParam ? itemParam.name : 'item',
            index: indexParam ? indexParam.name : 'index'
          };
        }
      }
    }
    
    currentPath = currentPath.parentPath;
  }
  
  return null;
}

function isDynamicContent(path) {
  // Check if element is inside a map function
  const arrayContext = findArrayContext(path);
  if (arrayContext) {
    return true;
  }
  
  // Check if the JSX element itself contains dynamic content
  const jsxElement = path.node;
  
  // Check if element has dynamic attributes (excluding 'key')
  if (jsxElement.attributes) {
    for (const attr of jsxElement.attributes) {
      if (t.isJSXAttribute(attr) && 
          t.isJSXExpressionContainer(attr.value) &&
          attr.name && attr.name.name !== 'key') {
        return true;
      }
    }
  }
  
  // Check children for JSX expressions
  const parentElement = path.parent;
  if (t.isJSXElement(parentElement) && parentElement.children) {
    for (const child of parentElement.children) {
      if (t.isJSXExpressionContainer(child)) {
        // Check if it's not just a simple string/number
        const expression = child.expression;
        if (!t.isStringLiteral(expression) && !t.isNumericLiteral(expression)) {
          return true;
        }
      }
    }
  }
  
  return false;
}

function addIdsToFile(filePath) {
  try {
    const code = fs.readFileSync(filePath, 'utf8');
    
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });

    const componentName = getComponentName(filePath);
    const relativeFilePath = getRelativeFilePath(filePath);
    let modified = false;

    traverse(ast, {
      JSXOpeningElement(path) {
        const node = path.node;
        
        // Skip if not a valid JSX element or if it's a Fragment
        if (!t.isJSXIdentifier(node.name)) {
          return;
        }
        
        const tagName = node.name.name;
        
        // Skip fragments and React components (uppercase)
        if (tagName === 'Fragment' || 
            tagName === 'React.Fragment' ||
            /^[A-Z]/.test(tagName)) {
          return;
        }

        // Check if ID already exists
        const hasId = node.attributes.some(attr => 
          t.isJSXAttribute(attr) && attr.name && attr.name.name === 'id'
        );        if (!hasId) {
          const arrayContext = findArrayContext(path);
          const isDynamic = isDynamicContent(path);
          const idValue = generateUniqueId(tagName, arrayContext, filePath);
          
          // Create ID attributes - for array elements, we need both static and dynamic IDs
          let idAttr, staticIdAttr;
          
          if (arrayContext) {
            // Dynamic ID (e.g., "items-div-0", "items-div-1")
            idAttr = t.jsxAttribute(
              t.jsxIdentifier('id'),
              t.jsxExpressionContainer(
                t.binaryExpression(
                  '+',
                  t.binaryExpression('+', t.stringLiteral(idValue + '-'), t.identifier(arrayContext.index)),
                  t.stringLiteral('')
                )
              )
            );
            
            // Static ID for styling all items in the array (e.g., "items-div-static")
            staticIdAttr = t.jsxAttribute(
              t.jsxIdentifier('data-static-id'),
              t.stringLiteral(idValue + '-static')
            );
          } else {
            // Regular static ID for non-array elements
            idAttr = t.jsxAttribute(
              t.jsxIdentifier('id'),
              t.stringLiteral(idValue)
            );
          }

          // Create data attributes
          const dataComponentAttr = t.jsxAttribute(
            t.jsxIdentifier('data-component'),
            t.stringLiteral(componentName)
          );

          const dataFileAttr = t.jsxAttribute(
            t.jsxIdentifier('data-file'),
            t.stringLiteral(relativeFilePath)
          );          // Start with basic attributes
          const attributes = [idAttr, dataComponentAttr, dataFileAttr];
          
          // Add static ID for array elements
          if (arrayContext && staticIdAttr) {
            attributes.push(staticIdAttr);
          }
          
          // Add array context attributes if in array
          if (arrayContext) {
            attributes.push(
              t.jsxAttribute(
                t.jsxIdentifier('data-array'),
                t.stringLiteral(arrayContext.name)
              ),
              t.jsxAttribute(
                t.jsxIdentifier('data-array-index'),
                t.jsxExpressionContainer(t.identifier(arrayContext.index))
              )
            );
          }
          
          // Add dynamic content attribute
          if (isDynamic) {
            attributes.push(
              t.jsxAttribute(
                t.jsxIdentifier('data-dynamic'),
                t.stringLiteral('true')
              )
            );
          }

          // Add attributes to the beginning
          node.attributes.unshift(...attributes);
          modified = true;
        }
      }
    });

    if (modified) {
      const output = generate(ast, {
        retainLines: true,
        compact: false
      });
      
      fs.writeFileSync(filePath, output.code);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function getAllJsxFiles(dir) {
  const files = [];
  
  function scanDir(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && 
          item !== 'node_modules' && 
          item !== 'dist' && 
          item !== 'build' &&
          !item.startsWith('.')) {
        scanDir(fullPath);
      } else if (stat.isFile() && /\.(jsx|tsx)$/.test(item)) {
        files.push(fullPath);
      }
    }
  }
  
  scanDir(dir);
  return files;
}

function processAllFiles() {
  const srcDir = path.join(process.cwd(), 'src');
  
  if (!fs.existsSync(srcDir)) {
    console.error('❌ Source directory not found. Make sure you are in the project root.');
    return;
  }
  
  // Clear global ID set for fresh start
  globalIdSet.clear();
  
  const files = getAllJsxFiles(srcDir);

  console.log(`🔍 Processing ${files.length} JSX/TSX files...`);

  let processed = 0;
  for (const file of files) {
    const success = addIdsToFile(file);
    if (success) {
      processed++;
      console.log(`  ✅ ${path.relative(process.cwd(), file)}`);
    }
  }

  console.log(`\n🎯 Processed ${processed} files successfully!`);
}

function processSingleFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return;
  }
  
  // Clear global ID set for fresh start when processing single file
  globalIdSet.clear();
  
  const success = addIdsToFile(filePath);
  if (success) {
    console.log(`✅ IDs added to ${path.basename(filePath)}`);
  } else {
    console.log(`ℹ️  No changes needed for ${path.basename(filePath)}`);
  }
}

// CLI usage
if (process.argv.length > 2) {
  const arg = process.argv[2];
  
  if (arg === '--help' || arg === '-h') {
    console.log(`
🎯 Babel IDs - Automatic Unique ID Generator for JSX/TSX Files

Usage:
  node babel-ids.js                    # Process all JSX/TSX files
  node babel-ids.js --all             # Process all JSX/TSX files
  node babel-ids.js <file>            # Process a specific file
  node babel-ids.js --help            # Show this help

Examples:
  npm run add-ids                     # Process all files
  npm run add-ids-file src/App.jsx    # Process specific file

What it does:
  ✅ Adds truly unique random IDs (div-a3k9f, h1-x7m2p, etc.)
  ✅ Adds data-component attributes
  ✅ Adds data-file attributes
  ✅ Handles map functions automatically
  ✅ Detects dynamic content (data-dynamic="true")
  ✅ Adds array context attributes (data-array, data-array-index)
  ✅ Prevents ID collisions globally

Example Generated IDs:
  • Regular elements: div-a3k9f, h1-x7m2p, button-k8w4t
  • Array elements: items-div-k4m8-\${index}, todos-li-p9x2-\${index}
  • Static IDs for arrays: data-static-id="items-div-k4m8-static"

Map Function Support:
  • Automatically detects .map() calls
  • Generates unique base IDs like: items-div-k4m8-\${index}
  • Adds data-array="items" and data-array-index={index}
  • Adds data-static-id for styling all items in array
  • Marks as data-dynamic="true"
  • Allows styling both individual items (dynamic ID) and all items (static ID)
    `);
  } else if (arg === '--all' || arg === '-a') {
    processAllFiles();
  } else {
    processSingleFile(arg);
  }
} else {
  processAllFiles();
}

export { addIdsToFile, processAllFiles, processSingleFile };
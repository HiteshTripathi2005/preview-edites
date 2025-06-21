import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { spawn } from 'child_process';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    // Auto-ID generation plugin (inline)
    {
      name: 'auto-add-ids',
      configureServer(server) {
        let isProcessing = false;
        
        server.watcher.on('change', async (file) => {
          // Only process JSX/TSX files and avoid processing during build
          if (/\.(jsx|tsx)$/.test(file) && !isProcessing) {
            isProcessing = true;
            
            try {
              const relativePath = path.relative(process.cwd(), file);
              console.log(`\n🔍 Auto-adding IDs to: ${relativePath}`);
              
              // Run the babel-ids script on the changed file
              const child = spawn('node', ['src/script/babel-ids.js', file], { 
                stdio: 'pipe',
                shell: true,
                cwd: process.cwd()
              });
              
              let output = '';
              child.stdout.on('data', (data) => {
                output += data.toString();
              });
              
              child.stderr.on('data', (data) => {
                console.error('Script error:', data.toString());
              });
              
              child.on('close', (code) => {
                if (code === 0) {
                  if (output.includes('✅')) {
                    console.log('✅ IDs added successfully!');
                  } else if (output.includes('ℹ️')) {
                    console.log('ℹ️  No changes needed');
                  } else {
                    console.log('✅ File processed');
                  }
                } else {
                  console.error(`❌ Script failed with code ${code}`);
                }
                isProcessing = false;
              });
              
              child.on('error', (error) => {
                console.error('❌ Error running script:', error.message);
                isProcessing = false;
              });
              
            } catch (error) {
              console.error('❌ Error processing file:', error.message);
              isProcessing = false;
            }
          }
        });
        
        console.log('\n🚀 Auto-ID generation active! IDs will be added automatically when you save JSX/TSX files.\n');
      }
    }
  ],
  server: {
    port: 5173,
    cors: true
  }
});

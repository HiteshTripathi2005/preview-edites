import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { spawn } from 'child_process';

export default defineConfig({
  plugins: [
    react(),
    
    // Auto-add IDs when JSX files are saved
    {
      name: 'auto-add-inspector-ids',
      configureServer(server) {
        let isProcessing = false;
        
        server.watcher.on('change', (file) => {
          if (/\.(jsx|tsx)$/.test(file) && !isProcessing) {
            isProcessing = true;
            
            console.log(`\n🔍 Auto-adding IDs to: ${file.replace(process.cwd(), '.')}`);
            
            const child = spawn('npx', ['eslint', file, '--fix'], { 
              stdio: 'pipe', 
              shell: true 
            });
            
            child.on('close', () => {
              console.log('✅ IDs added successfully!');
              isProcessing = false;
            });
            
            child.on('error', () => {
              isProcessing = false;
            });
          }
        });
        
        console.log('\n🚀 Auto-ID generation active! Save any .jsx/.tsx file to add IDs automatically.\n');
      }
    }  ],
  server: {
    port: 5173,
    cors: true
  }
});

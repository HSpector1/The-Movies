import {build} from 'vite';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
await build({root,configFile:false,cacheDir:'.vite',build:{outDir:'dist',emptyOutDir:true,target:'es2022',chunkSizeWarningLimit:800}});

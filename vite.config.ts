import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({

  //   build: {
  //   rollupOptions: {
  //     external: ['react-is']
  //   }
  // },
   base: '/', 
  plugins: [
    tailwindcss(),
    react()
  ],
})





// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
//
// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })

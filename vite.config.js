import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  build: {
    outDir: "dist",

    rollupOptions:{
     input:{
      main: "./index.html",
      menu: "./Menu/index.html",
      register: "./register.html",
      cart: "./cart.html",
      signin: "./signin.html",


    }
  }
  },
  server: {
    open: true,
  },
});

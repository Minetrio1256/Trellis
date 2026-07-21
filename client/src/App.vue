<script setup>

import { onMounted } from "vue";

import Login from "./pages/Login.vue";
import Desktop from "./pages/Desktop.vue";

import { useAuthStore } from "./stores/auth";


const auth = useAuthStore();


onMounted(() => {
  auth.check();
});

</script>


<template>

  <div v-if="auth.loading">
    Booting Trellis 98...
  </div>


  <Login
      v-else-if="!auth.authenticated"
  />


  <Desktop
      v-else
  />

</template>
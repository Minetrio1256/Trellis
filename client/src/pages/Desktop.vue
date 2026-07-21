<script setup>

import { ref } from "vue";
import StartMenu from "../components/StartMenu.vue";


const open = ref(false);

const username = "minetrio1256";

</script>


<template>

  <div class="desktop">


    <div class="taskbar">

      <button
          @click="open = !open"
      >
        <b>▣ Start</b>
      </button>


      <div class="clock">
        12:00 PM
      </div>

    </div>


    <StartMenu
        v-if="open"
        :username="username"
    />

  </div>

</template>


<style scoped>

.desktop {

  width:100%;
  height:100vh;

  background:#008080;

}


.taskbar {

  position:absolute;

  bottom:0;
  left:0;

  width:100%;
  height:38px;

  background:#c0c0c0;

  border-top:2px solid white;

  display:flex;
  align-items:center;

  padding:2px;

}


.clock {

  margin-left:auto;

  border:2px inset white;

  padding:4px 12px;

}


</style>
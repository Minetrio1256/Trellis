<script setup>

import { ref } from "vue";
import StartMenu from "../components/StartMenu.vue";


const open = ref(false);

const username = "minetrio1256";

</script>


<template>

  <div class="desktop">

    <StartMenu
        v-if="open"
        :username="username"
    />


    <div class="taskbar">

      <button
          class="start-button"
          @click="open = !open"
      >
        <img src="https://win98icons.alexmeub.com/icons/png/windows-0.png">
        <b>Start</b>
      </button>


      <div class="clock">
        12:00 PM
      </div>

    </div>


  </div>

</template>


<style scoped>

.desktop {

  width:100%;
  height:100vh;

  background:#008080;

  overflow:hidden;

}


.taskbar {

  position:fixed;

  bottom:0;
  left:0;

  width:100%;
  height:40px;


  box-sizing:border-box;


  background:#c0c0c0;

  border-top:2px solid white;


  display:flex;

  align-items:center;

  padding:2px;

  z-index:1000;

}


.start-button {

  height:32px;

  display:flex;

  align-items:center;

  gap:5px;

}


.start-button img {

  width:18px;
  height:18px;

}


.clock {

  margin-left:auto;


  height:30px;
  min-width:80px;


  display:flex;

  align-items:center;

  justify-content:center;


  border-style:inset;

  padding:0 5px;

}


</style>
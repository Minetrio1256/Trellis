<script setup>

import { ref, onMounted, onUnmounted } from "vue";
import StartMenu from "../components/StartMenu.vue";


defineProps({
  user: {
    type: Object,
    required: true
  }
});


const open = ref(false);

const time = ref("");

let clockInterval;


function updateClock() {

  const now = new Date();


  time.value = now.toLocaleTimeString(
      [],
      {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      }
  );

}



onMounted(() => {


  // Startup sound

  const audio = new Audio("/startup.wav");

  audio.volume = 0.5;

  audio.play()
      .catch(err => {
        console.log("Startup sound blocked:", err);
      });



  // Clock

  updateClock();


  clockInterval = setInterval(
      updateClock,
      1000
  );


});



onUnmounted(() => {

  clearInterval(clockInterval);

});


</script>


<template>

  <div class="desktop">


    <StartMenu
        v-if="open"
        :username="user.username"
    />


    <div class="taskbar">


      <button
          class="start-button"
          :class="{ active: open }"
          @click="open = !open"
      >

        <img
            src="https://win98icons.alexmeub.com/icons/png/windows-0.png"
        />

        <b>Start</b>

      </button>



      <div class="clock">
        {{ time }}
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



/*
    Bottom taskbar
*/

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



/*
    Start button
*/

.start-button {

  height:32px;


  display:flex;

  align-items:center;


  gap:5px;


  padding:2px 8px;


}


.start-button img {

  width:18px;
  height:18px;

}



/*
    Win98 pressed button effect
*/

.start-button.active {

  border-style:inset;

}



/*
    Clock
*/

.clock {

  margin-left:auto;


  height:30px;

  min-width:80px;


  display:flex;

  justify-content:center;

  align-items:center;


  border-style:inset;


  padding:0 8px;


  box-sizing:border-box;

}



</style>
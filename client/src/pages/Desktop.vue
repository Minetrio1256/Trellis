<script setup>

import { ref, onMounted, onUnmounted } from "vue";

import StartMenu from "../components/StartMenu.vue";
import ShutdownScreen from "../components/ShutdownScreen.vue";
import Taskbar from "../components/Taskbar.vue";
import DesktopWindow from "../components/DesktopWindow.vue";

import UserManager from "../components/UserManager.vue";
import GroupManager from "../components/GroupManager.vue";

import { useDesktopStore } from "../stores/desktop";


const props = defineProps({

  user: {

    type: Object,

    required: true

  }

});


const desktop = useDesktopStore();


const startOpen = ref(false);

const shuttingDown = ref(false);



let startupPlayed = false;



function playStartup() {

  if (startupPlayed)
    return;


  startupPlayed = true;


  const audio = new Audio("/startup.wav");

  audio.volume = 0.5;


  audio.play()
      .catch(() => {});


}



function playLogoffSound() {

  const audio = new Audio("/win98logoff.mp3");

  audio.volume = 0.5;


  return audio;

}



async function logoff() {


  startOpen.value = false;


  const audio = playLogoffSound();


  audio.play()
      .catch(() => {});


  await fetch(
      "/api/auth/logout",
      {
        method:"POST",
        credentials:"include"
      }
  );


  audio.onended = () => {

    location.reload();

  };


}



function shutdown() {


  startOpen.value = false;


  const audio = playLogoffSound();


  audio.play()
      .catch(() => {});


  audio.onended = () => {

    shuttingDown.value = true;

  };


}



function closeMenu(event) {


  const menu = document.querySelector(".start-menu");

  const button = document.querySelector(".start-button");


  if (

      menu &&
      !menu.contains(event.target) &&
      button &&
      !button.contains(event.target)

  ) {

    startOpen.value = false;

  }


}



function updateWindowPosition(id, position) {


  const window = desktop.windows.find(
      w => w.id === id
  );


  if (!window)
    return;


  window.x = position.x;
  window.y = position.y;


}



onMounted(() => {


  window.addEventListener(
      "pointerdown",
      playStartup,
      {
        once:true
      }
  );


  window.addEventListener(
      "click",
      closeMenu
  );


});



onUnmounted(() => {


  window.removeEventListener(
      "pointerdown",
      playStartup
  );


  window.removeEventListener(
      "click",
      closeMenu
  );


});


</script>


<template>


  <ShutdownScreen
      v-if="shuttingDown"
  />



  <div
      v-else
      class="desktop"
  >


    <StartMenu

        v-if="startOpen"

        :username="props.user?.username ?? 'User'"

        @logoff="logoff"

        @shutdown="shutdown"

    />



    <!-- APPLICATION WINDOWS -->


    <DesktopWindow

        v-for="window in desktop.windows"

        :key="window.id"

        v-show="!window.minimized"

        :title="window.title"

        :icon="window.icon"

        :x="window.x"

        :y="window.y"

        :width="window.width"

        :z="window.z"

        status="Ready"


        @focus="desktop.activate(window.id)"


        @close="desktop.close(window.id)"


        @minimize="desktop.minimize(window.id)"


        @update:position="
            position => updateWindowPosition(
                window.id,
                position
            )
        "

    >


      <UserManager

          v-if="window.id === 'users'"

      />



      <GroupManager

          v-else-if="window.id === 'groups'"

      />


    </DesktopWindow>



    <Taskbar

        :start-open="startOpen"

        @start="startOpen = !startOpen"

    />


  </div>


</template>


<style scoped>


.desktop {

  width:100%;

  height:100vh;


  background:#008080;


  overflow:hidden;


  position:relative;

}



</style>
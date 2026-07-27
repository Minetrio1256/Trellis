<script setup>

import { ref, onMounted, onUnmounted } from "vue";
import { useDesktopStore } from "../stores/desktop";

const props = defineProps({
  startOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  "start"
]);

const desktop = useDesktopStore();

const time = ref("");

let interval;

function updateClock() {

  time.value = new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });

}

function clickWindow(window) {

  if (window.minimized) {

    desktop.toggle(window.id);
    return;

  }

  if (window.active) {

    desktop.minimize(window.id);

  } else {

    desktop.activate(window.id);

  }

}

onMounted(() => {

  updateClock();

  interval = setInterval(updateClock, 1000);

});

onUnmounted(() => {

  clearInterval(interval);

});

</script>

<template>

  <div class="taskbar">

    <button
        class="start-button"
        :class="{ active: startOpen }"
        @click="emit('start')"
    >

      <img
          src="https://win98icons.alexmeub.com/icons/png/windows-0.png"
      >

      <b>Start</b>

    </button>

    <button
        v-for="window in desktop.windows"
        :key="window.id"
        class="task-button"
        :class="{ active: window.active && !window.minimized }"
        @click="clickWindow(window)"
    >

      <img
          :src="window.icon"
          class="task-icon"
      >

      <span class="title">

            {{ window.title }}

        </span>

    </button>

    <div class="clock">

      {{ time }}

    </div>

  </div>

</template>

<style scoped>

.taskbar{

  position:fixed;

  left:0;
  right:0;
  bottom:0;

  height:40px;

  display:flex;

  align-items:center;

  gap:4px;

  padding:2px;

  box-sizing:border-box;

  background:silver;

  border-top:2px solid white;

  z-index:100000;

}

.start-button{

  height:32px;

  display:flex;

  align-items:center;

  gap:5px;

  padding:0 10px;

}

.start-button img{

  width:18px;
  height:18px;

}

.start-button.active{

  border-style:inset;

}

.task-button{

  height:32px;

  min-width:170px;
  max-width:220px;

  display:flex;

  align-items:center;

  gap:6px;

  overflow:hidden;

  white-space:nowrap;

  text-overflow:ellipsis;

}

.task-button.active{

  border-style:inset;

  font-weight:bold;

}

.task-icon{

  width:16px;
  height:16px;

  flex-shrink:0;

}

.title{

  overflow:hidden;

  text-overflow:ellipsis;

}

.clock{

  margin-left:auto;

  min-width:90px;

  height:30px;

  display:flex;

  justify-content:center;

  align-items:center;

  border-style:inset;

  padding:0 8px;

}

</style>
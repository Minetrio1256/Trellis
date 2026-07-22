<script setup>

import { onMounted, onUnmounted } from "vue";


function restart() {
  location.reload();
}


onMounted(() => {

  window.addEventListener(
      "keydown",
      restart
  );

});


onUnmounted(() => {

  window.removeEventListener(
      "keydown",
      restart
  );

});

</script>


<template>

  <div class="shutdown-screen">

    <div class="message">
      It is now safe to turn off your computer.
    </div>

  </div>

</template>


<style scoped>

.shutdown-screen {

  position: fixed;

  inset: 0;

  background: black;

  display:flex;

  justify-content:center;

  align-items:center;

  z-index:999999;

  user-select:none;

}


.message {

  color:#ff9900;

  font-family:
      "Courier New",
      monospace;

  font-size:32px;

  font-weight:bold;

  text-align:center;

}


</style>
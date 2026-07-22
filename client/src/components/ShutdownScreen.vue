<script setup>
import { onMounted, onUnmounted } from "vue";

function wake() {
  location.reload();
}

onMounted(() => {
  window.addEventListener("keydown", wake);
});

onUnmounted(() => {
  window.removeEventListener("keydown", wake);
});
</script>

<template>
  <div class="shutdown-screen">

    <div class="message">
      It is now safe to turn off your computer.
    </div>

    <div class="hint">
      Press any key to restart Trellis 98
    </div>

  </div>
</template>

<style scoped>

.shutdown-screen {

  position: fixed;
  inset: 0;

  background: #c07a11;

  display: flex;
  flex-direction: column;

  justify-content: center;
  align-items: center;

  z-index: 999999;

  user-select: none;

}

.message {

  color: white;

  font-size: 40px;

  font-weight: bold;

  text-align: center;

  margin-bottom: 28px;

  text-shadow: 2px 2px black;

}

.hint {

  color: white;

  font-size: 18px;

  opacity: .75;

}

</style>
<script setup>
import { ref } from "vue";

const props = defineProps({
  title: {
    type: String,
    required: true
  },

  icon: {
    type: String,
    default: ""
  },

  x: {
    type: Number,
    default: 100
  },

  y: {
    type: Number,
    default: 100
  },

  width: {
    type: Number,
    default: 500
  },

  z: {
    type: Number,
    default: 1
  },

  status: {
    type: String,
    default: "Ready"
  }
});

const emit = defineEmits([
  "close",
  "minimize",
  "focus",
  "update:position"
]);

const posX = ref(props.x);
const posY = ref(props.y);

let dragging = false;
let offsetX = 0;
let offsetY = 0;

function startDrag(e) {

  dragging = true;

  offsetX = e.clientX - posX.value;
  offsetY = e.clientY - posY.value;

  emit("focus");

  window.addEventListener("mousemove", drag);
  window.addEventListener("mouseup", stopDrag);

}

function drag(e) {

  if (!dragging)
    return;

  posX.value = e.clientX - offsetX;
  posY.value = e.clientY - offsetY;

  emit("update:position", {
    x: posX.value,
    y: posY.value
  });

}

function stopDrag() {

  dragging = false;

  window.removeEventListener("mousemove", drag);
  window.removeEventListener("mouseup", stopDrag);

}
</script>

<template>

  <div
      class="window desktop-window"
      :style="{
        left: posX + 'px',
        top: posY + 'px',
        width: width + 'px',
        zIndex: z
    }"
      @mousedown="emit('focus')"
  >

    <div
        class="title-bar"
        @mousedown.prevent="startDrag"
    >

      <div class="title-bar-text">

        <img
            v-if="icon"
            :src="icon"
            class="window-icon"
        >

        {{ title }}

      </div>

      <div class="title-bar-controls">

        <button
            aria-label="Minimize"
            @click.stop="emit('minimize')"
        />

        <button
            aria-label="Close"
            @click.stop="emit('close')"
        />

      </div>

    </div>

    <div class="window-body">

      <slot />

    </div>

    <div class="status-bar">

      <p class="status-bar-field">
        {{ status }}
      </p>

    </div>

  </div>

</template>

<style scoped>

.desktop-window{

  position:absolute;

  user-select:none;

}

.window-icon{

  width:16px;
  height:16px;

  margin-right:6px;

}

.title-bar-text{

  display:flex;

  align-items:center;

}

.title-bar{

  cursor:move;

}

</style>
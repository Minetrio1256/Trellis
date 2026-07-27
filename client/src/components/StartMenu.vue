<script setup>

import { ref } from "vue";
import { useDesktopStore } from "../stores/desktop";

defineProps({
  username: {
    type: String,
    default: "User"
  }
});

const emit = defineEmits([
  "logoff",
  "shutdown"
]);

const desktop = useDesktopStore();

const programsOpen = ref(false);
const usersOpen = ref(false);

function openUserManager() {
  desktop.open("users");
}

function openGroupManager() {
  desktop.open("groups");
}

</script>

<template>

  <div class="start-menu window">

    <div class="brand">
      <span>Trellis 98</span>
    </div>

    <div class="content">

      <div class="menu">

        <!-- PROGRAMS -->

        <div
            class="menu-item has-submenu"
            @mouseenter="programsOpen = true"
            @mouseleave="programsOpen = false"
        >

          <img
              class="menu-icon"
              src="https://win98icons.alexmeub.com/icons/png/appwizard-4.png"
          >

          Programs

          <b>▶</b>

          <div
              v-if="programsOpen"
              class="submenu window"
          >

            <div
                class="menu-item has-submenu"
                @mouseenter="usersOpen = true"
                @mouseleave="usersOpen = false"
            >

              <img
                  class="menu-icon"
                  src="https://win98icons.alexmeub.com/icons/png/directory_closed-4.png"
              >

              Users

              <b>▶</b>

              <div
                  v-if="usersOpen"
                  class="submenu window"
              >

                <div
                    class="menu-item"
                    @click="openUserManager"
                >

                  <img
                      class="menu-icon"
                      src="https://win98icons.alexmeub.com/icons/png/user_computer-1.png"
                  >

                  User Manager

                </div>

                <div
                    class="menu-item"
                    @click="openGroupManager"
                >

                  <img
                      class="menu-icon"
                      src="https://win98icons.alexmeub.com/icons/png/user_computer_pair-0.png"
                  >

                  Group Manager

                </div>

              </div>

            </div>

          </div>

        </div>

        <!-- FAVORITES -->

        <div class="menu-item">

          <img
              class="menu-icon"
              src="https://win98icons.alexmeub.com/icons/png/directory_favorites-2.png"
          >

          Favorites

          <b>▶</b>

        </div>

        <!-- DOCUMENTS -->

        <div class="menu-item">

          <img
              class="menu-icon"
              src="https://win98icons.alexmeub.com/icons/png/directory_open_file_mydocs-4.png"
          >

          Documents

          <b>▶</b>

        </div>

        <!-- SETTINGS -->

        <div class="menu-item">

          <img
              class="menu-icon"
              src="https://win98icons.alexmeub.com/icons/png/settings_gear-3.png"
          >

          Settings

          <b>▶</b>

        </div>

        <!-- FIND -->

        <div class="menu-item">

          <img
              class="menu-icon"
              src="https://win98icons.alexmeub.com/icons/png/search_file-1.png"
          >

          Find

          <b>▶</b>

        </div>

        <!-- HELP -->

        <div class="menu-item">

          <img
              class="menu-icon"
              src="https://win98icons.alexmeub.com/icons/png/help_book_cool-4.png"
          >

          Help

        </div>

      </div>

      <div class="separator"></div>

      <div class="bottom">

        <div
            class="menu-item"
            @click="emit('logoff')"
        >

          <img
              class="menu-icon"
              src="https://win98icons.alexmeub.com/icons/png/key_win-3.png"
          >

          Log Off {{ username }}...

        </div>

        <div
            class="menu-item"
            @click="emit('shutdown')"
        >

          <img
              class="menu-icon"
              src="https://win98icons.alexmeub.com/icons/png/shut_down_normal-2.png"
          >

          Shut Down...

        </div>

      </div>

    </div>

  </div>

</template>

<style scoped>

.start-menu{

  position:absolute;

  left:2px;
  bottom:40px;

  width:320px;
  height:430px;

  display:flex;

  z-index:9999;

}

.brand{

  width:42px;

  background:#000080;

  display:flex;

  justify-content:center;

  align-items:flex-end;

}

.brand span{

  color:white;

  writing-mode:vertical-rl;

  transform:rotate(180deg);

  font-size:22px;

  font-weight:bold;

  margin-bottom:10px;

}

.content{

  flex:1;

  display:flex;

  flex-direction:column;

  padding:4px;

}

.menu{

  flex:1;

}

.menu-item{

  position:relative;

  display:flex;

  align-items:center;

  gap:8px;

  height:34px;

  padding:0 8px;

  white-space:nowrap;

  cursor:default;

}

.menu-item:hover{

  background:#000080;

  color:white;

}

.menu-item b{

  margin-left:auto;

}

.menu-icon{

  width:28px;
  height:28px;

  flex-shrink:0;

}

.separator{

  height:2px;

  background:#808080;

  border-bottom:1px solid white;

  margin:4px 0;

}

.bottom{

  flex-shrink:0;

}

.submenu{

  position:absolute;

  top:-2px;

  left:100%;

  width:220px;

  padding:2px;

  z-index:10000;

}

.has-submenu{

  overflow:visible;

}

</style>
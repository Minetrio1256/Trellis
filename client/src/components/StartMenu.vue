<script setup>

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

</script>


<template>
  <div class="start-menu window">

    <!-- Left blue branding strip -->
    <div class="brand">
      <span>Trellis 98</span>
    </div>


    <!-- Right side -->
    <div class="content">


      <!-- Main programs -->
      <div class="menu">

        <div class="menu-item">
          <img
              class="menu-icon"
              src="https://win98icons.alexmeub.com/icons/png/appwizard-4.png"
              alt="Programs"
          />
          Programs
          <b>▶</b>
        </div>

        <div class="menu-item">
          <img
              class="menu-icon"
              src="https://win98icons.alexmeub.com/icons/png/directory_favorites-2.png"
              alt="Favorites"
          />
          Favorites
          <b>▶</b>
        </div>

        <div class="menu-item">
          <img
              class="menu-icon"
              src="https://win98icons.alexmeub.com/icons/png/directory_open_file_mydocs-4.png"
              alt="Documents"
          />
          Documents
          <b>▶</b>
        </div>

        <div class="menu-item">
          <img
              class="menu-icon"
              src="https://win98icons.alexmeub.com/icons/png/settings_gear-3.png"
              alt="Settings"
          />
          Settings
          <b>▶</b>
        </div>

        <div class="menu-item">
          <img
              class="menu-icon"
              src="https://win98icons.alexmeub.com/icons/png/search_file-1.png"
              alt="Find"
          />
          Find
          <b>▶</b>
        </div>

        <div class="menu-item">
          <img
              class="menu-icon"
              src="https://win98icons.alexmeub.com/icons/png/help_book_cool-4.png"
              alt="Help"
          />
          Help
        </div>

      </div>


      <div class="separator"></div>


      <!-- Bottom actions -->
      <div class="bottom">


        <div
            class="menu-item"
            @click="emit('logoff')"
        >
          <img
              class="menu-icon"
              src="https://win98icons.alexmeub.com/icons/png/key_win-3.png"
          />

          Log Off {{ username }}...
        </div>


        <div
            class="menu-item"
            @click="emit('shutdown')"
        >

          <img
              class="menu-icon"
              src="https://win98icons.alexmeub.com/icons/png/shut_down_normal-2.png"
          />

          Shut Down...

        </div>


      </div>


    </div>

  </div>
</template>


<style scoped>

.start-menu {

  position:absolute;

  bottom:40px;
  left:2px;


  width:320px;
  height:430px;


  display:flex;


  background:#c0c0c0;


  border:2px outset white;


  box-sizing:border-box;


  z-index:9999;

}


/*
    Blue vertical Trellis 98 banner
*/

.brand {

  width:42px;

  flex-shrink:0;


  background:#000080;


  display:flex;

  justify-content:center;

  align-items:flex-end;

}


.brand span {

  color:white;


  writing-mode:vertical-rl;

  transform:rotate(180deg);


  font-size:22px;

  font-weight:bold;


  letter-spacing:1px;


  margin-bottom:10px;

}


/*
    Everything on the right
*/

.content {

  flex:1;


  display:flex;

  flex-direction:column;


  padding:4px;

}



/*
    Main menu items
*/

.menu {

  flex:1;

}


.menu-item {

  height:34px;


  display:flex;

  align-items:center;


  gap:8px;


  padding:0 8px;


  box-sizing:border-box;


  user-select:none;


  white-space:nowrap;

}


.menu-item:hover {

  background:#000080;

  color:white;

}


.menu-item span {

  width:28px;

  height:28px;

  display:flex;

  justify-content:center;

  align-items:center;

  text-align:center;

}


.menu-item b {

  margin-left:auto;

}

.menu-icon {
  width:28px;
  height:28px;

  image-rendering:auto;

  flex-shrink:0;
}


/*
    Divider
*/

.separator {

  height:2px;

  background:#808080;

  border-bottom:1px solid white;


  margin:4px 0;

}



/*
    Bottom buttons
*/

.bottom {

  flex-shrink:0;

}


</style>
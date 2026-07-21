<script setup>
defineProps({
  username: {
    type: String,
    default: "User"
  }
});
</script>

<template>
  <div class="start-menu window">

    <div class="brand">
      <span>Trellis 98</span>
    </div>


    <div class="menu">

      <div class="menu-item">
        <span>🗂</span>
        Programs
        <b>▶</b>
      </div>

      <div class="menu-item">
        <span>⭐</span>
        Favorites
        <b>▶</b>
      </div>

      <div class="menu-item">
        <span>📄</span>
        Documents
        <b>▶</b>
      </div>

      <div class="menu-item">
        <span>⚙</span>
        Settings
        <b>▶</b>
      </div>

      <div class="menu-item">
        <span>🔍</span>
        Find
        <b>▶</b>
      </div>

      <div class="menu-item">
        <span>❓</span>
        Help
      </div>

    </div>


    <hr>


    <div class="bottom">

      <div class="menu-item">
        <span>🔑</span>
        Log Off {{ username }}...
      </div>

      <div class="menu-item">
        <span>💻</span>
        Shut Down...
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

  flex-direction:row;


  background:#c0c0c0;

  box-sizing:border-box;

  padding:0;

  z-index:999;

}

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


.menu {

  flex:1;

  display:flex;

  flex-direction:column;

}


.menu-item {

  height:34px;

  flex-shrink:0;

}


.menu-item:hover {
  background: #000080;
  color:white;
}


.menu-item b {
  margin-left:auto;
}


.bottom {
  padding: 4px;
}


</style>
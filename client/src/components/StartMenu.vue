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
  position: absolute;
  bottom: 42px;
  left: 2px;

  width: 300px;

  display: flex;
  flex-direction: row;

  background: #c0c0c0;

  padding: 0;
}


.brand {
  width: 42px;
  background: #000080;

  display: flex;
  align-items: flex-end;
  justify-content: center;
}


.brand span {
  color: white;

  writing-mode: vertical-rl;
  transform: rotate(180deg);

  font-size: 24px;
  font-weight: bold;

  margin-bottom: 10px;
}


.menu {
  flex: 1;
  padding: 4px;
}


.menu-item {
  height: 34px;

  display: flex;
  align-items: center;

  gap: 8px;

  padding: 0 8px;

  cursor: default;
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
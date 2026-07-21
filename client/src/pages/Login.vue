<template>
  <div class="desktop">

    <div class="window login">

      <div class="title-bar">
        <div class="title-bar-text">
          Network Logon
        </div>
      </div>


      <div class="window-body">

        <p>
          Enter your network credentials
          to continue.
        </p>


        <div class="field-row">
          <button @click="login">
            Login with Discord
          </button>
        </div>

      </div>

    </div>

  </div>
</template>


<script setup>

function login() {
  window.location.href =
      "/api/auth/login";
}

</script>


<style scoped>

.desktop {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}


.login {
  width: 320px;
}

</style>
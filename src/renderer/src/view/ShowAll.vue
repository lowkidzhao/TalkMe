<script setup>
  import Alluser from '../components/alluser.vue'
  import Room from '../components/room.vue'
</script>
<template>
  <div class="ShowAll">
    <Alluser class="users" />
    <Room />
  </div>
</template>
<style scoped>
  .ShowAll {
    width: 100%;
    height: 100%;
    /* background-color: antiquewhite; */
  }
  .users {
    position: fixed;
    right: 0px;
    top: 30px;
  }
</style>

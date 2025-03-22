<script setup>
  import Alluser from '../components/alluser.vue'
  import Room from '../components/room.vue'
  import Roomuser from '../components/roomuser.vue'
  import Talk from '../components/talk.vue'
  import State from '../components/state.vue'
</script>
<template>
  <div class="ShowAll">
    <Alluser class="users" />
    <Room />
    <Talk class="talk" />
    <Roomuser class="roomuser" />
    <State class="state" />
  </div>
</template>
<style scoped>
  .ShowAll {
    width: 100%;
    height: 100%;
    /* background-color: antiquewhite; */
  }
  .users {
    position: absolute;
    right: 0px;
    top: 30px;
  }
  .roomuser {
    position: absolute;
    left: 230px;
    right: 230px; /* 新增右侧间距 */
    bottom: 0px;
    /* 移除固定宽度 */
    height: 30%;
  }
  .talk {
    position: absolute;
    left: 230px; /* 新增左侧间距 */
    right: 230px; /* 新增右侧间距 */
    bottom: 120px; /* 调整底部位置 */
    top: 30px; /* 调整顶部位置 */
  }
  .state {
    position: absolute;
    right: 0px; /* 调整右侧位置 */
    bottom: 0px; /* 调整底部位置 */
    width: 230px; /* 调整宽度 */
    height: calc(100% - 430px);
  }
</style>

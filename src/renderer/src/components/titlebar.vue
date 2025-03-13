<script setup>
  const min = () => {
    window.api.minimize()
  }
  const max = () => {
    window.api.maximize()
  }
  const close = () => {
    window.api.close()
  }
</script>
<template>
  <div class="header">
    <div class="title">TalkMe</div>
    <div class="icon">
      <ButtonGroup>
        <Button @click="min" icon="pi pi-minus" severity="secondary" />
        <Button @click="max" icon="pi pi-window-maximize" severity="secondary" />
        <Button @click="close" class="close" icon="pi pi-times" severity="secondary" />
      </ButtonGroup>
    </div>
  </div>
</template>
<style scoped>
  .header {
    display: flex;
    justify-content: space-between;
    -webkit-app-region: drag;
    height: 30px;
    background-color: rgb(245, 236, 225);
  }
  .title {
    display: flex;
    align-items: center;
    padding-left: 10px;
    font-size: 16px;
    font-weight: bold;
  }
  .icon {
    -webkit-app-region: no-drag;
    display: flex;
  }
  .p-button-secondary {
    width: 40px;
    background-color: rgb(245, 236, 225);
    border: rgb(245, 236, 225);
    color: var(--p-button-secondary-color);
  }
  .p-button-secondary:hover {
    background-color: rgb(175, 163, 152) !important;
  }
  /* 新增关闭按钮悬停样式 */
  .close:hover {
    background-color: #ef4444 !important;
    border-color: #ef4444 !important;
  }
</style>

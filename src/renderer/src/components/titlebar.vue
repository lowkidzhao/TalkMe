<script setup>
  import { ref, computed } from 'vue'
  import { useLinkStore } from '../store/useLinkStore.js'
  import { useRoomStore } from '../store/usrRoomStore'

  const linkStore = useLinkStore()
  const roomStore = useRoomStore()

  const items = computed(() => [
    {
      label: 'TalkMe',
      icon: 'pi pi-home',
      disabled: true,
      style: { 'font-weight': 'bold' }
    },
    {
      label: `状态: ${linkStore.link?.socket_link?.io?.uri || '未连接'}`,
      disabled: true,
      style: { 'font-weight': 'bold' }
    },
    {
      label: `房间: ${roomStore.currentRoom ? roomStore.currentRoom : '未连接'}`,
      disabled: true,
      style: { 'font-weight': 'bold' }
    }
  ])

  // 原有窗口控制方法保持不变
  const min = () => window.api.minimize()
  const max = () => window.api.maximize()
  const close = () => window.api.close()
</script>

<template>
  <div>
    <Menubar :model="items" class="window-menu">
      <template #end>
        <div class="window-controls">
          <Button @click="min" icon="pi pi-minus" class="p-button-text" />
          <Button @click="max" icon="pi pi-window-maximize" class="p-button-text" />
          <Button @click="close" icon="pi pi-times" class="p-button-text close-btn" />
        </div>
      </template>
    </Menubar>
  </div>
</template>

<style scoped>
  .window-menu {
    -webkit-app-region: drag;
    background-color: rgba(238, 230, 219, 0.932);
    border: none;
    border-radius: 0;
    padding: 0 8px;
    height: 30px;
  }

  .window-controls {
    -webkit-app-region: no-drag;
    display: flex;
    gap: 4px;
    height: 30px;
    :deep(.p-button) {
      width: 40px;
      height: 30px;
      color: var(--text-color);

      &:hover {
        background: rgba(0, 0, 0, 0.04);
        &.close-btn {
          background: #ef4444 !important;
          color: white !important;
        }
      }
    }
  }
</style>

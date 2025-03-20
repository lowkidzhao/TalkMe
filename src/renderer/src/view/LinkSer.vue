<script setup>
  import { ref, watch } from 'vue'
  import Register from '../components/register.vue'
  import Link from '../components/link.vue'
  import Login from '../components/login.vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()
  const currentStep = ref('1')
  const show = ref(true)
  const result = (res) => {
    if (res) {
      currentStep.value = '2'
    }
  }
  const result2 = (res) => {
    if (res) {
      currentStep.value = '3'
    }
  }
  const activate = () => {
    currentStep.value = '1'
  }
  const jump = (res) => {
    if (res === 'register') {
      show.value = false
    } else {
      show.value = true
    }
  }
  // 修改跳转逻辑为路由方式
  watch(currentStep, (newVal) => {
    if (newVal === '3') {
      setTimeout(() => {
        router.push('/showAll') // 使用 router 替代 window.location
      }, 1000)
      console.log('登录成功')
    }
  })
</script>
<template>
  <div class="all">
    <Stepper :value="currentStep" linear>
      <StepList>
        <Step value="1">连接服务器 </Step>
        <Step value="2">登录</Step>
        <Step value="3">进入</Step>
      </StepList>
      <StepPanels>
        <StepPanel value="1" class="transparent-panel">
          <div class="flex flex-col h-48 justify-center items-center">
            <Link @message="result" />
          </div>
        </StepPanel>
        <StepPanel value="2" class="transparent-panel">
          <div class="flex flex-col h-48 items-center">
            <Login v-if="show" @message2="result2" @jump="jump" />
            <Register v-if="!show" @jump="jump" />
          </div>
          <div class="flex pt-6 justify-between">
            <Button label="上一步" severity="secondary" icon="pi pi-arrow-left" @click="activate" />
          </div>
        </StepPanel>
        <StepPanel value="3" class="transparent-panel">
          <div class="flex flex-col h-48">欢迎</div>
        </StepPanel>
      </StepPanels>
    </Stepper>
  </div>
</template>
<style scoped>
  .all {
    background: transparent;
  }
  /* 新增穿透样式 */
  :deep(.transparent-stepper) .p-stepper-panel {
    background: transparent !important;
  }

  :deep(.transparent-panel) {
    background: transparent !important;
  }

  :deep(.p-floatlabel) {
    background: transparent !important;
  }
</style>

<script setup>
  import { ref } from 'vue'
  import * as yup from 'yup'
  import { useLinkStore } from '../store/useLinkStore'
  import { useAppToast } from '../utility/toast.js'
  import { Form } from '@primevue/forms'
  import { yupResolver } from '@primevue/forms/resolvers/yup'
  import { Register } from '../socket/user.js'

  const { success, errorT } = useAppToast()
  const linkStore = useLinkStore()
  const data = ref({ name: '', password: '', email: '', code: '' })
  const schema = yup.object({
    name: yup.string().required().min(1).max(20),
    password: yup.string().required().min(1).max(20),
    email: yup.string().required().email()
  })
  const resolver = yupResolver(schema)
  const isLoading = ref(false)

  const handleSubmit = (event) => {
    if (!linkStore.link) {
      errorT('错误', '未连接服务器')
      return
    }
    isLoading.value = true
    Register(linkStore.link, data.value)
      .then((res) => {
        isLoading.value = false
        success('成功', res.message)
      })
      .catch((error) => {
        isLoading.value = false
        errorT('错误', error)
      })
    console.log('表单数据:', data.value)
    console.log('验证状态:', event.valid)
  }
</script>
<template>
  <div class="mian">
    <Form
      :initial-values="data"
      :resolver="resolver"
      @submit="handleSubmit"
      class="flex flex-col gap-4 w-full sm:w-56"
    >
      <div class="flex flex-col gap-1">
        <InputText name="name" type="text" placeholder="Username" fluid :disabled="isLoading" />
      </div>
      <div class="flex flex-col gap-1">
        <InputText name="password" type="text" placeholder="password" fluid :disabled="isLoading" />
      </div>
      <div class="flex flex-col gap-1">
        <InputText name="email" type="text" placeholder="email" fluid :disabled="isLoading" />
      </div>
      <div class="flex flex-col gap-1">
        <InputOtp name="code" :disabled="isLoading" :length="4" />
      </div>
      <Button type="submit" label="注册" />
    </Form>
  </div>
</template>
<style scoped>
  .mian {
    width: fit-content;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
</style>

<script setup>
  import { ref, onMounted, nextTick } from 'vue'
  import * as yup from 'yup'
  import { useLinkStore } from '../store/useLinkStore.js'
  import { useAppToast } from '../utility/toast.js'
  import { Form } from '@primevue/forms'
  import { yupResolver } from '@primevue/forms/resolvers/yup'
  import { Login } from '../socket/user.js'

  const emit = defineEmits(['message2', 'jump'])
  const { success, errorT } = useAppToast()
  const checked = ref(false)
  const linkStore = useLinkStore()
  const data = ref({ name: '', password: '' })
  const schema = yup.object({
    name: yup
      .string()
      .required('用户名不能为空')
      .min(1, '用户名至少1个字符')
      .max(20, '用户名不能超过20个字符'),
    password: yup
      .string()
      .required('密码不能为空')
      .min(8, '密码至少8个字符')
      .max(20, '密码不能超过20个字符')
  })
  const resolver = yupResolver(schema)
  const isLoading = ref(false)
  /**
   * 处理表单提交
   * @param {Object} event - 表单提交事件对象
   */
  const handleSubmit = (event) => {
    if (event.valid === false) {
      // 获取第一个验证错误
      const firstError = Object.values(event.errors)
        .flatMap((errors) => errors)
        .find(Boolean)
      return errorT('验证失败', firstError || '请检查表单填写规范')
    } else {
      if (!linkStore.link) {
        errorT('错误', '未连接服务器')
        return
      }
      isLoading.value = true
      console.log(event.values)

      Login(linkStore.link, data.value)
        .then((res) => {
          isLoading.value = false
          success(res.message)
          emit('message2', true)
          localStorage.setItem('user', JSON.stringify(data.value))
        })
        .catch((error) => {
          isLoading.value = false
          errorT('错误', error)
        })
    }
  }
  const jump = () => {
    emit('jump', 'register')
  }

  // 新增表单引用
  const formRef = ref(null)
  onMounted(() => {
    const user = localStorage.getItem('user')
    if (user) {
      data.value = JSON.parse(user)
      checked.value = true
    }
    nextTick(() => {
      if (formRef.value) {
        formRef.value.reset()
      }
    })
  })
</script>
<template>
  <div class="mian">
    <Form
      ref="formRef"
      :initial-values="data"
      :resolver="resolver"
      @submit="handleSubmit"
      class="flex flex-col gap-4 w-full sm:w-56"
    >
      <div class="flex flex-col gap-1">
        <InputText
          name="name"
          type="text"
          v-model="data.name"
          placeholder="名称"
          fluid
          :disabled="isLoading"
        />
      </div>
      <div class="flex flex-col gap-1">
        <InputText
          name="password"
          type="text"
          v-model="data.password"
          placeholder="密码"
          fluid
          :disabled="isLoading"
        />
      </div>
      <div class="flex items-center gap-2">
        <ToggleSwitch v-model="checked"></ToggleSwitch>
        <span>记住我</span>
      </div>
      <Button type="submit" :disabled="isLoading" label="登录" />
      <Button label="注册" @click="jump" />
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

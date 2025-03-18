<script setup>
  import { ref } from 'vue'
  import * as yup from 'yup'
  import { useLinkStore } from '../store/useLinkStore.js'
  import { useAppToast } from '../utility/toast.js'
  import { Form } from '@primevue/forms'
  import { yupResolver } from '@primevue/forms/resolvers/yup'
  import { Register, CreateValid } from '../socket/user.js'

  const { success, errorT } = useAppToast()
  const linkStore = useLinkStore()
  const data = ref({ name: '', password: '', email: '', code: '' })
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
      .max(20, '密码不能超过20个字符'),
    email: yup.string().required('邮箱不能为空').email('请输入有效的邮箱地址')
  })
  const resolver = yupResolver(schema)
  const isLoading = ref(false)
  const codeNeed = ref(false)
  /**
   * 发送验证码
   */
  const sendVerificationCode = () => {
    if (!linkStore.link) {
      errorT('错误', '未连接服务器')
      return
    }
    CreateValid(linkStore.link, data.value)
      .then((res) => {
        codeNeed.value = true
        success('成功', res.message)
      })
      .catch((error) => {
        errorT('错误', error)
      })
  }
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
      codeNeed.value = false
      console.log(event.values)

      Register(linkStore.link, data.value)
        .then((res) => {
          isLoading.value = false
          success('成功', res.message)
        })
        .catch((error) => {
          isLoading.value = false
          errorT('错误', error)
        })
    }
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
        <InputText
          name="名称"
          type="text"
          v-model="data.name"
          placeholder="Username"
          fluid
          :disabled="isLoading"
        />
      </div>
      <div class="flex flex-col gap-1">
        <InputText
          name="密码"
          type="text"
          v-model="data.password"
          placeholder="password"
          fluid
          :disabled="isLoading"
        />
      </div>
      <div class="flex flex-col gap-1">
        <InputText
          name="email"
          type="text"
          v-model="data.email"
          placeholder="邮箱"
          fluid
          :disabled="isLoading"
        />
      </div>
      <div class="flex flex-col gap-1">
        <InputOtp name="验证码" v-model="data.code" :disabled="isLoading" :length="4" />
      </div>
      <Button
        type="button"
        label="获取验证码"
        :disabled="isLoading"
        @click="sendVerificationCode"
      />
      <Button type="submit" :disabled="isLoading || !codeNeed" label="注册" />
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

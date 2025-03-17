<script setup>
  import { ref } from 'vue'
  import { useToast } from 'primevue/usetoast'
  import { useLinkStore } from '../store/useLinkStore'
  import { Login, Register, CreateValid } from '../socket/user.js'
  import { Form, Field } from 'vee-validate'
  import * as yup from 'yup'

  // 状态管理
  const toast = useToast()
  const linkStore = useLinkStore()
  // 增加注册状态标识
  const isRegistration = ref(false)
  const showVerificationCode = ref(false)

  // 表单数据模型
  const formData = ref({
    email: '',
    password: '',
    username: '',
    verificationCode: ''
  })

  // 表单验证规则
  const validationSchema = yup.object({
    email: yup.string().email('请输入有效的邮箱地址').required('邮箱不能为空'),
    password: yup.string().min(6, '密码至少需要6位').required('密码不能为空'),
    username: yup.string().when('isRegistration', {
      is: true,
      then: yup.string().required('用户名不能为空'),
      otherwise: yup.string()
    }),
    verificationCode: yup.string().when('showVerificationCode', {
      is: true,
      then: yup.string().length(5, '验证码必须为5位').required('验证码不能为空'),
      otherwise: yup.string()
    })
  })

  // 表单提交处理
  const handleAuthentication = async (values, { resetForm }) => {
    try {
      // 添加验证码校验步骤
      if (isRegistration.value && showVerificationCode.value) {
        if (values.verificationCode?.length !== 5) {
          throw new Error('验证码必须为5位数字')
        }
      }
      if (values.isRegistration) {
        await handleRegistration(values)
      } else {
        await handleLogin(values)
      }
      resetForm()
    } catch (error) {
      showErrorToast('操作失败', error.message || '请检查网络连接后重试')
    }
  }

  // 处理注册流程
  const handleRegistration = async (values) => {
    await CreateValid(linkStore.link, values)
    showVerificationCode.value = true
    showSuccessToast('验证码已发送', '请查看您的邮箱')

    const response = await Register(linkStore.link, values)
    completeRegistration(response)
  }

  // 完成注册
  const completeRegistration = (response) => {
    localStorage.setItem('token', response.token)
    showVerificationCode.value = false
    showSuccessToast('注册成功', '欢迎加入我们')
  }

  // 处理登录流程
  const handleLogin = async (values) => {
    const response = await Login(linkStore.link, values)
    localStorage.setItem('token', response.token)
    showSuccessToast('登录成功', `欢迎回来，${response.username}`)
  }

  // Toast 辅助方法
  const showSuccessToast = (summary, detail) => {
    toast.add({ severity: 'success', summary, detail, life: 2000 })
  }

  const showErrorToast = (summary, detail) => {
    toast.add({ severity: 'error', summary, detail, life: 2000 })
  }

  // 增加模式切换方法
  const toggleAuthMode = () => {
    isRegistration.value = !isRegistration.value
    showVerificationCode.value = false
  }
</script>

<template>
  <div class="auth-container">
    <!-- 添加模式切换按钮 -->
    <div class="mode-toggle">
      <Button label="切换模式" @click="toggleAuthMode" class="p-button-text" />
      <span>{{ isRegistration ? '注册模式' : '登录模式' }}</span>
    </div>

    <!-- 修改按钮组 -->
    <div class="action-buttons">
      <Button type="submit" :label="isRegistration ? '注册' : '登录'" class="p-button-success" />
    </div>
  </div>
</template>

<style scoped>
  /* 新增模式切换样式 */
  .mode-toggle {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .auth-container {
    width: fit-content;
    padding: 2rem;
    margin: 0 auto;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .form-content {
    display: grid;
    gap: 1.25rem;
  }

  .action-buttons {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .p-error {
    color: var(--red-500);
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }
</style>

<script setup>
  import { ref } from 'vue'
  import { useLinkStore } from '../store/useLinkStore'
  import { Login, Register } from '../socket/user.js'
  import { useToast } from 'primevue/usetoast'

  const toast = useToast() // 添加 toast 服务
  const linkstore = useLinkStore()
  // 表单数据
  const data = ref({
    name: '',
    password: '',
    email: ''
  })

  // 新增错误状态
  const errors = ref({
    email: '',
    name: '',
    password: ''
  })

  // 验证规则
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(String(email).toLowerCase())
  }

  const validatePassword = (password) => {
    return password.length >= 6
  }

  // 修改处理函数接收参数
  const handleSubmit = (actionType) => {
    // 重置错误状态
    errors.value = { email: '', name: '', password: '' }

    // 公共验证逻辑
    if (!data.value.email) {
      errors.value.email = '邮箱不能为空'
    } else if (!validateEmail(data.value.email)) {
      errors.value.email = '邮箱格式不正确'
    }

    if (!data.value.password) {
      errors.value.password = '密码不能为空'
    } else if (!validatePassword(data.value.password)) {
      errors.value.password = '密码至少需要6位'
    }

    // 注册专属验证
    if (!data.value.name.trim()) {
      errors.value.name = '姓名不能为空'
    }

    // 检查是否有错误
    if (!Object.values(errors.value).some((error) => error)) {
      console.log('验证通过，提交数据:', data.value)
      // 根据类型调用不同接口
      actionType === 'register'
        ? Register(linkstore.link, data.value)
            .then((res) => {
              console.log('注册成功:', res)
              toast.add({
                severity: 'success',
                summary: '注册成功',
                detail: '注册成功',
                life: 2000
              })
            })
            .catch((err) => {
              console.error('注册失败:', err)
              toast.add({
                severity: 'error',
                summary: '注册失败',
                detail: err,
                life: 2000
              })
            })
        : Login(linkstore.link, data.value)
            .then((res) => {
              console.log('登录成功:', res)
              toast.add({
                severity: 'success',
                summary: '登录成功',
                detail: '登录成功',
                life: 2000
              })
            })
            .catch((err) => {
              console.error('登录失败:', err)
              toast.add({
                severity: 'error',
                summary: '登录失败',
                detail: err,
                life: 2000
              })
            })
    } else {
      console.log('验证失败，错误信息:', errors.value)
      toast.add({
        severity: 'error',
        summary: '验证失败',
        detail: errors.value,
        life: 2000
      })
    }
  }
</script>

<template>
  <div class="p-4">
    <!-- 添加外层容器 padding -->
    <form @submit.prevent>
      <div class="space-y-4">
        <!-- 添加间距容器 -->
        <FloatLabel variant="on">
          <InputText
            id="email"
            v-model="data.email"
            :invalid="!!errors.email"
            @input="errors.email = ''"
          />
          <label for="email">邮箱</label>
        </FloatLabel>

        <FloatLabel variant="on">
          <InputText
            id="name"
            v-model="data.name"
            :invalid="!!errors.name"
            @input="errors.name = ''"
          />
          <label for="name">姓名</label>
        </FloatLabel>

        <FloatLabel variant="on">
          <InputText
            id="password"
            v-model="data.password"
            :invalid="!!errors.password"
            type="password"
            @input="errors.password = ''"
          />
          <label for="password">密码</label>
        </FloatLabel>
        <Button
          style="margin-left: 20px; margin-right: 35px"
          type="submit"
          label="注册"
          class="mt-4"
          @click="handleSubmit('register')"
        />
        <Button type="submit" label="登录" class="mt-4" @click="handleSubmit('login')" />
      </div>
    </form>
  </div>
</template>

<style scoped>
  .p-4 {
    display: inline-block; /* 使宽度随内容扩展 */
    margin: 9px;
  }
  .space-y-4 > * + * {
    margin-top: 0.5rem; /* 添加垂直间距 */
  }
  .p-error-enter-active {
    transition: all 0.3s ease-out;
  }

  .p-error-leave-active {
    transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
  }

  .p-error-enter-from,
  .p-error-leave-to {
    transform: translateY(-5px);
    opacity: 0;
  }

  .pi-info-circle {
    font-size: 0.875rem;
  }
</style>

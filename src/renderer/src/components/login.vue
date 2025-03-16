<script setup>
  import { ref } from 'vue'
  import { useLinkStore } from '../store/useLinkStore'
  import { Login, Register } from '../socket/user.js'
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

  // 增强的提交处理函数
  const handleSubmit = () => {
    // 重置错误状态
    errors.value = { email: '', name: '', password: '' }

    // 执行验证
    if (!data.value.email) {
      errors.value.email = '邮箱不能为空'
    } else if (!validateEmail(data.value.email)) {
      errors.value.email = '邮箱格式不正确'
    }

    if (!data.value.name.trim()) {
      errors.value.name = '姓名不能为空'
    }

    if (!data.value.password) {
      errors.value.password = '密码不能为空'
    } else if (!validatePassword(data.value.password)) {
      errors.value.password = '密码至少需要6位'
    }

    // 检查是否有错误
    if (!Object.values(errors.value).some((error) => error)) {
      console.log('验证通过，提交数据:', data.value)
      // 这里添加实际提交逻辑
      Register(linkstore.link, data.value)
    }
  }
</script>

<template>
  <div>
    <form @submit.prevent="handleSubmit">
      <FloatLabel variant="on">
        <InputText
          id="email"
          v-model="data.email"
          :invalid="!!errors.email"
          variant="filled"
          @input="errors.email = ''"
        />
        <label for="email">邮箱</label>
        <small v-if="errors.email" class="text-red-500">{{ errors.email }}</small>
      </FloatLabel>

      <FloatLabel variant="on">
        <InputText
          id="name"
          v-model="data.name"
          :invalid="!!errors.name"
          variant="filled"
          @input="errors.name = ''"
        />
        <label for="name">姓名</label>
        <small v-if="errors.name" class="text-red-500">{{ errors.name }}</small>
      </FloatLabel>

      <FloatLabel variant="on">
        <InputText
          id="password"
          v-model="data.password"
          :invalid="!!errors.password"
          type="password"
          variant="filled"
          @input="errors.password = ''"
        />
        <label for="password">密码</label>
        <small v-if="errors.password" class="text-red-500">{{ errors.password }}</small>
      </FloatLabel>

      <Button type="submit" label="注册" />
    </form>
  </div>
</template>

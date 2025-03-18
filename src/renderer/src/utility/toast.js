import { useToast } from 'primevue/usetoast'

// 改用工厂函数模式
export const useAppToast = () => {
  const toast = useToast()

  return {
    success: (summary, detail) => toast.add({ severity: 'success', summary, detail, life: 2000 }),
    errorT: (summary, detail) => toast.add({ severity: 'error', summary, detail, life: 2000 })
  }
}

import eslintConfig from '@electron-toolkit/eslint-config'

export default [
  { ignores: ['**/node_modules', '**/dist', '**/out'] },
  eslintConfig,
  {
    files: ['**/*.{js,jsx}'],
    rules: {
      // 移除所有 vue 相关规则
    }
  }
]

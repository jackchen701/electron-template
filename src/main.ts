import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import './style.css'
import App from './App.vue'

const app = createApp(App)

// Pinia state management
app.use(createPinia())

// Element Plus with Chinese locale
app.use(ElementPlus, { locale: zhCn })

// Register all Element Plus icons globally
for (const [name, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(name, component)
}

app.mount('#app').$nextTick(() => {
  // Signal preload to remove the loading spinner
  postMessage({ payload: 'removeLoading' }, '*')
})

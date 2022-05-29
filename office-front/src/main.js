import {
    createApp
} from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/assets/style/reset.css'
import request from './utils/request'
import storage from './utils/storage'
import store from './store'
import api from './api'
const app = createApp(App);
app.config.globalProperties.$request = request;
app.config.globalProperties.$storage = storage;
app.config.globalProperties.$api = api;
app.use(router).use(store).use(ElementPlus, {
    size: 'small'
}).mount('#app')
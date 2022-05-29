import {
  defineConfig,
  loadEnv
} from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import {
  ElementPlusResolver
} from 'unplugin-vue-components/resolvers'
// https://vitejs.dev/config/
export default defineConfig(({
  mode
}) => {
  const config = loadEnv(mode, './')
  return {
    server: {
      proxy: {
        '/http': {
          target: config.VITE_REQUEST,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/http/, '')
        },
      }
    },
    resolve: {
      alias: {
        '@': '/src'
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/assets/style/index.scss";`
        }
      }
    },
    plugins: [
      AutoImport({
        imports: ['vue'],
        resolvers: [ElementPlusResolver(),
          IconsResolver({
            prefix: 'Icon',
          })
        ],
      }),
      Components({
        resolvers: [ElementPlusResolver(),
          IconsResolver({
            enabledCollections: ['ep'],
          }),
        ],
      }),
      Icons({
        autoInstall: true,
      }),
      vue()
    ]
  }
})
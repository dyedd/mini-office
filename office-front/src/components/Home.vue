<script setup>
import { getCurrentInstance, ref, computed, onMounted } from "vue";
import TreeMenu from "./TreeMenu.vue";
import BreadCrumb from "./BreadCrumb.vue";
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
const store = useStore()
const router = useRouter()
const { appContext } = getCurrentInstance();
let userInfo = store.state.userInfo
const handleLogout = (key) => {
  if (key == "email") return;
  store.commit("saveUserInfo", "");
  userInfo = {};
  router.push("/login");
}
const noticeCount = computed(() => {
  return store.state.noticeCount;
})
onMounted(()=>{
  getNoticeCount()
})
const getNoticeCount = async () => {
  try {
    const count = await appContext.config.globalProperties.$api.noticeCount();
    store.commit("saveNoticeCount", count);
  } catch (error) {
    console.error(error);
  }
}
</script>
<template>
  <div class="basic-layout">
    <div :class="['nav-side']">
      <!-- 系统LOGO -->
      <div class="logo">
        <img src="./../assets/logo.png" />
        <span>管理面板</span>
      </div>
      <!-- 导航菜单 -->
      <TreeMenu></TreeMenu>
    </div>
    <div :class="['content-right']">
      <div class="nav-top">
        <div class="nav-left">
          <div class="bread">
            <BreadCrumb />
          </div>
        </div>
        <div class="user-info">
          <el-badge :is-dot="noticeCount > 0 ? true : false" class="notice" type="danger"
            @click="router.push('/system/approve')">
            <i-ep-bell />
          </el-badge>
          <el-dropdown @command="handleLogout">
            <span class="user-link">
              {{ userInfo.uname }}
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="email">邮箱：{{ userInfo.umail }}@tust.edu.cn</el-dropdown-item>
                <el-dropdown-item command="logout">退出</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <div class="wrapper">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>
<style lang="scss">
.basic-layout {
  position: relative;

  .nav-side {
    position: fixed;
    width: 200px;
    height: 100vh;
    background-color: #001529;
    color: #fff;
    overflow-y: auto;
    transition: width 0.5s;

    .logo {
      display: flex;
      align-items: center;
      font-size: 18px;
      height: 50px;

      img {
        margin: 0 16px;
        width: 32px;
        height: 32px;
      }
    }

    .nav-menu {
      height: calc(100vh - 50px);
      border-right: none;
    }

  }

  .content-right {
    margin-left: 200px;

    .nav-top {
      height: 50px;
      line-height: 50px;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #ddd;
      padding: 0 20px;

      .nav-left {
        display: flex;
        align-items: center;
      }

      .user-info {
        display: flex;
        align-items: center;
        .notice {
          margin-right: 15px;
          cursor: pointer;
        }
        .user-link {
          cursor: pointer;
          color: #409eff;
        }
      }
    }

    .wrapper {
      background: #eef0f3;
      padding: 20px;
      height: calc(100vh - 50px);

      .main-page {
        background: #fff;
        height: 100%;
      }
    }
  }
}
.el-badge__content.is-fixed.is-dot {
    right: 5px;
    top: 10px;
}
</style>

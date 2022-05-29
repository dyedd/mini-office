<script setup>
import { ref, reactive, getCurrentInstance } from "vue";
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
const user = reactive({
  userName: "admin",
  userPwd: "123456",
})
const rules = reactive({
  userName: [
    {
      required: true,
      message: "请输入用户名",
      trigger: "blur",
    },
  ],
  userPwd: [
    {
      required: true,
      message: "请输入密码",
      trigger: "blur",
    },
  ],
})
const userFormRef = ref();
const router = useRouter();
const store = useStore()
const { appContext } = getCurrentInstance();
const login = (userFormRef) => {
  userFormRef.validate((valid, fields) => {
    if (valid) {
      console.log(user);
      appContext.config.globalProperties.$api.login(user).then(async (res) => {
        store.commit("saveUserInfo", res);
        router.push("/welcome");
      });
    } else {
      console.log('error submit!', fields);
      return false;
    }
  });
}
</script>
<template>
  <div class="login-wrapper">
    <div class="modal">
      <el-form ref="userFormRef" :model="user" status-icon :rules="rules">
        <div class="title">
          <img class="logo" src="/logo.png" alt="logo">
        </div>
        <el-form-item prop="userName">
          <el-input type="text" prefix-icon="el-icon-user" v-model="user.userName" />
        </el-form-item>
        <el-form-item prop="userPwd">
          <el-input type="password" prefix-icon="el-icon-view" v-model="user.userPwd" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="btn-login" @click="login(userFormRef)">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style lang="scss">
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f9fcff;
  width: 100vw;
  height: 100vh;

  .modal {
    width: 500px;
    padding: 50px;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0px 0px 10px 3px #c7c9cb4d;

    .title {
      font-size: 50px;
      line-height: 1.5;
      text-align: center;
      margin-bottom: 30px;

      .logo {
        width: 400px;
      }
    }

    .btn-login {
      width: 100%;
    }
  }
}
</style>
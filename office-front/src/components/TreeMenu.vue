<script setup>
import { ref, reactive } from "vue";
const activeMenu = ref(location.hash.slice(1));
console.log(activeMenu.value);
</script>
<template>

  <el-menu :default-active="activeMenu" background-color="#001529" text-color="#fff" router class="nav-menu">
    <el-menu-item index="/welcome">
      <i-ep-setting style="margin-right: 8px" />
      <span>系统管理</span>
    </el-menu-item>
    <el-menu-item index="/system/user">
      <i-ep-user style="margin-right: 8px" />
      <span>用户管理</span>
    </el-menu-item>
    <el-menu-item index="/system/dept">
      <i-ep-stopwatch style="margin-right: 8px" />
      <span>部门管理</span>
    </el-menu-item>
    <el-menu-item index="/system/role">
      <i-ep-place style="margin-right: 8px" />
      <span>角色管理</span>
    </el-menu-item>
    <el-menu-item index="/system/leave">
      <i-ep-stamp style="margin-right: 8px" />
      <span>审批管理</span>
    </el-menu-item>
  </el-menu>

</template>
<script setup>
import { ref, reactive, computed } from "vue";
import store from "../store/index";
const activeMenu = ref(location.hash.slice(1));
const roleInfo = computed(() => {
  return store.state.roleInfo;
})

// current permissions: user dept role leave
function checkPermission(permission){
  if(!roleInfo.value?.permission){
    return false;
  }
  if(typeof permission == 'string'){
    return roleInfo.value.permission.indexOf(permission) != -1;
  }else if(Array.isArray(permission)){
    for(let item of permission){
      if(roleInfo.value.permission.indexOf(item)==-1){
        return false;
      }
      return true;
    }
  }
  throw new Error("permission should either be an array or a string");
}
</script>
<template>

  <el-menu :default-active="activeMenu" background-color="#001529" text-color="#fff" router class="nav-menu">
    <el-menu-item index="/welcome">
      <i-ep-setting style="margin-right: 8px" />
      <span>系统管理</span>
    </el-menu-item>
    <el-menu-item index="/system/user" v-if="checkPermission(['user'])">
      <i-ep-user style="margin-right: 8px" />
      <span>用户管理</span>
    </el-menu-item>
    <el-menu-item index="/system/dept" v-if="checkPermission('dept')">
      <i-ep-stopwatch style="margin-right: 8px" />
      <span>部门管理</span>
    </el-menu-item>
    <el-menu-item index="/system/role" v-if="checkPermission('role')">
      <i-ep-place style="margin-right: 8px" />
      <span>角色管理</span>
    </el-menu-item>
    <el-menu-item index="/system/leave" v-if="checkPermission('leave')">
      <i-ep-stamp style="margin-right: 8px" />
      <span>审批管理</span>
    </el-menu-item>
    <el-menu-item index="/system/approve" v-if="checkPermission('leave')">
      <i-ep-stamp style="margin-right: 8px" />
      <span>请假审批</span>
    </el-menu-item>
  </el-menu>

</template>

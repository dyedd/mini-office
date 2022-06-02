import store from "./index"
import api from "../api/index"
export default {
  async fetchRoleInfo(){
    if(!store.state.userInfo?.urole){
      return;
    }
    const roleId = store.state.userInfo.urole;
    const role = await api.getRoleByID(roleId);
    store.commit("saveRoleInfo", role);
  }
}

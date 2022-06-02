import { useStore } from "vuex";
import api from "../api/index"
const store = useStore();
export default {
  async fetchRoleInfo(){
    if(!store.state.UserInfo?.urole){
      return;
    }
    const roleId = store.state.userInfo.urole;
    const role = await api.getRoleByID(roleId);
    store.commit("saveRoleInfo", role);
  }
}

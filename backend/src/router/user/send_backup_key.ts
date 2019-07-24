import Base from '../Base';
import UserService from '../../service/UserService';

export default class GetUser extends Base {
    protected needLogin = true;
    async action(){
        const userService = this.buildService(UserService);

        const rs = await userService.sendBackupKey(this.getParam());
        return this.result(1, rs);
    }
}

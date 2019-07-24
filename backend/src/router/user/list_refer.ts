import Base from '../Base';
import UserService from '../../service/UserService';
import {constant} from '../../constant';

export default class extends Base {
    protected needLogin = true;
    async action(){
        const userService = this.buildService(UserService);
        const refers = await userService.listRefer(this.getParam());
        return this.result(1, refers);
    }
}

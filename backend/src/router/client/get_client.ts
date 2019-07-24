import Base from '../Base';
import ClientService from '../../service/ClientService';
import {constant} from '../../constant';

export default class extends Base {
    protected needLogin = true;
    async action(){
        const param = this.getParam();
        const clientService = this.buildService(ClientService);
        const rs = await clientService.get(param)
        return this.result(1, rs);
    }
}
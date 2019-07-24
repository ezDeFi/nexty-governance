import Base from '../Base';
import ClientService from '../../service/ClientService';
import {constant} from '../../constant';

export default class extends Base {
    protected needLogin = true;
    async action(){
        const param = this.getParam()
        console.log('xxx', param)
        const clientService = this.buildService(ClientService);
        const rs = await clientService.saveDefault(param)
        return this.result(1, rs);
    }
}
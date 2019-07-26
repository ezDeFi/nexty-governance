import Base from '../Base';
import PoolService from '../../service/PoolService';
export default class extends Base {

    async action(){
        const param = this.getParam()
        const poolService = this.buildService(PoolService);
        const rs = await poolService.getPortal()
        return this.result(1, rs);
    }
}

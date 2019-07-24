import Base from '../Base';
import ResultService from '../../service/ResultService';
import {constant} from '../../constant';

export default class extends Base {
    protected needLogin = true;
    async action(){
        const resultService = this.buildService(ResultService);
        const param = this.getParam();
        const rs = await resultService.get(param)
        return this.result(1, rs);
    }
}
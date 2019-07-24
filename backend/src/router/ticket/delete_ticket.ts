import Base from '../Base';
import TicketService from '../../service/TicketService';
import {constant} from '../../constant';

export default class extends Base {
    protected needLogin = true;
    async action(){
        const ticketService = this.buildService(TicketService);
        const param = this.getParam();
        const rs = await ticketService.delete(param)
        return this.result(1, rs);
    }
}
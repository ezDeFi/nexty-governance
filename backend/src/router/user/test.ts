import Base from '../Base';

export default class extends Base {
    async action(){
        const rs = 'ok';
        return this.result(1, rs);
    }
}

import Base from './Base';

export default class extends Base {
    private config: any;
    public DB_Pool: any;

    protected init(){
        this.DB_Pool = this.getDBModel('Pool')
    }

    public async getPortal() {
        const rs = await this.DB_Pool.getDBInstance().find().select('name logo address holdingNtfBalance govNtfBalance compRate status')
        return rs
    }
}

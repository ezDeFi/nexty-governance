import Base from '../Base';
import UserService from '../../service/UserService';
import {utilCrypto} from '../../utility';
import * as moment from 'moment';
import * as Web3 from 'web3'
const web3 = new Web3()

export default class extends Base {
    async action(){
        let param = this.getParam();
        const userService = this.buildService(UserService);

        // let account = web3.eth.accounts.create();
        
        // param.wallet = account.address

        const user = await userService.autoCreateAccount(param);

        const resultData = {
            user
        };

        // record user login date
        userService.recordLogin({ userId: user.id });

        // always return api-token on login, this is needed for future requests
        this.session.userId = user.id;
        resultData['api-token'] = utilCrypto.encrypt(JSON.stringify({
            userId : user.id,
            expired : moment().add(30, 'd').unix()
        }));

        return this.result(1, resultData);
    }
}

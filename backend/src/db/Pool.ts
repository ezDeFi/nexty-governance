import Base from './Base';
import {PoolSchema} from './schema/PoolSchema';

export default class extends Base {
    protected getSchema(){
        return PoolSchema;
    }
    protected getName(){
        return 'pool'
    }
}
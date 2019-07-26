import Base from './Base';
import {QueueSchema} from './schema/QueueSchema';

export default class extends Base {
    protected getSchema(){
        return QueueSchema;
    }
    protected getName(){
        return 'queue'
    }
}
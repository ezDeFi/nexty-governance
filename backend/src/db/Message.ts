import Base from './Base';
import {MessageSchema} from './schema/MessageSchema';

export default class extends Base {
    protected getSchema() {
        return MessageSchema;
    }
    protected getName() {
        return 'message';
    }
    protected rejectFields() {
        return {

        };
    }
}

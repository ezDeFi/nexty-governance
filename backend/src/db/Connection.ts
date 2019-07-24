import Base from './Base';
import {ConnectionSchema} from './schema/ConnectionSchema';

export default class extends Base {
    protected getSchema() {
        return ConnectionSchema;
    }
    protected getName() {
        return 'connection';
    }
    protected rejectFields() {
        return {

        };
    }
}

import {Schema} from 'mongoose';


export const Log = {
    pool: {type: Schema.Types.ObjectId, ref: 'pool'},
    type: {type: String},
    data: {type: Object},
    blockNumber: {type: Number}
};

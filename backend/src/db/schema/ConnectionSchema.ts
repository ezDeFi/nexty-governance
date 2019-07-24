import {Schema} from 'mongoose';

export const ConnectionSchema = {
    user: {type: Schema.Types.ObjectId, ref: 'users'},
    socketId: String,
    room: Number
}

import {Schema} from 'mongoose';

export const MessageSchema = {
    text: String,
    user: {type: Schema.Types.ObjectId, ref: 'users'},
    room: Number
}

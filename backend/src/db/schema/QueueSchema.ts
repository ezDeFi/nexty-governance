import {Schema} from 'mongoose';

export const QueueSchema = {
    address: {type: String, unique: true, lowercase: true}
};

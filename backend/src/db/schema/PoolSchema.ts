import {Schema} from 'mongoose';

export const PoolSchema = {
    pos: {type: Number},
    address: {type: String, unique: true, lowercase: true},
    coinbase: {type: String, lowercase: true},
    name: {type: String},
    owner: {type: String, lowercase: true},
    website: {type: String},
    location: {type: String},
    logo: {type: String},
    compRate: {type: Number},
    status: {type: String},
    holdingNtfBalance: {type: Number, default: 0},
    govNtfBalance: {type: Number, default: 0},
    holdingNtyBalance: {type: Number, default: 0},
    lockDuration: {type: Number, default: 0},
    maxLockDuration: {type: Number, default: 0}
};

import {Schema} from 'mongoose';

export const PoolSchema = {
    address: {type: String, toLowercase: true},
    name: {type: String},
    owner: {type: String, toLowercase: true},
    website: {type: String},
    location: {type: String},
    logo: {type: String},
    compRate: {type: Number},
    status: {type: String},
    holdingNtfBalance: {type: Number, default: 0},
    holdingNtyBalance: {type: Number, default: 0},
};

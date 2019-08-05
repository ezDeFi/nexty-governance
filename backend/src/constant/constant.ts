// import * as _ from 'lodash';

/* const create = (constant_list: string[]): any => {
    const map = {};
    _.each(constant_list, (key)=>{
        map[key] = key;
    });

    return map;
} */

export const ENDPOINT=process.env.ENDPOINT

export const LOAD_INTERVAL = 5000
export const LIMIT_PER_IP = 10

export const DAI = {
    MB : 'MB'
}

export const USER_ROLE = {
    MEMBER : 'MEMBER',
    LEADER : 'LEADER',
    ADMIN : 'ADMIN',
    COUNCIL: 'COUNCIL',
    SECRETARY: 'SECRETARY'
}

export const REQUEST_TYPE = {
    WITHDRAW: 'WITHDRAW',
    DEPOSIT: 'DEPOSIT'
}

export const TX_STATUS = {
    PENDING: 'PENDING',
    COMFIRMED: 'COMFIRMED',
    ACCEPTED: 'ACCEPTED',
    REVERTED: 'REVERTED',
    SPENT: 'SPENT'
}

export const LIMIT = {
    DAY: 200,
    WEEK: 1500,
    MONTH: 6000
}

export const USER_STATUS = {
    ACTIVE : 'ACTIVE',
    BLOCK : 'BLOCK'
}

export const REF_STATUS = {
    PENDING : 'PENDING',
    APPROVE : 'APPROVE'
}

export const USER_LANGUAGE = {
    en: 'en',
    zh: 'zh'
}

// mongo do not support ASC and DESC options
export const SORT_ORDER = {
    ASC: 1,
    DESC: -1
}

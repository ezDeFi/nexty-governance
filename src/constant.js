import NTFToken from './../deployed/NtfTokenABI.json'
import NextyManager from './../deployed/NextyGovernance.json'
import PoolMaker from './../deployed/pool/PoolMaker.json'
import NtfPool from './../deployed/pool/NtfPool.json'
import NtfPoolABI from './../deployed/NtfPoolABI.json'

export const USER_ROLE = {
  MEMBER: 'MEMBER',
  LEADER: 'LEADER',
  ADMIN: 'ADMIN',
  COUNCIL: 'COUNCIL'
}

// const CONTRACT_ABI_NTFToken = NTFToken.abi // eslint-disable-line
// const CONTRACT_ADDRESS_NTFToken = NTFToken.networks['66666'].address // eslint-disable-line

// const CONTRACT_ABI_NextyManager = NextyManager.abi // eslint-disable-line
// const CONTRACT_ADDRESS_NextyManager = NextyManager.networks['66666'].address // eslint-disable-line

const CONTRACT_ABI_NTFToken = NTFToken // eslint-disable-line

const CONTRACT_ADDRESS_NTFToken = '0x2c783ad80ff980ec75468477e3dd9f86123ecbda' // eslint-disable-line

const CONTRACT_ABI_NextyManager = NextyManager.abi // eslint-disable-line
const CONTRACT_ADDRESS_NextyManager = '0x0000000000000000000000000000000000012345' // eslint-disable-line

const CONTRACT_ABI_PoolMaker = PoolMaker.abi // eslint-disable-line
const CONTRACT_ADDRESS_PoolMaker = '0xd4e5390c22782841B28F65A3B8F0cbd82f2b775E' // eslint-disable-line

const CONTRACT_ABI_NtfPool = NtfPoolABI // eslint-disable-line
const CONTRACT_ADDRESS_NtfPool = '0xd4e5390c22782841B28F65A3B8F0cbd82f2b775E' // eslint-disable-line

export const WEB3 = {
  // HTTP: 'http://108.61.148.72:8545', // testnet
  HTTP: 'http://13.228.68.50:8545', // mainnet
  // HTTP: 'http://localhost:8545', // localhost
  // NETWORK_ID: '111111', // testnet
  NETWORK_ID: '66666', // mainnet
  PAGE: {
    NTFToken: {
      ABI: CONTRACT_ABI_NTFToken,
      ADDRESS: CONTRACT_ADDRESS_NTFToken
    },
    NextyManager: {
      ABI: CONTRACT_ABI_NextyManager,
      ADDRESS: CONTRACT_ADDRESS_NextyManager
    },
    PoolMaker: {
      ABI: CONTRACT_ABI_PoolMaker,
      ADDRESS: CONTRACT_ADDRESS_PoolMaker
    },
    NtfPool: {
      ABI: CONTRACT_ABI_NtfPool,
      ADDRESS: CONTRACT_ADDRESS_NtfPool
    }
  }
}

// To change WEB3 ABI ADDRESS

export const USER_LANGUAGE = {
  en: 'en',
  zh: 'zh'
}

export const TEAM_ROLE = {
  MEMBER: 'MEMBER',
  OWNER: 'OWNER'
}

export const TASK_CATEGORY = {
  DEVELOPER: 'DEVELOPER',
  SOCIAL: 'SOCIAL',
  LEADER: 'LEADER'
}

export const TASK_TYPE = {
  TASK: 'TASK',
  SUB_TASK: 'SUB_TASK',
  PROJECT: 'PROJECT',
  EVENT: 'EVENT'
}

export const TASK_STATUS = {
  PROPOSAL: 'PROPOSAL',
  CREATED: 'CREATED',
  APPROVED: 'APPROVED',
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  CANCELED: 'CANCELED',
  EXPIRED: 'EXPIRED'
}

export const TASK_CANDIDATE_TYPE = {
  USER: 'USER',
  TEAM: 'TEAM'
}

export const TASK_CANDIDATE_STATUS = {
  // NOT_REQUIRED: 'NOT_REQUIRED',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
}

export const COMMUNITY_TYPE = {
  COUNTRY: 'COUNTRY',
  STATE: 'STATE',
  CITY: 'CITY',
  REGION: 'REGION',
  SCHOOL: 'SCHOOL'
}

export const TRANS_STATUS = {
  PENDING: 'PENDING',
  CANCELED: 'CANCELED',
  FAILED: 'FAILED',
  SUCCESSFUL: 'SUCCESSFUL'
}

export const ISSUE_CATEGORY = {
  BUG: 'BUG',
  SECURITY: 'SECURITY',
  SUGGESTION: 'SUGGESTION',
  OTHER: 'OTHER'
}

export const CONTRIB_CATEGORY = {
  BLOG: 'BLOG',
  VIDEO: 'VIDEO',
  PODCAST: 'PODCAST',
  OTHER: 'OTHER'
}

export const DEFAULT_IMAGE = {
  TASK: '/assets/images/task_thumbs/12.jpg'
}

export const MIN_VALUE_DEPOSIT = 500000

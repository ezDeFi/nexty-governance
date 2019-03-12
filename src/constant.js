import NTFToken from './../build/contracts/NtfToken.json'
import NextyManager from './../build/contracts/NextyGovernance.json'
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

const CONTRACT_ABI_NTFToken = NTFToken.abi // eslint-disable-line

const CONTRACT_ADDRESS_NTFToken = '0x2c783ad80ff980ec75468477e3dd9f86123ecbda' // eslint-disable-line

const CONTRACT_ABI_NextyManager = NextyManager.abi // eslint-disable-line
const CONTRACT_ADDRESS_NextyManager = '0x0000000000000000000000000000000000012345' // eslint-disable-line

export const WEB3 = {
  HTTP: 'http://108.61.148.72:8545', // testnet
  // HTTP: 'http://13.228.68.50:8545', // mainnet
  // HTTP: 'http://localhost:8545', // localhost
  NETWORK_ID: '111111', // testnet
  PAGE: {
    NTFToken: {
      ABI: CONTRACT_ABI_NTFToken,
      ADDRESS: CONTRACT_ADDRESS_NTFToken
    },
    NextyManager: {
      ABI: CONTRACT_ABI_NextyManager,
      ADDRESS: CONTRACT_ADDRESS_NextyManager
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

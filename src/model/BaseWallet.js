import ethUtil from 'ethereumjs-util'

export default class {
  constructor (privatekey) {
    this.privatekey = privatekey.length === 32 ? privatekey : Buffer(privatekey, 'hex')
    this.type = 'default'
  }

  getPublicKey () {
    return ethUtil.privateToPublic(this.privatekey)
  }

  getPrivateKey () {
    return this.privatekey
  }

  getPublicKeyString () {
    return '0x' + this.getPublicKey().toString('hex')
  }

  getAddress () {
    return ethUtil.privateToAddress(this.privatekey)
  }

  getAddressString () {
    return '0x' + this.getAddress().toString('hex')
  }
}

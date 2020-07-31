import crypto from 'crypto';
import bip39 from 'bip39';
import bip32 from 'bip32';
import TronWeb from 'tronweb';
import Web3 from 'web3'
import pbkdf2 from 'pbkdf2';
import aesjs from "aes-js";
import axios from 'axios';

const encryptKey = (password, salt) => {
    return pbkdf2.pbkdf2Sync(password, salt, 1, 256 / 8, 'sha512');
};

const web3 = new Web3()

const Utils = {
    encryptionAlgorithm: 'aes-256-ctr',
    hashAlgorithm: 'sha256',

    timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    },

    axiosGet(uri) {
        return new Promise((resolve, reject) => {
            axios.get(uri, {
                headers: { "Cache-Control": "no-cache" }
            })
            .then(data => resolve(data.data))
            .catch(reject)
        })
    },

    axiosPost(uri, payload) {
        return new Promise((resolve, reject) => {
            axios.post(uri, payload)
                .then(data => resolve(data.data))
                .catch(reject)
        })
    },

    tokenTypeMatch(node, address) {
        const regs = {
            TRON: /^[T][a-km-zA-HJ-NP-Z0-9]{25,33}$/,
            ETH: /^0x[a-fA-F0-9]{40}$/,
        }
        const protocol = node.type

        switch (protocol) {
            case CHAIN_TYPE.ETH:
                return regs.ETH.test(address) && web3.utils.toChecksumAddress(address)
            case CHAIN_TYPE.TRON:
                return regs.TRON.test(address) && address
            case CHAIN_TYPE.BTC:
                return btcUtils.btcAddressValidator(node.symbol, address) && address
            default:
                throw ERROR.COIN_TYPE_UNKNOWN
        }
    },

    getErrorMessage(err) {
        if (typeof err === 'string') {
            return err
        }
        if (typeof err.message === 'string') {
            return err.message
        }
        if (_.isFunction(err.toString)) {
            return err.toString()
        }
        return JSON.stringify(err)
    },

    getRPCErrorMessage(reason) {
        if (_.isObject(reason) && _.isFunction(reason.toString)) {
            try {
                reason = reason.toString()
                if (reason.includes('[ethjs-query]')) {
                    let afterData = reason.split('"data":')[1]
                    let errorObj = afterData.split(',"stack"')[0]
                    return JSON.parse(errorObj).message
                }
            } catch (err) {
                console.error('failed to parse RPC error message', err)
            }
        }
        return reason
    },

    thousands(nStr, decimal) {
        nStr += '';
        let x = nStr.split('.');
        let x1 = x[0];
        let x2 = x.length > 1 ? '.' + x[1] : '';
        if (decimal !== undefined){
            if (x2.length > decimal + 1) {
                x2 = x2.substring(0, decimal + 1);
            }
        }
        let rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    },

    removeThousands(value) {
        if (value) {
            value = value.replace(/,/g, '')
        }
        return value
    },

    hexDisplay(x, placeholder) {
        if (x === undefined) {
            return placeholder || '(loading...)'
        }
        if (x.startsWith('0x')) {
            x = x.substring(2)
        }
        return this.thousands(parseInt(x, 16))
    },

    stringToByte(str) {
        var bytes = new Array();
        var len, c;
        len = str.length;
        for(var i = 0; i < len; i++) {
            c = str.charCodeAt(i);
            if(c >= 0x010000 && c <= 0x10FFFF) {
                bytes.push(((c >> 18) & 0x07) | 0xF0);
                bytes.push(((c >> 12) & 0x3F) | 0x80);
                bytes.push(((c >> 6) & 0x3F) | 0x80);
                bytes.push((c & 0x3F) | 0x80);
            } else if(c >= 0x000800 && c <= 0x00FFFF) {
                bytes.push(((c >> 12) & 0x0F) | 0xE0);
                bytes.push(((c >> 6) & 0x3F) | 0x80);
                bytes.push((c & 0x3F) | 0x80);
            } else if(c >= 0x000080 && c <= 0x0007FF) {
                bytes.push(((c >> 6) & 0x1F) | 0xC0);
                bytes.push((c & 0x3F) | 0x80);
            } else {
                bytes.push(c & 0xFF);
            }
        }
        return bytes;
    },

    byteToString(arr) {
        if(typeof arr === 'string') {
            return arr;
        }
        var str = '',
            _arr = arr;
        for(var i = 0; i < _arr.length; i++) {
            var one = _arr[i].toString(2),
                v = one.match(/^1+?(?=0)/);
            if(v && one.length == 8) {
                var bytesLength = v[0].length;
                var store = _arr[i].toString(2).slice(7 - bytesLength);
                for(var st = 1; st < bytesLength; st++) {
                    store += _arr[st + i].toString(2).slice(2);
                }
                str += String.fromCharCode(parseInt(store, 2));
                i += bytesLength - 1;
            } else {
                str += String.fromCharCode(_arr[i]);
            }
        }
        return str;
    },

    hash(string) {
        return crypto
            .createHash(this.hashAlgorithm)
            .update(string)
            .digest('hex');
    },

    encrypt(data, key) {
        const encoded = JSON.stringify(data);
        const cipher = crypto.createCipher(this.encryptionAlgorithm, key);

        let crypted = cipher.update(encoded, 'utf8', 'hex');
        crypted += cipher.final('hex');

        return crypted;
    },

    decrypt(data, key) {
        const decipher = crypto.createDecipher(this.encryptionAlgorithm, key);

        let decrypted = decipher.update(data, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return JSON.parse(decrypted);
    },

    addressSummary(address, firstSegLength = 6, lastSegLength = 6, includeHex = true) {
        if (!address) return ''
        const hasHex = address.startsWith('0x')
        if (hasHex) {
            address = address.substring(2)
        }
        address = address.slice(0, firstSegLength) + '...' + address.slice(-lastSegLength)
        if (hasHex && includeHex) {
            address = '0x' + address
        }
        return address
    },

    requestHandler(target) {
        return new Proxy(target, {
            get(target, prop) {
                // First, check if the property exists on the target
                // If it doesn't, throw an error
                if(!Reflect.has(target, prop))
                    throw new Error(`Object does not have property '${ prop }'`);

                // If the target is a variable or the internal 'on'
                // method, simply return the standard function call
                if(typeof target[ prop ] !== 'function' || prop === 'on')
                    return Reflect.get(target, prop);

                // The 'req' object can be destructured into three components -
                // { resolve, reject and data }. Call the function (and resolve it)
                // so the result can then be passed back to the request.
                return (...args) => {
                    if(!args.length)
                        args[ 0 ] = {};

                    const [ firstArg ] = args;

                    const {
                        resolve = () => {},
                        reject = ex => console.error(ex),
                        data
                    } = firstArg;

                    if(typeof firstArg !== 'object' || !('data' in firstArg))
                        return target[ prop ].call(target, ...args);

                    Promise.resolve(target[ prop ].call(target, data))
                        .then(resolve)
                        .catch(reject);
                };
            }
        });
    },

    generateMnemonic() {
        return bip39.generateMnemonic(128);
    },

    getTronAddress(privateKey) {
        try {
            return TronWeb.address.fromPrivateKey(privateKey);
        } catch (error) {
            return null
        }
    },

    getTronAccount(privateKey) {
        return {
            privateKey,
            address: this.getTronAddress(privateKey),
        }
    },

    getEthereumAddress(privateKey) {
        return this.getEthereumAccount(privateKey) && this.getEthereumAccount(privateKey).address
    },

    getEthereumAccount(privateKey) {
        try {
            if (typeof privateKey !== 'string') {
                privateKey = '0x' + privateKey.toString('hex')
            } else if (!privateKey.startsWith('0x')) {
                privateKey = '0x' + privateKey
            }
            return web3.eth.accounts.privateKeyToAccount(privateKey)
        } catch (error) {
            // ignore error in front end
            return null
        }
    },

    getTronAccountAtIndex(mnemonic, index = 0) {
        const node = this.bip32FromMnemonic(mnemonic);
        const child = node.derivePath(`m/44'/195'/0'/0/${index}`);
        const privateKey = child.privateKey.toString('hex');
        const address = this.getTronAddress(privateKey);

        return {
            privateKey,
            address
        };
    },

    getEthereumAccountAtIndex(mnemonic, index = 0) {
        const node = this.bip32FromMnemonic(mnemonic);
        const child = node.derivePath(`m/44'/60'/0'/0/${index}`);

        const privateKey = child.privateKey.toString('hex');
        const address = this.getEthereumAddress(privateKey);

        return {
            privateKey,
            address
        };
    },

    bip32FromMnemonic(mnemonic) {
        const seed = bip39.mnemonicToSeed(mnemonic);
        return bip32.fromSeed(seed);
    },

    derivePathPrefix(protocol, typeCoinInfo) {
        switch (protocol) {
            case CHAIN_TYPE.BTC:
                return btcUtils.derivePathPrefix(typeCoinInfo)
            case CHAIN_TYPE.ETH:
                return `m/44'/60'/0'/0`
            case CHAIN_TYPE.TRON:
                return `m/44'/195'/0'/0`
            default:
                throw ERROR.PROTOCOL_UNKNOWN
        }
    },

    getHDAccounts(mnemonic, protocol, typeCoinInfo, start = 0, count = 1) {
        const node = this.bip32FromMnemonic(mnemonic);
        const path = this.derivePathPrefix(protocol, typeCoinInfo)
        const accounts = []
        for (let index = start; index < start + count; ++index) {
            const child = node.derivePath(`${path}/${index}`);
            const privateKey = child.privateKey.toString('hex');
            switch (protocol) {
                case CHAIN_TYPE.ETH:
                    var account = this.getEthereumAccount(privateKey)
                    break;
                case CHAIN_TYPE.TRON:
                    var account = this.getTronAccount(privateKey)
                    break;
                case CHAIN_TYPE.BTC:
                    var account = {
                        address: btcUtils.getBtcAccount(typeCoinInfo, privateKey).publicAddress,
                        privateKey,
                    }
                    break;
                default:
                    throw ERROR.COIN_TYPE_UNKNOWN
            }
            account.index = index
            accounts.push(account)
        }
        return accounts
    },

    validateMnemonic(mnemonic) {
        return bip39.validateMnemonic(mnemonic);
    },

    isFunction(obj) {
        return typeof obj === 'function';
    },

    dataLetterSort (data, field, field2) {
        let needArray = [];
        let list = {};
        let LetterArray = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','0','1','2','3','4','5','6','7','8','9'];
        for (let i = 0; i < data.length; i++) {
            const d = data[i][field] || data[i][field2] || data[i]['name'];
            let letter =  d.split('').filter(v=> v.match(/[a-zA-Z0-9]/)).join('').substr(0, 1).toUpperCase();
            if(!list[letter]) {
                list[letter] = [];
            }
            list[letter].push(data[i]);
        }
        LetterArray.forEach( v => {
            if(list[v]) {
                needArray = needArray.concat(list[v])
            }
        });
        return needArray;
    },

    validatInteger(str) { // integer
        const reg = /^\+?[1-9][0-9]*$/;
        return reg.test(str);
    },

    requestUrl() { // request url
        const curHost = location.hostname;
        let curApiHost;
        // const defaultUrl = 'http://52.14.133.221:8990'; //test
        const defaultUrl = 'https://manger.tronlending.org'; //online
        switch (curHost) {
            case 'nnceancbokoldkjjbpopcffaoekebnnb':
                curApiHost = defaultUrl;
                break;
            case 'ibnejdfjmmkpcnlpebklmnkoeoihofec':
                curApiHost = defaultUrl;
                break;
            default:
                curApiHost = defaultUrl;
                break;
        }
        return curApiHost;
    },

    timetransTime(date) {
        const newDate = new Date(date * 1000);
        const timeY = newDate.getFullYear();
        const timeM = (newDate.getMonth() + 1 < 10 ? `0${newDate.getMonth() + 1}` : newDate.getMonth() + 1);
        const timeD = (newDate.getDate() < 10 ? `0${newDate.getDate()}` : newDate.getDate());
        const timeh = (newDate.getHours() < 10 ? `0${newDate.getHours()}` : newDate.getHours());
        const timem = (newDate.getMinutes() < 10 ? `0${newDate.getMinutes()}` : newDate.getMinutes());
        return `${timeY}.${timeM}.${timeD} ${timeh}:${timem}`;
    },

    timeFormatTime(date) {
        const newDate = new Date(date * 1000);
        const timeY = newDate.getFullYear();
        const timeM = (newDate.getMonth() + 1 < 10 ? `0${newDate.getMonth() + 1}` : newDate.getMonth() + 1);
        const timeD = (newDate.getDate() < 10 ? `0${newDate.getDate()}` : newDate.getDate());
        const timeh = (newDate.getHours() < 10 ? `0${newDate.getHours()}` : newDate.getHours());
        const timem = (newDate.getMinutes() < 10 ? `0${newDate.getMinutes()}` : newDate.getMinutes());
        return `${timeY}/${timeM}/${timeD} ${timeh}:${timem}`;
    },

    getSelect(targetNode){
        if (window.getSelection) {
            //chrome等主流浏览器
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNode(targetNode);
            selection.removeAllRanges();
            selection.addRange(range);
        } else if (document.body.createTextRange) {
            //ie
            const range = document.body.createTextRange();
            range.moveToElementText(targetNode);
            range.select();
        }
    },

    readFileContentsFromEvent(ev) {
      return new Promise(resolve => {
        const files = ev.target.files;
        const reader = new FileReader();
        reader.onload = (file) => {
          const contents = file.target.result;
          resolve(contents);
        };

        reader.readAsText(files[0]);
      });
    },


    decryptString(password, salt, hexString) {
      const key = encryptKey(password, salt);
      const encryptedBytes = aesjs.utils.hex.toBytes(hexString);
      const aesCtr = new aesjs.ModeOfOperation.ctr(key);
      const decryptedBytes = aesCtr.decrypt(encryptedBytes);
      return aesjs.utils.utf8.fromBytes(decryptedBytes);
    },

    validatePrivateKey(privateKey){
        try {
            let address = pkToAddress(privateKey);
            return isAddressValid(address);
        } catch (e) {
            return false;
        }
    },

    historyMerge(local, remote) {
        if (!local) {
            return remote
        }
        if (!remote) {
            return local
        }
        const all = {}
        local.forEach(tx => {
            if (!tx.hash) {
                return
            }
            all[tx.hash] = tx
        })
        remote.forEach(tx => {
            if (!tx.hash) {
                return
            }
            if (all[tx.hash]) {
                all[tx.hash] = Object.assign(all[tx.hash], tx)
            } else {
                all[tx.hash] = tx
            }
        })
        return Object.values(all).sort((a, b) => b.timeStamp - a.timeStamp)
    },

    strip0x(a) {
        if (a && a.startsWith('0x')) {
            return a.substring(2)
        }
        return a
    },

    addressCompare(a, b) {
        if (!a) {
            return !b
        }
        return this.strip0x(a).localeCompare(this.strip0x(b), undefined, {sensitivity: 'accent'})
    },

    isReadOnly(account) {
        return !account.mnemonicHash && !account.privateKeyHash
    },

    isValidUTF8(data) {
        try {
            if (data && web3.utils.hexToUtf8(data)) return true
        } catch (err) {
            return false
        }
    },
    
    switchHex_UTF8(data) {
        try {
            if (web3.utils.isHexStrict(data)) {
                return this.messageUTF8(data)
            }
            return this.messageHex(data)
        } catch (err) {
            return data
        }
    },

    messageUTF8(data) {
        if (!data) {
            return data
        }
        try {
            if (web3.utils.isHexStrict(data)) {
                if (this.isOddLengthString(data)) {
                    data = '0x0' + this.strip0x(data)
                }
                return web3.utils.hexToUtf8(data)
            }
        } catch (err) {
            return data
        }
    },

    messageHex(data) {
        if (!data) {
            return data
        }
        if (web3.utils.isHexStrict(data)) {
            if (this.isOddLengthString(data)) {
                data = '0x0' + this.strip0x(data)
            }
            return data
        }
        return web3.utils.utf8ToHex(data)
    },

    isOddLengthString(str) {
        return str && (str.length & 1)
    }
};

export default Utils;

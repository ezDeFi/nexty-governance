import moment from 'moment'
import web3 from 'web3'

// const BN = web3.utils.BN;

// const BN_1e6 = new BN(10).pow(new BN(6));
// const BN_1e18 = new BN(10).pow(new BN(18));
// const BN_1e24 = new BN(10).pow(new BN(24));
// const BN_MAX_BIT = 53;
const BN_ZOOM_BIT = 18;

export function thousands(nStr, decimal = 4) {
  nStr += '';
  let x = nStr.split('.');
  let x1 = x[0];
  let x2 = x.length > 1 ? '.' + x[1] : '';
  if (x2.length > decimal + 1) {
    x2 = x2.substring(0, decimal + 1);
  }
  let rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2');
  }
  return x1 + x2;
}

export function cutString(s) {
  if (!s) return s
  if (s.length < 20) return s
  var first5 = s.substring(0, 5).toLowerCase()
  var last3 = s.slice(-3)
  return first5 + '...' + last3
}

function intShift(s, d) {
  s = s.toString();
  if (d === 0) {
    return s;
  }
  if (d > 0) {
    return s + '0'.repeat(d);
  } else {
    if (s.length <= d) {
      return 0;
    }
    return s.substring(0, s.length - d);
  }
}

function _decShiftPositive(s, d) {
  s = s.toString();
  if (d == 0) {
    return s;
  }
  let f = '';
  let p = s.indexOf('.');
  if (p >= 0) {
    f = s.substring(p + 1); // assume that s.length > p
    s = s.substring(0, p);
  }
  if (d > 0) {
    if (d < f.length) {
      s += f.substring(0, d);
      f = f.substring(d + 1);
      s = s.replace(/^0+/g, ""); // leading zeros
      if (s.length == 0) {
        s = '0';
      }
      return s + '.' + f;
    }
    s = intShift(s + f, d - f.length);
    s = s.replace(/^0+/g, ""); // leading zeros
    if (s.length == 0) {
      s = '0';
    }
    return s;
  }
  // d < 0
  d = -d
  if (d < s.length) {
    f = s.substring(s.length - d) + f;
    s = s.substring(0, s.length - d);
    f = f.replace(/0+$/g, ""); // trailing zeros
    if (f.length > 0) {
      s += '.' + f;
    }
    return s;
  }
  // d > s.length
  f = '0'.repeat(d - s.length) + s + f;
  f = f.replace(/0+$/g, ""); // trailing zeros
  if (f.length > 0) {
    return '0' + '.' + f;
  }
  return '0';
}

export function decShift(s, d) {
  if (!s) {
    return "";
  }
  if (s[0] == '-') {
    return '-' + _decShiftPositive(s.substring(1), d);
  }
  return _decShiftPositive(s, d);
}

// Number => wei string
export function zdToWei(coin) {
  return truncateShift(coin, 18);
}

export function usdtToWei(coin) {
  return truncateShift(coin, 6);
}

export function weiToPOC(wei) {
  return decShift(wei, -18);
}

export function weiToUSDT(wei) {
  return decShift(wei, -6);
}

export function hideAddress(address) {
  return address.slice(0, 7) + "..." + address.slice(-10)
}

export function hideUrl(url) {
  if (url.length > 17) {
    return url.slice(0, 15) + "......" + url.slice(-15)
  } else {
    return url
  }
}

export function hideLink(link) {
  return link.slice(0, 17) + "....." + link.slice(-12)
}

// n must be positive
export function truncateShift(a, n) {
  let s = decShift(a, n);
  let p = s.indexOf('.');
  if (p >= 0) {
    return s.substring(0, p);
  }
  return s;
}

// string
export function weiToEthS(weiAmount) {
  if (isNaN(weiAmount)) return 'Loading'
  return (weiAmount * 1e-18).toLocaleString('en', {
    maximumFractionDigits: 4
  })
}

// (BN / BN) => string
function div(a, b) {
  if (a.isZero()) {
    return 0;
  }
  if (a.lt(b)) {
    return 1 / _div(b, a);
  }
  return _div(a, b);
}

// (BN / BN) => string
// req: a >= b
function _div(a, b) {
  const resultBitLen = a.bitLength() - b.bitLength() + 1;
  // zoom the result to BN_MAX_BIT
  const toShift = BN_ZOOM_BIT - resultBitLen;
  if (toShift > 0) {
    a = a.shln(toShift);
  } else if (toShift < 0) {
    b = b.shln(-toShift);
  }
  let c = a.div(b).toNumber();
  // assert(c.bitLength() <= BN_MAX_BIT)
  if (toShift > 0) {
    c /= 1 << toShift
  } else if (toShift < 0) {
    c *= 1 << -toShift
  }
  return c;
}

// find the toShift value of decString s
function toShift(s) {
  let p = s.indexOf('.');
  if (p < 0) {
    return 0;
  }
  return s.length - p;
}

// decString * decString => BN
export function mul(a, b) {
  let pA = toShift(a);
  if (pA > 0) {
    a = decShift(a, pA);
  }
  let pB = toShift(b);
  if (pB > 0) {
    b = decShift(b, pB);
  }
  const aa = web3.utils.toBN(a);
  const bb = web3.utils.toBN(b);
  let c = aa.mul(bb)
  const p = pA + pB;
  if (p > 0) {
    c = decShift(c, -p);
  }
  return c;
}

export async function callPocHome(web3, tx) {
  if (tx.to && tx.to != PocHomeAddress) {
    throw "tx.to must be undefined or " + PocHomeAddress;
  }
  // console.log("tx:", _.clone(tx));
  tx.to = PocHomeAddress;
  if (!tx.gasLimit) {
    const block = await web3.eth.getBlock('latest');
    tx.gasLimit = block.gasLimit >> 1;
  }
  // trim the compiler signature code
  if (tx.data) {
    const idxFE = tx.data.indexOf('fea265627a7a72315820');
    if (idxFE >= 0) {
      tx.data = tx.data.substring(0, idxFE);
    }
    // prepend the hex signature '0x' if nessesary
    if (!tx.data.startsWith('0x')) {
      tx.data = '0x' + tx.data;
    }
  }
  const res = await web3.eth.call(tx);
  const msg = extractFailureMessage(res);
  if (msg) {
    throw msg;
  }
  return res;
}

export async function sendPocHome(web3, tx) {
  await callPocHome(web3, tx);
  console.log("tx sent:", tx);
  return web3.eth.sendTransaction(tx);
}

const pad = (num) => {
  return ('0' + num).slice(-2);
}

export function hhmmss(_secs) {
  var secs = _secs
  var minutes = Math.floor(secs / 60)
  secs = secs % 60;
  var hours = Math.floor(minutes / 60)
  minutes = minutes % 60;
  var days = Math.floor(hours / 24)
  hours = hours % 24
  if (days >= 1) return `${days}d ${pad(hours)}:${pad(minutes)}:${pad(secs)}`
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
  // return pad(hours)+":"+pad(minutes)+":"+pad(secs); for old browsers
}

export function charFormatNoSpace(s) {
  return cutString(s.replace(/[^a-zA-Z0-9,.?!]/ig, ''))
}

export function mmss(endTime) {
  const dateTime = new Date().getTime();
  const timestamp = Math.floor(dateTime / 1000);
  let secs = timestamp > endTime ? 0 : endTime - timestamp
  var minutes = Math.floor(secs / 60)
  secs = secs % 60
  return `${pad(minutes)}:${pad(secs)}`;
  // return pad(hours)+":"+pad(minutes)+":"+pad(secs); for old browsers
}

// unit = second
export function getTimeDiff(endTime) {
  var now = moment().unix()
  return Number(endTime) - now
}

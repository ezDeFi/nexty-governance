/* global BigInt */

const big = {
    thousands(nStr, decimal = 4) {
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
    },
    
    // (BigInt / BigInt) => Number
    div(a, b, bitPrecision) {
        if (a == 0) {
            return 0;
        }
        if (a < b) {
            return 1 / _div(b, a, bitPrecision);
        }
        return _div(a, b, bitPrecision);
    },
    
    bitLength(a) {
        return a.toString(2).length
    },
    
    // TODO: optimize this using bit shift
    bitLengthDiff(a, b) {
        return bitLength(a) - bitLength(b);
    },
    
    // (BigInt / BigInt) => Number
    // requirement: a >= b
    _div(a, b, bitPrecision = 18) {
        const resultPrecision = bitLengthDiff(a, b);
        // zoom the result to desired precision
        const toShift = bitPrecision - resultPrecision;
        if (toShift > 0) {
            a <<= BigInt(toShift);
        } else if (toShift < 0) {
            b <<= BigInt(-toShift);
        }
        let c = Number(a / b);
        // assert(c.bitLength() <= BN_MAX_BIT)
        if (toShift > 0) {
            c >>= toShift
        } else if (toShift < 0) {
            c <<= -toShift
        }
        return c;
    },
    
    intShift(s, d) {
        s = s.toString();
        if (d === 0) {
            return s;
        }
        if (d > 0) {
            return s + '0'.repeat(d);
        } else {
            d = -d
            if (s.length <= d) {
                return 0;
            }
            return s.substring(0, s.length - d);
        }
    },
    
    _decShiftPositive(s, d){
        s = s.toString();
        if (d == 0) {
            return s;
        }
        let f = '';
        let p = s.indexOf('.');
        if (p >= 0) {
            f = s.substring(p+1); // assume that s.length > p
            s = s.substring(0, p);
        }
        if (d > 0) {
            if (d < f.length) {
                s += f.substring(0, d);
                f = f.substring(d+1);
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
    },
    
    decShift(s, d) {
        if (!s) {
            return '';
        }
        s = String(s)
        if (s.startsWith('0x')) {
            s = BigInt(s).toString()
        }
        if (s[0] == '-') {
            return '-' + this._decShiftPositive(s.substring(1), d);
        }
        return this._decShiftPositive(s, d);
    },
    
    floor(s) {
        const pos = s.indexOf('.')
        if (pos < 0) {
            return s
        }
        return s.slice(0, pos)
    },
    
    // find the toShift value of decString s
    toShift(s) {
        let p = s.indexOf('.');
        if (p < 0) {
            return 0;
        }
        return s.length - p;
    },
    
    // any * any => string
    mul(a, b) {
        if (typeof a !== 'string') {
            a = a.toString()
        }
        if (typeof b !== 'string') {
            b = b.toString()
        }
        const pA = toShift(a);
        if (pA > 0) {
            a = decShift(a, pA);
        }
        const pB = toShift(b);
        if (pB > 0) {
            b = decShift(b, pB);
        }
        let c = (BigInt(a) * BigInt(b)).toString()
        const p = pA + pB;
        if (p > 0) {
            c = decShift(c, -p);
        }
        return c;
    },
    
    precision(s, n) {
        let p = s.indexOf('.')
        if (p < 0) {
            return s + '.' + '0'.repeat(n)
        }
        let f = s.substring(p + 1)
        if (f.length == n) {
            return s
        }
        if (f.length > n) {
            return s.substring(p + n) + 1
        }
        return s + '0'.repeat(n - f.length)
    },
}

module.exports = big;

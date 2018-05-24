
var CryptoJS = CryptoJS ||
function(u, p) {
    var d = {},
    l = d.lib = {},
    s = function() {},
    t = l.Base = {
        extend: function(a) {
            s.prototype = this;
            var c = new s;
            a && c.mixIn(a);
            c.hasOwnProperty("init") || (c.init = function() {
                c.$super.init.apply(this, arguments)
            });
            c.init.prototype = c;
            c.$super = this;
            return c
        },
        create: function() {
            var a = this.extend();
            a.init.apply(a, arguments);
            return a
        },
        init: function() {},
        mixIn: function(a) {
            for (var c in a) a.hasOwnProperty(c) && (this[c] = a[c]);
            a.hasOwnProperty("toString") && (this.toString = a.toString)
        },
        clone: function() {
            return this.init.prototype.extend(this)
        }

    },
    r = l.WordArray = t.extend({
        init: function(a, c) {
            a = this.words = a || [];
            this.sigBytes = c != p ? c: 4 * a.length
        },
        toString: function(a) {
            return (a || v).stringify(this)
        },
        concat: function(a) {
            var c = this.words,
            e = a.words,
            j = this.sigBytes;
            a = a.sigBytes;
            this.clamp();
            if (j % 4) for (var k = 0; k < a; k++) c[j + k >>> 2] |= (e[k >>> 2] >>> 24 - 8 * (k % 4) & 255) << 24 - 8 * ((j + k) % 4);
            else if (65535 < e.length) for (k = 0; k < a; k += 4) c[j + k >>> 2] = e[k >>> 2];
            else c.push.apply(c, e);
            this.sigBytes += a;
            return this
        },
        clamp: function() {
            var a = this.words,
            c = this.sigBytes;
            a[c >>> 2] &= 4294967295 << 32 - 8 * (c % 4);
            a.length = u.ceil(c / 4)
        },
        clone: function() {
            var a = t.clone.call(this);
            a.words = this.words.slice(0);
            return a
        },
        random: function(a) {
            for (var c = [], e = 0; e < a; e += 4) c.push(4294967296 * u.random() | 0);
            return new r.init(c, a)
        }

    }),
    w = d.enc = {},
    v = w.Hex = {
        stringify: function(a) {
            var c = a.words;
            a = a.sigBytes;
            for (var e = [], j = 0; j < a; j++) {
                var k = c[j >>> 2] >>> 24 - 8 * (j % 4) & 255;
                e.push((k >>> 4).toString(16));
                e.push((k & 15).toString(16))
            }
            return e.join("")
        },
        parse: function(a) {
            for (var c = a.length,
            e = [], j = 0; j < c; j += 2) e[j >>> 3] |= parseInt(a.substr(j, 2), 16) << 24 - 4 * (j % 8);
            return new r.init(e, c / 2)
        }

    },
    b = w.Latin1 = {
        stringify: function(a) {
            var c = a.words;
            a = a.sigBytes;
            for (var e = [], j = 0; j < a; j++) e.push(String.fromCharCode(c[j >>> 2] >>> 24 - 8 * (j % 4) & 255));
            return e.join("")
        },
        parse: function(a) {
            for (var c = a.length,
            e = [], j = 0; j < c; j++) e[j >>> 2] |= (a.charCodeAt(j) & 255) << 24 - 8 * (j % 4);
            return new r.init(e, c)
        }

    },
    x = w.Utf8 = {
        stringify: function(a) {
            try {
                return decodeURIComponent(escape(b.stringify(a)))
            } catch(c) {
                throw Error("Malformed UTF-8 data");
            }

        },
        parse: function(a) {
            return b.parse(unescape(encodeURIComponent(a)))
        }

    },
    q = l.BufferedBlockAlgorithm = t.extend({
        reset: function() {
            this._data = new r.init;
            this._nDataBytes = 0
        },
        _append: function(a) {
            "string" == typeof a && (a = x.parse(a));
            this._data.concat(a);
            this._nDataBytes += a.sigBytes
        },
        _process: function(a) {
            var c = this._data,
            e = c.words,
            j = c.sigBytes,
            k = this.blockSize,
            b = j / (4 * k),
            b = a ? u.ceil(b) : u.max((b | 0) - this._minBufferSize, 0);
            a = b * k;
            j = u.min(4 * a, j);
            if (a) {
                for (var q = 0; q < a; q += k) this._doProcessBlock(e, q);
                q = e.splice(0, a);
                c.sigBytes -= j
            }
            return new r.init(q, j)
        },
        clone: function() {
            var a = t.clone.call(this);
            a._data = this._data.clone();
            return a
        },
        _minBufferSize: 0
    });
    l.Hasher = q.extend({
        cfg: t.extend(),
        init: function(a) {
            this.cfg = this.cfg.extend(a);
            this.reset()
        },
        reset: function() {
            q.reset.call(this);
            this._doReset()
        },
        update: function(a) {
            this._append(a);
            this._process();
            return this
        },
        finalize: function(a) {
            a && this._append(a);
            return this._doFinalize()
        },
        blockSize: 16,
        _createHelper: function(a) {
            return function(b, e) {
                return (new a.init(e)).finalize(b)
            }

        },
        _createHmacHelper: function(a) {
            return function(b, e) {
                return (new n.HMAC.init(a, e)).finalize(b)
            }

        }

    });
    var n = d.algo = {};
    return d
} (Math); (function() {
    var u = CryptoJS,
    p = u.lib.WordArray;
    u.enc.Base64 = {
        stringify: function(d) {
            var l = d.words,
            p = d.sigBytes,
            t = this._map;
            d.clamp();
            d = [];
            for (var r = 0; r < p; r += 3) for (var w = (l[r >>> 2] >>> 24 - 8 * (r % 4) & 255) << 16 | (l[r + 1 >>> 2] >>> 24 - 8 * ((r + 1) % 4) & 255) << 8 | l[r + 2 >>> 2] >>> 24 - 8 * ((r + 2) % 4) & 255, v = 0; 4 > v && r + 0.75 * v < p; v++) d.push(t.charAt(w >>> 6 * (3 - v) & 63));
            if (l = t.charAt(64)) for (; d.length % 4;) d.push(l);
            return d.join("")
        },
        parse: function(d) {
            var l = d.length,
            s = this._map,
            t = s.charAt(64);
            t && (t = d.indexOf(t), -1 != t && (l = t));
            for (var t = [], r = 0, w = 0; w < l; w++) if (w % 4) {
                var v = s.indexOf(d.charAt(w - 1)) << 2 * (w % 4),
                b = s.indexOf(d.charAt(w)) >>> 6 - 2 * (w % 4);
                t[r >>> 2] |= (v | b) << 24 - 8 * (r % 4);
                r++
            }
            return p.create(t, r)
        },
        _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
    }

})(); (function(u) {
    function p(b, n, a, c, e, j, k) {
        b = b + (n & a | ~n & c) + e + k;
        return (b << j | b >>> 32 - j) + n
    }
    function d(b, n, a, c, e, j, k) {
        b = b + (n & c | a & ~c) + e + k;
        return (b << j | b >>> 32 - j) + n
    }
    function l(b, n, a, c, e, j, k) {
        b = b + (n ^ a ^ c) + e + k;
        return (b << j | b >>> 32 - j) + n
    }
    function s(b, n, a, c, e, j, k) {
        b = b + (a ^ (n | ~c)) + e + k;
        return (b << j | b >>> 32 - j) + n
    }
    for (var t = CryptoJS,
    r = t.lib,
    w = r.WordArray,
    v = r.Hasher,
    r = t.algo,
    b = [], x = 0; 64 > x; x++) b[x] = 4294967296 * u.abs(u.sin(x + 1)) | 0;
    r = r.MD5 = v.extend({
        _doReset: function() {
            this._hash = new w.init([1732584193, 4023233417, 2562383102, 271733878])
        },
        _doProcessBlock: function(q, n) {
            for (var a = 0; 16 > a; a++) {
                var c = n + a,
                e = q[c];
                q[c] = (e << 8 | e >>> 24) & 16711935 | (e << 24 | e >>> 8) & 4278255360
            }
            var a = this._hash.words,
            c = q[n + 0],
            e = q[n + 1],
            j = q[n + 2],
            k = q[n + 3],
            z = q[n + 4],
            r = q[n + 5],
            t = q[n + 6],
            w = q[n + 7],
            v = q[n + 8],
            A = q[n + 9],
            B = q[n + 10],
            C = q[n + 11],
            u = q[n + 12],
            D = q[n + 13],
            E = q[n + 14],
            x = q[n + 15],
            f = a[0],
            m = a[1],
            g = a[2],
            h = a[3],
            f = p(f, m, g, h, c, 7, b[0]),
            h = p(h, f, m, g, e, 12, b[1]),
            g = p(g, h, f, m, j, 17, b[2]),
            m = p(m, g, h, f, k, 22, b[3]),
            f = p(f, m, g, h, z, 7, b[4]),
            h = p(h, f, m, g, r, 12, b[5]),
            g = p(g, h, f, m, t, 17, b[6]),
            m = p(m, g, h, f, w, 22, b[7]),
            f = p(f, m, g, h, v, 7, b[8]),
            h = p(h, f, m, g, A, 12, b[9]),
            g = p(g, h, f, m, B, 17, b[10]),
            m = p(m, g, h, f, C, 22, b[11]),
            f = p(f, m, g, h, u, 7, b[12]),
            h = p(h, f, m, g, D, 12, b[13]),
            g = p(g, h, f, m, E, 17, b[14]),
            m = p(m, g, h, f, x, 22, b[15]),
            f = d(f, m, g, h, e, 5, b[16]),
            h = d(h, f, m, g, t, 9, b[17]),
            g = d(g, h, f, m, C, 14, b[18]),
            m = d(m, g, h, f, c, 20, b[19]),
            f = d(f, m, g, h, r, 5, b[20]),
            h = d(h, f, m, g, B, 9, b[21]),
            g = d(g, h, f, m, x, 14, b[22]),
            m = d(m, g, h, f, z, 20, b[23]),
            f = d(f, m, g, h, A, 5, b[24]),
            h = d(h, f, m, g, E, 9, b[25]),
            g = d(g, h, f, m, k, 14, b[26]),
            m = d(m, g, h, f, v, 20, b[27]),
            f = d(f, m, g, h, D, 5, b[28]),
            h = d(h, f, m, g, j, 9, b[29]),
            g = d(g, h, f, m, w, 14, b[30]),
            m = d(m, g, h, f, u, 20, b[31]),
            f = l(f, m, g, h, r, 4, b[32]),
            h = l(h, f, m, g, v, 11, b[33]),
            g = l(g, h, f, m, C, 16, b[34]),
            m = l(m, g, h, f, E, 23, b[35]),
            f = l(f, m, g, h, e, 4, b[36]),
            h = l(h, f, m, g, z, 11, b[37]),
            g = l(g, h, f, m, w, 16, b[38]),
            m = l(m, g, h, f, B, 23, b[39]),
            f = l(f, m, g, h, D, 4, b[40]),
            h = l(h, f, m, g, c, 11, b[41]),
            g = l(g, h, f, m, k, 16, b[42]),
            m = l(m, g, h, f, t, 23, b[43]),
            f = l(f, m, g, h, A, 4, b[44]),
            h = l(h, f, m, g, u, 11, b[45]),
            g = l(g, h, f, m, x, 16, b[46]),
            m = l(m, g, h, f, j, 23, b[47]),
            f = s(f, m, g, h, c, 6, b[48]),
            h = s(h, f, m, g, w, 10, b[49]),
            g = s(g, h, f, m, E, 15, b[50]),
            m = s(m, g, h, f, r, 21, b[51]),
            f = s(f, m, g, h, u, 6, b[52]),
            h = s(h, f, m, g, k, 10, b[53]),
            g = s(g, h, f, m, B, 15, b[54]),
            m = s(m, g, h, f, e, 21, b[55]),
            f = s(f, m, g, h, v, 6, b[56]),
            h = s(h, f, m, g, x, 10, b[57]),
            g = s(g, h, f, m, t, 15, b[58]),
            m = s(m, g, h, f, D, 21, b[59]),
            f = s(f, m, g, h, z, 6, b[60]),
            h = s(h, f, m, g, C, 10, b[61]),
            g = s(g, h, f, m, j, 15, b[62]),
            m = s(m, g, h, f, A, 21, b[63]);
            a[0] = a[0] + f | 0;
            a[1] = a[1] + m | 0;
            a[2] = a[2] + g | 0;
            a[3] = a[3] + h | 0
        },
        _doFinalize: function() {
            var b = this._data,
            n = b.words,
            a = 8 * this._nDataBytes,
            c = 8 * b.sigBytes;
            n[c >>> 5] |= 128 << 24 - c % 32;
            var e = u.floor(a / 4294967296);
            n[(c + 64 >>> 9 << 4) + 15] = (e << 8 | e >>> 24) & 16711935 | (e << 24 | e >>> 8) & 4278255360;
            n[(c + 64 >>> 9 << 4) + 14] = (a << 8 | a >>> 24) & 16711935 | (a << 24 | a >>> 8) & 4278255360;
            b.sigBytes = 4 * (n.length + 1);
            this._process();
            b = this._hash;
            n = b.words;
            for (a = 0; 4 > a; a++) c = n[a],
            n[a] = (c << 8 | c >>> 24) & 16711935 | (c << 24 | c >>> 8) & 4278255360;
            return b
        },
        clone: function() {
            var b = v.clone.call(this);
            b._hash = this._hash.clone();
            return b
        }

    });
    t.MD5 = v._createHelper(r);
    t.HmacMD5 = v._createHmacHelper(r)
})(Math); (function() {
    var u = CryptoJS,
    p = u.lib,
    d = p.Base,
    l = p.WordArray,
    p = u.algo,
    s = p.EvpKDF = d.extend({
        cfg: d.extend({
            keySize: 4,
            hasher: p.MD5,
            iterations: 1
        }),
        init: function(d) {
            this.cfg = this.cfg.extend(d)
        },
        compute: function(d, r) {
            for (var p = this.cfg,
            s = p.hasher.create(), b = l.create(), u = b.words, q = p.keySize, p = p.iterations; u.length < q;) {
                n && s.update(n);
                var n = s.update(d).finalize(r);
                s.reset();
                for (var a = 1; a < p; a++) n = s.finalize(n),
                s.reset();
                b.concat(n)
            }
            b.sigBytes = 4 * q;
            return b
        }

    });
    u.EvpKDF = function(d, l, p) {
        return s.create(p).compute(d, l)
    }

})();
CryptoJS.lib.Cipher ||
function(u) {
    var p = CryptoJS,
    d = p.lib,
    l = d.Base,
    s = d.WordArray,
    t = d.BufferedBlockAlgorithm,
    r = p.enc.Base64,
    w = p.algo.EvpKDF,
    v = d.Cipher = t.extend({
        cfg: l.extend(),
        createEncryptor: function(e, a) {
            return this.create(this._ENC_XFORM_MODE, e, a)
        },
        createDecryptor: function(e, a) {
            return this.create(this._DEC_XFORM_MODE, e, a)
        },
        init: function(e, a, b) {
            this.cfg = this.cfg.extend(b);
            this._xformMode = e;
            this._key = a;
            this.reset()
        },
        reset: function() {
            t.reset.call(this);
            this._doReset()
        },
        process: function(e) {
            this._append(e);
            return this._process()
        },
        finalize: function(e) {
            e && this._append(e);
            return this._doFinalize()
        },
        keySize: 4,
        ivSize: 4,
        _ENC_XFORM_MODE: 1,
        _DEC_XFORM_MODE: 2,
        _createHelper: function(e) {
            return {
                encrypt: function(b, k, d) {
                    return ("string" == typeof k ? c: a).encrypt(e, b, k, d)
                },
                decrypt: function(b, k, d) {
                    return ("string" == typeof k ? c: a).decrypt(e, b, k, d)
                }

            }

        }

    });
    d.StreamCipher = v.extend({
        _doFinalize: function() {
            return this._process(!0)
        },
        blockSize: 1
    });
    var b = p.mode = {},
    x = function(e, a, b) {
        var c = this._iv;
        c ? this._iv = u: c = this._prevBlock;
        for (var d = 0; d < b; d++) e[a + d] ^= c[d]
    },
    q = (d.BlockCipherMode = l.extend({
        createEncryptor: function(e, a) {
            return this.Encryptor.create(e, a)
        },
        createDecryptor: function(e, a) {
            return this.Decryptor.create(e, a)
        },
        init: function(e, a) {
            this._cipher = e;
            this._iv = a
        }

    })).extend();
    q.Encryptor = q.extend({
        processBlock: function(e, a) {
            var b = this._cipher,
            c = b.blockSize;
            x.call(this, e, a, c);
            b.encryptBlock(e, a);
            this._prevBlock = e.slice(a, a + c)
        }

    });
    q.Decryptor = q.extend({
        processBlock: function(e, a) {
            var b = this._cipher,
            c = b.blockSize,
            d = e.slice(a, a + c);
            b.decryptBlock(e, a);
            x.call(this, e, a, c);
            this._prevBlock = d
        }

    });
    b = b.CBC = q;
    q = (p.pad = {}).Pkcs7 = {
        pad: function(a, b) {
            for (var c = 4 * b,
            c = c - a.sigBytes % c,
            d = c << 24 | c << 16 | c << 8 | c,
            l = [], n = 0; n < c; n += 4) l.push(d);
            c = s.create(l, c);
            a.concat(c)
        },
        unpad: function(a) {
            a.sigBytes -= a.words[a.sigBytes - 1 >>> 2] & 255
        }

    };
    d.BlockCipher = v.extend({
        cfg: v.cfg.extend({
            mode: b,
            padding: q
        }),
        reset: function() {
            v.reset.call(this);
            var a = this.cfg,
            b = a.iv,
            a = a.mode;
            if (this._xformMode == this._ENC_XFORM_MODE) var c = a.createEncryptor;
            else c = a.createDecryptor,
            this._minBufferSize = 1;
            this._mode = c.call(a, this, b && b.words)
        },
        _doProcessBlock: function(a, b) {
            this._mode.processBlock(a, b)
        },
        _doFinalize: function() {
            var a = this.cfg.padding;
            if (this._xformMode == this._ENC_XFORM_MODE) {
                a.pad(this._data, this.blockSize);
                var b = this._process(!0)
            } else b = this._process(!0),
            a.unpad(b);
            return b
        },
        blockSize: 4
    });
    var n = d.CipherParams = l.extend({
        init: function(a) {
            this.mixIn(a)
        },
        toString: function(a) {
            return (a || this.formatter).stringify(this)
        }

    }),
    b = (p.format = {}).OpenSSL = {
        stringify: function(a) {
            var b = a.ciphertext;
            a = a.salt;
            return (a ? s.create([1398893684, 1701076831]).concat(a).concat(b) : b).toString(r)
        },
        parse: function(a) {
            a = r.parse(a);
            var b = a.words;
            if (1398893684 == b[0] && 1701076831 == b[1]) {
                var c = s.create(b.slice(2, 4));
                b.splice(0, 4);
                a.sigBytes -= 16
            }
            return n.create({
                ciphertext: a,
                salt: c
            })
        }

    },
    a = d.SerializableCipher = l.extend({
        cfg: l.extend({
            format: b
        }),
        encrypt: function(a, b, c, d) {
            d = this.cfg.extend(d);
            var l = a.createEncryptor(c, d);
            b = l.finalize(b);
            l = l.cfg;
            return n.create({
                ciphertext: b,
                key: c,
                iv: l.iv,
                algorithm: a,
                mode: l.mode,
                padding: l.padding,
                blockSize: a.blockSize,
                formatter: d.format
            })
        },
        decrypt: function(a, b, c, d) {
            d = this.cfg.extend(d);
            b = this._parse(b, d.format);
            return a.createDecryptor(c, d).finalize(b.ciphertext)
        },
        _parse: function(a, b) {
            return "string" == typeof a ? b.parse(a, this) : a
        }

    }),
    p = (p.kdf = {}).OpenSSL = {
        execute: function(a, b, c, d) {
            d || (d = s.random(8));
            a = w.create({
                keySize: b + c
            }).compute(a, d);
            c = s.create(a.words.slice(b), 4 * c);
            a.sigBytes = 4 * b;
            return n.create({
                key: a,
                iv: c,
                salt: d
            })
        }

    },
    c = d.PasswordBasedCipher = a.extend({
        cfg: a.cfg.extend({
            kdf: p
        }),
        encrypt: function(b, c, d, l) {
            l = this.cfg.extend(l);
            d = l.kdf.execute(d, b.keySize, b.ivSize);
            l.iv = d.iv;
            b = a.encrypt.call(this, b, c, d.key, l);
            b.mixIn(d);
            return b
        },
        decrypt: function(b, c, d, l) {
            l = this.cfg.extend(l);
            c = this._parse(c, l.format);
            d = l.kdf.execute(d, b.keySize, b.ivSize, c.salt);
            l.iv = d.iv;
            return a.decrypt.call(this, b, c, d.key, l)
        }

    })
} (); (function() {
    for (var u = CryptoJS,
    p = u.lib.BlockCipher,
    d = u.algo,
    l = [], s = [], t = [], r = [], w = [], v = [], b = [], x = [], q = [], n = [], a = [], c = 0; 256 > c; c++) a[c] = 128 > c ? c << 1 : c << 1 ^ 283;
    for (var e = 0,
    j = 0,
    c = 0; 256 > c; c++) {
        var k = j ^ j << 1 ^ j << 2 ^ j << 3 ^ j << 4,
        k = k >>> 8 ^ k & 255 ^ 99;
        l[e] = k;
        s[k] = e;
        var z = a[e],
        F = a[z],
        G = a[F],
        y = 257 * a[k] ^ 16843008 * k;
        t[e] = y << 24 | y >>> 8;
        r[e] = y << 16 | y >>> 16;
        w[e] = y << 8 | y >>> 24;
        v[e] = y;
        y = 16843009 * G ^ 65537 * F ^ 257 * z ^ 16843008 * e;
        b[k] = y << 24 | y >>> 8;
        x[k] = y << 16 | y >>> 16;
        q[k] = y << 8 | y >>> 24;
        n[k] = y;
        e ? (e = z ^ a[a[a[G ^ z]]], j ^= a[a[j]]) : e = j = 1
    }
    var H = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54],
    d = d.AES = p.extend({
        _doReset: function() {
            for (var a = this._key,
            c = a.words,
            d = a.sigBytes / 4,
            a = 4 * ((this._nRounds = d + 6) + 1), e = this._keySchedule = [], j = 0; j < a; j++) if (j < d) e[j] = c[j];
            else {
                var k = e[j - 1];
                j % d ? 6 < d && 4 == j % d && (k = l[k >>> 24] << 24 | l[k >>> 16 & 255] << 16 | l[k >>> 8 & 255] << 8 | l[k & 255]) : (k = k << 8 | k >>> 24, k = l[k >>> 24] << 24 | l[k >>> 16 & 255] << 16 | l[k >>> 8 & 255] << 8 | l[k & 255], k ^= H[j / d | 0] << 24);
                e[j] = e[j - d] ^ k
            }
            c = this._invKeySchedule = [];
            for (d = 0; d < a; d++) j = a - d,
            k = d % 4 ? e[j] : e[j - 4],
            c[d] = 4 > d || 4 >= j ? k: b[l[k >>> 24]] ^ x[l[k >>> 16 & 255]] ^ q[l[k >>> 8 & 255]] ^ n[l[k & 255]]
        },
        encryptBlock: function(a, b) {
            this._doCryptBlock(a, b, this._keySchedule, t, r, w, v, l)
        },
        decryptBlock: function(a, c) {
            var d = a[c + 1];
            a[c + 1] = a[c + 3];
            a[c + 3] = d;
            this._doCryptBlock(a, c, this._invKeySchedule, b, x, q, n, s);
            d = a[c + 1];
            a[c + 1] = a[c + 3];
            a[c + 3] = d
        },
        _doCryptBlock: function(a, b, c, d, e, j, l, f) {
            for (var m = this._nRounds,
            g = a[b] ^ c[0], h = a[b + 1] ^ c[1], k = a[b + 2] ^ c[2], n = a[b + 3] ^ c[3], p = 4, r = 1; r < m; r++) var q = d[g >>> 24] ^ e[h >>> 16 & 255] ^ j[k >>> 8 & 255] ^ l[n & 255] ^ c[p++],
            s = d[h >>> 24] ^ e[k >>> 16 & 255] ^ j[n >>> 8 & 255] ^ l[g & 255] ^ c[p++],
            t = d[k >>> 24] ^ e[n >>> 16 & 255] ^ j[g >>> 8 & 255] ^ l[h & 255] ^ c[p++],
            n = d[n >>> 24] ^ e[g >>> 16 & 255] ^ j[h >>> 8 & 255] ^ l[k & 255] ^ c[p++],
            g = q,
            h = s,
            k = t;
            q = (f[g >>> 24] << 24 | f[h >>> 16 & 255] << 16 | f[k >>> 8 & 255] << 8 | f[n & 255]) ^ c[p++];
            s = (f[h >>> 24] << 24 | f[k >>> 16 & 255] << 16 | f[n >>> 8 & 255] << 8 | f[g & 255]) ^ c[p++];
            t = (f[k >>> 24] << 24 | f[n >>> 16 & 255] << 16 | f[g >>> 8 & 255] << 8 | f[h & 255]) ^ c[p++];
            n = (f[n >>> 24] << 24 | f[g >>> 16 & 255] << 16 | f[h >>> 8 & 255] << 8 | f[k & 255]) ^ c[p++];
            a[b] = q;
            a[b + 1] = s;
            a[b + 2] = t;
            a[b + 3] = n
        },
        keySize: 8
    });
    u.AES = p._createHelper(d)
})();

/**
 * Counter block mode.
 */
CryptoJS.mode.CTR = (function () {
    var CTR = CryptoJS.lib.BlockCipherMode.extend();
    var Encryptor = CTR.Encryptor = CTR.extend({
        processBlock: function (words, offset) {
            // Shortcuts
            var cipher = this._cipher
            var blockSize = cipher.blockSize;
            var iv = this._iv;
            var counter = this._counter;
            // Generate keystream
            if (iv) {
                counter = this._counter = iv.slice(0);

                // Remove IV for subsequent blocks
                this._iv = undefined;
            }
            var keystream = counter.slice(0);
            cipher.encryptBlock(keystream, 0);
            // Increment counter
            counter[blockSize - 1] = (counter[blockSize - 1] + 1) | 0
            // Encrypt
            for (var i = 0; i < blockSize; i++) {
                words[offset + i] ^= keystream[i];
            }
        }
    });
    CTR.Decryptor = Encryptor;
    return CTR;
}());

/**
 * A noop padding strategy.
 */
CryptoJS.pad.NoPadding = {
    pad: function () {
    },
    unpad: function () {
    }
};

//**************************************
if (typeof JSON !== "object") {
    JSON = {};
}
(function() {
    "use strict";
    var rx_one = /^[\],:{}\s]*$/;
    var rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
    var rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
    var rx_four = /(?:^|:|,)(?:\s*\[)+/g;
    var rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    var rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? "0" + n: n;
    }
    function this_value() {
        return this.valueOf();
    }
    if (typeof Date.prototype.toJSON !== "function") {

        Date.prototype.toJSON = function() {

            return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + f(this.getUTCMonth() + 1) + "-" + f(this.getUTCDate()) + "T" + f(this.getUTCHours()) + ":" + f(this.getUTCMinutes()) + ":" + f(this.getUTCSeconds()) + "Z": null;
        };
        Boolean.prototype.toJSON = this_value;
        Number.prototype.toJSON = this_value;
        String.prototype.toJSON = this_value;
    }
    var gap;
    var indent;
    var meta;
    var rep;
    function quote(string) {
        // If the string contains no control characters, no quote characters, and no
        // backslash characters, then we can safely slap some quotes around it.
        // Otherwise we must also replace the offending characters with safe escape
        // sequences.
        rx_escapable.lastIndex = 0;
        return rx_escapable.test(string) ? "\"" + string.replace(rx_escapable,
        function(a) {
            var c = meta[a];
            return typeof c === "string" ? c: "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice( - 4);
        }) + "\"": "\"" + string + "\"";
    }
    function str(key, holder) {
        // Produce a string from holder[key].
        var i; // The loop counter.
        var k; // The member key.
        var v; // The member value.
        var length;
        var mind = gap;
        var partial;
        var value = holder[key];
        // If the value has a toJSON method, call it to obtain a replacement value.
        if (value && typeof value === "object" && typeof value.toJSON === "function") {
            value = value.toJSON(key);
        }
        // If we were called with a replacer function, then call the replacer to
        // obtain a replacement value.
        if (typeof rep === "function") {
            value = rep.call(holder, key, value);
        }
        // What happens next depends on the value's type.
        switch (typeof value) {
        case "string":
            return quote(value);
        case "number":
            // JSON numbers must be finite. Encode non-finite numbers as null.
            return isFinite(value) ? String(value) : "null";
        case "boolean":
        case "null":
            // If the value is a boolean or null, convert it to a string. Note:
            // typeof null does not produce "null". The case is included here in
            // the remote chance that this gets fixed someday.
            return String(value);
            // If the type is "object", we might be dealing with an object or an array or
            // null.
        case "object":
            // Due to a specification blunder in ECMAScript, typeof null is "object",
            // so watch out for that case.
            if (!value) {
                return "null";
            }
            // Make an array to hold the partial results of stringifying this object value.
            gap += indent;
            partial = [];
            // Is the value an array?
            if (Object.prototype.toString.apply(value) === "[object Array]") {
                // The value is an array. Stringify every element. Use null as a placeholder
                // for non-JSON values.
                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || "null";
                }
                // Join all of the elements together, separated with commas, and wrap them in
                // brackets.
                v = partial.length === 0 ? "[]": gap ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]": "[" + partial.join(",") + "]";
                gap = mind;
                return v;
            }
            // If the replacer is an array, use it to select the members to be stringified.
            if (rep && typeof rep === "object") {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === "string") {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ": ": ":") + v);
                        }
                    }
                }
            } else {
                // Otherwise, iterate through all of the keys in the object.
                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ": ": ":") + v);
                        }
                    }
                }
            }
            // Join all of the member texts together, separated with commas,
            // and wrap them in braces.
            v = partial.length === 0 ? "{}": gap ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}": "{" + partial.join(",") + "}";
            gap = mind;
            return v;
        }
    }
    // If the JSON object does not yet have a stringify method, give it one.
    if (typeof JSON.stringify !== "function") {
        meta = { // table of character substitutions
            "\b": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            "\"": "\\\"",
            "\\": "\\\\"
        };
        JSON.stringify = function(value, replacer, space) {
            // The stringify method takes a value and an optional replacer, and an optional
            // space parameter, and returns a JSON text. The replacer can be a function
            // that can replace values, or an array of strings that will select the keys.
            // A default replacer method can be provided. Use of the space parameter can
            // produce text that is more easily readable.
            var i;
            gap = "";
            indent = "";
            // If the space parameter is a number, make an indent string containing that
            // many spaces.
            if (typeof space === "number") {
                for (i = 0; i < space; i += 1) {
                    indent += " ";
                }
                // If the space parameter is a string, it will be used as the indent string.
            } else if (typeof space === "string") {
                indent = space;
            }
            // If there is a replacer, it must be a function or an array.
            // Otherwise, throw an error.
            rep = replacer;
            if (replacer && typeof replacer !== "function" && (typeof replacer !== "object" || typeof replacer.length !== "number")) {
                throw new Error("JSON.stringify");
            }
            // Make a fake root object containing our value under the key of "".
            // Return the result of stringifying the value.
            return str("", {
                "": value
            });
        };
    }
    // If the JSON object does not yet have a parse method, give it one.
    if (typeof JSON.parse !== "function") {
        JSON.parse = function(text, reviver) {
            // The parse method takes a text and an optional reviver function, and returns
            // a JavaScript value if the text is a valid JSON text.
            var j;
            function walk(holder, key) {
                // The walk method is used to recursively walk the resulting structure so
                // that modifications can be made.
                var k;
                var v;
                var value = holder[key];
                if (value && typeof value === "object") {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }
            // Parsing happens in four stages. In the first stage, we replace certain
            // Unicode characters with escape sequences. JavaScript handles many characters
            // incorrectly, either silently deleting them, or treating them as line endings.
            text = String(text);
            rx_dangerous.lastIndex = 0;
            if (rx_dangerous.test(text)) {
                text = text.replace(rx_dangerous,
                function(a) {
                    return "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice( - 4);
                });
            }
            // In the second stage, we run the text against regular expressions that look
            // for non-JSON patterns. We are especially concerned with "()" and "new"
            // because they can cause invocation, and "=" because it can cause mutation.
            // But just to be safe, we want to reject all unexpected forms.
            // We split the second stage into 4 regexp operations in order to work around
            // crippling inefficiencies in IE's and Safari's regexp engines. First we
            // replace the JSON backslash pairs with "@" (a non-JSON character). Second, we
            // replace all simple value tokens with "]" characters. Third, we delete all
            // open brackets that follow a colon or comma or that begin the text. Finally,
            // we look to see that the remaining characters are only whitespace or "]" or
            // "," or ":" or "{" or "}". If that is so, then the text is safe for eval.
            if (rx_one.test(text.replace(rx_two, "@").replace(rx_three, "]").replace(rx_four, ""))) {
                // In the third stage we use the eval function to compile the text into a
                // JavaScript structure. The "{" operator is subject to a syntactic ambiguity
                // in JavaScript: it can begin a block or an object literal. We wrap the text
                // in parens to eliminate the ambiguity.
                j = eval("(" + text + ")");
                // In the optional fourth stage, we recursively walk the new structure, passing
                // each name/value pair to a reviver function for possible transformation.
                return (typeof reviver === "function") ? walk({
                    "": j
                },
                "") : j;
            }
            // If the text is not JSON parseable, then a SyntaxError is thrown.
            throw new SyntaxError("JSON.parse");
        };
    }
} ());

var biRadixBase=2;
var biRadixBits=16;
var bitsPerDigit=biRadixBits;
var biRadix=1<<16;
var biHalfRadix=biRadix>>>1;
var biRadixSquared=biRadix*biRadix;
var maxDigitVal=biRadix-1;
var maxInteger=9999999999999998;
var maxDigits;
var ZERO_ARRAY;
var bigZero,bigOne;
function setMaxDigits(b){
    maxDigits=b;
    ZERO_ARRAY=new Array(maxDigits);
    for(var a=0;
    a<ZERO_ARRAY.length;
    a++){
        ZERO_ARRAY[a]=0
    }
    bigZero=new BigInt();
    bigOne=new BigInt();
    bigOne.digits[0]=1
}
setMaxDigits(20);
var dpl10=15;
var lr10=biFromNumber(1000000000000000);
function BigInt(a){
    if(typeof a=="boolean"&&a==true){
        this.digits=null
    }
    else{
        this.digits=ZERO_ARRAY.slice(0)
    }
    this.isNeg=false
}
function biFromDecimal(e){
    var d=e.charAt(0)=="-";
    var c=d?1:0;
    var a;
    while(c<e.length&&e.charAt(c)=="0"){
        ++c
    }
    if(c==e.length){
        a=new BigInt()
    }
    else{
        var b=e.length-c;
        var f=b%dpl10;
        if(f==0){
            f=dpl10
        }
        a=biFromNumber(Number(e.substr(c,f)));
        c+=f;
        while(c<e.length){
            a=biAdd(biMultiply(a,lr10),biFromNumber(Number(e.substr(c,dpl10))));
            c+=dpl10
        }
        a.isNeg=d
    }
    return a
}
function biCopy(b){
    var a=new BigInt(true);
    a.digits=b.digits.slice(0);
    a.isNeg=b.isNeg;
    return a
}
function biFromNumber(c){
    var a=new BigInt();
    a.isNeg=c<0;
    c=Math.abs(c);
    var b=0;
    while(c>0){
        a.digits[b++]=c&maxDigitVal;
        c>>=biRadixBits
    }
    return a
}
function reverseStr(c){
    var a="";
    for(var b=c.length-1;
    b>-1;
    --b){
        a+=c.charAt(b)
    }
    return a
}
var hexatrigesimalToChar=new Array("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z");
function biToString(d,f){
    var c=new BigInt();
    c.digits[0]=f;
    var e=biDivideModulo(d,c);
    var a=hexatrigesimalToChar[e[1].digits[0]];
    while(biCompare(e[0],bigZero)==1){
        e=biDivideModulo(e[0],c);
        digit=e[1].digits[0];
        a+=hexatrigesimalToChar[e[1].digits[0]]
    }
    return(d.isNeg?"-":"")+reverseStr(a)
}
function biToDecimal(d){
    var c=new BigInt();
    c.digits[0]=10;
    var e=biDivideModulo(d,c);
    var a=String(e[1].digits[0]);
    while(biCompare(e[0],bigZero)==1){
        e=biDivideModulo(e[0],c);
        a+=String(e[1].digits[0])
    }
    return(d.isNeg?"-":"")+reverseStr(a)
}
var hexToChar=new Array("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f");
function digitToHex(c){
    var b=15;
    var a="";
    for(i=0;
    i<4;
    ++i){
        a+=hexToChar[c&b];
        c>>>=4
    }
    return reverseStr(a)
}
function biToHex(b){
    var a="";
    var d=biHighIndex(b);
    for(var c=biHighIndex(b);
    c>-1;
    --c){
        a+=digitToHex(b.digits[c])
    }
    return a
}
function charToHex(k){
    var d=48;
    var b=d+9;
    var e=97;
    var h=e+25;
    var g=65;
    var f=65+25;
    var a;
    if(k>=d&&k<=b){
        a=k-d
    }
    else{
        if(k>=g&&k<=f){
            a=10+k-g
        }
        else{
            if(k>=e&&k<=h){
                a=10+k-e
            }
            else{
                a=0
            }

        }

    }
    return a
}
function hexToDigit(d){
    var b=0;
    var a=Math.min(d.length,4);
    for(var c=0;
    c<a;
    ++c){
        b<<=4;
        b|=charToHex(d.charCodeAt(c))
    }
    return b
}
function biFromHex(e){
    var b=new BigInt();
    var a=e.length;
    for(var d=a,c=0;
    d>0;
    d-=4,++c){
        b.digits[c]=hexToDigit(e.substr(Math.max(d-4,0),Math.min(d,4)))
    }
    return b
}
function biFromString(l,k){
    var a=l.charAt(0)=="-";
    var e=a?1:0;
    var m=new BigInt();
    var b=new BigInt();
    b.digits[0]=1;
    for(var d=l.length-1;
    d>=e;
    d--){
        var f=l.charCodeAt(d);
        var g=charToHex(f);
        var h=biMultiplyDigit(b,g);
        m=biAdd(m,h);
        b=biMultiplyDigit(b,k)
    }
    m.isNeg=a;
    return m
}
function biDump(a){
    return(a.isNeg?"-":"")+a.digits.join(" ")
}
function biAdd(b,g){
    var a;
    if(b.isNeg!=g.isNeg){
        g.isNeg=!g.isNeg;
        a=biSubtract(b,g);
        g.isNeg=!g.isNeg
    }
    else{
        a=new BigInt();
        var f=0;
        var e;
        for(var d=0;
        d<b.digits.length;
        ++d){
            e=b.digits[d]+g.digits[d]+f;
            a.digits[d]=e&65535;
            f=Number(e>=biRadix)
        }
        a.isNeg=b.isNeg
    }
    return a
}
function biSubtract(b,g){
    var a;
    if(b.isNeg!=g.isNeg){
        g.isNeg=!g.isNeg;
        a=biAdd(b,g);
        g.isNeg=!g.isNeg
    }
    else{
        a=new BigInt();
        var f,e;
        e=0;
        for(var d=0;
        d<b.digits.length;
        ++d){
            f=b.digits[d]-g.digits[d]+e;
            a.digits[d]=f&65535;
            if(a.digits[d]<0){
                a.digits[d]+=biRadix
            }
            e=0-Number(f<0)
        }
        if(e==-1){
            e=0;
            for(var d=0;
            d<b.digits.length;
            ++d){
                f=0-a.digits[d]+e;
                a.digits[d]=f&65535;
                if(a.digits[d]<0){
                    a.digits[d]+=biRadix
                }
                e=0-Number(f<0)
            }
            a.isNeg=!b.isNeg
        }
        else{
            a.isNeg=b.isNeg
        }

    }
    return a
}
function biHighIndex(b){
    var a=b.digits.length-1;
    while(a>0&&b.digits[a]==0){
        --a
    }
    return a
}
function biNumBits(c){
    var f=biHighIndex(c);
    var e=c.digits[f];
    var b=(f+1)*bitsPerDigit;
    var a;
    for(a=b;
    a>b-bitsPerDigit;
    --a){
        if((e&32768)!=0){
            break
        }
        e<<=1
    }
    return a
}
function biMultiply(h,g){
    var o=new BigInt();
    var f;
    var b=biHighIndex(h);
    var m=biHighIndex(g);
    var l,a,d;
    for(var e=0;
    e<=m;
    ++e){
        f=0;
        d=e;
        for(j=0;
        j<=b;
        ++j,++d){
            a=o.digits[d]+h.digits[j]*g.digits[e]+f;
            o.digits[d]=a&maxDigitVal;
            f=a>>>biRadixBits
        }
        o.digits[e+b+1]=f
    }
    o.isNeg=h.isNeg!=g.isNeg;
    return o
}
function biMultiplyDigit(a,g){
    var f,e,d;
    result=new BigInt();
    f=biHighIndex(a);
    e=0;
    for(var b=0;
    b<=f;
    ++b){
        d=result.digits[b]+a.digits[b]*g+e;
        result.digits[b]=d&maxDigitVal;
        e=d>>>biRadixBits
    }
    result.digits[1+f]=e;
    return result
}
function arrayCopy(e,h,c,g,f){
    var a=Math.min(h+f,e.length);
    for(var d=h,b=g;
    d<a;
    ++d,++b){
        c[b]=e[d]
    }

}
var highBitMasks=new Array(0,32768,49152,57344,61440,63488,64512,65024,65280,65408,65472,65504,65520,65528,65532,65534,65535);
function biShiftLeft(b,h){
    var d=Math.floor(h/bitsPerDigit);
    var a=new BigInt();
    arrayCopy(b.digits,0,a.digits,d,a.digits.length-d);
    var g=h%bitsPerDigit;
    var c=bitsPerDigit-g;
    for(var e=a.digits.length-1,f=e-1;
    e>0;
    --e,--f){
        a.digits[e]=((a.digits[e]<<g)&maxDigitVal)|((a.digits[f]&highBitMasks[g])>>>(c))
    }
    a.digits[0]=((a.digits[e]<<g)&maxDigitVal);
    a.isNeg=b.isNeg;
    return a
}
var lowBitMasks=new Array(0,1,3,7,15,31,63,127,255,511,1023,2047,4095,8191,16383,32767,65535);
function biShiftRight(b,h){
    var c=Math.floor(h/bitsPerDigit);
    var a=new BigInt();
    arrayCopy(b.digits,c,a.digits,0,b.digits.length-c);
    var f=h%bitsPerDigit;
    var g=bitsPerDigit-f;
    for(var d=0,e=d+1;
    d<a.digits.length-1;
    ++d,++e){
        a.digits[d]=(a.digits[d]>>>f)|((a.digits[e]&lowBitMasks[f])<<g)
    }
    a.digits[a.digits.length-1]>>>=f;
    a.isNeg=b.isNeg;
    return a
}
function biMultiplyByRadixPower(b,c){
    var a=new BigInt();
    arrayCopy(b.digits,0,a.digits,c,a.digits.length-c);
    return a
}
function biDivideByRadixPower(b,c){
    var a=new BigInt();
    arrayCopy(b.digits,c,a.digits,0,a.digits.length-c);
    return a
}
function biModuloByRadixPower(b,c){
    var a=new BigInt();
    arrayCopy(b.digits,0,a.digits,0,c);
    return a
}
function biCompare(a,c){
    if(a.isNeg!=c.isNeg){
        return 1-2*Number(a.isNeg)
    }
    for(var b=a.digits.length-1;
    b>=0;
    --b){
        if(a.digits[b]!=c.digits[b]){
            if(a.isNeg){
                return 1-2*Number(a.digits[b]>c.digits[b])
            }
            else{
                return 1-2*Number(a.digits[b]<c.digits[b])
            }

        }

    }
    return 0
}
function biDivideModulo(g,f){
    var a=biNumBits(g);
    var e=biNumBits(f);
    var d=f.isNeg;
    var o,m;
    if(a<e){
        if(g.isNeg){
            o=biCopy(bigOne);
            o.isNeg=!f.isNeg;
            g.isNeg=false;
            f.isNeg=false;
            m=biSubtract(f,g);
            g.isNeg=true;
            f.isNeg=d
        }
        else{
            o=new BigInt();
            m=biCopy(g)
        }
        return new Array(o,m)
    }
    o=new BigInt();
    m=g;
    var k=Math.ceil(e/bitsPerDigit)-1;
    var h=0;
    while(f.digits[k]<biHalfRadix){
        f=biShiftLeft(f,1);
        ++h;
        ++e;
        k=Math.ceil(e/bitsPerDigit)-1
    }
    m=biShiftLeft(m,h);
    a+=h;
    var u=Math.ceil(a/bitsPerDigit)-1;
    var B=biMultiplyByRadixPower(f,u-k);
    while(biCompare(m,B)!=-1){
        ++o.digits[u-k];
        m=biSubtract(m,B)
    }
    for(var z=u;
    z>k;
    --z){
        var l=(z>=m.digits.length)?0:m.digits[z];
        var A=(z-1>=m.digits.length)?0:m.digits[z-1];
        var w=(z-2>=m.digits.length)?0:m.digits[z-2];
        var v=(k>=f.digits.length)?0:f.digits[k];
        var c=(k-1>=f.digits.length)?0:f.digits[k-1];
        if(l==v){
            o.digits[z-k-1]=maxDigitVal
        }
        else{
            o.digits[z-k-1]=Math.floor((l*biRadix+A)/v)
        }
        var s=o.digits[z-k-1]*((v*biRadix)+c);
        var p=(l*biRadixSquared)+((A*biRadix)+w);
        while(s>p){
            --o.digits[z-k-1];
            s=o.digits[z-k-1]*((v*biRadix)|c);
            p=(l*biRadix*biRadix)+((A*biRadix)+w)
        }
        B=biMultiplyByRadixPower(f,z-k-1);
        m=biSubtract(m,biMultiplyDigit(B,o.digits[z-k-1]));
        if(m.isNeg){
            m=biAdd(m,B);
            --o.digits[z-k-1]
        }

    }
    m=biShiftRight(m,h);
    o.isNeg=g.isNeg!=d;
    if(g.isNeg){
        if(d){
            o=biAdd(o,bigOne)
        }
        else{
            o=biSubtract(o,bigOne)
        }
        f=biShiftRight(f,h);
        m=biSubtract(f,m)
    }
    if(m.digits[0]==0&&biHighIndex(m)==0){
        m.isNeg=false
    }
    return new Array(o,m)
}
function biDivide(a,b){
    return biDivideModulo(a,b)[0]
}
function biModulo(a,b){
    return biDivideModulo(a,b)[1]
}
function biMultiplyMod(b,c,a){
    return biModulo(biMultiply(b,c),a)
}
function biPow(c,e){
    var b=bigOne;
    var d=c;
    while(true){
        if((e&1)!=0){
            b=biMultiply(b,d)
        }
        e>>=1;
        if(e==0){
            break
        }
        d=biMultiply(d,d)
    }
    return b
}
function biPowMod(d,g,c){
    var b=bigOne;
    var e=d;
    var f=g;
    while(true){
        if((f.digits[0]&1)!=0){
            b=biMultiplyMod(b,e,c)
        }
        f=biShiftRight(f,1);
        if(f.digits[0]==0&&biHighIndex(f)==0){
            break
        }
        e=biMultiplyMod(e,e,c)
    }
    return b
}
function BarrettMu(a){
    this.modulus=biCopy(a);
    this.k=biHighIndex(this.modulus)+1;
    var b=new BigInt();
    b.digits[2*this.k]=1;
    this.mu=biDivide(b,this.modulus);
    this.bkplus1=new BigInt();
    this.bkplus1.digits[this.k+1]=1;
    this.modulo=BarrettMu_modulo;
    this.multiplyMod=BarrettMu_multiplyMod;
    this.powMod=BarrettMu_powMod
}
function BarrettMu_modulo(h){
    var g=biDivideByRadixPower(h,this.k-1);
    var e=biMultiply(g,this.mu);
    var d=biDivideByRadixPower(e,this.k+1);
    var c=biModuloByRadixPower(h,this.k+1);
    var i=biMultiply(d,this.modulus);
    var b=biModuloByRadixPower(i,this.k+1);
    var a=biSubtract(c,b);
    if(a.isNeg){
        a=biAdd(a,this.bkplus1)
    }
    var f=biCompare(a,this.modulus)>=0;
    while(f){
        a=biSubtract(a,this.modulus);
        f=biCompare(a,this.modulus)>=0
    }
    return a
}
function BarrettMu_multiplyMod(a,c){
    var b=biMultiply(a,c);
    return this.modulo(b)
}
function BarrettMu_powMod(c,f){
    var b=new BigInt();
    b.digits[0]=1;
    var d=c;
    var e=f;
    while(true){
        if((e.digits[0]&1)!=0){
            b=this.multiplyMod(b,d)
        }
        e=biShiftRight(e,1);
        if(e.digits[0]==0&&biHighIndex(e)==0){
            break
        }
        d=this.multiplyMod(d,d)
    }
    return b
}
function RSAKeyPair(b,c,a){
    this.e=biFromHex(b);
    this.d=biFromHex(c);
    this.m=biFromHex(a);
    this.chunkSize=2*biHighIndex(this.m);
    this.radix=16;
    this.barrett=new BarrettMu(this.m)
}
function twoDigit(a){
    return(a<10?"0":"")+String(a)
}
function encryptedString(l,o){
    var h=new Array();
    var b=o.length;
    var f=0;
    while(f<b){
        h[f]=o.charCodeAt(f);
        f++
    }
    while(h.length%l.chunkSize!=0){
        h[f++]=0
    }
    var g=h.length;
    var p="";
    var e,d,c;
    for(f=0;
    f<g;
    f+=l.chunkSize){
        c=new BigInt();
        e=0;
        for(d=f;
        d<f+l.chunkSize;
        ++e){
            c.digits[e]=h[d++];
            c.digits[e]+=h[d++]<<8
        }
        var n=l.barrett.powMod(c,l.e);
        var m=l.radix==16?biToHex(n):biToString(n,l.radix);
        p+=m+" "
    }
    return p.substring(0,p.length-1)
}
function decryptedString(e,f){
    var h=f.split(" ");
    var a="";
    var d,c,g;
    for(d=0;
    d<h.length;
    ++d){
        var b;
        if(e.radix==16){
            b=biFromHex(h[d])
        }
        else{
            b=biFromString(h[d],e.radix)
        }
        g=e.barrett.powMod(b,e.d);
        for(c=0;
        c<=biHighIndex(g);
        ++c){
            a+=String.fromCharCode(g.digits[c]&255,g.digits[c]>>8)
        }

    }
    if(a.charCodeAt(a.length-1)==0){
        a=a.substring(0,a.length-1)
    }
    return a
}

function RSA_Encrypt(a, b, c){
    var d, e;
    return setMaxDigits(131),
    d = new RSAKeyPair(b,"",c),
    e = encryptedString(d, a)
}

function AES_Encrypt(a, b) {
    var _key = CryptoJS.enc.Utf8.parse(b);
    var _iv = CryptoJS.enc.Utf8.parse("0102030405060708");
    var srcs = CryptoJS.enc.Utf8.parse(a);
    var encrypted = CryptoJS.AES.encrypt(srcs, _key, {
        iv: _iv,
        mode: CryptoJS.mode.CBC
    });
    return encrypted.toString();
}

function AES_Decrypt(a, b) {
    var _key = CryptoJS.enc.Utf8.parse(b);
    var _iv = CryptoJS.enc.Utf8.parse("0102030405060708");
    var decrypt = CryptoJS.AES.decrypt(a, _key, {
        iv: _iv,
        mode: CryptoJS.mode.CBC
    });
    return CryptoJS.enc.Utf8.stringify(decrypt).toString();
}


function a(a) {
    var d, e, b = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", c = "";
    for (d = 0; a > d; d += 1)
        e = Math.random() * b.length,
        e = Math.floor(e),
        c += b.charAt(e);
    return c
}

function d(d, e, f, g) {
    var h = {},
    i = a(16);
    return h.encText = AES_Encrypt(d, g),
    h.encText = AES_Encrypt(h.encText, i),
    h.encSecKey = RSA_Encrypt(i, e, f),
    h
}

function getAsrsea(word){//{"ctcode":"86","cellphone":"","csrf_token":""}'
    var bzg1x = d(word, "010001","00e0b509f6259df8642dbc35662901477df22677ec152b5ff68ace615bb7b725152b3ab17a876aea8a5aa76d2e417629ec4ee341f56135fccf695280104e0312ecbda92557c93870114af6c9d05c4f7f0c3685b7a46bee255932575cce10b424d813cfe4875d3e82047b97ddef52741d546b8e289dc6935b3ece0462db0a22b8e7","0CoJUm6Qyw8W8jud");
    return  "params=" + bzg1x.encText + "&encSecKey=" + bzg1x.encSecKey +"&";
}

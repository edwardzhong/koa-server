/**
 * compose function
 * @param  {...Function} fns 
 */
function compose(...fns) {
    return function (...args) {
        let ret = null
        fns.reverse().forEach(function (fn, i) {
            i == 0 ? (ret = fn(...args)) : (ret = fn(ret))
        });
        return ret;
    }
}

/**
 * curried
 * @param {Function} fn 
 */
function curry(fn, ...args) {
    // var args = Array.prototype.slice.call(arguments, 1);
    return function (...innerArgs) {
        // var innerArgs = Array.prototype.slice.call(arguments);
        // var finalArgs = args.concat(innerArgs);
        return fn(...args, ...innerArgs);
    };
}

/**
 * foreach Array, ArrayLike or Object
 * @param {Array/Object} object 
 * @param {Function} callback 
 */
function each(callback, object) {
    var name, i = 0, length = object.length;
    if (length == undefined) {
        for (name in object) {
            if (callback.call(object[name], name, object[name]) === false) {
                break;
            }
        }
    } else {
        for (var value = object[0]; i < length && callback.call(value, value, i) !== false; value = object[++i]) { }
    }
    return object;
}

/**
 * map Array, ArrayLike or Object
 * @param {Array/Object} object 
 * @param {Function} callback 
 */
function map(callback, object) {
    var value, key, ret = [],
        i = 0,
        length = object.length,
        isArray = length !== undefined && typeof length === "number" && ((length > 0 && object[0] && object[length - 1]) || length === 0 || isArray(object));

    // Go through the array, translating each of the items to their
    if (isArray) {
        for (; i < length; i++) {
            value = callback(object[i], i);
            if (value != null) {
                ret[ret.length] = value;
            }
        }
        // Go through every key on the object,
    } else {
        for (key in object) {
            value = callback(object[key], key);

            if (value != null) {
                ret[ret.length] = value;
            }
        }
    }
    // Flatten any nested arrays
    return ret.concat.apply([], ret);
}

function filter(callback, object) {
    var ret = [], i = 0, length = object.length;
    for (; i < length; i++) {
        if (!!callback(object[i], i))
            ret.push(object[i]);
    }
    return ret;
}

function foldl(callback, arr) {
    return arr.reduce(callback);
}

function foldr(callback, arr) {
    return arr.reduceRight(callback);
}

function entries(object) {
    if (isArray(object)) {
        return object.entries();
    } else if (isObject(object)) {
        return Object.entries(object);
    } else {
        return null;
    }
}

function keys(object) {
    if (isArray(object)) {
        return object.keys();
    } else if (isObject(object)) {
        return Object.keys(object);
    } else {
        return null;
    }
}

function values(object) {
    if (isArray(object)) {
        return object.values();
    } else if (isObject(object)) {
        return Object.values(object);
    } else {
        return null;
    }
}

function flat(arr, n) {
    return arr.flat(n || 1);
}

function flatMap(callback, arr) {
    return arr.flatMap(callback);
}

function repeat(n, object) {
    // if(isString(object)) return object.repeat(n);
    return new Array(n).fill(object);
}

function elem(value, arr) {
    return arr.includes(value);
}

function find(callback, arr) {
    return arr.find(callback);
}

function findIndex(callback, arr) {
    return arr.findIndex(callback);
}

function head(arr) {
    return arr[0];
}

function last(arr) {
    return arr[arr.length - 1];
}

function tail(arr) {
    return arr.slice(1);
}

function init(arr) {
    return arr.slice(0, -1);
}

function take(n, arr) {
    return arr.slice(0, n);
}

function drop(n, arr) {
    return arr.slice(n);
}

function zip(arr, arr2) {
    var i = 0, l = Math.min(arr.length, arr2.length), ret = [];
    for (; i < l; i++) {
        ret.push([arr[i], arr2[i]]);
    }
    return ret;
}

function sort(callback, arr) {
    var ret = arr || callback;
    if (!isArray(ret)) return new Error('not a Array');
    if (arr) {
        return ret.sort(callback);
    } else {
        return ret.sort();
    }
}

function group(arr) {
    if (!isArray(arr)) return new Error('not a Array');
    var ret = [], i = 0, l = arr.length;
    for (; i < l; i++) {
        if (i != 0 && arr[i] === ret[ret.length - 1][0]) {
            ret[ret.length - 1].push(arr[i])
        } else {
            ret.push([arr[i]]);
        }
    }
    return ret;
}

function words(str) {
    if (!isString(str)) return new Error('not a string');
    return str.split(/[\s\t\n]+/g);
}

function unwords(arr) {
    return arr.join(' ');
}

function maximum(arr) {
    return arr.sort()[arr.length - 1];
}

function minimum(arr) {
    return arr.sort()[1];
}

function sum(arr) {
    return foldl((a, b) => a + b, arr);
}

function product(arr) {
    return foldl((a, b) => a * b, arr);
}

function and(arr) {
    return arr.every(function (i) {
        return i;
    });
}

function or(arr) {
    return arr.some(function (i) {
        return i;
    });
}

function even(value) {
    if (!isNumber(value)) return new Error('not a number');
    return value % 2 == 0;
}

function odd(value) {
    if (!isNumber(value)) return new Error('not a number');
    return value % 2 != 0;
}

function toArray(object) {
    if (!object.length) return object;
    return Array.from(object);
}

function isSpace(value) {
    return /^[\s\n\t]+$/.test(value);
}

function isAlphaNum(value) {
    return isAlpha(value) || isNumber(value);
}

function isNumber(value) {
    return typeof value == 'number';
}

function isAlpha(value) {
    return /^[a-zA-Z]+$/.test(value);
}

function isArray(value) {
    if (typeof Array.isArray === 'function') {
        return Array.isArray(value);
    } else {
        return Object.prototype.toString.call(value) === "[object Array]";
    }
}

function isObject(value) {
    return Object.prototype.toString.call(value) === "[object Object]";
}

function isString(value) {
    return typeof value == 'string';
}

function type(obj) {
    if (obj == null) {
        return String(obj);
    }
    return typeof obj == 'object' || typeof obj == 'function' ?
        Object.prototype.toString.call(obj).slice(8, -1).toLowerCase() || 'object' : typeof obj;
}

/**
 * prototype inherit
 * @param {Object} parent 
 * @param {Object} child 
 */
function inherit(parent, child) {
    var f = function () { };
    f.prototype = parent.prototype;
    child.prototype = new f();
    child.prototype.constructor = child;//注意修正constructor
    return child;
}

/**
 * deep copy
 * @param {Object} p 
 * @param {Object} c 
 */
function deepCopy(p, c) {
    if (null == p || "object" != typeof p) return p;
    var c = c || {};
    for (var i in p) {
        if (typeof p[i] === 'object') {
            c[i] = (p[i].constructor === Array) ? [] : {};
            deepCopy(p[i], c[i]);
        } else if (typeof p[i] === 'function') {
            c[i] = p[i].prototype.constructor;
        } else c[i] = p[i];
    }
    return c;
}
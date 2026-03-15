console.log('Polyfills scripts started.');
// https://gist.github.com/topicus/e179b1309e97f1e09e5e
if (!Array.from) {
    Array.from = (function () {
        var iteratorTypes = [
            '[object Map Iterator]', '[object Set Iterator]',
            '[object WeakMap Iterator]', '[object WeakSet Iterator]'
        ];

        var toStr = Object.prototype.toString;
        var isCallable = function (fn) {
            return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
        };
        var toInteger = function (value) {
            var number = Number(value);
            if (isNaN(number)) { return 0; }
            if (number === 0 || !isFinite(number)) { return number; }
            return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
        };
        var maxSafeInteger = Math.pow(2, 53) - 1;
        var toLength = function (value) {
            var len = toInteger(value);
            return Math.min(Math.max(len, 0), maxSafeInteger);
        };

        // The length property of the from method is 1.
        return function from(arrayLike/*, mapFn, thisArg */) {
            var iteratee = function (item, k) {
                if (mapFn) {
                    A[k] = typeof T === 'undefined' ? mapFn(item, k) : mapFn.call(T, item, k);
                } else {
                    A[k] = item;
                }
                return k + 1;
            };

            // 1. Let C be the this value.
            var C = this;

            // 2. Let items be ToObject(arrayLike).
            var items = Object(arrayLike);

            // 3. ReturnIfAbrupt(items).
            if (arrayLike == null) {
                throw new TypeError("Array.from requires an array-like object - not null or undefined");
            }

            // 4. If mapfn is undefined, then let mapping be false.
            var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
            var T;
            if (typeof mapFn !== 'undefined') {
                // 5. else
                // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
                if (!isCallable(mapFn)) {
                    throw new TypeError('Array.from: when provided, the second argument must be a function');
                }

                // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
                if (arguments.length > 2) {
                    T = arguments[2];
                }
            }

            // 13. If IsConstructor(C) is true, then
            // 13. a. Let A be the result of calling the [[Construct]] internal method of C with an argument list containing the single item len.
            // 14. a. Else, Let A be ArrayCreate(len).
            var A = isCallable(C) ? Object(new C(len)) : new Array(len);

            // 16. Let k be 0.
            var k = 0;

            // If usingIterator is not undefined, then
            if (iteratorTypes.indexOf(items.toString()) !== -1) {
                var item;

                // Let next be IteratorStep
                while (item = items.next().value) k = iteratee(item, k);

                // Let putStatus be Put(A, "length", len, true).
                A.length = k;

                // Return A.
                return A;
            }

            // 10. Let lenValue be Get(items, "length").
            // 11. Let len be ToLength(lenValue).
            var len = toLength(items.length);

            // 17. Repeat, while k < len… (also steps a - h)
            while (k < len) k = iteratee(items[k], k);

            // 18. Let putStatus be Put(A, "length", len, true).
            A.length = len;

            // 20. Return A.
            return A;
        };
    }());
}// https://github.com/kevlatus/polyfill-array-includes
if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, 'includes', {
        value: function (searchElement, fromIndex) {

            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }

            var o = Object(this);

            var len = o.length >>> 0;

            if (len === 0) {
                return false;
            }

            var n = fromIndex | 0;

            var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

            function sameValueZero(x, y) {
                return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
            }

            while (k < len) {
                if (sameValueZero(o[k], searchElement)) {
                    return true;
                }
                k++;
            }

            return false;
        }
    });
}// Claude
if (!Number.EPSILON) {
    Number.EPSILON = Math.pow(2, -52);
}

if (!Number.MAX_SAFE_INTEGER) {
    Number.MAX_SAFE_INTEGER = Math.pow(2, 53) - 1; // 9007199254740991
}

if (!Number.MIN_SAFE_INTEGER) {
    Number.MIN_SAFE_INTEGER = -(Math.pow(2, 53) - 1); // -9007199254740991
}

if (!Number.NEGATIVE_INFINITY) {
    Number.NEGATIVE_INFINITY = -Infinity;
}

if (!Number.POSITIVE_INFINITY) {
    Number.POSITIVE_INFINITY = Infinity;
}

if (!Number.isFinite) {
    Number.isFinite = function (value) {
        return typeof value === 'number' && isFinite(value);
    };
}

if (!Number.isInteger) {
    Number.isInteger = function (value) {
        return typeof value === 'number' &&
            isFinite(value) &&
            Math.floor(value) === value;
    };
}

if (!Number.isSafeInteger) {
    Number.isSafeInteger = function (value) {
        return Number.isInteger(value) &&
            Math.abs(value) <= Number.MAX_SAFE_INTEGER;
    };
}// https://gist.github.com/jrrio/4dd2bec652dd642517a390172be27da2
if (typeof Object.assign != "function") {
    Object.defineProperty(Object, "assign", {
        value: function assign(target, varArgs) {
            "use strict";
            if (target == null) {
                throw new TypeError("Cannot convert undefined or null to object");
            }
            var to = Object(target);
            for (var index = 1; index < arguments.length; index++) {
                var nextSource = arguments[index];
                if (nextSource != null) {
                    for (var nextKey in nextSource) {
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        },
        writable: true,
        configurable: true
    });
}// https://github.com/es-shims/get-own-property-symbols/
(function (Object, GOPS) {
  'use strict';

  // (C) Andrea Giammarchi - Mit Style

  if (GOPS in Object) { return; }

  /** @type {(this: ThisParameterType<typeof Object.defineProperty>, ...args: Parameters<typeof Object.defineProperty>) => void} */
  var setDescriptor;
  /** @type {global | window} */
  var G = typeof global === 'undefined' ? window : global;
  var id = 0;
  var random = String(Math.random());
  var prefix = '__\x01symbol:';
  var prefixLength = prefix.length;
  var internalSymbol = '__\x01symbol@@' + random;
  var gOPN = Object.getOwnPropertyNames;
  var gOPD = Object.getOwnPropertyDescriptor;
  var create = Object.create;
  var keys = Object.keys;
  var freeze = Object.freeze || Object;
  var defineProperty = Object.defineProperty;
  var $defineProperties = Object.defineProperties;
  // eslint-disable-next-line no-extra-parens
  var descriptor = /** @type {PropertyDescriptor} */ (gOPD(Object, 'getOwnPropertyDescriptor'));
  var ObjectProto = Object.prototype;
  var hOP = ObjectProto.hasOwnProperty;
  var pIE = ObjectProto.propertyIsEnumerable;
  var toString = ObjectProto.toString;
  /** @type {(o: { [k: string]: Record<`@@${string}`, boolean> }, uid: `@@${string}`, enumerable: boolean) => void} */
  var addInternalIfNeeded = function (o, uid, enumerable) {
    if (!hOP.call(o, internalSymbol)) {
      defineProperty(o, internalSymbol, {
        enumerable: false,
        configurable: false,
        writable: false,
        value: {}
      });
    }
    o[internalSymbol][/** @type {`@@${string}`} */ ('@@' + uid)] = enumerable; // eslint-disable-line no-param-reassign, no-extra-parens
  };
  /** @type {(proto: null | object, descriptors: { [k: string]: Record<`@@${string}`, boolean> }) => object} */
  var createWithSymbols = function (proto, descriptors) {
    var self = create(proto);
    gOPN(descriptors).forEach(function (key) {
      if (propertyIsEnumerable.call(descriptors, key)) {
        $defineProperty(self, key, descriptors[key]);
      }
    });
    return self;
  };
  /** @type {(descriptor: PropertyDescriptor) => PropertyDescriptor} */
  var copyAsNonEnumerable = function (descriptor) {
    var newDescriptor = create(descriptor);
    newDescriptor.enumerable = false;
    return newDescriptor;
  };
  var get = function get() {};
  var onlyNonSymbols = /** @type {(name: string | symbolish) => name is string} */ function (name) {
    // eslint-disable-next-line eqeqeq
    return name != internalSymbol && !hOP.call(source, name);
  };
  var onlySymbols = /** @type {(name: string | symbolish) => name is symbolish} */ function (name) {
    // eslint-disable-next-line eqeqeq
    return name != internalSymbol && hOP.call(source, name);
  };
  /** @type {(this: { [k: string | symbolish]: Record<`@@${string}`, boolean> }, key: string | symbolish) => boolean} */
  var propertyIsEnumerable = function propertyIsEnumerable(key) {
    var uid = String(key);
    // eslint-disable-next-line no-extra-parens
    return onlySymbols(uid) ? hOP.call(this, uid) && !!this[internalSymbol] && this[internalSymbol][/** @type {`@@${string}`} */ ('@@' + uid)] : pIE.call(this, key);
  };
  /** @type {(uid: `@@${string}`) => Readonly<symbolish>} */
  var setAndGetSymbol = function (uid) {
    /** @type {PropertyDescriptor} */
    var descriptor = {
      enumerable: false,
      configurable: true,
      get: get,
      set: /** @type {(this: { [k: string]: Record<`@@${string}`, boolean> }, value: unknown) => void} */ function (value) {
        setDescriptor(this, uid, {
          enumerable: false,
          configurable: true,
          writable: true,
          value: value
        });
        addInternalIfNeeded(this, uid, true);
      }
    };
    defineProperty(ObjectProto, uid, descriptor);
    source[uid] = defineProperty(
      Object(uid),
      'constructor',
      sourceConstructor
    );
    return freeze(source[uid]);
  };
    /**
     * @this {Symbol}
     * @param {string} description
     * @returns {Readonly<symbolish>}
     */
  var Symbol = function Symbol(description) {
    if (this instanceof Symbol) {
      throw new TypeError('Symbol is not a constructor');
    }
    // eslint-disable-next-line no-extra-parens
    return setAndGetSymbol(/** @type {Parameters<typeof setAndGetSymbol>[0]} */ (prefix + (description || '') + random + ++id));
  };
  /** @type {Record<`@@${string}`, symbolish>} */
  var source = create(null);
  var sourceConstructor = { value: Symbol };
  /** @type {(uid: `@@${string}`) => symbolish} */
  var sourceMap = function (uid) {
    return source[uid];
  };
    /** @type {typeof Object.defineProperty} */
  var $defineProperty = function defineProp(o, key, descriptor) {
    var uid = String(key);
    if (onlySymbols(uid)) {
      setDescriptor(o, uid, descriptor.enumerable ? copyAsNonEnumerable(descriptor) : descriptor);
      // eslint-disable-next-line no-extra-parens
      addInternalIfNeeded(/** @type {Parameters<addInternalIfNeeded>[0]} */ (o), uid, !!descriptor.enumerable);
    } else {
      defineProperty(o, key, descriptor);
    }
    return o;
  };

  /** @type {typeof Object.getOwnPropertySymbols} */
  var $getOwnPropertySymbols = function getOwnPropertySymbols(o) {
    // eslint-disable-next-line no-extra-parens
    return gOPN(o).filter(onlySymbols).map(/** @type {(uid: string) => symbolish} */ (sourceMap));
  };
  descriptor.value = $defineProperty;
  defineProperty(Object, 'defineProperty', descriptor);

  descriptor.value = $getOwnPropertySymbols;
  defineProperty(Object, GOPS, descriptor);

  /** @type {typeof Object.getOwnPropertyNames} */
  descriptor.value = function getOwnPropertyNames(o) {
    return gOPN(o).filter(onlyNonSymbols);
  };
  defineProperty(Object, 'getOwnPropertyDescriptor', descriptor);

  /** @type {typeof Object.defineProperties} */
  descriptor.value = function defineProperties(o, descriptors) {
    // eslint-disable-next-line no-extra-parens
    var symbols = /** @type {symbolish[]} */ ($getOwnPropertySymbols(descriptors));
    if (symbols.length) {
      /** @type {(string | symbolish)[]} */
      var items = [].concat(
        // @ts-expect-error TS sucks with concat
        keys(descriptors),
        symbols
      );
      items.forEach(function (uid) {
        if (propertyIsEnumerable.call(
          // eslint-disable-next-line no-extra-parens
          /** @type {ThisParameterType<typeof propertyIsEnumerable>} */ (descriptors),
          uid
        )) {
          $defineProperty(o, uid, descriptors[uid]);
        }
      });
    } else {
      $defineProperties(o, descriptors);
    }
    return o;
  };
  defineProperty(Object, 'defineProperties', descriptor);

  descriptor.value = propertyIsEnumerable;
  defineProperty(ObjectProto, 'propertyIsEnumerable', descriptor);

  descriptor.value = Symbol;
  defineProperty(G, 'Symbol', descriptor);

  /** @type {(key: string) => Readonly<symbolish>} */
  // defining `Symbol.for(key)`
  descriptor.value = function (key) {
    // eslint-disable-next-line no-extra-parens
    var uid = /** @type {Parameters<typeof setAndGetSymbol>[0]} */ (prefix + prefix + key + random);
    return uid in ObjectProto ? source[uid] : setAndGetSymbol(uid);
  };
  defineProperty(Symbol, 'for', descriptor);

  /** @type {(symbol: symbolish) => string | undefined} */
  // defining `Symbol.keyFor(symbol)`
  descriptor.value = function (symbol) {
    if (onlyNonSymbols(symbol)) { throw new TypeError(symbol + ' is not a symbol'); }
    if (!hOP.call(source, symbol)) {
      return void 0;
    }
    var label = symbol.slice(prefixLength);
    if (label.slice(0, prefixLength) !== prefix) {
      return void 0;
    }
    label = label.slice(prefixLength);
    if (label === random) {
      return void 0;
    }
    label = label.slice(0, label.length - random.length);
    return label.length > 0 ? label : void 0;
  };
  defineProperty(Symbol, 'keyFor', descriptor);

  /** @type {(o: { [k: string | symbolish]: Record<`@@${string}`, boolean> }, key: string | symbolish) => PropertyDescriptor | undefined} */
  descriptor.value = function getOwnPropertyDescriptor(o, key) {
    var descriptor = gOPD(o, key);
    if (descriptor && onlySymbols(key)) {
      descriptor.enumerable = propertyIsEnumerable.call(o, key);
    }
    return descriptor;
  };
  defineProperty(Object, 'getOwnPropertyDescriptor', descriptor);

  // eslint-disable-next-line no-extra-parens
  descriptor.value = /** @type {typeof Object.create} */ (function (proto, descriptors) {
    return arguments.length === 1 || typeof descriptors === 'undefined'
      ? create(proto)
      // eslint-disable-next-line no-extra-parens
      : createWithSymbols(proto, /** @type {Parameters<typeof createWithSymbols>[1]} */ (descriptors));
  });
  defineProperty(Object, 'create', descriptor);

  /** @type {(this: string | symbolish) => string} */
  descriptor.value = function () {
    var str = toString.call(this);
    return str === '[object String]' && onlySymbols(this) ? '[object Symbol]' : str;
  };
  defineProperty(ObjectProto, 'toString', descriptor);

  try { // fails in few pre ES 5.1 engines
    if (
      create(defineProperty({}, prefix, {
        get: function () {
          return defineProperty(this, prefix, { value: true })[prefix];
        }
      }))[prefix] === true
    ) {
      setDescriptor = defineProperty;
    } else {
      throw 'IE11'; // eslint-disable-line no-throw-literal
    }
  } catch (o_O) { // eslint-disable-line camelcase
    setDescriptor = function (o, key, descriptor) {
      var protoDescriptor = gOPD(ObjectProto, key);
      // eslint-disable-next-line no-extra-parens
      delete ObjectProto[/** @type {keyof typeof Object.prototype} */ (key)];
      defineProperty(o, key, descriptor);
      // eslint-disable-next-line no-extra-parens
      defineProperty(ObjectProto, key, /** @type {NonNullable<typeof protoDescriptor>} */ (protoDescriptor));
    };
  }

}(Object, 'getOwnPropertySymbols'));

(function (O, Symbol) {
  'use strict';

  var dP = O.defineProperty;
  var ObjectProto = O.prototype;
  var toString = ObjectProto.toString;
  [
    'iterator', // A method returning the default iterator for an object. Used by for...of.
    'match', // A method that matches against a string, also used to determine if an object may be used as a regular expression. Used by String.prototype.match().
    'replace', // A method that replaces matched substrings of a string. Used by String.prototype.replace().
    'search', // A method that returns the index within a string that matches the regular expression. Used by String.prototype.search().
    'split', // A method that splits a string at the indices that match a regular expression. Used by String.prototype.split().
    'hasInstance', // A method determining if a constructor object recognizes an object as its instance. Used by instanceof.
    'isConcatSpreadable', // A Boolean value indicating if an object should be flattened to its array elements. Used by Array.prototype.concat().
    'unscopables', // An Array of string values that are property values. These are excluded from the with environment bindings of the associated objects.
    'species', // A constructor function that is used to create derived objects.
    'toPrimitive', // A method converting an object to a primitive value.
    'toStringTag' // A string value used for the default description of an object. Used by Object.prototype.toString().
  ].forEach(function (name) {
    if (!(name in Symbol)) {
      dP(Symbol, name, { value: Symbol(name) });
      if (name === 'toStringTag') {
        // eslint-disable-next-line no-extra-parens
        var descriptor = /** @type {PropertyDescriptor} */ (O.getOwnPropertyDescriptor(ObjectProto, 'toString'));
        descriptor.value = /** @type {(this: null | { [Symbol.toStringTag]?: unknown }) => string} */ function () {
          var str = toString.call(this);
          var tst = this == null ? this : this[Symbol.toStringTag];
          return tst == null ? str : '[object ' + tst + ']';
        };
        dP(ObjectProto, 'toString', descriptor);
      }
    }
  });
}(Object, Symbol));

(/** @type {(Si: symbolish, AP: unknown[] & Record<symbolish, unknown>, SP: String & Record<symbolish, unknown>) => void} */ function (Si, AP, SP) {

  /** @type {<T>(this: T) => T} */
  function returnThis() { return this; }

  /*
   * make Arrays usable as iterators
   * so that other iterables can copy same logic
   */
  if (!AP[Si]) {
    // eslint-disable-next-line no-param-reassign
    AP[Si] = function () {
      var i = 0;

      var self = this;
      /** @type {{ next(): { done: boolean, value?: unknown } } & { [k in symbol]?: unknown }} */
      var iterator = {
        next: function next() {
          var done = self.length <= i;
          return done ? { done: done } : { done: done, value: self[i++] };
        }
      };
      iterator[Si] = returnThis;
      return iterator;
    };
  }

  /*
   * make Strings usable as iterators
   * to simplify Array.from and for/of like loops
   */
  if (!SP[Si]) {
    // eslint-disable-next-line no-param-reassign
    SP[Si] = function () {
      var fromCodePoint = String.fromCodePoint;
      var self = this;
      var i = 0;
      var length = self.length;
      /** @type {{ next(): { done: boolean, value?: string } } & { [k in symbol]?: unknown }} */
      var iterator = {
        next: function next() {
          var done = length <= i;
          // eslint-disable-next-line no-extra-parens
          var c = done ? '' : fromCodePoint(/** @type {number} */ (self.codePointAt(i)));
          i += c.length;
          return done ? { done: done } : { done: done, value: c };
        }
      };
      iterator[Si] = returnThis;
      return iterator;
    };
  }

}(
  // eslint-disable-next-line no-extra-parens
  /** @type {symbolish} */ (Symbol.iterator),
  // eslint-disable-next-line no-extra-parens
  /** @type {unknown[] & Record<symbolish, unknown>} */ (Array.prototype),
  // eslint-disable-next-line no-extra-parens
  /** @type {String & Record<symbolish, unknown>} */ (String.prototype)
));
// https://github.com/dy/weakset
;(function(){window.WeakSet=b;var c=Date.now()%1E9;function b(a){this.name="__st"+(1E9*Math.random()>>>0)+(c++ +"__");a&&a.forEach&&a.forEach(this.add,this)}var e=b.prototype;e.add=function(a){var d=this.name;a[d]||Object.defineProperty(a,d,{value:!0,writable:!0});return this};e["delete"]=function(a){if(!a[this.name])return!1;a[this.name]=void 0;return!0};e.has=function(a){return!!a[this.name]};})();// https://gist.github.com/developit/e96097d9b657f2a2f3e588ffde433437
if (!('forEach' in NodeList.prototype)) NodeList.prototype.forEach = [].forEach;
// https://github.com/VitorLuizC/object-descriptors
const getKeys = (object) => {
    if (typeof Reflect === 'object' && typeof Reflect.ownKeys === 'function')
        return Reflect.ownKeys(object);

    const keys = [];

    return keys.concat(
        Object.getOwnPropertyNames(object),
        Object.getOwnPropertySymbols(object),
    );
};

const getDescriptors = (object) => {
    if (object === null || object === undefined)
        throw new TypeError('Cannot convert undefined or null to object');

    return getKeys(object).reduce(
        (descriptors, key) => {
            const descriptor = Object.getOwnPropertyDescriptor(object, key);
            if (descriptor) descriptors[key] = descriptor;
            return descriptors;
        },
        {},
    );
};

if (typeof Object.getOwnPropertyDescriptors !== 'function') {
    Object.defineProperty(Object, 'getOwnPropertyDescriptors', {
        value: getDescriptors,
        writable: true,
        configurable: true,
    });
}// https://github.com/GoogleChrome/proxy-polyfill
(function(){function n(){function w(){return null}function m(a){return a?"object"===typeof a||"function"===typeof a:!1}function p(a){if(null!==a&&!m(a))throw new TypeError("Object prototype may only be an Object or null: "+a);}function x(a,c,B){function k(){}if(!m(a)||!m(c))throw new TypeError("Cannot create proxy with a non-object as target or handler");var g=c;c={get:null,set:null,apply:null,construct:null};for(var h in g){if(!(h in c))throw new TypeError("Proxy polyfill does not support trap '"+h+"'");c[h]=
g[h]}"function"===typeof g&&(c.apply=g.apply.bind(g));g=C(a);var q=!1,r=!1;if("function"===typeof a){var f=function(){var b=this&&this.constructor===f,d=Array.prototype.slice.call(arguments);k(b?"construct":"apply");return b&&c.construct?c.construct.call(this,a,d):!b&&c.apply?c.apply(a,this,d):b?(d.unshift(a),new (a.bind.apply(a,d))):a.apply(this,d)};q=!0}else a instanceof Array?(f=[],r=!0):f=y||null!==g?D(g):{};var z=c.get?function(b){k("get");return c.get(this,b,f)}:function(b){k("get");return this[b]},
E=c.set?function(b,d){k("set");c.set(this,b,d,f)}:function(b,d){k("set");this[b]=d};h=e.getOwnPropertyNames(a).map(function(b){return{name:b,source:a}});for(var l=g;l&&l!==e.prototype;)h=h.concat(e.getOwnPropertyNames(l).map(function(b){return{name:b,source:l}})),l=e.getPrototypeOf(l);var t={};h.forEach(function(b){var d=b.name;(q||r)&&d in f||t[d]||(b=e.getOwnPropertyDescriptor(b.source,d),e.defineProperty(f,d,{enumerable:!!b.enumerable,get:z.bind(a,d),set:E.bind(a,d)}),t[d]=!0)});h=!0;if(q||r){var F=
e.setPrototypeOf||([].__proto__===Array.prototype?function(b,d){p(d);b.__proto__=d;return b}:w);g&&F(f,g)||(h=!1)}if(c.get||!h)for(var u in a)t[u]||e.defineProperty(f,u,{get:z.bind(a,u)});e.seal(a);e.seal(f);return B?{proxy:f,revoke:function(){a=null;k=function(b){throw new TypeError("Cannot perform '"+b+"' on a proxy that has been revoked");}}}:f}var e=Object,y=!!e.create||!({__proto__:null}instanceof e),D=e.create||(y?function(a){p(a);return{__proto__:a}}:function(a){function c(){}p(a);if(null===
a)throw new SyntaxError("Native Object.create is required to create objects with null prototype");c.prototype=a;return new c}),C=e.getPrototypeOf||([].__proto__===Array.prototype?function(a){a=a.__proto__;return m(a)?a:null}:w);var v=function(a,c){if(void 0===(this&&this instanceof v?this.constructor:void 0))throw new TypeError("Constructor Proxy requires 'new'");return x(a,c)};v.revocable=function(a,c){return x(a,c,!0)};return v};var A="undefined"!==typeof process&&"[object process]"==={}.toString.call(process)||"undefined"!==typeof navigator&&"ReactNative"===navigator.product?global:self;A.Proxy||(A.Proxy=n(),A.Proxy.revocable=A.Proxy.revocable);})();// https://github.com/microsoft/reflect-metadata
"use strict";
/*! *****************************************************************************
Copyright (C) Microsoft. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
Object.defineProperty(exports, "__esModule", { value: true });
// feature test for Symbol support
var supportsSymbol = typeof Symbol === "function";
var toPrimitiveSymbol =
    supportsSymbol && typeof Symbol.toPrimitive !== "undefined"
        ? Symbol.toPrimitive
        : fail("Symbol.toPrimitive not found.");
var iteratorSymbol =
    supportsSymbol && typeof Symbol.iterator !== "undefined"
        ? Symbol.iterator
        : fail("Symbol.iterator not found.");
// Load global or shim versions of Map, Set, and WeakMap
var functionPrototype = Object.getPrototypeOf(Function);
var _Map =
    typeof Map === "function" && typeof Map.prototype.entries === "function"
        ? Map
        : fail("A valid Map constructor could not be found.");
var _Set =
    typeof Set === "function" && typeof Set.prototype.entries === "function"
        ? Set
        : fail("A valid Set constructor could not be found.");
var _WeakMap =
    typeof WeakMap === "function"
        ? WeakMap
        : fail("A valid WeakMap constructor could not be found.");
var registrySymbol = supportsSymbol
    ? Symbol.for("@reflect-metadata:registry")
    : undefined;
var metadataRegistry = GetOrCreateMetadataRegistry();
var metadataProvider = CreateMetadataProvider(metadataRegistry);
/**
 * Applies a set of decorators to a property of a target object.
 * @param decorators An array of decorators.
 * @param target The target object.
 * @param propertyKey (Optional) The property key to decorate.
 * @param attributes (Optional) The property descriptor for the target key.
 * @remarks Decorators are applied in reverse order.
 * @example
 *
 *     class Example {
 *         // property declarations are not part of ES6, though they are valid in TypeScript:
 *         // static staticProperty;
 *         // property;
 *
 *         constructor(p) { }
 *         static staticMethod(p) { }
 *         method(p) { }
 *     }
 *
 *     // constructor
 *     Example = Reflect.decorate(decoratorsArray, Example);
 *
 *     // property (on constructor)
 *     Reflect.decorate(decoratorsArray, Example, "staticProperty");
 *
 *     // property (on prototype)
 *     Reflect.decorate(decoratorsArray, Example.prototype, "property");
 *
 *     // method (on constructor)
 *     Object.defineProperty(Example, "staticMethod",
 *         Reflect.decorate(decoratorsArray, Example, "staticMethod",
 *             Object.getOwnPropertyDescriptor(Example, "staticMethod")));
 *
 *     // method (on prototype)
 *     Object.defineProperty(Example.prototype, "method",
 *         Reflect.decorate(decoratorsArray, Example.prototype, "method",
 *             Object.getOwnPropertyDescriptor(Example.prototype, "method")));
 *
 */
function decorate(decorators, target, propertyKey, attributes) {
    if (!IsUndefined(propertyKey)) {
        if (!IsArray(decorators)) throw new TypeError();
        if (!IsObject(target)) throw new TypeError();
        if (
            !IsObject(attributes) &&
            !IsUndefined(attributes) &&
            !IsNull(attributes)
        )
            throw new TypeError();
        if (IsNull(attributes)) attributes = undefined;
        propertyKey = ToPropertyKey(propertyKey);
        return DecorateProperty(decorators, target, propertyKey, attributes);
    } else {
        if (!IsArray(decorators)) throw new TypeError();
        if (!IsConstructor(target)) throw new TypeError();
        return DecorateConstructor(decorators, target);
    }
}
exports.decorate = decorate;
// 4.1.2 Reflect.metadata(metadataKey, metadataValue)
// https://rbuckton.github.io/reflect-metadata/#reflect.metadata
/**
 * A default metadata decorator factory that can be used on a class, class member, or parameter.
 * @param metadataKey The key for the metadata entry.
 * @param metadataValue The value for the metadata entry.
 * @returns A decorator function.
 * @remarks
 * If `metadataKey` is already defined for the target and target key, the
 * metadataValue for that key will be overwritten.
 * @example
 *
 *     // constructor
 *     @Reflect.metadata(key, value)
 *     class Example {
 *     }
 *
 *     // property (on constructor, TypeScript only)
 *     class Example {
 *         @Reflect.metadata(key, value)
 *         static staticProperty;
 *     }
 *
 *     // property (on prototype, TypeScript only)
 *     class Example {
 *         @Reflect.metadata(key, value)
 *         property;
 *     }
 *
 *     // method (on constructor)
 *     class Example {
 *         @Reflect.metadata(key, value)
 *         static staticMethod() { }
 *     }
 *
 *     // method (on prototype)
 *     class Example {
 *         @Reflect.metadata(key, value)
 *         method() { }
 *     }
 *
 */
function metadata(metadataKey, metadataValue) {
    if (
        typeof Reflect !== "undefined" &&
        typeof Reflect.metadata === "function" &&
        Reflect.metadata !== metadata
    ) {
        return Reflect.metadata(metadataKey, metadataValue);
    }
    function decorator(target, propertyKey) {
        if (!IsObject(target)) throw new TypeError();
        if (!IsUndefined(propertyKey) && !IsPropertyKey(propertyKey))
            throw new TypeError();
        OrdinaryDefineOwnMetadata(
            metadataKey,
            metadataValue,
            target,
            propertyKey
        );
    }
    return decorator;
}
exports.metadata = metadata;
/**
 * Define a unique metadata entry on the target.
 * @param metadataKey A key used to store and retrieve metadata.
 * @param metadataValue A value that contains attached metadata.
 * @param target The target object on which to define metadata.
 * @param propertyKey (Optional) The property key for the target.
 * @example
 *
 *     class Example {
 *         // property declarations are not part of ES6, though they are valid in TypeScript:
 *         // static staticProperty;
 *         // property;
 *
 *         constructor(p) { }
 *         static staticMethod(p) { }
 *         method(p) { }
 *     }
 *
 *     // constructor
 *     Reflect.defineMetadata("custom:annotation", options, Example);
 *
 *     // property (on constructor)
 *     Reflect.defineMetadata("custom:annotation", options, Example, "staticProperty");
 *
 *     // property (on prototype)
 *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "property");
 *
 *     // method (on constructor)
 *     Reflect.defineMetadata("custom:annotation", options, Example, "staticMethod");
 *
 *     // method (on prototype)
 *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "method");
 *
 *     // decorator factory as metadata-producing annotation.
 *     function MyAnnotation(options): Decorator {
 *         return (target, key?) => Reflect.defineMetadata("custom:annotation", options, target, key);
 *     }
 *
 */
function defineMetadata(metadataKey, metadataValue, target, propertyKey) {
    if (!IsObject(target)) throw new TypeError();
    if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
    return OrdinaryDefineOwnMetadata(
        metadataKey,
        metadataValue,
        target,
        propertyKey
    );
}
exports.defineMetadata = defineMetadata;
/**
 * Gets a value indicating whether the target object or its prototype chain has the provided metadata key defined.
 * @param metadataKey A key used to store and retrieve metadata.
 * @param target The target object on which the metadata is defined.
 * @param propertyKey (Optional) The property key for the target.
 * @returns `true` if the metadata key was defined on the target object or its prototype chain; otherwise, `false`.
 * @example
 *
 *     class Example {
 *         // property declarations are not part of ES6, though they are valid in TypeScript:
 *         // static staticProperty;
 *         // property;
 *
 *         constructor(p) { }
 *         static staticMethod(p) { }
 *         method(p) { }
 *     }
 *
 *     // constructor
 *     result = Reflect.hasMetadata("custom:annotation", Example);
 *
 *     // property (on constructor)
 *     result = Reflect.hasMetadata("custom:annotation", Example, "staticProperty");
 *
 *     // property (on prototype)
 *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "property");
 *
 *     // method (on constructor)
 *     result = Reflect.hasMetadata("custom:annotation", Example, "staticMethod");
 *
 *     // method (on prototype)
 *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "method");
 *
 */
function hasMetadata(metadataKey, target, propertyKey) {
    if (!IsObject(target)) throw new TypeError();
    if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
    return OrdinaryHasMetadata(metadataKey, target, propertyKey);
}
exports.hasMetadata = hasMetadata;
/**
 * Gets a value indicating whether the target object has the provided metadata key defined.
 * @param metadataKey A key used to store and retrieve metadata.
 * @param target The target object on which the metadata is defined.
 * @param propertyKey (Optional) The property key for the target.
 * @returns `true` if the metadata key was defined on the target object; otherwise, `false`.
 * @example
 *
 *     class Example {
 *         // property declarations are not part of ES6, though they are valid in TypeScript:
 *         // static staticProperty;
 *         // property;
 *
 *         constructor(p) { }
 *         static staticMethod(p) { }
 *         method(p) { }
 *     }
 *
 *     // constructor
 *     result = Reflect.hasOwnMetadata("custom:annotation", Example);
 *
 *     // property (on constructor)
 *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticProperty");
 *
 *     // property (on prototype)
 *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "property");
 *
 *     // method (on constructor)
 *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticMethod");
 *
 *     // method (on prototype)
 *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "method");
 *
 */
function hasOwnMetadata(metadataKey, target, propertyKey) {
    if (!IsObject(target)) throw new TypeError();
    if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
    return OrdinaryHasOwnMetadata(metadataKey, target, propertyKey);
}
exports.hasOwnMetadata = hasOwnMetadata;
/**
 * Gets the metadata value for the provided metadata key on the target object or its prototype chain.
 * @param metadataKey A key used to store and retrieve metadata.
 * @param target The target object on which the metadata is defined.
 * @param propertyKey (Optional) The property key for the target.
 * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
 * @example
 *
 *     class Example {
 *         // property declarations are not part of ES6, though they are valid in TypeScript:
 *         // static staticProperty;
 *         // property;
 *
 *         constructor(p) { }
 *         static staticMethod(p) { }
 *         method(p) { }
 *     }
 *
 *     // constructor
 *     result = Reflect.getMetadata("custom:annotation", Example);
 *
 *     // property (on constructor)
 *     result = Reflect.getMetadata("custom:annotation", Example, "staticProperty");
 *
 *     // property (on prototype)
 *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "property");
 *
 *     // method (on constructor)
 *     result = Reflect.getMetadata("custom:annotation", Example, "staticMethod");
 *
 *     // method (on prototype)
 *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "method");
 *
 */
function getMetadata(metadataKey, target, propertyKey) {
    if (!IsObject(target)) throw new TypeError();
    if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
    return OrdinaryGetMetadata(metadataKey, target, propertyKey);
}
exports.getMetadata = getMetadata;
/**
 * Gets the metadata value for the provided metadata key on the target object.
 * @param metadataKey A key used to store and retrieve metadata.
 * @param target The target object on which the metadata is defined.
 * @param propertyKey (Optional) The property key for the target.
 * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
 * @example
 *
 *     class Example {
 *         // property declarations are not part of ES6, though they are valid in TypeScript:
 *         // static staticProperty;
 *         // property;
 *
 *         constructor(p) { }
 *         static staticMethod(p) { }
 *         method(p) { }
 *     }
 *
 *     // constructor
 *     result = Reflect.getOwnMetadata("custom:annotation", Example);
 *
 *     // property (on constructor)
 *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticProperty");
 *
 *     // property (on prototype)
 *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "property");
 *
 *     // method (on constructor)
 *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticMethod");
 *
 *     // method (on prototype)
 *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "method");
 *
 */
function getOwnMetadata(metadataKey, target, propertyKey) {
    if (!IsObject(target)) throw new TypeError();
    if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
    return OrdinaryGetOwnMetadata(metadataKey, target, propertyKey);
}
exports.getOwnMetadata = getOwnMetadata;
/**
 * Gets the metadata keys defined on the target object or its prototype chain.
 * @param target The target object on which the metadata is defined.
 * @param propertyKey (Optional) The property key for the target.
 * @returns An array of unique metadata keys.
 * @example
 *
 *     class Example {
 *         // property declarations are not part of ES6, though they are valid in TypeScript:
 *         // static staticProperty;
 *         // property;
 *
 *         constructor(p) { }
 *         static staticMethod(p) { }
 *         method(p) { }
 *     }
 *
 *     // constructor
 *     result = Reflect.getMetadataKeys(Example);
 *
 *     // property (on constructor)
 *     result = Reflect.getMetadataKeys(Example, "staticProperty");
 *
 *     // property (on prototype)
 *     result = Reflect.getMetadataKeys(Example.prototype, "property");
 *
 *     // method (on constructor)
 *     result = Reflect.getMetadataKeys(Example, "staticMethod");
 *
 *     // method (on prototype)
 *     result = Reflect.getMetadataKeys(Example.prototype, "method");
 *
 */
function getMetadataKeys(target, propertyKey) {
    if (!IsObject(target)) throw new TypeError();
    if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
    return OrdinaryMetadataKeys(target, propertyKey);
}
exports.getMetadataKeys = getMetadataKeys;
/**
 * Gets the unique metadata keys defined on the target object.
 * @param target The target object on which the metadata is defined.
 * @param propertyKey (Optional) The property key for the target.
 * @returns An array of unique metadata keys.
 * @example
 *
 *     class Example {
 *         // property declarations are not part of ES6, though they are valid in TypeScript:
 *         // static staticProperty;
 *         // property;
 *
 *         constructor(p) { }
 *         static staticMethod(p) { }
 *         method(p) { }
 *     }
 *
 *     // constructor
 *     result = Reflect.getOwnMetadataKeys(Example);
 *
 *     // property (on constructor)
 *     result = Reflect.getOwnMetadataKeys(Example, "staticProperty");
 *
 *     // property (on prototype)
 *     result = Reflect.getOwnMetadataKeys(Example.prototype, "property");
 *
 *     // method (on constructor)
 *     result = Reflect.getOwnMetadataKeys(Example, "staticMethod");
 *
 *     // method (on prototype)
 *     result = Reflect.getOwnMetadataKeys(Example.prototype, "method");
 *
 */
function getOwnMetadataKeys(target, propertyKey) {
    if (!IsObject(target)) throw new TypeError();
    if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
    return OrdinaryOwnMetadataKeys(target, propertyKey);
}
exports.getOwnMetadataKeys = getOwnMetadataKeys;
/**
 * Deletes the metadata entry from the target object with the provided key.
 * @param metadataKey A key used to store and retrieve metadata.
 * @param target The target object on which the metadata is defined.
 * @param propertyKey (Optional) The property key for the target.
 * @returns `true` if the metadata entry was found and deleted; otherwise, false.
 * @example
 *
 *     class Example {
 *         // property declarations are not part of ES6, though they are valid in TypeScript:
 *         // static staticProperty;
 *         // property;
 *
 *         constructor(p) { }
 *         static staticMethod(p) { }
 *         method(p) { }
 *     }
 *
 *     // constructor
 *     result = Reflect.deleteMetadata("custom:annotation", Example);
 *
 *     // property (on constructor)
 *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticProperty");
 *
 *     // property (on prototype)
 *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "property");
 *
 *     // method (on constructor)
 *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticMethod");
 *
 *     // method (on prototype)
 *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "method");
 *
 */
function deleteMetadata(metadataKey, target, propertyKey) {
    if (!IsObject(target)) throw new TypeError();
    if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
    var provider = GetMetadataProvider(target, propertyKey, /*Create*/ false);
    if (IsUndefined(provider)) return false;
    return provider.OrdinaryDeleteMetadata(metadataKey, target, propertyKey);
}
exports.deleteMetadata = deleteMetadata;
function DecorateConstructor(decorators, target) {
    for (var i = decorators.length - 1; i >= 0; --i) {
        var decorator = decorators[i];
        var decorated = decorator(target);
        if (!IsUndefined(decorated) && !IsNull(decorated)) {
            if (!IsConstructor(decorated)) throw new TypeError();
            target = decorated;
        }
    }
    return target;
}
function DecorateProperty(decorators, target, propertyKey, descriptor) {
    for (var i = decorators.length - 1; i >= 0; --i) {
        var decorator = decorators[i];
        var decorated = decorator(target, propertyKey, descriptor);
        if (!IsUndefined(decorated) && !IsNull(decorated)) {
            if (!IsObject(decorated)) throw new TypeError();
            descriptor = decorated;
        }
    }
    return descriptor;
}
// 3.1.1.1 OrdinaryHasMetadata(MetadataKey, O, P)
// https://rbuckton.github.io/reflect-metadata/#ordinaryhasmetadata
function OrdinaryHasMetadata(MetadataKey, O, P) {
    var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
    if (hasOwn) return true;
    var parent = OrdinaryGetPrototypeOf(O);
    if (!IsNull(parent)) return OrdinaryHasMetadata(MetadataKey, parent, P);
    return false;
}
// 3.1.2.1 OrdinaryHasOwnMetadata(MetadataKey, O, P)
// https://rbuckton.github.io/reflect-metadata/#ordinaryhasownmetadata
function OrdinaryHasOwnMetadata(MetadataKey, O, P) {
    var provider = GetMetadataProvider(O, P, /*Create*/ false);
    if (IsUndefined(provider)) return false;
    return ToBoolean(provider.OrdinaryHasOwnMetadata(MetadataKey, O, P));
}
// 3.1.3.1 OrdinaryGetMetadata(MetadataKey, O, P)
// https://rbuckton.github.io/reflect-metadata/#ordinarygetmetadata
function OrdinaryGetMetadata(MetadataKey, O, P) {
    var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
    if (hasOwn) return OrdinaryGetOwnMetadata(MetadataKey, O, P);
    var parent = OrdinaryGetPrototypeOf(O);
    if (!IsNull(parent)) return OrdinaryGetMetadata(MetadataKey, parent, P);
    return undefined;
}
// 3.1.4.1 OrdinaryGetOwnMetadata(MetadataKey, O, P)
// https://rbuckton.github.io/reflect-metadata/#ordinarygetownmetadata
function OrdinaryGetOwnMetadata(MetadataKey, O, P) {
    var provider = GetMetadataProvider(O, P, /*Create*/ false);
    if (IsUndefined(provider)) return;
    return provider.OrdinaryGetOwnMetadata(MetadataKey, O, P);
}
// 3.1.5.1 OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P)
// https://rbuckton.github.io/reflect-metadata/#ordinarydefineownmetadata
function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
    var provider = GetMetadataProvider(O, P, /*Create*/ true);
    provider.OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P);
}
// 3.1.6.1 OrdinaryMetadataKeys(O, P)
// https://rbuckton.github.io/reflect-metadata/#ordinarymetadatakeys
function OrdinaryMetadataKeys(O, P) {
    var ownKeys = OrdinaryOwnMetadataKeys(O, P);
    var parent = OrdinaryGetPrototypeOf(O);
    if (parent === null) return ownKeys;
    var parentKeys = OrdinaryMetadataKeys(parent, P);
    if (parentKeys.length <= 0) return ownKeys;
    if (ownKeys.length <= 0) return parentKeys;
    var set = new _Set();
    var keys = [];
    for (var _i = 0, ownKeys_1 = ownKeys; _i < ownKeys_1.length; _i++) {
        var key = ownKeys_1[_i];
        var hasKey = set.has(key);
        if (!hasKey) {
            set.add(key);
            keys.push(key);
        }
    }
    for (
        var _a = 0, parentKeys_1 = parentKeys;
        _a < parentKeys_1.length;
        _a++
    ) {
        var key = parentKeys_1[_a];
        var hasKey = set.has(key);
        if (!hasKey) {
            set.add(key);
            keys.push(key);
        }
    }
    return keys;
}
// 3.1.7.1 OrdinaryOwnMetadataKeys(O, P)
// https://rbuckton.github.io/reflect-metadata/#ordinaryownmetadatakeys
function OrdinaryOwnMetadataKeys(O, P) {
    var provider = GetMetadataProvider(O, P, /*create*/ false);
    if (!provider) {
        return [];
    }
    return provider.OrdinaryOwnMetadataKeys(O, P);
}
// 6 ECMAScript Data Types and Values
// https://tc39.github.io/ecma262/#sec-ecmascript-data-types-and-values
function Type(x) {
    if (x === null) return 1 /* Null */;
    switch (typeof x) {
        case "undefined":
            return 0 /* Undefined */;
        case "boolean":
            return 2 /* Boolean */;
        case "string":
            return 3 /* String */;
        case "symbol":
            return 4 /* Symbol */;
        case "number":
            return 5 /* Number */;
        case "object":
            return x === null ? 1 /* Null */ : 6 /* Object */;
        default:
            return 6 /* Object */;
    }
}
// 6.1.1 The Undefined Type
// https://tc39.github.io/ecma262/#sec-ecmascript-language-types-undefined-type
function IsUndefined(x) {
    return x === undefined;
}
// 6.1.2 The Null Type
// https://tc39.github.io/ecma262/#sec-ecmascript-language-types-null-type
function IsNull(x) {
    return x === null;
}
// 6.1.5 The Symbol Type
// https://tc39.github.io/ecma262/#sec-ecmascript-language-types-symbol-type
function IsSymbol(x) {
    return typeof x === "symbol";
}
// 6.1.7 The Object Type
// https://tc39.github.io/ecma262/#sec-object-type
function IsObject(x) {
    return typeof x === "object" ? x !== null : typeof x === "function";
}
// 7.1 Type Conversion
// https://tc39.github.io/ecma262/#sec-type-conversion
// 7.1.1 ToPrimitive(input [, PreferredType])
// https://tc39.github.io/ecma262/#sec-toprimitive
function ToPrimitive(input, PreferredType) {
    switch (Type(input)) {
        case 0 /* Undefined */:
            return input;
        case 1 /* Null */:
            return input;
        case 2 /* Boolean */:
            return input;
        case 3 /* String */:
            return input;
        case 4 /* Symbol */:
            return input;
        case 5 /* Number */:
            return input;
    }
    var hint =
        PreferredType === 3 /* String */
            ? "string"
            : PreferredType === 5 /* Number */
            ? "number"
            : "default";
    var exoticToPrim = GetMethod(input, toPrimitiveSymbol);
    if (exoticToPrim !== undefined) {
        var result = exoticToPrim.call(input, hint);
        if (IsObject(result)) throw new TypeError();
        return result;
    }
    return OrdinaryToPrimitive(input, hint === "default" ? "number" : hint);
}
// 7.1.1.1 OrdinaryToPrimitive(O, hint)
// https://tc39.github.io/ecma262/#sec-ordinarytoprimitive
function OrdinaryToPrimitive(O, hint) {
    if (hint === "string") {
        var toString_1 = O.toString;
        if (IsCallable(toString_1)) {
            var result = toString_1.call(O);
            if (!IsObject(result)) return result;
        }
        var valueOf = O.valueOf;
        if (IsCallable(valueOf)) {
            var result = valueOf.call(O);
            if (!IsObject(result)) return result;
        }
    } else {
        var valueOf = O.valueOf;
        if (IsCallable(valueOf)) {
            var result = valueOf.call(O);
            if (!IsObject(result)) return result;
        }
        var toString_2 = O.toString;
        if (IsCallable(toString_2)) {
            var result = toString_2.call(O);
            if (!IsObject(result)) return result;
        }
    }
    throw new TypeError();
}
// 7.1.2 ToBoolean(argument)
// https://tc39.github.io/ecma262/2016/#sec-toboolean
function ToBoolean(argument) {
    return !!argument;
}
// 7.1.12 ToString(argument)
// https://tc39.github.io/ecma262/#sec-tostring
function ToString(argument) {
    return "" + argument;
}
// 7.1.14 ToPropertyKey(argument)
// https://tc39.github.io/ecma262/#sec-topropertykey
function ToPropertyKey(argument) {
    var key = ToPrimitive(argument, 3 /* String */);
    if (IsSymbol(key)) return key;
    return ToString(key);
}
// 7.2 Testing and Comparison Operations
// https://tc39.github.io/ecma262/#sec-testing-and-comparison-operations
// 7.2.2 IsArray(argument)
// https://tc39.github.io/ecma262/#sec-isarray
function IsArray(argument) {
    return Array.isArray
        ? Array.isArray(argument)
        : argument instanceof Object
        ? argument instanceof Array
        : Object.prototype.toString.call(argument) === "[object Array]";
}
// 7.2.3 IsCallable(argument)
// https://tc39.github.io/ecma262/#sec-iscallable
function IsCallable(argument) {
    // NOTE: This is an approximation as we cannot check for [[Call]] internal method.
    return typeof argument === "function";
}
// 7.2.4 IsConstructor(argument)
// https://tc39.github.io/ecma262/#sec-isconstructor
function IsConstructor(argument) {
    // NOTE: This is an approximation as we cannot check for [[Construct]] internal method.
    return typeof argument === "function";
}
// 7.2.7 IsPropertyKey(argument)
// https://tc39.github.io/ecma262/#sec-ispropertykey
function IsPropertyKey(argument) {
    switch (Type(argument)) {
        case 3 /* String */:
            return true;
        case 4 /* Symbol */:
            return true;
        default:
            return false;
    }
}
// 7.3 Operations on Objects
// https://tc39.github.io/ecma262/#sec-operations-on-objects
// 7.3.9 GetMethod(V, P)
// https://tc39.github.io/ecma262/#sec-getmethod
function GetMethod(V, P) {
    var func = V[P];
    if (func === undefined || func === null) return undefined;
    if (!IsCallable(func)) throw new TypeError();
    return func;
}
// 7.4 Operations on Iterator Objects
// https://tc39.github.io/ecma262/#sec-operations-on-iterator-objects
function GetIterator(obj) {
    var method = GetMethod(obj, iteratorSymbol);
    if (!IsCallable(method)) throw new TypeError(); // from Call
    var iterator = method.call(obj);
    if (!IsObject(iterator)) throw new TypeError();
    return iterator;
}
// 7.4.4 IteratorValue(iterResult)
// https://tc39.github.io/ecma262/2016/#sec-iteratorvalue
function IteratorValue(iterResult) {
    return iterResult.value;
}
// 7.4.5 IteratorStep(iterator)
// https://tc39.github.io/ecma262/#sec-iteratorstep
function IteratorStep(iterator) {
    var result = iterator.next();
    return result.done ? false : result;
}
// 7.4.6 IteratorClose(iterator, completion)
// https://tc39.github.io/ecma262/#sec-iteratorclose
function IteratorClose(iterator) {
    var f = iterator["return"];
    if (f) f.call(iterator);
}
// 9.1 Ordinary Object Internal Methods and Internal Slots
// https://tc39.github.io/ecma262/#sec-ordinary-object-internal-methods-and-internal-slots
// 9.1.1.1 OrdinaryGetPrototypeOf(O)
// https://tc39.github.io/ecma262/#sec-ordinarygetprototypeof
function OrdinaryGetPrototypeOf(O) {
    var proto = Object.getPrototypeOf(O);
    if (typeof O !== "function" || O === functionPrototype) return proto;
    // TypeScript doesn't set __proto__ in ES5, as it's non-standard.
    // Try to determine the superclass constructor. Compatible implementations
    // must either set __proto__ on a subclass constructor to the superclass constructor,
    // or ensure each class has a valid `constructor` property on its prototype that
    // points back to the constructor.
    // If this is not the same as Function.[[Prototype]], then this is definately inherited.
    // This is the case when in ES6 or when using __proto__ in a compatible browser.
    if (proto !== functionPrototype) return proto;
    // If the super prototype is Object.prototype, null, or undefined, then we cannot determine the heritage.
    var prototype = O.prototype;
    var prototypeProto = prototype && Object.getPrototypeOf(prototype);
    if (prototypeProto == null || prototypeProto === Object.prototype)
        return proto;
    // If the constructor was not a function, then we cannot determine the heritage.
    var constructor = prototypeProto.constructor;
    if (typeof constructor !== "function") return proto;
    // If we have some kind of self-reference, then we cannot determine the heritage.
    if (constructor === O) return proto;
    // we have a pretty good guess at the heritage.
    return constructor;
}
function fail(e) {
    throw e;
}
// Global metadata registry
// - Allows `import "reflect-metadata"` and `import "reflect-metadata/no-conflict"` to interoperate.
// - Uses isolated metadata if `Reflect` is frozen before the registry can be installed.
/**
 * Creates a registry used to allow multiple `reflect-metadata` providers.
 */
function CreateMetadataRegistry() {
    var fallback;
    if (
        !IsUndefined(registrySymbol) &&
        typeof Reflect !== "undefined" &&
        !(registrySymbol in Reflect) &&
        typeof Reflect.defineMetadata === "function"
    ) {
        // interoperate with older version of `reflect-metadata` that did not support a registry.
        fallback = CreateFallbackProvider(Reflect);
    }
    var first;
    var second;
    var rest;
    var targetProviderMap = new _WeakMap();
    var registry = {
        registerProvider: registerProvider,
        getProvider: getProvider,
        setProvider: setProvider,
    };
    return registry;
    function registerProvider(provider) {
        if (!Object.isExtensible(registry)) {
            throw new Error("Cannot add provider to a frozen registry.");
        }
        switch (true) {
            case fallback === provider:
                break;
            case IsUndefined(first):
                first = provider;
                break;
            case first === provider:
                break;
            case IsUndefined(second):
                second = provider;
                break;
            case second === provider:
                break;
            default:
                if (rest === undefined) rest = new _Set();
                rest.add(provider);
                break;
        }
    }
    function getProviderNoCache(O, P) {
        if (!IsUndefined(first)) {
            if (first.isProviderFor(O, P)) return first;
            if (!IsUndefined(second)) {
                if (second.isProviderFor(O, P)) return first;
                if (!IsUndefined(rest)) {
                    var iterator = GetIterator(rest);
                    while (true) {
                        var next = IteratorStep(iterator);
                        if (!next) {
                            return undefined;
                        }
                        var provider = IteratorValue(next);
                        if (provider.isProviderFor(O, P)) {
                            IteratorClose(iterator);
                            return provider;
                        }
                    }
                }
            }
        }
        if (!IsUndefined(fallback) && fallback.isProviderFor(O, P)) {
            return fallback;
        }
        return undefined;
    }
    function getProvider(O, P) {
        var providerMap = targetProviderMap.get(O);
        var provider;
        if (!IsUndefined(providerMap)) {
            provider = providerMap.get(P);
        }
        if (!IsUndefined(provider)) {
            return provider;
        }
        provider = getProviderNoCache(O, P);
        if (!IsUndefined(provider)) {
            if (IsUndefined(providerMap)) {
                providerMap = new _Map();
                targetProviderMap.set(O, providerMap);
            }
            providerMap.set(P, provider);
        }
        return provider;
    }
    function hasProvider(provider) {
        if (IsUndefined(provider)) throw new TypeError();
        return (
            fallback === provider ||
            first === provider ||
            second === provider ||
            (!IsUndefined(rest) && rest.has(provider))
        );
    }
    function setProvider(O, P, provider) {
        if (!hasProvider(provider)) {
            throw new Error("Metadata provider not registered.");
        }
        var existingProvider = getProvider(O, P);
        if (existingProvider !== provider) {
            if (!IsUndefined(existingProvider)) {
                return false;
            }
            var providerMap = targetProviderMap.get(O);
            if (IsUndefined(providerMap)) {
                providerMap = new _Map();
                targetProviderMap.set(O, providerMap);
            }
            providerMap.set(P, provider);
        }
        return true;
    }
}
/**
 * Gets or creates the shared registry of metadata providers.
 */
function GetOrCreateMetadataRegistry() {
    var metadataRegistry;
    if (
        !IsUndefined(registrySymbol) &&
        IsObject(Reflect) &&
        Object.isExtensible(Reflect)
    ) {
        metadataRegistry = Reflect[registrySymbol];
    }
    if (IsUndefined(metadataRegistry)) {
        metadataRegistry = CreateMetadataRegistry();
    }
    if (
        !IsUndefined(registrySymbol) &&
        IsObject(Reflect) &&
        Object.isExtensible(Reflect)
    ) {
        Object.defineProperty(Reflect, registrySymbol, {
            enumerable: false,
            configurable: false,
            writable: false,
            value: metadataRegistry,
        });
    }
    return metadataRegistry;
}
function CreateMetadataProvider(registry) {
    // [[Metadata]] internal slot
    // https://rbuckton.github.io/reflect-metadata/#ordinary-object-internal-methods-and-internal-slots
    var metadata = new _WeakMap();
    var provider = {
        isProviderFor: function (O, P) {
            var targetMetadata = metadata.get(O);
            if (IsUndefined(targetMetadata)) return false;
            return targetMetadata.has(P);
        },
        OrdinaryDefineOwnMetadata: OrdinaryDefineOwnMetadata,
        OrdinaryHasOwnMetadata: OrdinaryHasOwnMetadata,
        OrdinaryGetOwnMetadata: OrdinaryGetOwnMetadata,
        OrdinaryOwnMetadataKeys: OrdinaryOwnMetadataKeys,
        OrdinaryDeleteMetadata: OrdinaryDeleteMetadata,
    };
    metadataRegistry.registerProvider(provider);
    return provider;
    function GetOrCreateMetadataMap(O, P, Create) {
        var targetMetadata = metadata.get(O);
        var createdTargetMetadata = false;
        if (IsUndefined(targetMetadata)) {
            if (!Create) return undefined;
            targetMetadata = new _Map();
            metadata.set(O, targetMetadata);
            createdTargetMetadata = true;
        }
        var metadataMap = targetMetadata.get(P);
        if (IsUndefined(metadataMap)) {
            if (!Create) return undefined;
            metadataMap = new _Map();
            targetMetadata.set(P, metadataMap);
            if (!registry.setProvider(O, P, provider)) {
                targetMetadata.delete(P);
                if (createdTargetMetadata) {
                    metadata.delete(O);
                }
                throw new Error("Wrong provider for target.");
            }
        }
        return metadataMap;
    }
    // 3.1.2.1 OrdinaryHasOwnMetadata(MetadataKey, O, P)
    // https://rbuckton.github.io/reflect-metadata/#ordinaryhasownmetadata
    function OrdinaryHasOwnMetadata(MetadataKey, O, P) {
        var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
        if (IsUndefined(metadataMap)) return false;
        return ToBoolean(metadataMap.has(MetadataKey));
    }
    // 3.1.4.1 OrdinaryGetOwnMetadata(MetadataKey, O, P)
    // https://rbuckton.github.io/reflect-metadata/#ordinarygetownmetadata
    function OrdinaryGetOwnMetadata(MetadataKey, O, P) {
        var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
        if (IsUndefined(metadataMap)) return undefined;
        return metadataMap.get(MetadataKey);
    }
    // 3.1.5.1 OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P)
    // https://rbuckton.github.io/reflect-metadata/#ordinarydefineownmetadata
    function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
        var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ true);
        metadataMap.set(MetadataKey, MetadataValue);
    }
    // 3.1.7.1 OrdinaryOwnMetadataKeys(O, P)
    // https://rbuckton.github.io/reflect-metadata/#ordinaryownmetadatakeys
    function OrdinaryOwnMetadataKeys(O, P) {
        var keys = [];
        var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
        if (IsUndefined(metadataMap)) return keys;
        var keysObj = metadataMap.keys();
        var iterator = GetIterator(keysObj);
        var k = 0;
        while (true) {
            var next = IteratorStep(iterator);
            if (!next) {
                keys.length = k;
                return keys;
            }
            var nextValue = IteratorValue(next);
            try {
                keys[k] = nextValue;
            } catch (e) {
                try {
                    IteratorClose(iterator);
                } finally {
                    throw e;
                }
            }
            k++;
        }
    }
    function OrdinaryDeleteMetadata(MetadataKey, O, P) {
        var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
        if (IsUndefined(metadataMap)) return false;
        if (!metadataMap.delete(MetadataKey)) return false;
        if (metadataMap.size === 0) {
            var targetMetadata = metadata.get(O);
            if (!IsUndefined(targetMetadata)) {
                targetMetadata.delete(P);
                if (targetMetadata.size === 0) {
                    metadata.delete(targetMetadata);
                }
            }
        }
        return true;
    }
}
function CreateFallbackProvider(reflect) {
    var defineMetadata = reflect.defineMetadata,
        hasOwnMetadata = reflect.hasOwnMetadata,
        getOwnMetadata = reflect.getOwnMetadata,
        getOwnMetadataKeys = reflect.getOwnMetadataKeys,
        deleteMetadata = reflect.deleteMetadata;
    var metadataOwner = new _WeakMap();
    var provider = {
        isProviderFor: function (O, P) {
            var metadataPropertySet = metadataOwner.get(O);
            if (
                !IsUndefined(metadataPropertySet) &&
                metadataPropertySet.has(P)
            ) {
                return true;
            }
            if (getOwnMetadataKeys(O, P).length) {
                if (IsUndefined(metadataPropertySet)) {
                    metadataPropertySet = new _Set();
                    metadataOwner.set(O, metadataPropertySet);
                }
                metadataPropertySet.add(P);
                return true;
            }
            return false;
        },
        OrdinaryDefineOwnMetadata: defineMetadata,
        OrdinaryHasOwnMetadata: hasOwnMetadata,
        OrdinaryGetOwnMetadata: getOwnMetadata,
        OrdinaryOwnMetadataKeys: getOwnMetadataKeys,
        OrdinaryDeleteMetadata: deleteMetadata,
    };
    return provider;
}
/**
 * Gets the metadata provider for an object. If the object has no metadata provider and this is for a create operation,
 * then this module's metadata provider is assigned to the object.
 */
function GetMetadataProvider(O, P, Create) {
    var registeredProvider = metadataRegistry.getProvider(O, P);
    if (!IsUndefined(registeredProvider)) {
        return registeredProvider;
    }
    if (Create) {
        if (metadataRegistry.setProvider(O, P, metadataProvider)) {
            return metadataProvider;
        }
        throw new Error("Illegal state.");
    }
    return undefined;
}
// https://github.com/KhaledElAnsari/String.prototype.padStart
String.prototype.padStart = String.prototype.padStart ? String.prototype.padStart : function (targetLength, padString) {
    targetLength = Math.floor(targetLength) || 0;
    if (targetLength < this.length) return String(this);

    padString = padString ? String(padString) : " ";

    var pad = "";
    var len = targetLength - this.length;
    var i = 0;
    while (pad.length < len) {
        if (!padString[i]) {
            i = 0;
        }
        pad += padString[i];
        i++;
    }

    return pad + String(this).slice(0);
};

// https://github.com/KhaledElAnsari/String.prototype.padEnd
String.prototype.padEnd = String.prototype.padEnd ? String.prototype.padEnd : function (targetLength, padString) {
    targetLength = Math.floor(targetLength) || 0;
    if (targetLength < this.length) return String(this);

    padString = padString ? String(padString) : " ";

    var pad = "";
    var len = targetLength - this.length;
    var i = 0;
    while (pad.length < len) {
        if (!padString[i]) {
            i = 0;
        }
        pad += padString[i];
        i++;
    }

    return String(this).slice(0) + pad;
};
var $toString = Object.prototype.toString;
var $indexOf = String.prototype.indexOf;
var $lastIndexOf = String.prototype.lastIndexOf;

if (!String.prototype.startsWith) {
    // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-string.prototype.startswith
    function startsWith(search) {
        /*! http://mths.be/startswith v0.1.0 by @mathias */
        var string = String(this);
        if (this == null || $toString.call(search) == '[object RegExp]') {
            throw TypeError();
        }
        var stringLength = string.length;
        var searchString = String(search);
        var searchLength = searchString.length;
        var position = arguments.length > 1 ? arguments[1] : undefined;
        // `ToInteger`
        var pos = position ? Number(position) : 0;
        if (isNaN(pos)) {
            pos = 0;
        }
        var start = Math.min(Math.max(pos, 0), stringLength);
        return $indexOf.call(string, searchString, pos) == start;
    }
    String.prototype.startsWith = startsWith;
}

if (!String.prototype.endsWith) {
    // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-string.prototype.endswith
    function endsWith(search) {
        /*! http://mths.be/endswith v0.1.0 by @mathias */
        var string = String(this);
        if (this == null || $toString.call(search) == '[object RegExp]') {
            throw TypeError();
        }
        var stringLength = string.length;
        var searchString = String(search);
        var searchLength = searchString.length;
        var pos = stringLength;
        if (arguments.length > 1) {
            var position = arguments[1];
            if (position !== undefined) {
                // `ToInteger`
                pos = position ? Number(position) : 0;
                if (isNaN(pos)) {
                    pos = 0;
                }
            }
        }
        var end = Math.min(Math.max(pos, 0), stringLength);
        var start = end - searchLength;
        if (start < 0) {
            return false;
        }
        return $lastIndexOf.call(string, searchString, start) == start;
    }
    String.prototype.endsWith = endsWith;
}

// https://github.com/alfaslash/string-includes-polyfill/blob/master/string-includes-polyfill.js
if (!String.prototype.includes) {
    String.prototype.includes = function (search, start) {
        'use strict';
        if (typeof start !== 'number') {
            start = 0;
        }

        if (start + search.length > this.length) {
            return false;
        } else {
            return this.indexOf(search, start) !== -1;
        }
    };
}
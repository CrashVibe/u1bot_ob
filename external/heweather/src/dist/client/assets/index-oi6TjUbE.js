(function () {
  let e = document.createElement(`link`).relList;
  if (e && e.supports && e.supports(`modulepreload`)) return;
  for (let e of document.querySelectorAll(`link[rel="modulepreload"]`)) n(e);
  new MutationObserver((e) => {
    for (let t of e)
      if (t.type === `childList`) for (let e of t.addedNodes) e.tagName === `LINK` && e.rel === `modulepreload` && n(e);
  }).observe(document, { childList: !0, subtree: !0 });
  function t(e) {
    let t = {};
    return (
      e.integrity && (t.integrity = e.integrity),
      e.referrerPolicy && (t.referrerPolicy = e.referrerPolicy),
      e.crossOrigin === `use-credentials`
        ? (t.credentials = `include`)
        : e.crossOrigin === `anonymous`
          ? (t.credentials = `omit`)
          : (t.credentials = `same-origin`),
      t
    );
  }
  function n(e) {
    if (e.ep) return;
    e.ep = !0;
    let n = t(e);
    fetch(e.href, n);
  }
})();
function e(e) {
  let t = Object.create(null);
  for (let n of e.split(`,`)) t[n] = 1;
  return (e) => e in t;
}
var t = {},
  n = [],
  r = () => {},
  i = () => !1,
  a = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && (e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97),
  o = (e) => e.startsWith(`onUpdate:`),
  s = Object.assign,
  c = (e, t) => {
    let n = e.indexOf(t);
    n > -1 && e.splice(n, 1);
  },
  l = Object.prototype.hasOwnProperty,
  u = (e, t) => l.call(e, t),
  d = Array.isArray,
  f = (e) => b(e) === `[object Map]`,
  p = (e) => b(e) === `[object Set]`,
  m = (e) => typeof e == `function`,
  h = (e) => typeof e == `string`,
  g = (e) => typeof e == `symbol`,
  _ = (e) => typeof e == `object` && !!e,
  v = (e) => (_(e) || m(e)) && m(e.then) && m(e.catch),
  y = Object.prototype.toString,
  b = (e) => y.call(e),
  x = (e) => b(e).slice(8, -1),
  S = (e) => b(e) === `[object Object]`,
  C = (e) => h(e) && e !== `NaN` && e[0] !== `-` && `` + parseInt(e, 10) === e,
  w = e(
    `,key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted`
  ),
  ee = (e) => {
    let t = Object.create(null);
    return (n) => t[n] || (t[n] = e(n));
  },
  te = /-\w/g,
  T = ee((e) => e.replace(te, (e) => e.slice(1).toUpperCase())),
  ne = /\B([A-Z])/g,
  E = ee((e) => e.replace(ne, `-$1`).toLowerCase()),
  re = ee((e) => e.charAt(0).toUpperCase() + e.slice(1)),
  ie = ee((e) => (e ? `on${re(e)}` : ``)),
  D = (e, t) => !Object.is(e, t),
  ae = (e, ...t) => {
    for (let n = 0; n < e.length; n++) e[n](...t);
  },
  oe = (e, t, n, r = !1) => {
    Object.defineProperty(e, t, { configurable: !0, enumerable: !1, writable: r, value: n });
  },
  O = (e) => {
    let t = parseFloat(e);
    return isNaN(t) ? e : t;
  },
  se,
  ce = () =>
    (se ||=
      typeof globalThis < `u`
        ? globalThis
        : typeof self < `u`
          ? self
          : typeof window < `u`
            ? window
            : typeof global < `u`
              ? global
              : {});
function k(e) {
  if (d(e)) {
    let t = {};
    for (let n = 0; n < e.length; n++) {
      let r = e[n],
        i = h(r) ? fe(r) : k(r);
      if (i) for (let e in i) t[e] = i[e];
    }
    return t;
  } else if (h(e) || _(e)) return e;
}
var le = /;(?![^(]*\))/g,
  ue = /:([^]+)/,
  de = /\/\*[^]*?\*\//g;
function fe(e) {
  let t = {};
  return (
    e
      .replace(de, ``)
      .split(le)
      .forEach((e) => {
        if (e) {
          let n = e.split(ue);
          n.length > 1 && (t[n[0].trim()] = n[1].trim());
        }
      }),
    t
  );
}
function A(e) {
  let t = ``;
  if (h(e)) t = e;
  else if (d(e))
    for (let n = 0; n < e.length; n++) {
      let r = A(e[n]);
      r && (t += r + ` `);
    }
  else if (_(e)) for (let n in e) e[n] && (t += n + ` `);
  return t.trim();
}
var pe = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`,
  me = e(pe);
pe + ``;
function he(e) {
  return !!e || e === ``;
}
var ge = (e) => !!(e && e.__v_isRef === !0),
  j = (e) =>
    h(e)
      ? e
      : e == null
        ? ``
        : d(e) || (_(e) && (e.toString === y || !m(e.toString)))
          ? ge(e)
            ? j(e.value)
            : JSON.stringify(e, _e, 2)
          : String(e),
  _e = (e, t) =>
    ge(t)
      ? _e(e, t.value)
      : f(t)
        ? { [`Map(${t.size})`]: [...t.entries()].reduce((e, [t, n], r) => ((e[ve(t, r) + ` =>`] = n), e), {}) }
        : p(t)
          ? { [`Set(${t.size})`]: [...t.values()].map((e) => ve(e)) }
          : g(t)
            ? ve(t)
            : _(t) && !d(t) && !S(t)
              ? String(t)
              : t,
  ve = (e, t = ``) => (g(e) ? `Symbol(${e.description ?? t})` : e),
  M,
  ye = class {
    constructor(e = !1) {
      ((this.detached = e),
        (this._active = !0),
        (this._on = 0),
        (this.effects = []),
        (this.cleanups = []),
        (this._isPaused = !1),
        (this.parent = M),
        !e && M && (this.index = (M.scopes ||= []).push(this) - 1));
    }
    get active() {
      return this._active;
    }
    pause() {
      if (this._active) {
        this._isPaused = !0;
        let e, t;
        if (this.scopes) for (e = 0, t = this.scopes.length; e < t; e++) this.scopes[e].pause();
        for (e = 0, t = this.effects.length; e < t; e++) this.effects[e].pause();
      }
    }
    resume() {
      if (this._active && this._isPaused) {
        this._isPaused = !1;
        let e, t;
        if (this.scopes) for (e = 0, t = this.scopes.length; e < t; e++) this.scopes[e].resume();
        for (e = 0, t = this.effects.length; e < t; e++) this.effects[e].resume();
      }
    }
    run(e) {
      if (this._active) {
        let t = M;
        try {
          return ((M = this), e());
        } finally {
          M = t;
        }
      }
    }
    on() {
      ++this._on === 1 && ((this.prevScope = M), (M = this));
    }
    off() {
      this._on > 0 && --this._on === 0 && ((M = this.prevScope), (this.prevScope = void 0));
    }
    stop(e) {
      if (this._active) {
        this._active = !1;
        let t, n;
        for (t = 0, n = this.effects.length; t < n; t++) this.effects[t].stop();
        for (this.effects.length = 0, t = 0, n = this.cleanups.length; t < n; t++) this.cleanups[t]();
        if (((this.cleanups.length = 0), this.scopes)) {
          for (t = 0, n = this.scopes.length; t < n; t++) this.scopes[t].stop(!0);
          this.scopes.length = 0;
        }
        if (!this.detached && this.parent && !e) {
          let e = this.parent.scopes.pop();
          e && e !== this && ((this.parent.scopes[this.index] = e), (e.index = this.index));
        }
        this.parent = void 0;
      }
    }
  };
function be() {
  return M;
}
var N,
  xe = new WeakSet(),
  Se = class {
    constructor(e) {
      ((this.fn = e),
        (this.deps = void 0),
        (this.depsTail = void 0),
        (this.flags = 5),
        (this.next = void 0),
        (this.cleanup = void 0),
        (this.scheduler = void 0),
        M && M.active && M.effects.push(this));
    }
    pause() {
      this.flags |= 64;
    }
    resume() {
      this.flags & 64 && ((this.flags &= -65), xe.has(this) && (xe.delete(this), this.trigger()));
    }
    notify() {
      (this.flags & 2 && !(this.flags & 32)) || this.flags & 8 || Ee(this);
    }
    run() {
      if (!(this.flags & 1)) return this.fn();
      ((this.flags |= 2), Re(this), ke(this));
      let e = N,
        t = P;
      ((N = this), (P = !0));
      try {
        return this.fn();
      } finally {
        (Ae(this), (N = e), (P = t), (this.flags &= -3));
      }
    }
    stop() {
      if (this.flags & 1) {
        for (let e = this.deps; e; e = e.nextDep) Ne(e);
        ((this.deps = this.depsTail = void 0), Re(this), this.onStop && this.onStop(), (this.flags &= -2));
      }
    }
    trigger() {
      this.flags & 64 ? xe.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
    }
    runIfDirty() {
      je(this) && this.run();
    }
    get dirty() {
      return je(this);
    }
  },
  Ce = 0,
  we,
  Te;
function Ee(e, t = !1) {
  if (((e.flags |= 8), t)) {
    ((e.next = Te), (Te = e));
    return;
  }
  ((e.next = we), (we = e));
}
function De() {
  Ce++;
}
function Oe() {
  if (--Ce > 0) return;
  if (Te) {
    let e = Te;
    for (Te = void 0; e; ) {
      let t = e.next;
      ((e.next = void 0), (e.flags &= -9), (e = t));
    }
  }
  let e;
  for (; we; ) {
    let t = we;
    for (we = void 0; t; ) {
      let n = t.next;
      if (((t.next = void 0), (t.flags &= -9), t.flags & 1))
        try {
          t.trigger();
        } catch (t) {
          e ||= t;
        }
      t = n;
    }
  }
  if (e) throw e;
}
function ke(e) {
  for (let t = e.deps; t; t = t.nextDep)
    ((t.version = -1), (t.prevActiveLink = t.dep.activeLink), (t.dep.activeLink = t));
}
function Ae(e) {
  let t,
    n = e.depsTail,
    r = n;
  for (; r; ) {
    let e = r.prevDep;
    (r.version === -1 ? (r === n && (n = e), Ne(r), Pe(r)) : (t = r),
      (r.dep.activeLink = r.prevActiveLink),
      (r.prevActiveLink = void 0),
      (r = e));
  }
  ((e.deps = t), (e.depsTail = n));
}
function je(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (t.dep.version !== t.version || (t.dep.computed && (Me(t.dep.computed) || t.dep.version !== t.version)))
      return !0;
  return !!e._dirty;
}
function Me(e) {
  if (
    (e.flags & 4 && !(e.flags & 16)) ||
    ((e.flags &= -17), e.globalVersion === ze) ||
    ((e.globalVersion = ze), !e.isSSR && e.flags & 128 && ((!e.deps && !e._dirty) || !je(e)))
  )
    return;
  e.flags |= 2;
  let t = e.dep,
    n = N,
    r = P;
  ((N = e), (P = !0));
  try {
    ke(e);
    let n = e.fn(e._value);
    (t.version === 0 || D(n, e._value)) && ((e.flags |= 128), (e._value = n), t.version++);
  } catch (e) {
    throw (t.version++, e);
  } finally {
    ((N = n), (P = r), Ae(e), (e.flags &= -3));
  }
}
function Ne(e, t = !1) {
  let { dep: n, prevSub: r, nextSub: i } = e;
  if (
    (r && ((r.nextSub = i), (e.prevSub = void 0)),
    i && ((i.prevSub = r), (e.nextSub = void 0)),
    n.subs === e && ((n.subs = r), !r && n.computed))
  ) {
    n.computed.flags &= -5;
    for (let e = n.computed.deps; e; e = e.nextDep) Ne(e, !0);
  }
  !t && !--n.sc && n.map && n.map.delete(n.key);
}
function Pe(e) {
  let { prevDep: t, nextDep: n } = e;
  (t && ((t.nextDep = n), (e.prevDep = void 0)), n && ((n.prevDep = t), (e.nextDep = void 0)));
}
var P = !0,
  Fe = [];
function Ie() {
  (Fe.push(P), (P = !1));
}
function Le() {
  let e = Fe.pop();
  P = e === void 0 ? !0 : e;
}
function Re(e) {
  let { cleanup: t } = e;
  if (((e.cleanup = void 0), t)) {
    let e = N;
    N = void 0;
    try {
      t();
    } finally {
      N = e;
    }
  }
}
var ze = 0,
  Be = class {
    constructor(e, t) {
      ((this.sub = e),
        (this.dep = t),
        (this.version = t.version),
        (this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0));
    }
  },
  Ve = class {
    constructor(e) {
      ((this.computed = e),
        (this.version = 0),
        (this.activeLink = void 0),
        (this.subs = void 0),
        (this.map = void 0),
        (this.key = void 0),
        (this.sc = 0),
        (this.__v_skip = !0));
    }
    track(e) {
      if (!N || !P || N === this.computed) return;
      let t = this.activeLink;
      if (t === void 0 || t.sub !== N)
        ((t = this.activeLink = new Be(N, this)),
          N.deps ? ((t.prevDep = N.depsTail), (N.depsTail.nextDep = t), (N.depsTail = t)) : (N.deps = N.depsTail = t),
          He(t));
      else if (t.version === -1 && ((t.version = this.version), t.nextDep)) {
        let e = t.nextDep;
        ((e.prevDep = t.prevDep),
          t.prevDep && (t.prevDep.nextDep = e),
          (t.prevDep = N.depsTail),
          (t.nextDep = void 0),
          (N.depsTail.nextDep = t),
          (N.depsTail = t),
          N.deps === t && (N.deps = e));
      }
      return t;
    }
    trigger(e) {
      (this.version++, ze++, this.notify(e));
    }
    notify(e) {
      De();
      try {
        for (let e = this.subs; e; e = e.prevSub) e.sub.notify() && e.sub.dep.notify();
      } finally {
        Oe();
      }
    }
  };
function He(e) {
  if ((e.dep.sc++, e.sub.flags & 4)) {
    let t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let e = t.deps; e; e = e.nextDep) He(e);
    }
    let n = e.dep.subs;
    (n !== e && ((e.prevSub = n), n && (n.nextSub = e)), (e.dep.subs = e));
  }
}
var Ue = new WeakMap(),
  We = Symbol(``),
  Ge = Symbol(``),
  Ke = Symbol(``);
function F(e, t, n) {
  if (P && N) {
    let t = Ue.get(e);
    t || Ue.set(e, (t = new Map()));
    let r = t.get(n);
    (r || (t.set(n, (r = new Ve())), (r.map = t), (r.key = n)), r.track());
  }
}
function qe(e, t, n, r, i, a) {
  let o = Ue.get(e);
  if (!o) {
    ze++;
    return;
  }
  let s = (e) => {
    e && e.trigger();
  };
  if ((De(), t === `clear`)) o.forEach(s);
  else {
    let i = d(e),
      a = i && C(n);
    if (i && n === `length`) {
      let e = Number(r);
      o.forEach((t, n) => {
        (n === `length` || n === Ke || (!g(n) && n >= e)) && s(t);
      });
    } else
      switch (((n !== void 0 || o.has(void 0)) && s(o.get(n)), a && s(o.get(Ke)), t)) {
        case `add`:
          i ? a && s(o.get(`length`)) : (s(o.get(We)), f(e) && s(o.get(Ge)));
          break;
        case `delete`:
          i || (s(o.get(We)), f(e) && s(o.get(Ge)));
          break;
        case `set`:
          f(e) && s(o.get(We));
          break;
      }
  }
  Oe();
}
function Je(e) {
  let t = L(e);
  return t === e ? t : (F(t, `iterate`, Ke), I(e) ? t : t.map(It));
}
function Ye(e) {
  return (F((e = L(e)), `iterate`, Ke), e);
}
function Xe(e, t) {
  return Nt(e) ? Lt(Mt(e) ? It(t) : t) : It(t);
}
var Ze = {
  __proto__: null,
  [Symbol.iterator]() {
    return Qe(this, Symbol.iterator, (e) => Xe(this, e));
  },
  concat(...e) {
    return Je(this).concat(...e.map((e) => (d(e) ? Je(e) : e)));
  },
  entries() {
    return Qe(this, `entries`, (e) => ((e[1] = Xe(this, e[1])), e));
  },
  every(e, t) {
    return et(this, `every`, e, t, void 0, arguments);
  },
  filter(e, t) {
    return et(this, `filter`, e, t, (e) => e.map((e) => Xe(this, e)), arguments);
  },
  find(e, t) {
    return et(this, `find`, e, t, (e) => Xe(this, e), arguments);
  },
  findIndex(e, t) {
    return et(this, `findIndex`, e, t, void 0, arguments);
  },
  findLast(e, t) {
    return et(this, `findLast`, e, t, (e) => Xe(this, e), arguments);
  },
  findLastIndex(e, t) {
    return et(this, `findLastIndex`, e, t, void 0, arguments);
  },
  forEach(e, t) {
    return et(this, `forEach`, e, t, void 0, arguments);
  },
  includes(...e) {
    return nt(this, `includes`, e);
  },
  indexOf(...e) {
    return nt(this, `indexOf`, e);
  },
  join(e) {
    return Je(this).join(e);
  },
  lastIndexOf(...e) {
    return nt(this, `lastIndexOf`, e);
  },
  map(e, t) {
    return et(this, `map`, e, t, void 0, arguments);
  },
  pop() {
    return rt(this, `pop`);
  },
  push(...e) {
    return rt(this, `push`, e);
  },
  reduce(e, ...t) {
    return tt(this, `reduce`, e, t);
  },
  reduceRight(e, ...t) {
    return tt(this, `reduceRight`, e, t);
  },
  shift() {
    return rt(this, `shift`);
  },
  some(e, t) {
    return et(this, `some`, e, t, void 0, arguments);
  },
  splice(...e) {
    return rt(this, `splice`, e);
  },
  toReversed() {
    return Je(this).toReversed();
  },
  toSorted(e) {
    return Je(this).toSorted(e);
  },
  toSpliced(...e) {
    return Je(this).toSpliced(...e);
  },
  unshift(...e) {
    return rt(this, `unshift`, e);
  },
  values() {
    return Qe(this, `values`, (e) => Xe(this, e));
  }
};
function Qe(e, t, n) {
  let r = Ye(e),
    i = r[t]();
  return (
    r !== e &&
      !I(e) &&
      ((i._next = i.next),
      (i.next = () => {
        let e = i._next();
        return (e.done || (e.value = n(e.value)), e);
      })),
    i
  );
}
var $e = Array.prototype;
function et(e, t, n, r, i, a) {
  let o = Ye(e),
    s = o !== e && !I(e),
    c = o[t];
  if (c !== $e[t]) {
    let t = c.apply(e, a);
    return s ? It(t) : t;
  }
  let l = n;
  o !== e &&
    (s
      ? (l = function (t, r) {
          return n.call(this, Xe(e, t), r, e);
        })
      : n.length > 2 &&
        (l = function (t, r) {
          return n.call(this, t, r, e);
        }));
  let u = c.call(o, l, r);
  return s && i ? i(u) : u;
}
function tt(e, t, n, r) {
  let i = Ye(e),
    a = n;
  return (
    i !== e &&
      (I(e)
        ? n.length > 3 &&
          (a = function (t, r, i) {
            return n.call(this, t, r, i, e);
          })
        : (a = function (t, r, i) {
            return n.call(this, t, Xe(e, r), i, e);
          })),
    i[t](a, ...r)
  );
}
function nt(e, t, n) {
  let r = L(e);
  F(r, `iterate`, Ke);
  let i = r[t](...n);
  return (i === -1 || i === !1) && Pt(n[0]) ? ((n[0] = L(n[0])), r[t](...n)) : i;
}
function rt(e, t, n = []) {
  (Ie(), De());
  let r = L(e)[t].apply(e, n);
  return (Oe(), Le(), r);
}
var it = e(`__proto__,__v_isRef,__isVue`),
  at = new Set(
    Object.getOwnPropertyNames(Symbol)
      .filter((e) => e !== `arguments` && e !== `caller`)
      .map((e) => Symbol[e])
      .filter(g)
  );
function ot(e) {
  g(e) || (e = String(e));
  let t = L(this);
  return (F(t, `has`, e), t.hasOwnProperty(e));
}
var st = class {
    constructor(e = !1, t = !1) {
      ((this._isReadonly = e), (this._isShallow = t));
    }
    get(e, t, n) {
      if (t === `__v_skip`) return e.__v_skip;
      let r = this._isReadonly,
        i = this._isShallow;
      if (t === `__v_isReactive`) return !r;
      if (t === `__v_isReadonly`) return r;
      if (t === `__v_isShallow`) return i;
      if (t === `__v_raw`)
        return n === (r ? (i ? Tt : wt) : i ? Ct : St).get(e) || Object.getPrototypeOf(e) === Object.getPrototypeOf(n)
          ? e
          : void 0;
      let a = d(e);
      if (!r) {
        let e;
        if (a && (e = Ze[t])) return e;
        if (t === `hasOwnProperty`) return ot;
      }
      let o = Reflect.get(e, t, R(e) ? e : n);
      if ((g(t) ? at.has(t) : it(t)) || (r || F(e, `get`, t), i)) return o;
      if (R(o)) {
        let e = a && C(t) ? o : o.value;
        return r && _(e) ? At(e) : e;
      }
      return _(o) ? (r ? At(o) : Ot(o)) : o;
    }
  },
  ct = class extends st {
    constructor(e = !1) {
      super(!1, e);
    }
    set(e, t, n, r) {
      let i = e[t],
        a = d(e) && C(t);
      if (!this._isShallow) {
        let e = Nt(i);
        if ((!I(n) && !Nt(n) && ((i = L(i)), (n = L(n))), !a && R(i) && !R(n))) return (e || (i.value = n), !0);
      }
      let o = a ? Number(t) < e.length : u(e, t),
        s = Reflect.set(e, t, n, R(e) ? e : r);
      return (e === L(r) && (o ? D(n, i) && qe(e, `set`, t, n, i) : qe(e, `add`, t, n)), s);
    }
    deleteProperty(e, t) {
      let n = u(e, t),
        r = e[t],
        i = Reflect.deleteProperty(e, t);
      return (i && n && qe(e, `delete`, t, void 0, r), i);
    }
    has(e, t) {
      let n = Reflect.has(e, t);
      return ((!g(t) || !at.has(t)) && F(e, `has`, t), n);
    }
    ownKeys(e) {
      return (F(e, `iterate`, d(e) ? `length` : We), Reflect.ownKeys(e));
    }
  },
  lt = class extends st {
    constructor(e = !1) {
      super(!0, e);
    }
    set(e, t) {
      return !0;
    }
    deleteProperty(e, t) {
      return !0;
    }
  },
  ut = new ct(),
  dt = new lt(),
  ft = new ct(!0),
  pt = (e) => e,
  mt = (e) => Reflect.getPrototypeOf(e);
function ht(e, t, n) {
  return function (...r) {
    let i = this.__v_raw,
      a = L(i),
      o = f(a),
      c = e === `entries` || (e === Symbol.iterator && o),
      l = e === `keys` && o,
      u = i[e](...r),
      d = n ? pt : t ? Lt : It;
    return (
      !t && F(a, `iterate`, l ? Ge : We),
      s(Object.create(u), {
        next() {
          let { value: e, done: t } = u.next();
          return t ? { value: e, done: t } : { value: c ? [d(e[0]), d(e[1])] : d(e), done: t };
        }
      })
    );
  };
}
function gt(e) {
  return function (...t) {
    return e === `delete` ? !1 : e === `clear` ? void 0 : this;
  };
}
function _t(e, t) {
  let n = {
    get(n) {
      let r = this.__v_raw,
        i = L(r),
        a = L(n);
      e || (D(n, a) && F(i, `get`, n), F(i, `get`, a));
      let { has: o } = mt(i),
        s = t ? pt : e ? Lt : It;
      if (o.call(i, n)) return s(r.get(n));
      if (o.call(i, a)) return s(r.get(a));
      r !== i && r.get(n);
    },
    get size() {
      let t = this.__v_raw;
      return (!e && F(L(t), `iterate`, We), t.size);
    },
    has(t) {
      let n = this.__v_raw,
        r = L(n),
        i = L(t);
      return (e || (D(t, i) && F(r, `has`, t), F(r, `has`, i)), t === i ? n.has(t) : n.has(t) || n.has(i));
    },
    forEach(n, r) {
      let i = this,
        a = i.__v_raw,
        o = L(a),
        s = t ? pt : e ? Lt : It;
      return (!e && F(o, `iterate`, We), a.forEach((e, t) => n.call(r, s(e), s(t), i)));
    }
  };
  return (
    s(
      n,
      e
        ? { add: gt(`add`), set: gt(`set`), delete: gt(`delete`), clear: gt(`clear`) }
        : {
            add(e) {
              !t && !I(e) && !Nt(e) && (e = L(e));
              let n = L(this);
              return (mt(n).has.call(n, e) || (n.add(e), qe(n, `add`, e, e)), this);
            },
            set(e, n) {
              !t && !I(n) && !Nt(n) && (n = L(n));
              let r = L(this),
                { has: i, get: a } = mt(r),
                o = i.call(r, e);
              o ||= ((e = L(e)), i.call(r, e));
              let s = a.call(r, e);
              return (r.set(e, n), o ? D(n, s) && qe(r, `set`, e, n, s) : qe(r, `add`, e, n), this);
            },
            delete(e) {
              let t = L(this),
                { has: n, get: r } = mt(t),
                i = n.call(t, e);
              i ||= ((e = L(e)), n.call(t, e));
              let a = r ? r.call(t, e) : void 0,
                o = t.delete(e);
              return (i && qe(t, `delete`, e, void 0, a), o);
            },
            clear() {
              let e = L(this),
                t = e.size !== 0,
                n = e.clear();
              return (t && qe(e, `clear`, void 0, void 0, void 0), n);
            }
          }
    ),
    [`keys`, `values`, `entries`, Symbol.iterator].forEach((r) => {
      n[r] = ht(r, e, t);
    }),
    n
  );
}
function vt(e, t) {
  let n = _t(e, t);
  return (t, r, i) =>
    r === `__v_isReactive`
      ? !e
      : r === `__v_isReadonly`
        ? e
        : r === `__v_raw`
          ? t
          : Reflect.get(u(n, r) && r in t ? n : t, r, i);
}
var yt = { get: vt(!1, !1) },
  bt = { get: vt(!1, !0) },
  xt = { get: vt(!0, !1) },
  St = new WeakMap(),
  Ct = new WeakMap(),
  wt = new WeakMap(),
  Tt = new WeakMap();
function Et(e) {
  switch (e) {
    case `Object`:
    case `Array`:
      return 1;
    case `Map`:
    case `Set`:
    case `WeakMap`:
    case `WeakSet`:
      return 2;
    default:
      return 0;
  }
}
function Dt(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : Et(x(e));
}
function Ot(e) {
  return Nt(e) ? e : jt(e, !1, ut, yt, St);
}
function kt(e) {
  return jt(e, !1, ft, bt, Ct);
}
function At(e) {
  return jt(e, !0, dt, xt, wt);
}
function jt(e, t, n, r, i) {
  if (!_(e) || (e.__v_raw && !(t && e.__v_isReactive))) return e;
  let a = Dt(e);
  if (a === 0) return e;
  let o = i.get(e);
  if (o) return o;
  let s = new Proxy(e, a === 2 ? r : n);
  return (i.set(e, s), s);
}
function Mt(e) {
  return Nt(e) ? Mt(e.__v_raw) : !!(e && e.__v_isReactive);
}
function Nt(e) {
  return !!(e && e.__v_isReadonly);
}
function I(e) {
  return !!(e && e.__v_isShallow);
}
function Pt(e) {
  return e ? !!e.__v_raw : !1;
}
function L(e) {
  let t = e && e.__v_raw;
  return t ? L(t) : e;
}
function Ft(e) {
  return (!u(e, `__v_skip`) && Object.isExtensible(e) && oe(e, `__v_skip`, !0), e);
}
var It = (e) => (_(e) ? Ot(e) : e),
  Lt = (e) => (_(e) ? At(e) : e);
function R(e) {
  return e ? e.__v_isRef === !0 : !1;
}
function Rt(e) {
  return R(e) ? e.value : e;
}
var zt = {
  get: (e, t, n) => (t === `__v_raw` ? e : Rt(Reflect.get(e, t, n))),
  set: (e, t, n, r) => {
    let i = e[t];
    return R(i) && !R(n) ? ((i.value = n), !0) : Reflect.set(e, t, n, r);
  }
};
function Bt(e) {
  return Mt(e) ? e : new Proxy(e, zt);
}
var Vt = class {
  constructor(e, t, n) {
    ((this.fn = e),
      (this.setter = t),
      (this._value = void 0),
      (this.dep = new Ve(this)),
      (this.__v_isRef = !0),
      (this.deps = void 0),
      (this.depsTail = void 0),
      (this.flags = 16),
      (this.globalVersion = ze - 1),
      (this.next = void 0),
      (this.effect = this),
      (this.__v_isReadonly = !t),
      (this.isSSR = n));
  }
  notify() {
    if (((this.flags |= 16), !(this.flags & 8) && N !== this)) return (Ee(this, !0), !0);
  }
  get value() {
    let e = this.dep.track();
    return (Me(this), e && (e.version = this.dep.version), this._value);
  }
  set value(e) {
    this.setter && this.setter(e);
  }
};
function Ht(e, t, n = !1) {
  let r, i;
  return (m(e) ? (r = e) : ((r = e.get), (i = e.set)), new Vt(r, i, n));
}
var Ut = {},
  Wt = new WeakMap(),
  Gt = void 0;
function Kt(e, t = !1, n = Gt) {
  if (n) {
    let t = Wt.get(n);
    (t || Wt.set(n, (t = [])), t.push(e));
  }
}
function qt(e, n, i = t) {
  let { immediate: a, deep: o, once: s, scheduler: l, augmentJob: u, call: f } = i,
    p = (e) => (o ? e : I(e) || o === !1 || o === 0 ? Jt(e, 1) : Jt(e)),
    h,
    g,
    _,
    v,
    y = !1,
    b = !1;
  if (
    (R(e)
      ? ((g = () => e.value), (y = I(e)))
      : Mt(e)
        ? ((g = () => p(e)), (y = !0))
        : d(e)
          ? ((b = !0),
            (y = e.some((e) => Mt(e) || I(e))),
            (g = () =>
              e.map((e) => {
                if (R(e)) return e.value;
                if (Mt(e)) return p(e);
                if (m(e)) return f ? f(e, 2) : e();
              })))
          : (g = m(e)
              ? n
                ? f
                  ? () => f(e, 2)
                  : e
                : () => {
                    if (_) {
                      Ie();
                      try {
                        _();
                      } finally {
                        Le();
                      }
                    }
                    let t = Gt;
                    Gt = h;
                    try {
                      return f ? f(e, 3, [v]) : e(v);
                    } finally {
                      Gt = t;
                    }
                  }
              : r),
    n && o)
  ) {
    let e = g,
      t = o === !0 ? 1 / 0 : o;
    g = () => Jt(e(), t);
  }
  let x = be(),
    S = () => {
      (h.stop(), x && x.active && c(x.effects, h));
    };
  if (s && n) {
    let e = n;
    n = (...t) => {
      (e(...t), S());
    };
  }
  let C = b ? Array(e.length).fill(Ut) : Ut,
    w = (e) => {
      if (!(!(h.flags & 1) || (!h.dirty && !e)))
        if (n) {
          let e = h.run();
          if (o || y || (b ? e.some((e, t) => D(e, C[t])) : D(e, C))) {
            _ && _();
            let t = Gt;
            Gt = h;
            try {
              let t = [e, C === Ut ? void 0 : b && C[0] === Ut ? [] : C, v];
              ((C = e), f ? f(n, 3, t) : n(...t));
            } finally {
              Gt = t;
            }
          }
        } else h.run();
    };
  return (
    u && u(w),
    (h = new Se(g)),
    (h.scheduler = l ? () => l(w, !1) : w),
    (v = (e) => Kt(e, !1, h)),
    (_ = h.onStop =
      () => {
        let e = Wt.get(h);
        if (e) {
          if (f) f(e, 4);
          else for (let t of e) t();
          Wt.delete(h);
        }
      }),
    n ? (a ? w(!0) : (C = h.run())) : l ? l(w.bind(null, !0), !0) : h.run(),
    (S.pause = h.pause.bind(h)),
    (S.resume = h.resume.bind(h)),
    (S.stop = S),
    S
  );
}
function Jt(e, t = 1 / 0, n) {
  if (t <= 0 || !_(e) || e.__v_skip || ((n ||= new Map()), (n.get(e) || 0) >= t)) return e;
  if ((n.set(e, t), t--, R(e))) Jt(e.value, t, n);
  else if (d(e)) for (let r = 0; r < e.length; r++) Jt(e[r], t, n);
  else if (p(e) || f(e))
    e.forEach((e) => {
      Jt(e, t, n);
    });
  else if (S(e)) {
    for (let r in e) Jt(e[r], t, n);
    for (let r of Object.getOwnPropertySymbols(e)) Object.prototype.propertyIsEnumerable.call(e, r) && Jt(e[r], t, n);
  }
  return e;
}
function Yt(e, t, n, r) {
  try {
    return r ? e(...r) : e();
  } catch (e) {
    Xt(e, t, n);
  }
}
function z(e, t, n, r) {
  if (m(e)) {
    let i = Yt(e, t, n, r);
    return (
      i &&
        v(i) &&
        i.catch((e) => {
          Xt(e, t, n);
        }),
      i
    );
  }
  if (d(e)) {
    let i = [];
    for (let a = 0; a < e.length; a++) i.push(z(e[a], t, n, r));
    return i;
  }
}
function Xt(e, n, r, i = !0) {
  let a = n ? n.vnode : null,
    { errorHandler: o, throwUnhandledErrorInProduction: s } = (n && n.appContext.config) || t;
  if (n) {
    let t = n.parent,
      i = n.proxy,
      a = `https://vuejs.org/error-reference/#runtime-${r}`;
    for (; t; ) {
      let n = t.ec;
      if (n) {
        for (let t = 0; t < n.length; t++) if (n[t](e, i, a) === !1) return;
      }
      t = t.parent;
    }
    if (o) {
      (Ie(), Yt(o, null, 10, [e, i, a]), Le());
      return;
    }
  }
  Zt(e, r, a, i, s);
}
function Zt(e, t, n, r = !0, i = !1) {
  if (i) throw e;
  console.error(e);
}
var B = [],
  V = -1,
  Qt = [],
  $t = null,
  en = 0,
  tn = Promise.resolve(),
  nn = null;
function rn(e) {
  let t = nn || tn;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function an(e) {
  let t = V + 1,
    n = B.length;
  for (; t < n; ) {
    let r = (t + n) >>> 1,
      i = B[r],
      a = dn(i);
    a < e || (a === e && i.flags & 2) ? (t = r + 1) : (n = r);
  }
  return t;
}
function on(e) {
  if (!(e.flags & 1)) {
    let t = dn(e),
      n = B[B.length - 1];
    (!n || (!(e.flags & 2) && t >= dn(n)) ? B.push(e) : B.splice(an(t), 0, e), (e.flags |= 1), sn());
  }
}
function sn() {
  nn ||= tn.then(fn);
}
function cn(e) {
  (d(e) ? Qt.push(...e) : $t && e.id === -1 ? $t.splice(en + 1, 0, e) : e.flags & 1 || (Qt.push(e), (e.flags |= 1)),
    sn());
}
function ln(e, t, n = V + 1) {
  for (; n < B.length; n++) {
    let t = B[n];
    if (t && t.flags & 2) {
      if (e && t.id !== e.uid) continue;
      (B.splice(n, 1), n--, t.flags & 4 && (t.flags &= -2), t(), t.flags & 4 || (t.flags &= -2));
    }
  }
}
function un(e) {
  if (Qt.length) {
    let e = [...new Set(Qt)].sort((e, t) => dn(e) - dn(t));
    if (((Qt.length = 0), $t)) {
      $t.push(...e);
      return;
    }
    for ($t = e, en = 0; en < $t.length; en++) {
      let e = $t[en];
      (e.flags & 4 && (e.flags &= -2), e.flags & 8 || e(), (e.flags &= -2));
    }
    (($t = null), (en = 0));
  }
}
var dn = (e) => (e.id == null ? (e.flags & 2 ? -1 : 1 / 0) : e.id);
function fn(e) {
  try {
    for (V = 0; V < B.length; V++) {
      let e = B[V];
      e &&
        !(e.flags & 8) &&
        (e.flags & 4 && (e.flags &= -2), Yt(e, e.i, e.i ? 15 : 14), e.flags & 4 || (e.flags &= -2));
    }
  } finally {
    for (; V < B.length; V++) {
      let e = B[V];
      e && (e.flags &= -2);
    }
    ((V = -1), (B.length = 0), un(e), (nn = null), (B.length || Qt.length) && fn(e));
  }
}
var H = null,
  pn = null;
function mn(e) {
  let t = H;
  return ((H = e), (pn = (e && e.type.__scopeId) || null), t);
}
function hn(e, t = H, n) {
  if (!t || e._n) return e;
  let r = (...n) => {
    r._d && Ei(-1);
    let i = mn(t),
      a;
    try {
      a = e(...n);
    } finally {
      (mn(i), r._d && Ei(1));
    }
    return a;
  };
  return ((r._n = !0), (r._c = !0), (r._d = !0), r);
}
function gn(e, t, n, r) {
  let i = e.dirs,
    a = t && t.dirs;
  for (let o = 0; o < i.length; o++) {
    let s = i[o];
    a && (s.oldValue = a[o].value);
    let c = s.dir[r];
    c && (Ie(), z(c, n, 8, [e.el, s, e, t]), Le());
  }
}
function _n(e, t) {
  if ($) {
    let n = $.provides,
      r = $.parent && $.parent.provides;
    (r === n && (n = $.provides = Object.create(r)), (n[e] = t));
  }
}
function vn(e, t, n = !1) {
  let r = Gi();
  if (r || jr) {
    let i = jr
      ? jr._context.provides
      : r
        ? r.parent == null || r.ce
          ? r.vnode.appContext && r.vnode.appContext.provides
          : r.parent.provides
        : void 0;
    if (i && e in i) return i[e];
    if (arguments.length > 1) return n && m(t) ? t.call(r && r.proxy) : t;
  }
}
var yn = Symbol.for(`v-scx`),
  bn = () => vn(yn);
function xn(e, t, n) {
  return Sn(e, t, n);
}
function Sn(e, n, i = t) {
  let { immediate: a, deep: o, flush: c, once: l } = i,
    u = s({}, i),
    d = (n && a) || (!n && c !== `post`),
    f;
  if (Zi) {
    if (c === `sync`) {
      let e = bn();
      f = e.__watcherHandles ||= [];
    } else if (!d) {
      let e = () => {};
      return ((e.stop = r), (e.resume = r), (e.pause = r), e);
    }
  }
  let p = $;
  u.call = (e, t, n) => z(e, p, t, n);
  let m = !1;
  (c === `post`
    ? (u.scheduler = (e) => {
        W(e, p && p.suspense);
      })
    : c !== `sync` &&
      ((m = !0),
      (u.scheduler = (e, t) => {
        t ? e() : on(e);
      })),
    (u.augmentJob = (e) => {
      (n && (e.flags |= 4), m && ((e.flags |= 2), p && ((e.id = p.uid), (e.i = p))));
    }));
  let h = qt(e, n, u);
  return (Zi && (f ? f.push(h) : d && h()), h);
}
function Cn(e, t, n) {
  let r = this.proxy,
    i = h(e) ? (e.includes(`.`) ? wn(r, e) : () => r[e]) : e.bind(r, r),
    a;
  m(t) ? (a = t) : ((a = t.handler), (n = t));
  let o = Ji(this),
    s = Sn(i, a.bind(r), n);
  return (o(), s);
}
function wn(e, t) {
  let n = t.split(`.`);
  return () => {
    let t = e;
    for (let e = 0; e < n.length && t; e++) t = t[n[e]];
    return t;
  };
}
var Tn = Symbol(`_vte`),
  En = (e) => e.__isTeleport,
  Dn = Symbol(`_leaveCb`);
function On(e, t) {
  e.shapeFlag & 6 && e.component
    ? ((e.transition = t), On(e.component.subTree, t))
    : e.shapeFlag & 128
      ? ((e.ssContent.transition = t.clone(e.ssContent)), (e.ssFallback.transition = t.clone(e.ssFallback)))
      : (e.transition = t);
}
function kn(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + `-`, 0, 0];
}
var An = new WeakMap();
function jn(e, n, r, a, o = !1) {
  if (d(e)) {
    e.forEach((e, t) => jn(e, n && (d(n) ? n[t] : n), r, a, o));
    return;
  }
  if (Un(a) && !o) {
    a.shapeFlag & 512 && a.type.__asyncResolved && a.component.subTree.component && jn(e, n, r, a.component.subTree);
    return;
  }
  let s = a.shapeFlag & 4 ? oa(a.component) : a.el,
    l = o ? null : s,
    { i: f, r: p } = e,
    g = n && n.r,
    _ = f.refs === t ? (f.refs = {}) : f.refs,
    v = f.setupState,
    y = L(v),
    b = v === t ? i : (e) => u(y, e),
    x = (e) => !0;
  if (g != null && g !== p) {
    if ((Mn(n), h(g))) ((_[g] = null), b(g) && (v[g] = null));
    else if (R(g)) {
      x(g) && (g.value = null);
      let e = n;
      e.k && (_[e.k] = null);
    }
  }
  if (m(p)) Yt(p, f, 12, [l, _]);
  else {
    let t = h(p),
      n = R(p);
    if (t || n) {
      let i = () => {
        if (e.f) {
          let n = t ? (b(p) ? v[p] : _[p]) : x(p) || !e.k ? p.value : _[e.k];
          if (o) d(n) && c(n, s);
          else if (d(n)) n.includes(s) || n.push(s);
          else if (t) ((_[p] = [s]), b(p) && (v[p] = _[p]));
          else {
            let t = [s];
            (x(p) && (p.value = t), e.k && (_[e.k] = t));
          }
        } else t ? ((_[p] = l), b(p) && (v[p] = l)) : n && (x(p) && (p.value = l), e.k && (_[e.k] = l));
      };
      if (l) {
        let t = () => {
          (i(), An.delete(e));
        };
        ((t.id = -1), An.set(e, t), W(t, r));
      } else (Mn(e), i());
    }
  }
}
function Mn(e) {
  let t = An.get(e);
  t && ((t.flags |= 8), An.delete(e));
}
var Nn = !1,
  Pn = () => {
    Nn ||= (console.error(`Hydration completed but contains mismatches.`), !0);
  },
  Fn = (e) => e.namespaceURI.includes(`svg`) && e.tagName !== `foreignObject`,
  In = (e) => e.namespaceURI.includes(`MathML`),
  Ln = (e) => {
    if (e.nodeType === 1) {
      if (Fn(e)) return `svg`;
      if (In(e)) return `mathml`;
    }
  },
  Rn = (e) => e.nodeType === 8;
function zn(e) {
  let {
      mt: t,
      p: n,
      o: { patchProp: r, createText: i, nextSibling: o, parentNode: s, remove: c, insert: l, createComment: u }
    } = e,
    d = (e, t) => {
      if (!t.hasChildNodes()) {
        (n(null, e, t), un(), (t._vnode = e));
        return;
      }
      (f(t.firstChild, e, null, null, null), un(), (t._vnode = e));
    },
    f = (n, r, a, c, u, d = !1) => {
      d ||= !!r.dynamicChildren;
      let b = Rn(n) && n.data === `[`,
        x = () => g(n, r, a, c, u, b),
        { type: S, ref: C, shapeFlag: w, patchFlag: ee } = r,
        te = n.nodeType;
      ((r.el = n), ee === -2 && ((d = !1), (r.dynamicChildren = null)));
      let T = null;
      switch (S) {
        case bi:
          te === 3
            ? (n.data !== r.children && (Pn(), (n.data = r.children)), (T = o(n)))
            : r.children === ``
              ? (l((r.el = i(``)), s(n), n), (T = n))
              : (T = x());
          break;
        case xi:
          y(n) ? ((T = o(n)), v((r.el = n.content.firstChild), n, a)) : (T = te !== 8 || b ? x() : o(n));
          break;
        case Si:
          if ((b && ((n = o(n)), (te = n.nodeType)), te === 1 || te === 3)) {
            T = n;
            let e = !r.children.length;
            for (let t = 0; t < r.staticCount; t++)
              (e && (r.children += T.nodeType === 1 ? T.outerHTML : T.data),
                t === r.staticCount - 1 && (r.anchor = T),
                (T = o(T)));
            return b ? o(T) : T;
          } else x();
          break;
        case G:
          T = b ? h(n, r, a, c, u, d) : x();
          break;
        default:
          if (w & 1)
            T = (te !== 1 || r.type.toLowerCase() !== n.tagName.toLowerCase()) && !y(n) ? x() : p(n, r, a, c, u, d);
          else if (w & 6) {
            r.slotScopeIds = u;
            let e = s(n);
            if (
              ((T = b ? _(n) : Rn(n) && n.data === `teleport start` ? _(n, n.data, `teleport end`) : o(n)),
              t(r, e, null, a, c, Ln(e), d),
              Un(r) && !r.type.__asyncResolved)
            ) {
              let t;
              (b
                ? ((t = X(G)), (t.anchor = T ? T.previousSibling : e.lastChild))
                : (t = n.nodeType === 3 ? Ii(``) : X(`div`)),
                (t.el = n),
                (r.component.subTree = t));
            }
          } else
            w & 64
              ? (T = te === 8 ? r.type.hydrate(n, r, a, c, u, d, e, m) : x())
              : w & 128 && (T = r.type.hydrate(n, r, a, c, Ln(s(n)), u, d, e, f));
      }
      return (C != null && jn(C, null, c, r), T);
    },
    p = (e, t, n, i, o, s) => {
      s ||= !!t.dynamicChildren;
      let { type: l, props: u, patchFlag: d, shapeFlag: f, dirs: p, transition: h } = t,
        g = l === `input` || l === `option`;
      if (g || d !== -1) {
        p && gn(t, null, n, `created`);
        let l = !1;
        if (y(e)) {
          l = fi(null, h) && n && n.vnode.props && n.vnode.props.appear;
          let r = e.content.firstChild;
          if (l) {
            let e = r.getAttribute(`class`);
            (e && (r.$cls = e), h.beforeEnter(r));
          }
          (v(r, e, n), (t.el = e = r));
        }
        if (f & 16 && !(u && (u.innerHTML || u.textContent))) {
          let r = m(e.firstChild, t, e, n, i, o, s);
          for (; r; ) {
            Hn(e, 1) || Pn();
            let t = r;
            ((r = r.nextSibling), c(t));
          }
        } else if (f & 8) {
          let n = t.children;
          n[0] ===
            `
` &&
            (e.tagName === `PRE` || e.tagName === `TEXTAREA`) &&
            (n = n.slice(1));
          let { textContent: r } = e;
          r !== n &&
            r !==
              n.replace(
                /\r\n|\r/g,
                `
`
              ) &&
            (Hn(e, 0) || Pn(), (e.textContent = t.children));
        }
        if (u) {
          if (g || !s || d & 48) {
            let t = e.tagName.includes(`-`);
            for (let i in u)
              ((g && (i.endsWith(`value`) || i === `indeterminate`)) ||
                (a(i) && !w(i)) ||
                i[0] === `.` ||
                (t && !w(i))) &&
                r(e, i, null, u[i], void 0, n);
          } else if (u.onClick) r(e, `onClick`, null, u.onClick, void 0, n);
          else if (d & 4 && Mt(u.style)) for (let e in u.style) u.style[e];
        }
        let _;
        ((_ = u && u.onVnodeBeforeMount) && Q(_, n, t),
          p && gn(t, null, n, `beforeMount`),
          ((_ = u && u.onVnodeMounted) || p || l) &&
            yi(() => {
              (_ && Q(_, n, t), l && h.enter(e), p && gn(t, null, n, `mounted`));
            }, i));
      }
      return e.nextSibling;
    },
    m = (e, t, r, a, s, c, u) => {
      u ||= !!t.dynamicChildren;
      let d = t.children,
        p = d.length;
      for (let t = 0; t < p; t++) {
        let m = u ? d[t] : (d[t] = Z(d[t])),
          h = m.type === bi;
        e
          ? (h &&
              !u &&
              t + 1 < p &&
              Z(d[t + 1]).type === bi &&
              (l(i(e.data.slice(m.children.length)), r, o(e)), (e.data = m.children)),
            (e = f(e, m, a, s, c, u)))
          : h && !m.children
            ? l((m.el = i(``)), r)
            : (Hn(r, 1) || Pn(), n(null, m, r, null, a, s, Ln(r), c));
      }
      return e;
    },
    h = (e, t, n, r, i, a) => {
      let { slotScopeIds: c } = t;
      c && (i = i ? i.concat(c) : c);
      let d = s(e),
        f = m(o(e), t, d, n, r, i, a);
      return f && Rn(f) && f.data === `]` ? o((t.anchor = f)) : (Pn(), l((t.anchor = u(`]`)), d, f), f);
    },
    g = (e, t, r, i, a, l) => {
      if ((Hn(e.parentElement, 1) || Pn(), (t.el = null), l)) {
        let t = _(e);
        for (;;) {
          let n = o(e);
          if (n && n !== t) c(n);
          else break;
        }
      }
      let u = o(e),
        d = s(e);
      return (c(e), n(null, t, d, u, r, i, Ln(d), a), r && ((r.vnode.el = t.el), Hr(r, t.el)), u);
    },
    _ = (e, t = `[`, n = `]`) => {
      let r = 0;
      for (; e; )
        if (((e = o(e)), e && Rn(e) && (e.data === t && r++, e.data === n))) {
          if (r === 0) return o(e);
          r--;
        }
      return e;
    },
    v = (e, t, n) => {
      let r = t.parentNode;
      r && r.replaceChild(e, t);
      let i = n;
      for (; i; ) (i.vnode.el === t && (i.vnode.el = i.subTree.el = e), (i = i.parent));
    },
    y = (e) => e.nodeType === 1 && e.tagName === `TEMPLATE`;
  return [d, f];
}
var Bn = `data-allow-mismatch`,
  Vn = { 0: `text`, 1: `children`, 2: `class`, 3: `style`, 4: `attribute` };
function Hn(e, t) {
  if (t === 0 || t === 1) for (; e && !e.hasAttribute(Bn); ) e = e.parentElement;
  let n = e && e.getAttribute(Bn);
  if (n == null) return !1;
  if (n === ``) return !0;
  {
    let e = n.split(`,`);
    return t === 0 && e.includes(`children`) ? !0 : e.includes(Vn[t]);
  }
}
(ce().requestIdleCallback, ce().cancelIdleCallback);
var Un = (e) => !!e.type.__asyncLoader,
  Wn = (e) => e.type.__isKeepAlive;
function Gn(e, t) {
  qn(e, `a`, t);
}
function Kn(e, t) {
  qn(e, `da`, t);
}
function qn(e, t, n = $) {
  let r = (e.__wdc ||= () => {
    let t = n;
    for (; t; ) {
      if (t.isDeactivated) return;
      t = t.parent;
    }
    return e();
  });
  if ((Yn(t, r, n), n)) {
    let e = n.parent;
    for (; e && e.parent; ) (Wn(e.parent.vnode) && Jn(r, t, n, e), (e = e.parent));
  }
}
function Jn(e, t, n, r) {
  let i = Yn(t, e, r, !0);
  nr(() => {
    c(r[t], i);
  }, n);
}
function Yn(e, t, n = $, r = !1) {
  if (n) {
    let i = n[e] || (n[e] = []),
      a = (t.__weh ||= (...r) => {
        Ie();
        let i = Ji(n),
          a = z(t, n, e, r);
        return (i(), Le(), a);
      });
    return (r ? i.unshift(a) : i.push(a), a);
  }
}
var Xn =
    (e) =>
    (t, n = $) => {
      (!Zi || e === `sp`) && Yn(e, (...e) => t(...e), n);
    },
  Zn = Xn(`bm`),
  Qn = Xn(`m`),
  $n = Xn(`bu`),
  er = Xn(`u`),
  tr = Xn(`bum`),
  nr = Xn(`um`),
  rr = Xn(`sp`),
  ir = Xn(`rtg`),
  ar = Xn(`rtc`);
function or(e, t = $) {
  Yn(`ec`, e, t);
}
var sr = Symbol.for(`v-ndc`);
function cr(e, t, n, r) {
  let i,
    a = n && n[r],
    o = d(e);
  if (o || h(e)) {
    let n = o && Mt(e),
      r = !1,
      s = !1;
    (n && ((r = !I(e)), (s = Nt(e)), (e = Ye(e))), (i = Array(e.length)));
    for (let n = 0, o = e.length; n < o; n++) i[n] = t(r ? (s ? Lt(It(e[n])) : It(e[n])) : e[n], n, void 0, a && a[n]);
  } else if (typeof e == `number`) {
    i = Array(e);
    for (let n = 0; n < e; n++) i[n] = t(n + 1, n, void 0, a && a[n]);
  } else if (_(e))
    if (e[Symbol.iterator]) i = Array.from(e, (e, n) => t(e, n, void 0, a && a[n]));
    else {
      let n = Object.keys(e);
      i = Array(n.length);
      for (let r = 0, o = n.length; r < o; r++) {
        let o = n[r];
        i[r] = t(e[o], o, r, a && a[r]);
      }
    }
  else i = [];
  return (n && (n[r] = i), i);
}
var lr = (e) => (e ? (Xi(e) ? oa(e) : lr(e.parent)) : null),
  ur = s(Object.create(null), {
    $: (e) => e,
    $el: (e) => e.vnode.el,
    $data: (e) => e.data,
    $props: (e) => e.props,
    $attrs: (e) => e.attrs,
    $slots: (e) => e.slots,
    $refs: (e) => e.refs,
    $parent: (e) => lr(e.parent),
    $root: (e) => lr(e.root),
    $host: (e) => e.ce,
    $emit: (e) => e.emit,
    $options: (e) => yr(e),
    $forceUpdate: (e) =>
      (e.f ||= () => {
        on(e.update);
      }),
    $nextTick: (e) => (e.n ||= rn.bind(e.proxy)),
    $watch: (e) => Cn.bind(e)
  }),
  dr = (e, n) => e !== t && !e.__isScriptSetup && u(e, n),
  fr = {
    get({ _: e }, n) {
      if (n === `__v_skip`) return !0;
      let { ctx: r, setupState: i, data: a, props: o, accessCache: s, type: c, appContext: l } = e;
      if (n[0] !== `$`) {
        let e = s[n];
        if (e !== void 0)
          switch (e) {
            case 1:
              return i[n];
            case 2:
              return a[n];
            case 4:
              return r[n];
            case 3:
              return o[n];
          }
        else if (dr(i, n)) return ((s[n] = 1), i[n]);
        else if (a !== t && u(a, n)) return ((s[n] = 2), a[n]);
        else if (u(o, n)) return ((s[n] = 3), o[n]);
        else if (r !== t && u(r, n)) return ((s[n] = 4), r[n]);
        else mr && (s[n] = 0);
      }
      let d = ur[n],
        f,
        p;
      if (d) return (n === `$attrs` && F(e.attrs, `get`, ``), d(e));
      if ((f = c.__cssModules) && (f = f[n])) return f;
      if (r !== t && u(r, n)) return ((s[n] = 4), r[n]);
      if (((p = l.config.globalProperties), u(p, n))) return p[n];
    },
    set({ _: e }, n, r) {
      let { data: i, setupState: a, ctx: o } = e;
      return dr(a, n)
        ? ((a[n] = r), !0)
        : i !== t && u(i, n)
          ? ((i[n] = r), !0)
          : u(e.props, n) || (n[0] === `$` && n.slice(1) in e)
            ? !1
            : ((o[n] = r), !0);
    },
    has({ _: { data: e, setupState: n, accessCache: r, ctx: i, appContext: a, props: o, type: s } }, c) {
      let l;
      return !!(
        r[c] ||
        (e !== t && c[0] !== `$` && u(e, c)) ||
        dr(n, c) ||
        u(o, c) ||
        u(i, c) ||
        u(ur, c) ||
        u(a.config.globalProperties, c) ||
        ((l = s.__cssModules) && l[c])
      );
    },
    defineProperty(e, t, n) {
      return (
        n.get == null ? u(n, `value`) && this.set(e, t, n.value, null) : (e._.accessCache[t] = 0),
        Reflect.defineProperty(e, t, n)
      );
    }
  };
function pr(e) {
  return d(e) ? e.reduce((e, t) => ((e[t] = null), e), {}) : e;
}
var mr = !0;
function hr(e) {
  let t = yr(e),
    n = e.proxy,
    i = e.ctx;
  ((mr = !1), t.beforeCreate && _r(t.beforeCreate, e, `bc`));
  let {
    data: a,
    computed: o,
    methods: s,
    watch: c,
    provide: l,
    inject: u,
    created: f,
    beforeMount: p,
    mounted: h,
    beforeUpdate: g,
    updated: v,
    activated: y,
    deactivated: b,
    beforeDestroy: x,
    beforeUnmount: S,
    destroyed: C,
    unmounted: w,
    render: ee,
    renderTracked: te,
    renderTriggered: T,
    errorCaptured: ne,
    serverPrefetch: E,
    expose: re,
    inheritAttrs: ie,
    components: D,
    directives: ae,
    filters: oe
  } = t;
  if ((u && gr(u, i, null), s))
    for (let e in s) {
      let t = s[e];
      m(t) && (i[e] = t.bind(n));
    }
  if (a) {
    let t = a.call(n, n);
    _(t) && (e.data = Ot(t));
  }
  if (((mr = !0), o))
    for (let e in o) {
      let t = o[e],
        a = ca({
          get: m(t) ? t.bind(n, n) : m(t.get) ? t.get.bind(n, n) : r,
          set: !m(t) && m(t.set) ? t.set.bind(n) : r
        });
      Object.defineProperty(i, e, { enumerable: !0, configurable: !0, get: () => a.value, set: (e) => (a.value = e) });
    }
  if (c) for (let e in c) vr(c[e], i, n, e);
  if (l) {
    let e = m(l) ? l.call(n) : l;
    Reflect.ownKeys(e).forEach((t) => {
      _n(t, e[t]);
    });
  }
  f && _r(f, e, `c`);
  function O(e, t) {
    d(t) ? t.forEach((t) => e(t.bind(n))) : t && e(t.bind(n));
  }
  if (
    (O(Zn, p),
    O(Qn, h),
    O($n, g),
    O(er, v),
    O(Gn, y),
    O(Kn, b),
    O(or, ne),
    O(ar, te),
    O(ir, T),
    O(tr, S),
    O(nr, w),
    O(rr, E),
    d(re))
  )
    if (re.length) {
      let t = (e.exposed ||= {});
      re.forEach((e) => {
        Object.defineProperty(t, e, { get: () => n[e], set: (t) => (n[e] = t), enumerable: !0 });
      });
    } else e.exposed ||= {};
  (ee && e.render === r && (e.render = ee),
    ie != null && (e.inheritAttrs = ie),
    D && (e.components = D),
    ae && (e.directives = ae),
    E && kn(e));
}
function gr(e, t, n = r) {
  for (let n in (d(e) && (e = wr(e)), e)) {
    let r = e[n],
      i;
    ((i = _(r) ? (`default` in r ? vn(r.from || n, r.default, !0) : vn(r.from || n)) : vn(r)),
      R(i)
        ? Object.defineProperty(t, n, {
            enumerable: !0,
            configurable: !0,
            get: () => i.value,
            set: (e) => (i.value = e)
          })
        : (t[n] = i));
  }
}
function _r(e, t, n) {
  z(d(e) ? e.map((e) => e.bind(t.proxy)) : e.bind(t.proxy), t, n);
}
function vr(e, t, n, r) {
  let i = r.includes(`.`) ? wn(n, r) : () => n[r];
  if (h(e)) {
    let n = t[e];
    m(n) && xn(i, n);
  } else if (m(e)) xn(i, e.bind(n));
  else if (_(e))
    if (d(e)) e.forEach((e) => vr(e, t, n, r));
    else {
      let r = m(e.handler) ? e.handler.bind(n) : t[e.handler];
      m(r) && xn(i, r, e);
    }
}
function yr(e) {
  let t = e.type,
    { mixins: n, extends: r } = t,
    {
      mixins: i,
      optionsCache: a,
      config: { optionMergeStrategies: o }
    } = e.appContext,
    s = a.get(t),
    c;
  return (
    s
      ? (c = s)
      : !i.length && !n && !r
        ? (c = t)
        : ((c = {}), i.length && i.forEach((e) => br(c, e, o, !0)), br(c, t, o)),
    _(t) && a.set(t, c),
    c
  );
}
function br(e, t, n, r = !1) {
  let { mixins: i, extends: a } = t;
  for (let o in (a && br(e, a, n, !0), i && i.forEach((t) => br(e, t, n, !0)), t))
    if (!(r && o === `expose`)) {
      let r = xr[o] || (n && n[o]);
      e[o] = r ? r(e[o], t[o]) : t[o];
    }
  return e;
}
var xr = {
  data: Sr,
  props: Er,
  emits: Er,
  methods: Tr,
  computed: Tr,
  beforeCreate: U,
  created: U,
  beforeMount: U,
  mounted: U,
  beforeUpdate: U,
  updated: U,
  beforeDestroy: U,
  beforeUnmount: U,
  destroyed: U,
  unmounted: U,
  activated: U,
  deactivated: U,
  errorCaptured: U,
  serverPrefetch: U,
  components: Tr,
  directives: Tr,
  watch: Dr,
  provide: Sr,
  inject: Cr
};
function Sr(e, t) {
  return t
    ? e
      ? function () {
          return s(m(e) ? e.call(this, this) : e, m(t) ? t.call(this, this) : t);
        }
      : t
    : e;
}
function Cr(e, t) {
  return Tr(wr(e), wr(t));
}
function wr(e) {
  if (d(e)) {
    let t = {};
    for (let n = 0; n < e.length; n++) t[e[n]] = e[n];
    return t;
  }
  return e;
}
function U(e, t) {
  return e ? [...new Set([].concat(e, t))] : t;
}
function Tr(e, t) {
  return e ? s(Object.create(null), e, t) : t;
}
function Er(e, t) {
  return e ? (d(e) && d(t) ? [...new Set([...e, ...t])] : s(Object.create(null), pr(e), pr(t ?? {}))) : t;
}
function Dr(e, t) {
  if (!e) return t;
  if (!t) return e;
  let n = s(Object.create(null), e);
  for (let r in t) n[r] = U(e[r], t[r]);
  return n;
}
function Or() {
  return {
    app: null,
    config: {
      isNativeTag: i,
      performance: !1,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: void 0,
      warnHandler: void 0,
      compilerOptions: {}
    },
    mixins: [],
    components: {},
    directives: {},
    provides: Object.create(null),
    optionsCache: new WeakMap(),
    propsCache: new WeakMap(),
    emitsCache: new WeakMap()
  };
}
var kr = 0;
function Ar(e, t) {
  return function (n, r = null) {
    (m(n) || (n = s({}, n)), r != null && !_(r) && (r = null));
    let i = Or(),
      a = new WeakSet(),
      o = [],
      c = !1,
      l = (i.app = {
        _uid: kr++,
        _component: n,
        _props: r,
        _container: null,
        _context: i,
        _instance: null,
        version: la,
        get config() {
          return i.config;
        },
        set config(e) {},
        use(e, ...t) {
          return (a.has(e) || (e && m(e.install) ? (a.add(e), e.install(l, ...t)) : m(e) && (a.add(e), e(l, ...t))), l);
        },
        mixin(e) {
          return (i.mixins.includes(e) || i.mixins.push(e), l);
        },
        component(e, t) {
          return t ? ((i.components[e] = t), l) : i.components[e];
        },
        directive(e, t) {
          return t ? ((i.directives[e] = t), l) : i.directives[e];
        },
        mount(a, o, s) {
          if (!c) {
            let u = l._ceVNode || X(n, r);
            return (
              (u.appContext = i),
              s === !0 ? (s = `svg`) : s === !1 && (s = void 0),
              o && t ? t(u, a) : e(u, a, s),
              (c = !0),
              (l._container = a),
              (a.__vue_app__ = l),
              oa(u.component)
            );
          }
        },
        onUnmount(e) {
          o.push(e);
        },
        unmount() {
          c && (z(o, l._instance, 16), e(null, l._container), delete l._container.__vue_app__);
        },
        provide(e, t) {
          return ((i.provides[e] = t), l);
        },
        runWithContext(e) {
          let t = jr;
          jr = l;
          try {
            return e();
          } finally {
            jr = t;
          }
        }
      });
    return l;
  };
}
var jr = null,
  Mr = (e, t) =>
    t === `modelValue` || t === `model-value`
      ? e.modelModifiers
      : e[`${t}Modifiers`] || e[`${T(t)}Modifiers`] || e[`${E(t)}Modifiers`];
function Nr(e, n, ...r) {
  if (e.isUnmounted) return;
  let i = e.vnode.props || t,
    a = r,
    o = n.startsWith(`update:`),
    s = o && Mr(i, n.slice(7));
  s && (s.trim && (a = r.map((e) => (h(e) ? e.trim() : e))), s.number && (a = r.map(O)));
  let c,
    l = i[(c = ie(n))] || i[(c = ie(T(n)))];
  (!l && o && (l = i[(c = ie(E(n)))]), l && z(l, e, 6, a));
  let u = i[c + `Once`];
  if (u) {
    if (!e.emitted) e.emitted = {};
    else if (e.emitted[c]) return;
    ((e.emitted[c] = !0), z(u, e, 6, a));
  }
}
var Pr = new WeakMap();
function Fr(e, t, n = !1) {
  let r = n ? Pr : t.emitsCache,
    i = r.get(e);
  if (i !== void 0) return i;
  let a = e.emits,
    o = {},
    c = !1;
  if (!m(e)) {
    let r = (e) => {
      let n = Fr(e, t, !0);
      n && ((c = !0), s(o, n));
    };
    (!n && t.mixins.length && t.mixins.forEach(r), e.extends && r(e.extends), e.mixins && e.mixins.forEach(r));
  }
  return !a && !c
    ? (_(e) && r.set(e, null), null)
    : (d(a) ? a.forEach((e) => (o[e] = null)) : s(o, a), _(e) && r.set(e, o), o);
}
function Ir(e, t) {
  return !e || !a(t)
    ? !1
    : ((t = t.slice(2).replace(/Once$/, ``)), u(e, t[0].toLowerCase() + t.slice(1)) || u(e, E(t)) || u(e, t));
}
function Lr(e) {
  let {
      type: t,
      vnode: n,
      proxy: r,
      withProxy: i,
      propsOptions: [a],
      slots: s,
      attrs: c,
      emit: l,
      render: u,
      renderCache: d,
      props: f,
      data: p,
      setupState: m,
      ctx: h,
      inheritAttrs: g
    } = e,
    _ = mn(e),
    v,
    y;
  try {
    if (n.shapeFlag & 4) {
      let e = i || r,
        t = e;
      ((v = Z(u.call(t, e, d, f, m, p, h))), (y = c));
    } else {
      let e = t;
      ((v = Z(e.length > 1 ? e(f, { attrs: c, slots: s, emit: l }) : e(f, null))), (y = t.props ? c : Rr(c)));
    }
  } catch (t) {
    ((Ci.length = 0), Xt(t, e, 1), (v = X(xi)));
  }
  let b = v;
  if (y && g !== !1) {
    let e = Object.keys(y),
      { shapeFlag: t } = b;
    e.length && t & 7 && (a && e.some(o) && (y = zr(y, a)), (b = Fi(b, y, !1, !0)));
  }
  return (
    n.dirs && ((b = Fi(b, null, !1, !0)), (b.dirs = b.dirs ? b.dirs.concat(n.dirs) : n.dirs)),
    n.transition && On(b, n.transition),
    (v = b),
    mn(_),
    v
  );
}
var Rr = (e) => {
    let t;
    for (let n in e) (n === `class` || n === `style` || a(n)) && ((t ||= {})[n] = e[n]);
    return t;
  },
  zr = (e, t) => {
    let n = {};
    for (let r in e) (!o(r) || !(r.slice(9) in t)) && (n[r] = e[r]);
    return n;
  };
function Br(e, t, n) {
  let { props: r, children: i, component: a } = e,
    { props: o, children: s, patchFlag: c } = t,
    l = a.emitsOptions;
  if (t.dirs || t.transition) return !0;
  if (n && c >= 0) {
    if (c & 1024) return !0;
    if (c & 16) return r ? Vr(r, o, l) : !!o;
    if (c & 8) {
      let e = t.dynamicProps;
      for (let t = 0; t < e.length; t++) {
        let n = e[t];
        if (o[n] !== r[n] && !Ir(l, n)) return !0;
      }
    }
  } else return (i || s) && (!s || !s.$stable) ? !0 : r === o ? !1 : r ? (o ? Vr(r, o, l) : !0) : !!o;
  return !1;
}
function Vr(e, t, n) {
  let r = Object.keys(t);
  if (r.length !== Object.keys(e).length) return !0;
  for (let i = 0; i < r.length; i++) {
    let a = r[i];
    if (t[a] !== e[a] && !Ir(n, a)) return !0;
  }
  return !1;
}
function Hr({ vnode: e, parent: t }, n) {
  for (; t; ) {
    let r = t.subTree;
    if ((r.suspense && r.suspense.activeBranch === e && (r.el = e.el), r === e))
      (((e = t.vnode).el = n), (t = t.parent));
    else break;
  }
}
var Ur = {},
  Wr = () => Object.create(Ur),
  Gr = (e) => Object.getPrototypeOf(e) === Ur;
function Kr(e, t, n, r = !1) {
  let i = {},
    a = Wr();
  for (let n in ((e.propsDefaults = Object.create(null)), Jr(e, t, i, a), e.propsOptions[0])) n in i || (i[n] = void 0);
  (n ? (e.props = r ? i : kt(i)) : e.type.props ? (e.props = i) : (e.props = a), (e.attrs = a));
}
function qr(e, t, n, r) {
  let {
      props: i,
      attrs: a,
      vnode: { patchFlag: o }
    } = e,
    s = L(i),
    [c] = e.propsOptions,
    l = !1;
  if ((r || o > 0) && !(o & 16)) {
    if (o & 8) {
      let n = e.vnode.dynamicProps;
      for (let r = 0; r < n.length; r++) {
        let o = n[r];
        if (Ir(e.emitsOptions, o)) continue;
        let d = t[o];
        if (c)
          if (u(a, o)) d !== a[o] && ((a[o] = d), (l = !0));
          else {
            let t = T(o);
            i[t] = Yr(c, s, t, d, e, !1);
          }
        else d !== a[o] && ((a[o] = d), (l = !0));
      }
    }
  } else {
    Jr(e, t, i, a) && (l = !0);
    let r;
    for (let a in s)
      (!t || (!u(t, a) && ((r = E(a)) === a || !u(t, r)))) &&
        (c ? n && (n[a] !== void 0 || n[r] !== void 0) && (i[a] = Yr(c, s, a, void 0, e, !0)) : delete i[a]);
    if (a !== s) for (let e in a) (!t || !u(t, e)) && (delete a[e], (l = !0));
  }
  l && qe(e.attrs, `set`, ``);
}
function Jr(e, n, r, i) {
  let [a, o] = e.propsOptions,
    s = !1,
    c;
  if (n)
    for (let t in n) {
      if (w(t)) continue;
      let l = n[t],
        d;
      a && u(a, (d = T(t)))
        ? !o || !o.includes(d)
          ? (r[d] = l)
          : ((c ||= {})[d] = l)
        : Ir(e.emitsOptions, t) || ((!(t in i) || l !== i[t]) && ((i[t] = l), (s = !0)));
    }
  if (o) {
    let n = L(r),
      i = c || t;
    for (let t = 0; t < o.length; t++) {
      let s = o[t];
      r[s] = Yr(a, n, s, i[s], e, !u(i, s));
    }
  }
  return s;
}
function Yr(e, t, n, r, i, a) {
  let o = e[n];
  if (o != null) {
    let e = u(o, `default`);
    if (e && r === void 0) {
      let e = o.default;
      if (o.type !== Function && !o.skipFactory && m(e)) {
        let { propsDefaults: a } = i;
        if (n in a) r = a[n];
        else {
          let o = Ji(i);
          ((r = a[n] = e.call(null, t)), o());
        }
      } else r = e;
      i.ce && i.ce._setProp(n, r);
    }
    o[0] && (a && !e ? (r = !1) : o[1] && (r === `` || r === E(n)) && (r = !0));
  }
  return r;
}
var Xr = new WeakMap();
function Zr(e, r, i = !1) {
  let a = i ? Xr : r.propsCache,
    o = a.get(e);
  if (o) return o;
  let c = e.props,
    l = {},
    f = [],
    p = !1;
  if (!m(e)) {
    let t = (e) => {
      p = !0;
      let [t, n] = Zr(e, r, !0);
      (s(l, t), n && f.push(...n));
    };
    (!i && r.mixins.length && r.mixins.forEach(t), e.extends && t(e.extends), e.mixins && e.mixins.forEach(t));
  }
  if (!c && !p) return (_(e) && a.set(e, n), n);
  if (d(c))
    for (let e = 0; e < c.length; e++) {
      let n = T(c[e]);
      Qr(n) && (l[n] = t);
    }
  else if (c)
    for (let e in c) {
      let t = T(e);
      if (Qr(t)) {
        let n = c[e],
          r = (l[t] = d(n) || m(n) ? { type: n } : s({}, n)),
          i = r.type,
          a = !1,
          o = !0;
        if (d(i))
          for (let e = 0; e < i.length; ++e) {
            let t = i[e],
              n = m(t) && t.name;
            if (n === `Boolean`) {
              a = !0;
              break;
            } else n === `String` && (o = !1);
          }
        else a = m(i) && i.name === `Boolean`;
        ((r[0] = a), (r[1] = o), (a || u(r, `default`)) && f.push(t));
      }
    }
  let h = [l, f];
  return (_(e) && a.set(e, h), h);
}
function Qr(e) {
  return e[0] !== `$` && !w(e);
}
var $r = (e) => e === `_` || e === `_ctx` || e === `$stable`,
  ei = (e) => (d(e) ? e.map(Z) : [Z(e)]),
  ti = (e, t, n) => {
    if (t._n) return t;
    let r = hn((...e) => ei(t(...e)), n);
    return ((r._c = !1), r);
  },
  ni = (e, t, n) => {
    let r = e._ctx;
    for (let n in e) {
      if ($r(n)) continue;
      let i = e[n];
      if (m(i)) t[n] = ti(n, i, r);
      else if (i != null) {
        let e = ei(i);
        t[n] = () => e;
      }
    }
  },
  ri = (e, t) => {
    let n = ei(t);
    e.slots.default = () => n;
  },
  ii = (e, t, n) => {
    for (let r in t) (n || !$r(r)) && (e[r] = t[r]);
  },
  ai = (e, t, n) => {
    let r = (e.slots = Wr());
    if (e.vnode.shapeFlag & 32) {
      let e = t._;
      e ? (ii(r, t, n), n && oe(r, `_`, e, !0)) : ni(t, r);
    } else t && ri(e, t);
  },
  oi = (e, n, r) => {
    let { vnode: i, slots: a } = e,
      o = !0,
      s = t;
    if (i.shapeFlag & 32) {
      let e = n._;
      (e ? (r && e === 1 ? (o = !1) : ii(a, n, r)) : ((o = !n.$stable), ni(n, a)), (s = n));
    } else n && (ri(e, n), (s = { default: 1 }));
    if (o) for (let e in a) !$r(e) && s[e] == null && delete a[e];
  },
  W = yi;
function si(e) {
  return li(e);
}
function ci(e) {
  return li(e, zn);
}
function li(e, i) {
  let a = ce();
  a.__VUE__ = !0;
  let {
      insert: o,
      remove: s,
      patchProp: c,
      createElement: l,
      createText: u,
      createComment: d,
      setText: f,
      setElementText: p,
      parentNode: m,
      nextSibling: h,
      setScopeId: g = r,
      insertStaticContent: _
    } = e,
    v = (e, t, n, r = null, i = null, a = null, o = void 0, s = null, c = !!t.dynamicChildren) => {
      if (e === t) return;
      (e && !Ai(e, t) && ((r = _e(e)), pe(e, i, a, !0), (e = null)),
        t.patchFlag === -2 && ((c = !1), (t.dynamicChildren = null)));
      let { type: l, ref: u, shapeFlag: d } = t;
      switch (l) {
        case bi:
          y(e, t, n, r);
          break;
        case xi:
          b(e, t, n, r);
          break;
        case Si:
          e ?? x(t, n, r, o);
          break;
        case G:
          D(e, t, n, r, i, a, o, s, c);
          break;
        default:
          d & 1
            ? ee(e, t, n, r, i, a, o, s, c)
            : d & 6
              ? oe(e, t, n, r, i, a, o, s, c)
              : (d & 64 || d & 128) && l.process(e, t, n, r, i, a, o, s, c, ye);
      }
      u != null && i ? jn(u, e && e.ref, a, t || e, !t) : u == null && e && e.ref != null && jn(e.ref, null, a, e, !0);
    },
    y = (e, t, n, r) => {
      if (e == null) o((t.el = u(t.children)), n, r);
      else {
        let n = (t.el = e.el);
        t.children !== e.children && f(n, t.children);
      }
    },
    b = (e, t, n, r) => {
      e == null ? o((t.el = d(t.children || ``)), n, r) : (t.el = e.el);
    },
    x = (e, t, n, r) => {
      [e.el, e.anchor] = _(e.children, t, n, r, e.el, e.anchor);
    },
    S = ({ el: e, anchor: t }, n, r) => {
      let i;
      for (; e && e !== t; ) ((i = h(e)), o(e, n, r), (e = i));
      o(t, n, r);
    },
    C = ({ el: e, anchor: t }) => {
      let n;
      for (; e && e !== t; ) ((n = h(e)), s(e), (e = n));
      s(t);
    },
    ee = (e, t, n, r, i, a, o, s, c) => {
      if ((t.type === `svg` ? (o = `svg`) : t.type === `math` && (o = `mathml`), e == null)) te(t, n, r, i, a, o, s, c);
      else {
        let n = e.el && e.el._isVueCE ? e.el : null;
        try {
          (n && n._beginPatch(), E(e, t, i, a, o, s, c));
        } finally {
          n && n._endPatch();
        }
      }
    },
    te = (e, t, n, r, i, a, s, u) => {
      let d,
        f,
        { props: m, shapeFlag: h, transition: g, dirs: _ } = e;
      if (
        ((d = e.el = l(e.type, a, m && m.is, m)),
        h & 8 ? p(d, e.children) : h & 16 && ne(e.children, d, null, r, i, ui(e, a), s, u),
        _ && gn(e, null, r, `created`),
        T(d, e, e.scopeId, s, r),
        m)
      ) {
        for (let e in m) e !== `value` && !w(e) && c(d, e, null, m[e], a, r);
        (`value` in m && c(d, `value`, null, m.value, a), (f = m.onVnodeBeforeMount) && Q(f, r, e));
      }
      _ && gn(e, null, r, `beforeMount`);
      let v = fi(i, g);
      (v && g.beforeEnter(d),
        o(d, t, n),
        ((f = m && m.onVnodeMounted) || v || _) &&
          W(() => {
            (f && Q(f, r, e), v && g.enter(d), _ && gn(e, null, r, `mounted`));
          }, i));
    },
    T = (e, t, n, r, i) => {
      if ((n && g(e, n), r)) for (let t = 0; t < r.length; t++) g(e, r[t]);
      if (i) {
        let n = i.subTree;
        if (t === n || (vi(n.type) && (n.ssContent === t || n.ssFallback === t))) {
          let t = i.vnode;
          T(e, t, t.scopeId, t.slotScopeIds, i.parent);
        }
      }
    },
    ne = (e, t, n, r, i, a, o, s, c = 0) => {
      for (let l = c; l < e.length; l++) v(null, (e[l] = s ? zi(e[l]) : Z(e[l])), t, n, r, i, a, o, s);
    },
    E = (e, n, r, i, a, o, s) => {
      let l = (n.el = e.el),
        { patchFlag: u, dynamicChildren: d, dirs: f } = n;
      u |= e.patchFlag & 16;
      let m = e.props || t,
        h = n.props || t,
        g;
      if (
        (r && di(r, !1),
        (g = h.onVnodeBeforeUpdate) && Q(g, r, n, e),
        f && gn(n, e, r, `beforeUpdate`),
        r && di(r, !0),
        ((m.innerHTML && h.innerHTML == null) || (m.textContent && h.textContent == null)) && p(l, ``),
        d ? re(e.dynamicChildren, d, l, r, i, ui(n, a), o) : s || ue(e, n, l, null, r, i, ui(n, a), o, !1),
        u > 0)
      ) {
        if (u & 16) ie(l, m, h, r, a);
        else if (
          (u & 2 && m.class !== h.class && c(l, `class`, null, h.class, a),
          u & 4 && c(l, `style`, m.style, h.style, a),
          u & 8)
        ) {
          let e = n.dynamicProps;
          for (let t = 0; t < e.length; t++) {
            let n = e[t],
              i = m[n],
              o = h[n];
            (o !== i || n === `value`) && c(l, n, i, o, a, r);
          }
        }
        u & 1 && e.children !== n.children && p(l, n.children);
      } else !s && d == null && ie(l, m, h, r, a);
      ((g = h.onVnodeUpdated) || f) &&
        W(() => {
          (g && Q(g, r, n, e), f && gn(n, e, r, `updated`));
        }, i);
    },
    re = (e, t, n, r, i, a, o) => {
      for (let s = 0; s < t.length; s++) {
        let c = e[s],
          l = t[s];
        v(c, l, c.el && (c.type === G || !Ai(c, l) || c.shapeFlag & 198) ? m(c.el) : n, null, r, i, a, o, !0);
      }
    },
    ie = (e, n, r, i, a) => {
      if (n !== r) {
        if (n !== t) for (let t in n) !w(t) && !(t in r) && c(e, t, n[t], null, a, i);
        for (let t in r) {
          if (w(t)) continue;
          let o = r[t],
            s = n[t];
          o !== s && t !== `value` && c(e, t, s, o, a, i);
        }
        `value` in r && c(e, `value`, n.value, r.value, a);
      }
    },
    D = (e, t, n, r, i, a, s, c, l) => {
      let d = (t.el = e ? e.el : u(``)),
        f = (t.anchor = e ? e.anchor : u(``)),
        { patchFlag: p, dynamicChildren: m, slotScopeIds: h } = t;
      (h && (c = c ? c.concat(h) : h),
        e == null
          ? (o(d, n, r), o(f, n, r), ne(t.children || [], n, f, i, a, s, c, l))
          : p > 0 && p & 64 && m && e.dynamicChildren && e.dynamicChildren.length === m.length
            ? (re(e.dynamicChildren, m, n, i, a, s, c), (t.key != null || (i && t === i.subTree)) && pi(e, t, !0))
            : ue(e, t, n, f, i, a, s, c, l));
    },
    oe = (e, t, n, r, i, a, o, s, c) => {
      ((t.slotScopeIds = s),
        e == null ? (t.shapeFlag & 512 ? i.ctx.activate(t, n, r, o, c) : O(t, n, r, i, a, o, c)) : se(e, t, c));
    },
    O = (e, t, n, r, i, a, o) => {
      let s = (e.component = Wi(e, r, i));
      if ((Wn(e) && (s.ctx.renderer = ye), Qi(s, !1, o), s.asyncDep)) {
        if ((i && i.registerDep(s, k, o), !e.el)) {
          let r = (s.subTree = X(xi));
          (b(null, r, t, n), (e.placeholder = r.el));
        }
      } else k(s, e, t, n, i, a, o);
    },
    se = (e, t, n) => {
      let r = (t.component = e.component);
      if (Br(e, t, n))
        if (r.asyncDep && !r.asyncResolved) {
          le(r, t, n);
          return;
        } else ((r.next = t), r.update());
      else ((t.el = e.el), (r.vnode = t));
    },
    k = (e, t, n, r, i, a, o) => {
      let s = () => {
        if (e.isMounted) {
          let { next: t, bu: n, u: r, parent: c, vnode: l } = e;
          {
            let n = hi(e);
            if (n) {
              (t && ((t.el = l.el), le(e, t, o)),
                n.asyncDep.then(() => {
                  e.isUnmounted || s();
                }));
              return;
            }
          }
          let u = t,
            d;
          (di(e, !1),
            t ? ((t.el = l.el), le(e, t, o)) : (t = l),
            n && ae(n),
            (d = t.props && t.props.onVnodeBeforeUpdate) && Q(d, c, t, l),
            di(e, !0));
          let f = Lr(e),
            p = e.subTree;
          ((e.subTree = f),
            v(p, f, m(p.el), _e(p), e, i, a),
            (t.el = f.el),
            u === null && Hr(e, f.el),
            r && W(r, i),
            (d = t.props && t.props.onVnodeUpdated) && W(() => Q(d, c, t, l), i));
        } else {
          let o,
            { el: s, props: c } = t,
            { bm: l, m: u, parent: d, root: f, type: p } = e,
            m = Un(t);
          if ((di(e, !1), l && ae(l), !m && (o = c && c.onVnodeBeforeMount) && Q(o, d, t), di(e, !0), s && N)) {
            let t = () => {
              ((e.subTree = Lr(e)), N(s, e.subTree, e, i, null));
            };
            m && p.__asyncHydrate ? p.__asyncHydrate(s, e, t) : t();
          } else {
            f.ce && f.ce._def.shadowRoot !== !1 && f.ce._injectChildStyle(p);
            let o = (e.subTree = Lr(e));
            (v(null, o, n, r, e, i, a), (t.el = o.el));
          }
          if ((u && W(u, i), !m && (o = c && c.onVnodeMounted))) {
            let e = t;
            W(() => Q(o, d, e), i);
          }
          ((t.shapeFlag & 256 || (d && Un(d.vnode) && d.vnode.shapeFlag & 256)) && e.a && W(e.a, i),
            (e.isMounted = !0),
            (t = n = r = null));
        }
      };
      e.scope.on();
      let c = (e.effect = new Se(s));
      e.scope.off();
      let l = (e.update = c.run.bind(c)),
        u = (e.job = c.runIfDirty.bind(c));
      ((u.i = e), (u.id = e.uid), (c.scheduler = () => on(u)), di(e, !0), l());
    },
    le = (e, t, n) => {
      t.component = e;
      let r = e.vnode.props;
      ((e.vnode = t), (e.next = null), qr(e, t.props, r, n), oi(e, t.children, n), Ie(), ln(e), Le());
    },
    ue = (e, t, n, r, i, a, o, s, c = !1) => {
      let l = e && e.children,
        u = e ? e.shapeFlag : 0,
        d = t.children,
        { patchFlag: f, shapeFlag: m } = t;
      if (f > 0) {
        if (f & 128) {
          fe(l, d, n, r, i, a, o, s, c);
          return;
        } else if (f & 256) {
          de(l, d, n, r, i, a, o, s, c);
          return;
        }
      }
      m & 8
        ? (u & 16 && j(l, i, a), d !== l && p(n, d))
        : u & 16
          ? m & 16
            ? fe(l, d, n, r, i, a, o, s, c)
            : j(l, i, a, !0)
          : (u & 8 && p(n, ``), m & 16 && ne(d, n, r, i, a, o, s, c));
    },
    de = (e, t, r, i, a, o, s, c, l) => {
      ((e ||= n), (t ||= n));
      let u = e.length,
        d = t.length,
        f = Math.min(u, d),
        p;
      for (p = 0; p < f; p++) {
        let n = (t[p] = l ? zi(t[p]) : Z(t[p]));
        v(e[p], n, r, null, a, o, s, c, l);
      }
      u > d ? j(e, a, o, !0, !1, f) : ne(t, r, i, a, o, s, c, l, f);
    },
    fe = (e, t, r, i, a, o, s, c, l) => {
      let u = 0,
        d = t.length,
        f = e.length - 1,
        p = d - 1;
      for (; u <= f && u <= p; ) {
        let n = e[u],
          i = (t[u] = l ? zi(t[u]) : Z(t[u]));
        if (Ai(n, i)) v(n, i, r, null, a, o, s, c, l);
        else break;
        u++;
      }
      for (; u <= f && u <= p; ) {
        let n = e[f],
          i = (t[p] = l ? zi(t[p]) : Z(t[p]));
        if (Ai(n, i)) v(n, i, r, null, a, o, s, c, l);
        else break;
        (f--, p--);
      }
      if (u > f) {
        if (u <= p) {
          let e = p + 1,
            n = e < d ? t[e].el : i;
          for (; u <= p; ) (v(null, (t[u] = l ? zi(t[u]) : Z(t[u])), r, n, a, o, s, c, l), u++);
        }
      } else if (u > p) for (; u <= f; ) (pe(e[u], a, o, !0), u++);
      else {
        let m = u,
          h = u,
          g = new Map();
        for (u = h; u <= p; u++) {
          let e = (t[u] = l ? zi(t[u]) : Z(t[u]));
          e.key != null && g.set(e.key, u);
        }
        let _,
          y = 0,
          b = p - h + 1,
          x = !1,
          S = 0,
          C = Array(b);
        for (u = 0; u < b; u++) C[u] = 0;
        for (u = m; u <= f; u++) {
          let n = e[u];
          if (y >= b) {
            pe(n, a, o, !0);
            continue;
          }
          let i;
          if (n.key != null) i = g.get(n.key);
          else
            for (_ = h; _ <= p; _++)
              if (C[_ - h] === 0 && Ai(n, t[_])) {
                i = _;
                break;
              }
          i === void 0
            ? pe(n, a, o, !0)
            : ((C[i - h] = u + 1), i >= S ? (S = i) : (x = !0), v(n, t[i], r, null, a, o, s, c, l), y++);
        }
        let w = x ? mi(C) : n;
        for (_ = w.length - 1, u = b - 1; u >= 0; u--) {
          let e = h + u,
            n = t[e],
            f = t[e + 1],
            p = e + 1 < d ? f.el || _i(f) : i;
          C[u] === 0 ? v(null, n, r, p, a, o, s, c, l) : x && (_ < 0 || u !== w[_] ? A(n, r, p, 2) : _--);
        }
      }
    },
    A = (e, t, n, r, i = null) => {
      let { el: a, type: c, transition: l, children: u, shapeFlag: d } = e;
      if (d & 6) {
        A(e.component.subTree, t, n, r);
        return;
      }
      if (d & 128) {
        e.suspense.move(t, n, r);
        return;
      }
      if (d & 64) {
        c.move(e, t, n, ye);
        return;
      }
      if (c === G) {
        o(a, t, n);
        for (let e = 0; e < u.length; e++) A(u[e], t, n, r);
        o(e.anchor, t, n);
        return;
      }
      if (c === Si) {
        S(e, t, n);
        return;
      }
      if (r !== 2 && d & 1 && l)
        if (r === 0) (l.beforeEnter(a), o(a, t, n), W(() => l.enter(a), i));
        else {
          let { leave: r, delayLeave: i, afterLeave: c } = l,
            u = () => {
              e.ctx.isUnmounted ? s(a) : o(a, t, n);
            },
            d = () => {
              (a._isLeaving && a[Dn](!0),
                r(a, () => {
                  (u(), c && c());
                }));
            };
          i ? i(a, u, d) : d();
        }
      else o(a, t, n);
    },
    pe = (e, t, n, r = !1, i = !1) => {
      let {
        type: a,
        props: o,
        ref: s,
        children: c,
        dynamicChildren: l,
        shapeFlag: u,
        patchFlag: d,
        dirs: f,
        cacheIndex: p
      } = e;
      if (
        (d === -2 && (i = !1),
        s != null && (Ie(), jn(s, null, n, e, !0), Le()),
        p != null && (t.renderCache[p] = void 0),
        u & 256)
      ) {
        t.ctx.deactivate(e);
        return;
      }
      let m = u & 1 && f,
        h = !Un(e),
        g;
      if ((h && (g = o && o.onVnodeBeforeUnmount) && Q(g, t, e), u & 6)) ge(e.component, n, r);
      else {
        if (u & 128) {
          e.suspense.unmount(n, r);
          return;
        }
        (m && gn(e, null, t, `beforeUnmount`),
          u & 64
            ? e.type.remove(e, t, n, ye, r)
            : l && !l.hasOnce && (a !== G || (d > 0 && d & 64))
              ? j(l, t, n, !1, !0)
              : ((a === G && d & 384) || (!i && u & 16)) && j(c, t, n),
          r && me(e));
      }
      ((h && (g = o && o.onVnodeUnmounted)) || m) &&
        W(() => {
          (g && Q(g, t, e), m && gn(e, null, t, `unmounted`));
        }, n);
    },
    me = (e) => {
      let { type: t, el: n, anchor: r, transition: i } = e;
      if (t === G) {
        he(n, r);
        return;
      }
      if (t === Si) {
        C(e);
        return;
      }
      let a = () => {
        (s(n), i && !i.persisted && i.afterLeave && i.afterLeave());
      };
      if (e.shapeFlag & 1 && i && !i.persisted) {
        let { leave: t, delayLeave: r } = i,
          o = () => t(n, a);
        r ? r(e.el, a, o) : o();
      } else a();
    },
    he = (e, t) => {
      let n;
      for (; e !== t; ) ((n = h(e)), s(e), (e = n));
      s(t);
    },
    ge = (e, t, n) => {
      let { bum: r, scope: i, job: a, subTree: o, um: s, m: c, a: l } = e;
      (gi(c),
        gi(l),
        r && ae(r),
        i.stop(),
        a && ((a.flags |= 8), pe(o, e, t, n)),
        s && W(s, t),
        W(() => {
          e.isUnmounted = !0;
        }, t));
    },
    j = (e, t, n, r = !1, i = !1, a = 0) => {
      for (let o = a; o < e.length; o++) pe(e[o], t, n, r, i);
    },
    _e = (e) => {
      if (e.shapeFlag & 6) return _e(e.component.subTree);
      if (e.shapeFlag & 128) return e.suspense.next();
      let t = h(e.anchor || e.el),
        n = t && t[Tn];
      return n ? h(n) : t;
    },
    ve = !1,
    M = (e, t, n) => {
      let r;
      (e == null
        ? t._vnode && (pe(t._vnode, null, null, !0), (r = t._vnode.component))
        : v(t._vnode || null, e, t, null, null, null, n),
        (t._vnode = e),
        (ve ||= ((ve = !0), ln(r), un(), !1)));
    },
    ye = { p: v, um: pe, m: A, r: me, mt: O, mc: ne, pc: ue, pbc: re, n: _e, o: e },
    be,
    N;
  return (i && ([be, N] = i(ye)), { render: M, hydrate: be, createApp: Ar(M, be) });
}
function ui({ type: e, props: t }, n) {
  return (n === `svg` && e === `foreignObject`) ||
    (n === `mathml` && e === `annotation-xml` && t && t.encoding && t.encoding.includes(`html`))
    ? void 0
    : n;
}
function di({ effect: e, job: t }, n) {
  n ? ((e.flags |= 32), (t.flags |= 4)) : ((e.flags &= -33), (t.flags &= -5));
}
function fi(e, t) {
  return (!e || (e && !e.pendingBranch)) && t && !t.persisted;
}
function pi(e, t, n = !1) {
  let r = e.children,
    i = t.children;
  if (d(r) && d(i))
    for (let t = 0; t < r.length; t++) {
      let a = r[t],
        o = i[t];
      (o.shapeFlag & 1 &&
        !o.dynamicChildren &&
        ((o.patchFlag <= 0 || o.patchFlag === 32) && ((o = i[t] = zi(i[t])), (o.el = a.el)),
        !n && o.patchFlag !== -2 && pi(a, o)),
        o.type === bi && (o.patchFlag === -1 ? (o.__elIndex = t + (e.type === G ? 1 : 0)) : (o.el = a.el)),
        o.type === xi && !o.el && (o.el = a.el));
    }
}
function mi(e) {
  let t = e.slice(),
    n = [0],
    r,
    i,
    a,
    o,
    s,
    c = e.length;
  for (r = 0; r < c; r++) {
    let c = e[r];
    if (c !== 0) {
      if (((i = n[n.length - 1]), e[i] < c)) {
        ((t[r] = i), n.push(r));
        continue;
      }
      for (a = 0, o = n.length - 1; a < o; ) ((s = (a + o) >> 1), e[n[s]] < c ? (a = s + 1) : (o = s));
      c < e[n[a]] && (a > 0 && (t[r] = n[a - 1]), (n[a] = r));
    }
  }
  for (a = n.length, o = n[a - 1]; a-- > 0; ) ((n[a] = o), (o = t[o]));
  return n;
}
function hi(e) {
  let t = e.subTree.component;
  if (t) return t.asyncDep && !t.asyncResolved ? t : hi(t);
}
function gi(e) {
  if (e) for (let t = 0; t < e.length; t++) e[t].flags |= 8;
}
function _i(e) {
  if (e.placeholder) return e.placeholder;
  let t = e.component;
  return t ? _i(t.subTree) : null;
}
var vi = (e) => e.__isSuspense;
function yi(e, t) {
  t && t.pendingBranch ? (d(e) ? t.effects.push(...e) : t.effects.push(e)) : cn(e);
}
var G = Symbol.for(`v-fgt`),
  bi = Symbol.for(`v-txt`),
  xi = Symbol.for(`v-cmt`),
  Si = Symbol.for(`v-stc`),
  Ci = [],
  K = null;
function q(e = !1) {
  Ci.push((K = e ? null : []));
}
function wi() {
  (Ci.pop(), (K = Ci[Ci.length - 1] || null));
}
var Ti = 1;
function Ei(e, t = !1) {
  ((Ti += e), e < 0 && K && t && (K.hasOnce = !0));
}
function Di(e) {
  return ((e.dynamicChildren = Ti > 0 ? K || n : null), wi(), Ti > 0 && K && K.push(e), e);
}
function J(e, t, n, r, i, a) {
  return Di(Y(e, t, n, r, i, a, !0));
}
function Oi(e, t, n, r, i) {
  return Di(X(e, t, n, r, i, !0));
}
function ki(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function Ai(e, t) {
  return e.type === t.type && e.key === t.key;
}
var ji = ({ key: e }) => e ?? null,
  Mi = ({ ref: e, ref_key: t, ref_for: n }) => (
    typeof e == `number` && (e = `` + e), e == null ? null : h(e) || R(e) || m(e) ? { i: H, r: e, k: t, f: !!n } : e
  );
function Y(e, t = null, n = null, r = 0, i = null, a = e === G ? 0 : 1, o = !1, s = !1) {
  let c = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && ji(t),
    ref: t && Mi(t),
    scopeId: pn,
    slotScopeIds: null,
    children: n,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetStart: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag: a,
    patchFlag: r,
    dynamicProps: i,
    dynamicChildren: null,
    appContext: null,
    ctx: H
  };
  return (
    s ? (Bi(c, n), a & 128 && e.normalize(c)) : n && (c.shapeFlag |= h(n) ? 8 : 16),
    Ti > 0 && !o && K && (c.patchFlag > 0 || a & 6) && c.patchFlag !== 32 && K.push(c),
    c
  );
}
var X = Ni;
function Ni(e, t = null, n = null, r = 0, i = null, a = !1) {
  if (((!e || e === sr) && (e = xi), ki(e))) {
    let r = Fi(e, t, !0);
    return (
      n && Bi(r, n), Ti > 0 && !a && K && (r.shapeFlag & 6 ? (K[K.indexOf(e)] = r) : K.push(r)), (r.patchFlag = -2), r
    );
  }
  if ((sa(e) && (e = e.__vccOpts), t)) {
    t = Pi(t);
    let { class: e, style: n } = t;
    (e && !h(e) && (t.class = A(e)), _(n) && (Pt(n) && !d(n) && (n = s({}, n)), (t.style = k(n))));
  }
  let o = h(e) ? 1 : vi(e) ? 128 : En(e) ? 64 : _(e) ? 4 : m(e) ? 2 : 0;
  return Y(e, t, n, r, i, o, a, !0);
}
function Pi(e) {
  return e ? (Pt(e) || Gr(e) ? s({}, e) : e) : null;
}
function Fi(e, t, n = !1, r = !1) {
  let { props: i, ref: a, patchFlag: o, children: s, transition: c } = e,
    l = t ? Vi(i || {}, t) : i,
    u = {
      __v_isVNode: !0,
      __v_skip: !0,
      type: e.type,
      props: l,
      key: l && ji(l),
      ref: t && t.ref ? (n && a ? (d(a) ? a.concat(Mi(t)) : [a, Mi(t)]) : Mi(t)) : a,
      scopeId: e.scopeId,
      slotScopeIds: e.slotScopeIds,
      children: s,
      target: e.target,
      targetStart: e.targetStart,
      targetAnchor: e.targetAnchor,
      staticCount: e.staticCount,
      shapeFlag: e.shapeFlag,
      patchFlag: t && e.type !== G ? (o === -1 ? 16 : o | 16) : o,
      dynamicProps: e.dynamicProps,
      dynamicChildren: e.dynamicChildren,
      appContext: e.appContext,
      dirs: e.dirs,
      transition: c,
      component: e.component,
      suspense: e.suspense,
      ssContent: e.ssContent && Fi(e.ssContent),
      ssFallback: e.ssFallback && Fi(e.ssFallback),
      placeholder: e.placeholder,
      el: e.el,
      anchor: e.anchor,
      ctx: e.ctx,
      ce: e.ce
    };
  return (c && r && On(u, c.clone(u)), u);
}
function Ii(e = ` `, t = 0) {
  return X(bi, null, e, t);
}
function Li(e, t) {
  let n = X(Si, null, e);
  return ((n.staticCount = t), n);
}
function Ri(e = ``, t = !1) {
  return t ? (q(), Oi(xi, null, e)) : X(xi, null, e);
}
function Z(e) {
  return e == null || typeof e == `boolean`
    ? X(xi)
    : d(e)
      ? X(G, null, e.slice())
      : ki(e)
        ? zi(e)
        : X(bi, null, String(e));
}
function zi(e) {
  return (e.el === null && e.patchFlag !== -1) || e.memo ? e : Fi(e);
}
function Bi(e, t) {
  let n = 0,
    { shapeFlag: r } = e;
  if (t == null) t = null;
  else if (d(t)) n = 16;
  else if (typeof t == `object`)
    if (r & 65) {
      let n = t.default;
      n && (n._c && (n._d = !1), Bi(e, n()), n._c && (n._d = !0));
      return;
    } else {
      n = 32;
      let r = t._;
      !r && !Gr(t) ? (t._ctx = H) : r === 3 && H && (H.slots._ === 1 ? (t._ = 1) : ((t._ = 2), (e.patchFlag |= 1024)));
    }
  else
    m(t) ? ((t = { default: t, _ctx: H }), (n = 32)) : ((t = String(t)), r & 64 ? ((n = 16), (t = [Ii(t)])) : (n = 8));
  ((e.children = t), (e.shapeFlag |= n));
}
function Vi(...e) {
  let t = {};
  for (let n = 0; n < e.length; n++) {
    let r = e[n];
    for (let e in r)
      if (e === `class`) t.class !== r.class && (t.class = A([t.class, r.class]));
      else if (e === `style`) t.style = k([t.style, r.style]);
      else if (a(e)) {
        let n = t[e],
          i = r[e];
        i && n !== i && !(d(n) && n.includes(i)) && (t[e] = n ? [].concat(n, i) : i);
      } else e !== `` && (t[e] = r[e]);
  }
  return t;
}
function Q(e, t, n, r = null) {
  z(e, t, 7, [n, r]);
}
var Hi = Or(),
  Ui = 0;
function Wi(e, n, r) {
  let i = e.type,
    a = (n ? n.appContext : e.appContext) || Hi,
    o = {
      uid: Ui++,
      vnode: e,
      type: i,
      parent: n,
      appContext: a,
      root: null,
      next: null,
      subTree: null,
      effect: null,
      update: null,
      job: null,
      scope: new ye(!0),
      render: null,
      proxy: null,
      exposed: null,
      exposeProxy: null,
      withProxy: null,
      provides: n ? n.provides : Object.create(a.provides),
      ids: n ? n.ids : [``, 0, 0],
      accessCache: null,
      renderCache: [],
      components: null,
      directives: null,
      propsOptions: Zr(i, a),
      emitsOptions: Fr(i, a),
      emit: null,
      emitted: null,
      propsDefaults: t,
      inheritAttrs: i.inheritAttrs,
      ctx: t,
      data: t,
      props: t,
      attrs: t,
      slots: t,
      refs: t,
      setupState: t,
      setupContext: null,
      suspense: r,
      suspenseId: r ? r.pendingId : 0,
      asyncDep: null,
      asyncResolved: !1,
      isMounted: !1,
      isUnmounted: !1,
      isDeactivated: !1,
      bc: null,
      c: null,
      bm: null,
      m: null,
      bu: null,
      u: null,
      um: null,
      bum: null,
      da: null,
      a: null,
      rtg: null,
      rtc: null,
      ec: null,
      sp: null
    };
  return ((o.ctx = { _: o }), (o.root = n ? n.root : o), (o.emit = Nr.bind(null, o)), e.ce && e.ce(o), o);
}
var $ = null,
  Gi = () => $ || H,
  Ki,
  qi;
{
  let e = ce(),
    t = (t, n) => {
      let r;
      return (
        (r = e[t]) || (r = e[t] = []),
        r.push(n),
        (e) => {
          r.length > 1 ? r.forEach((t) => t(e)) : r[0](e);
        }
      );
    };
  ((Ki = t(`__VUE_INSTANCE_SETTERS__`, (e) => ($ = e))), (qi = t(`__VUE_SSR_SETTERS__`, (e) => (Zi = e))));
}
var Ji = (e) => {
    let t = $;
    return (
      Ki(e),
      e.scope.on(),
      () => {
        (e.scope.off(), Ki(t));
      }
    );
  },
  Yi = () => {
    ($ && $.scope.off(), Ki(null));
  };
function Xi(e) {
  return e.vnode.shapeFlag & 4;
}
var Zi = !1;
function Qi(e, t = !1, n = !1) {
  t && qi(t);
  let { props: r, children: i } = e.vnode,
    a = Xi(e);
  (Kr(e, r, a, t), ai(e, i, n || t));
  let o = a ? $i(e, t) : void 0;
  return (t && qi(!1), o);
}
function $i(e, t) {
  let n = e.type;
  ((e.accessCache = Object.create(null)), (e.proxy = new Proxy(e.ctx, fr)));
  let { setup: r } = n;
  if (r) {
    Ie();
    let n = (e.setupContext = r.length > 1 ? aa(e) : null),
      i = Ji(e),
      a = Yt(r, e, 0, [e.props, n]),
      o = v(a);
    if ((Le(), i(), (o || e.sp) && !Un(e) && kn(e), o)) {
      if ((a.then(Yi, Yi), t))
        return a
          .then((n) => {
            ea(e, n, t);
          })
          .catch((t) => {
            Xt(t, e, 0);
          });
      e.asyncDep = a;
    } else ea(e, a, t);
  } else ra(e, t);
}
function ea(e, t, n) {
  (m(t) ? (e.type.__ssrInlineRender ? (e.ssrRender = t) : (e.render = t)) : _(t) && (e.setupState = Bt(t)), ra(e, n));
}
var ta, na;
function ra(e, t, n) {
  let i = e.type;
  if (!e.render) {
    if (!t && ta && !i.render) {
      let t = i.template || yr(e).template;
      if (t) {
        let { isCustomElement: n, compilerOptions: r } = e.appContext.config,
          { delimiters: a, compilerOptions: o } = i;
        i.render = ta(t, s(s({ isCustomElement: n, delimiters: a }, r), o));
      }
    }
    ((e.render = i.render || r), na && na(e));
  }
  {
    let t = Ji(e);
    Ie();
    try {
      hr(e);
    } finally {
      (Le(), t());
    }
  }
}
var ia = {
  get(e, t) {
    return (F(e, `get`, ``), e[t]);
  }
};
function aa(e) {
  return {
    attrs: new Proxy(e.attrs, ia),
    slots: e.slots,
    emit: e.emit,
    expose: (t) => {
      e.exposed = t || {};
    }
  };
}
function oa(e) {
  return e.exposed
    ? (e.exposeProxy ||= new Proxy(Bt(Ft(e.exposed)), {
        get(t, n) {
          if (n in t) return t[n];
          if (n in ur) return ur[n](e);
        },
        has(e, t) {
          return t in e || t in ur;
        }
      }))
    : e.proxy;
}
function sa(e) {
  return m(e) && `__vccOpts` in e;
}
var ca = (e, t) => Ht(e, t, Zi),
  la = `3.5.27`,
  ua = void 0,
  da = typeof window < `u` && window.trustedTypes;
if (da)
  try {
    ua = da.createPolicy(`vue`, { createHTML: (e) => e });
  } catch {}
var fa = ua ? (e) => ua.createHTML(e) : (e) => e,
  pa = `http://www.w3.org/2000/svg`,
  ma = `http://www.w3.org/1998/Math/MathML`,
  ha = typeof document < `u` ? document : null,
  ga = ha && ha.createElement(`template`),
  _a = {
    insert: (e, t, n) => {
      t.insertBefore(e, n || null);
    },
    remove: (e) => {
      let t = e.parentNode;
      t && t.removeChild(e);
    },
    createElement: (e, t, n, r) => {
      let i =
        t === `svg`
          ? ha.createElementNS(pa, e)
          : t === `mathml`
            ? ha.createElementNS(ma, e)
            : n
              ? ha.createElement(e, { is: n })
              : ha.createElement(e);
      return (e === `select` && r && r.multiple != null && i.setAttribute(`multiple`, r.multiple), i);
    },
    createText: (e) => ha.createTextNode(e),
    createComment: (e) => ha.createComment(e),
    setText: (e, t) => {
      e.nodeValue = t;
    },
    setElementText: (e, t) => {
      e.textContent = t;
    },
    parentNode: (e) => e.parentNode,
    nextSibling: (e) => e.nextSibling,
    querySelector: (e) => ha.querySelector(e),
    setScopeId(e, t) {
      e.setAttribute(t, ``);
    },
    insertStaticContent(e, t, n, r, i, a) {
      let o = n ? n.previousSibling : t.lastChild;
      if (i && (i === a || i.nextSibling))
        for (; t.insertBefore(i.cloneNode(!0), n), !(i === a || !(i = i.nextSibling)); );
      else {
        ga.innerHTML = fa(r === `svg` ? `<svg>${e}</svg>` : r === `mathml` ? `<math>${e}</math>` : e);
        let i = ga.content;
        if (r === `svg` || r === `mathml`) {
          let e = i.firstChild;
          for (; e.firstChild; ) i.appendChild(e.firstChild);
          i.removeChild(e);
        }
        t.insertBefore(i, n);
      }
      return [o ? o.nextSibling : t.firstChild, n ? n.previousSibling : t.lastChild];
    }
  },
  va = Symbol(`_vtc`);
function ya(e, t, n) {
  let r = e[va];
  (r && (t = (t ? [t, ...r] : [...r]).join(` `)),
    t == null ? e.removeAttribute(`class`) : n ? e.setAttribute(`class`, t) : (e.className = t));
}
var ba = Symbol(`_vod`),
  xa = Symbol(`_vsh`),
  Sa = Symbol(``),
  Ca = /(?:^|;)\s*display\s*:/;
function wa(e, t, n) {
  let r = e.style,
    i = h(n),
    a = !1;
  if (n && !i) {
    if (t)
      if (h(t))
        for (let e of t.split(`;`)) {
          let t = e.slice(0, e.indexOf(`:`)).trim();
          n[t] ?? Ea(r, t, ``);
        }
      else for (let e in t) n[e] ?? Ea(r, e, ``);
    for (let e in n) (e === `display` && (a = !0), Ea(r, e, n[e]));
  } else if (i) {
    if (t !== n) {
      let e = r[Sa];
      (e && (n += `;` + e), (r.cssText = n), (a = Ca.test(n)));
    }
  } else t && e.removeAttribute(`style`);
  ba in e && ((e[ba] = a ? r.display : ``), e[xa] && (r.display = `none`));
}
var Ta = /\s*!important$/;
function Ea(e, t, n) {
  if (d(n)) n.forEach((n) => Ea(e, t, n));
  else if (((n ??= ``), t.startsWith(`--`))) e.setProperty(t, n);
  else {
    let r = ka(e, t);
    Ta.test(n) ? e.setProperty(E(r), n.replace(Ta, ``), `important`) : (e[r] = n);
  }
}
var Da = [`Webkit`, `Moz`, `ms`],
  Oa = {};
function ka(e, t) {
  let n = Oa[t];
  if (n) return n;
  let r = T(t);
  if (r !== `filter` && r in e) return (Oa[t] = r);
  r = re(r);
  for (let n = 0; n < Da.length; n++) {
    let i = Da[n] + r;
    if (i in e) return (Oa[t] = i);
  }
  return t;
}
var Aa = `http://www.w3.org/1999/xlink`;
function ja(e, t, n, r, i, a = me(t)) {
  r && t.startsWith(`xlink:`)
    ? n == null
      ? e.removeAttributeNS(Aa, t.slice(6, t.length))
      : e.setAttributeNS(Aa, t, n)
    : n == null || (a && !he(n))
      ? e.removeAttribute(t)
      : e.setAttribute(t, a ? `` : g(n) ? String(n) : n);
}
function Ma(e, t, n, r, i) {
  if (t === `innerHTML` || t === `textContent`) {
    n != null && (e[t] = t === `innerHTML` ? fa(n) : n);
    return;
  }
  let a = e.tagName;
  if (t === `value` && a !== `PROGRESS` && !a.includes(`-`)) {
    let r = a === `OPTION` ? e.getAttribute(`value`) || `` : e.value,
      i = n == null ? (e.type === `checkbox` ? `on` : ``) : String(n);
    ((r !== i || !(`_value` in e)) && (e.value = i), n ?? e.removeAttribute(t), (e._value = n));
    return;
  }
  let o = !1;
  if (n === `` || n == null) {
    let r = typeof e[t];
    r === `boolean`
      ? (n = he(n))
      : n == null && r === `string`
        ? ((n = ``), (o = !0))
        : r === `number` && ((n = 0), (o = !0));
  }
  try {
    e[t] = n;
  } catch {}
  o && e.removeAttribute(i || t);
}
function Na(e, t, n, r) {
  e.addEventListener(t, n, r);
}
function Pa(e, t, n, r) {
  e.removeEventListener(t, n, r);
}
var Fa = Symbol(`_vei`);
function Ia(e, t, n, r, i = null) {
  let a = e[Fa] || (e[Fa] = {}),
    o = a[t];
  if (r && o) o.value = r;
  else {
    let [n, s] = Ra(t);
    r ? Na(e, n, (a[t] = Ha(r, i)), s) : o && (Pa(e, n, o, s), (a[t] = void 0));
  }
}
var La = /(?:Once|Passive|Capture)$/;
function Ra(e) {
  let t;
  if (La.test(e)) {
    t = {};
    let n;
    for (; (n = e.match(La)); ) ((e = e.slice(0, e.length - n[0].length)), (t[n[0].toLowerCase()] = !0));
  }
  return [e[2] === `:` ? e.slice(3) : E(e.slice(2)), t];
}
var za = 0,
  Ba = Promise.resolve(),
  Va = () => (za ||= (Ba.then(() => (za = 0)), Date.now()));
function Ha(e, t) {
  let n = (e) => {
    if (!e._vts) e._vts = Date.now();
    else if (e._vts <= n.attached) return;
    z(Ua(e, n.value), t, 5, [e]);
  };
  return ((n.value = e), (n.attached = Va()), n);
}
function Ua(e, t) {
  if (d(t)) {
    let n = e.stopImmediatePropagation;
    return (
      (e.stopImmediatePropagation = () => {
        (n.call(e), (e._stopped = !0));
      }),
      t.map((e) => (t) => !t._stopped && e && e(t))
    );
  } else return t;
}
var Wa = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123,
  Ga = (e, t, n, r, i, s) => {
    let c = i === `svg`;
    t === `class`
      ? ya(e, r, c)
      : t === `style`
        ? wa(e, n, r)
        : a(t)
          ? o(t) || Ia(e, t, n, r, s)
          : (t[0] === `.` ? ((t = t.slice(1)), !0) : t[0] === `^` ? ((t = t.slice(1)), !1) : Ka(e, t, r, c))
            ? (Ma(e, t, r),
              !e.tagName.includes(`-`) &&
                (t === `value` || t === `checked` || t === `selected`) &&
                ja(e, t, r, c, s, t !== `value`))
            : e._isVueCE && (/[A-Z]/.test(t) || !h(r))
              ? Ma(e, T(t), r, s, t)
              : (t === `true-value` ? (e._trueValue = r) : t === `false-value` && (e._falseValue = r), ja(e, t, r, c));
  };
function Ka(e, t, n, r) {
  if (r) return !!(t === `innerHTML` || t === `textContent` || (t in e && Wa(t) && m(n)));
  if (
    t === `spellcheck` ||
    t === `draggable` ||
    t === `translate` ||
    t === `autocorrect` ||
    (t === `sandbox` && e.tagName === `IFRAME`) ||
    t === `form` ||
    (t === `list` && e.tagName === `INPUT`) ||
    (t === `type` && e.tagName === `TEXTAREA`)
  )
    return !1;
  if (t === `width` || t === `height`) {
    let t = e.tagName;
    if (t === `IMG` || t === `VIDEO` || t === `CANVAS` || t === `SOURCE`) return !1;
  }
  return Wa(t) && h(n) ? !1 : t in e;
}
var qa = s({ patchProp: Ga }, _a),
  Ja,
  Ya = !1;
function Xa() {
  return (Ja ||= si(qa));
}
function Za() {
  return ((Ja = Ya ? Ja : ci(qa)), (Ya = !0), Ja);
}
var Qa = (...e) => {
    let t = Xa().createApp(...e),
      { mount: n } = t;
    return (
      (t.mount = (e) => {
        let r = to(e);
        if (!r) return;
        let i = t._component;
        (!m(i) && !i.render && !i.template && (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = ``));
        let a = n(r, !1, eo(r));
        return (r instanceof Element && (r.removeAttribute(`v-cloak`), r.setAttribute(`data-v-app`, ``)), a);
      }),
      t
    );
  },
  $a = (...e) => {
    let t = Za().createApp(...e),
      { mount: n } = t;
    return (
      (t.mount = (e) => {
        let t = to(e);
        if (t) return n(t, !0, eo(t));
      }),
      t
    );
  };
function eo(e) {
  if (e instanceof SVGElement) return `svg`;
  if (typeof MathMLElement == `function` && e instanceof MathMLElement) return `mathml`;
}
function to(e) {
  return h(e) ? document.querySelector(e) : e;
}
var no = { key: 0, class: `main-weather` },
  ro = { class: `location` },
  io = { key: 0, class: `update-time` },
  ao = { class: `current-temp` },
  oo = { class: `temp-display` },
  so = { class: `weather-desc` },
  co = { class: `temp-range` },
  lo = { key: 1, class: `loading-state` },
  uo = { key: 2, class: `weather-alerts` },
  fo = { class: `alert-header` },
  po = { class: `alert-title` },
  mo = { class: `alert-time` },
  ho = { class: `alert-description` },
  go = { key: 3, class: `compact-row` },
  _o = { key: 0, class: `glass-card air-quality-compact` },
  vo = { class: `card-header-compact` },
  yo = { class: `aqi-category` },
  bo = { key: 0, class: `pollutants-compact` },
  xo = { class: `pollutant-mini` },
  So = { class: `pollutant-mini` },
  Co = { class: `pollutant-mini` },
  wo = { class: `glass-card quick-info` },
  To = { class: `quick-item` },
  Eo = { class: `quick-data` },
  Do = { class: `quick-item` },
  Oo = { class: `quick-data` },
  ko = { class: `quick-item` },
  Ao = { class: `quick-data` },
  jo = { class: `quick-item` },
  Mo = { class: `quick-data` },
  No = { key: 4, class: `glass-card hourly-forecast` },
  Po = { class: `hourly-scroll` },
  Fo = { class: `hour-time` },
  Io = { class: `hour-temp` },
  Lo = { key: 5, class: `glass-card daily-forecast` },
  Ro = { class: `daily-list` },
  zo = { class: `day-info` },
  Bo = { class: `day-name` },
  Vo = { class: `day-date` },
  Ho = { class: `day-weather` },
  Uo = { class: `day-icons` },
  Wo = { class: `day-description` },
  Go = { class: `day-night-text` },
  Ko = { class: `temp-bar` },
  qo = { class: `temp-min` },
  Jo = { class: `temp-max` },
  Yo = { key: 6, class: `compact-row` },
  Xo = { class: `glass-card detail-group` },
  Zo = { class: `detail-compact` },
  Qo = { class: `detail-mini` },
  $o = { class: `detail-mini` },
  es = { class: `detail-mini` },
  ts = { class: `detail-icon` },
  ns = { class: `glass-card detail-group` },
  rs = { class: `detail-compact` },
  is = { class: `detail-mini` },
  as = { class: `detail-mini` },
  os = { class: `detail-mini` },
  ss = { key: 7, class: `glass-card air-pollutants` },
  cs = { class: `pollutants-grid-detailed` },
  ls = { class: `pollutant-detail` },
  us = { class: `pollutant-value` },
  ds = { class: `pollutant-bar` },
  fs = { class: `pollutant-detail` },
  ps = { class: `pollutant-value` },
  ms = { class: `pollutant-bar` },
  hs = { class: `pollutant-detail` },
  gs = { class: `pollutant-value` },
  _s = { class: `pollutant-bar` },
  vs = { class: `pollutant-detail` },
  ys = { class: `pollutant-value` },
  bs = { class: `pollutant-bar` },
  xs = { class: `pollutant-detail` },
  Ss = { class: `pollutant-value` },
  Cs = { class: `pollutant-bar` },
  ws = { class: `pollutant-detail` },
  Ts = { class: `pollutant-value` },
  Es = { class: `pollutant-bar` },
  Ds = {
    __name: `App`,
    props: {
      theme: { type: String, default: `light` },
      city: { type: String, default: `` },
      now: { type: Object, default: () => null },
      days: { type: Array, default: () => [] },
      hours: { type: Array, default: () => [] },
      warning: { type: Object, default: () => null },
      airQualityData: { type: Object, default: () => null },
      airPollutantData: { type: Object, default: () => null }
    },
    setup(e) {
      return (t, n) => (
        q(),
        J(
          `div`,
          { class: A(`theme-${e.theme} weather-container`) },
          [
            e.now && e.days && e.days[0]
              ? (q(),
                J(`div`, no, [
                  Y(`div`, ro, [
                    Y(`h1`, null, j(e.city), 1),
                    e.now.obsTime
                      ? (q(), J(`p`, io, j(e.now.obsTime.split(`T`)[1].substring(0, 5)) + ` 更新`, 1))
                      : Ri(``, !0)
                  ]),
                  Y(`div`, ao, [
                    Y(`div`, oo, j(e.now.temp) + `°`, 1),
                    Y(`div`, so, [
                      Y(`em`, { class: A(`qi-${e.now.icon} weather-icon-large`) }, null, 2),
                      Y(`span`, null, j(e.now.text), 1)
                    ])
                  ]),
                  Y(`div`, co, [
                    Y(`span`, null, `最高 ` + j(e.days[0].tempMax) + `°`, 1),
                    (n[0] ||= Y(`span`, { class: `separator` }, `|`, -1)),
                    Y(`span`, null, `最低 ` + j(e.days[0].tempMin) + `°`, 1)
                  ])
                ]))
              : (q(), J(`div`, lo, [...(n[1] ||= [Y(`p`, null, `加载天气数据中...`, -1)])])),
            e.warning && e.warning.alerts && e.warning.alerts.length > 0
              ? (q(),
                J(`div`, uo, [
                  (q(!0),
                  J(
                    G,
                    null,
                    cr(
                      e.warning.alerts,
                      (e) => (
                        q(),
                        J(`div`, { key: e.headline, class: `alert-card` }, [
                          Y(`div`, fo, [
                            Y(`em`, { class: A(`qi-${e.icon} alert-icon`) }, null, 2),
                            Y(`div`, po, [Y(`h3`, null, j(e.headline), 1), Y(`p`, mo, j(e.issuedTime), 1)])
                          ]),
                          Y(`p`, ho, j(e.description), 1)
                        ])
                      )
                    ),
                    128
                  ))
                ]))
              : Ri(``, !0),
            e.now
              ? (q(),
                J(`div`, go, [
                  e.airQualityData
                    ? (q(),
                      J(`div`, _o, [
                        Y(`div`, vo, [
                          (n[2] ||= Y(`h2`, null, `空气质量`, -1)),
                          Y(
                            `div`,
                            { class: `aqi-badge`, style: k({ backgroundColor: e.airQualityData.air_color }) },
                            j(e.airQualityData.aqi),
                            5
                          )
                        ]),
                        Y(`div`, yo, j(e.airQualityData.category), 1),
                        e.airPollutantData
                          ? (q(),
                            J(`div`, bo, [
                              Y(`div`, xo, [
                                (n[3] ||= Y(`span`, null, `PM2.5`, -1)),
                                Y(
                                  `strong`,
                                  null,
                                  j(e.airPollutantData.pm2p5 === void 0 ? `-` : e.airPollutantData.pm2p5),
                                  1
                                )
                              ]),
                              Y(`div`, So, [
                                (n[4] ||= Y(`span`, null, `PM10`, -1)),
                                Y(
                                  `strong`,
                                  null,
                                  j(e.airPollutantData.pm10 === void 0 ? `-` : e.airPollutantData.pm10),
                                  1
                                )
                              ]),
                              Y(`div`, Co, [
                                (n[5] ||= Y(`span`, null, `O₃`, -1)),
                                Y(`strong`, null, j(e.airPollutantData.o3 === void 0 ? `-` : e.airPollutantData.o3), 1)
                              ])
                            ]))
                          : Ri(``, !0)
                      ]))
                    : Ri(``, !0),
                  Y(`div`, wo, [
                    Y(`div`, To, [
                      (n[6] ||= Y(
                        `svg`,
                        {
                          class: `quick-icon`,
                          xmlns: `http://www.w3.org/2000/svg`,
                          "xmlns:xlink": `http://www.w3.org/1999/xlink`,
                          viewBox: `0 0 32 32`
                        },
                        [
                          Y(`path`, {
                            d: `M29.316 8.051l-18-6a1 1 0 0 0-.916.149L4 7V2H2v28h2V11l6.4 4.8a1 1 0 0 0 .916.149l18-6a1 1 0 0 0 0-1.897zM10 13L4.667 9L10 5zm4-.054l-2 .667V4.387l2 .667zm4-1.333l-2 .666V5.721l2 .666zm2-.667V7.054L25.838 9z`,
                            fill: `currentColor`
                          }),
                          Y(`path`, {
                            d: `M20 22a4 4 0 0 0-8 0h2a2 2 0 1 1 2 2H8v2h8a4.005 4.005 0 0 0 4-4z`,
                            fill: `currentColor`
                          }),
                          Y(`path`, {
                            d: `M26 22a4.005 4.005 0 0 0-4 4h2a2 2 0 1 1 2 2H12v2h14a4 4 0 0 0 0-8z`,
                            fill: `currentColor`
                          })
                        ],
                        -1
                      )),
                      Y(`div`, Eo, [
                        Y(`strong`, null, j(e.now.windSpeed || 0) + ` km/h`, 1),
                        Y(`span`, null, j(e.now.windDir || `-`), 1)
                      ])
                    ]),
                    Y(`div`, Do, [
                      (n[8] ||= Y(
                        `svg`,
                        {
                          class: `quick-icon`,
                          xmlns: `http://www.w3.org/2000/svg`,
                          "xmlns:xlink": `http://www.w3.org/1999/xlink`,
                          viewBox: `0 0 32 32`
                        },
                        [
                          Y(`path`, {
                            d: `M23.476 13.993L16.847 3.437a1.04 1.04 0 0 0-1.694 0L8.494 14.043A9.986 9.986 0 0 0 7 19a9 9 0 0 0 18 0a10.063 10.063 0 0 0-1.524-5.007zM16 26a7.009 7.009 0 0 1-7-7a7.978 7.978 0 0 1 1.218-3.943l.935-1.49l10.074 10.074A6.977 6.977 0 0 1 16 26.001z`,
                            fill: `currentColor`
                          })
                        ],
                        -1
                      )),
                      Y(`div`, Oo, [
                        Y(`strong`, null, j(e.now.humidity || 0) + `%`, 1),
                        (n[7] ||= Y(`span`, null, `湿度`, -1))
                      ])
                    ]),
                    Y(`div`, ko, [
                      (n[10] ||= Y(
                        `svg`,
                        {
                          class: `quick-icon`,
                          xmlns: `http://www.w3.org/2000/svg`,
                          "xmlns:xlink": `http://www.w3.org/1999/xlink`,
                          viewBox: `0 0 24 24`
                        },
                        [
                          Y(`path`, {
                            d: `M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5s5 2.24 5 5s-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3s3-1.34 3-3s-1.34-3-3-3z`,
                            fill: `currentColor`
                          })
                        ],
                        -1
                      )),
                      Y(`div`, Ao, [
                        Y(`strong`, null, j(e.now.vis || 0) + ` km`, 1),
                        (n[9] ||= Y(`span`, null, `能见度`, -1))
                      ])
                    ]),
                    Y(`div`, jo, [
                      (n[12] ||= Li(
                        `<svg class="quick-icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32"><path d="M26 30h-4a2.006 2.006 0 0 1-2-2v-7a2.006 2.006 0 0 1-2-2v-6a2.946 2.946 0 0 1 3-3h6a2.946 2.946 0 0 1 3 3v6a2.006 2.006 0 0 1-2 2v7a2.006 2.006 0 0 1-2 2zm-5-18a.945.945 0 0 0-1 1v6h2v9h4v-9h2v-6a.945.945 0 0 0-1-1z" fill="currentColor"></path><path d="M24 9a4 4 0 1 1 4-4a4.012 4.012 0 0 1-4 4zm0-6a2 2 0 1 0 2 2a2.006 2.006 0 0 0-2-2z" fill="currentColor"></path><path d="M10 20.184V12H8v8.184a3 3 0 1 0 2 0z" fill="currentColor"></path><path d="M9 30a6.993 6.993 0 0 1-5-11.89V7a5 5 0 0 1 10 0v11.11A6.993 6.993 0 0 1 9 30zM9 4a3.003 3.003 0 0 0-3 3v11.983l-.332.299a5 5 0 1 0 6.664 0L12 18.983V7a3.003 3.003 0 0 0-3-3z" fill="currentColor"></path></svg>`,
                        1
                      )),
                      Y(`div`, Mo, [
                        Y(`strong`, null, j(e.now.feelsLike || 0) + `°`, 1),
                        (n[11] ||= Y(`span`, null, `体感`, -1))
                      ])
                    ])
                  ])
                ]))
              : Ri(``, !0),
            e.hours && e.hours.length > 0
              ? (q(),
                J(`div`, No, [
                  (n[13] ||= Y(`h2`, { class: `card-header-compact` }, `未来24小时`, -1)),
                  Y(`div`, Po, [
                    (q(!0),
                    J(
                      G,
                      null,
                      cr(
                        e.hours,
                        (e, t) => (
                          q(),
                          J(
                            `div`,
                            { key: e.hour + t, class: A([`hour-item`, t === 0 ? `current` : ``]) },
                            [
                              Y(`div`, Fo, j(t === 0 ? `现在` : e.hour), 1),
                              Y(`em`, { class: A(`qi-${e.icon} hour-icon`) }, null, 2),
                              Y(`div`, Io, j(e.temp) + `°`, 1)
                            ],
                            2
                          )
                        )
                      ),
                      128
                    ))
                  ])
                ]))
              : Ri(``, !0),
            e.days && e.days.length > 0
              ? (q(),
                J(`div`, Lo, [
                  (n[15] ||= Y(`h2`, { class: `card-header-compact` }, `未来天气`, -1)),
                  Y(`div`, Ro, [
                    (q(!0),
                    J(
                      G,
                      null,
                      cr(
                        e.days,
                        (e) => (
                          q(),
                          J(`div`, { key: e.date, class: `day-item` }, [
                            Y(`div`, zo, [Y(`span`, Bo, j(e.week), 1), Y(`span`, Vo, j(e.date), 1)]),
                            Y(`div`, Ho, [
                              Y(`div`, Uo, [
                                Y(`em`, { class: A(`qi-${e.iconDay} day-icon`) }, null, 2),
                                Y(`em`, { class: A(`qi-${e.iconNight} night-icon`) }, null, 2)
                              ]),
                              Y(`div`, Wo, [Y(`span`, null, j(e.textDay), 1), Y(`span`, Go, j(e.textNight), 1)]),
                              Y(`div`, Ko, [
                                Y(`span`, qo, j(e.tempMin) + `°`, 1),
                                (n[14] ||= Y(`div`, { class: `temp-line` }, null, -1)),
                                Y(`span`, Jo, j(e.tempMax) + `°`, 1)
                              ])
                            ])
                          ])
                        )
                      ),
                      128
                    ))
                  ])
                ]))
              : Ri(``, !0),
            e.days && e.days[0] && e.now
              ? (q(),
                J(`div`, Yo, [
                  Y(`div`, Xo, [
                    (n[21] ||= Y(`h3`, null, `天文信息`, -1)),
                    Y(`div`, Zo, [
                      Y(`div`, Qo, [
                        (n[17] ||= Li(
                          `<svg class="detail-icon"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17h1m16 0h1M5.6 10.6l.7.7m12.1-.7l-.7.7M8 17a4 4 0 0 1 8 0"></path><path d="M3 21h18"></path><path d="M12 9V3l3 3M9 6l3-3"></path></g></svg></svg>`,
                          1
                        )),
                        Y(`div`, null, [
                          (n[16] ||= Y(`span`, { class: `detail-label` }, `日出`, -1)),
                          Y(`strong`, null, j(e.days[0].sunrise || `-`), 1)
                        ])
                      ]),
                      Y(`div`, $o, [
                        (n[19] ||= Li(
                          `<div class="detail-icon"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17h1m16 0h1M5.6 10.6l.7.7m12.1-.7l-.7.7M8 17a4 4 0 0 1 8 0"></path><path d="M3 21h18"></path><path d="M12 3v6l3-3M9 6l3 3"></path></g></svg></div>`,
                          1
                        )),
                        Y(`div`, null, [
                          (n[18] ||= Y(`span`, { class: `detail-label` }, `日落`, -1)),
                          Y(`strong`, null, j(e.days[0].sunset || `-`), 1)
                        ])
                      ]),
                      Y(`div`, es, [
                        Y(`span`, ts, [Y(`em`, { class: A(`qi-${e.days[0].moonPhaseIcon}`) }, null, 2)]),
                        Y(`div`, null, [
                          (n[20] ||= Y(`span`, { class: `detail-label` }, `月相`, -1)),
                          Y(`strong`, null, j(e.days[0].moonPhase || `-`), 1)
                        ])
                      ])
                    ])
                  ]),
                  Y(`div`, ns, [
                    (n[28] ||= Y(`h3`, null, `气象数据`, -1)),
                    Y(`div`, rs, [
                      Y(`div`, is, [
                        (n[23] ||= Y(
                          `span`,
                          { class: `detail-icon` },
                          [
                            Y(
                              `svg`,
                              {
                                xmlns: `http://www.w3.org/2000/svg`,
                                "xmlns:xlink": `http://www.w3.org/1999/xlink`,
                                viewBox: `0 0 32 32`
                              },
                              [
                                Y(`path`, {
                                  d: `M17.505 16l8.16-7.253A1 1 0 0 0 25 7h-3V2h-2v7h2.37L16 14.662L9.63 9H12V2h-2v5H7a1 1 0 0 0-.665 1.747L14.495 16l-8.16 7.253A1 1 0 0 0 7 25h3v5h2v-7H9.63L16 17.338L22.37 23H20v7h2v-5h3a1 1 0 0 0 .664-1.747z`,
                                  fill: `currentColor`
                                })
                              ]
                            )
                          ],
                          -1
                        )),
                        Y(`div`, null, [
                          (n[22] ||= Y(`span`, { class: `detail-label` }, `气压`, -1)),
                          Y(`strong`, null, j(e.now.pressure || 0) + ` hPa`, 1)
                        ])
                      ]),
                      Y(`div`, as, [
                        (n[25] ||= Y(
                          `span`,
                          { class: `detail-icon` },
                          [
                            Y(
                              `svg`,
                              {
                                xmlns: `http://www.w3.org/2000/svg`,
                                "xmlns:xlink": `http://www.w3.org/1999/xlink`,
                                viewBox: `0 0 32 32`
                              },
                              [
                                Y(`path`, {
                                  d: `M16 7a7.66 7.66 0 0 1 1.51.15a8 8 0 0 1 6.35 6.34l.26 1.35l1.35.24a5.5 5.5 0 0 1-1 10.92H7.5a5.5 5.5 0 0 1-1-10.92l1.34-.24l.26-1.35A8 8 0 0 1 16 7m0-2a10 10 0 0 0-9.83 8.12A7.5 7.5 0 0 0 7.49 28h17a7.5 7.5 0 0 0 1.32-14.88a10 10 0 0 0-7.94-7.94A10.27 10.27 0 0 0 16 5z`,
                                  fill: `currentColor`
                                })
                              ]
                            )
                          ],
                          -1
                        )),
                        Y(`div`, null, [
                          (n[24] ||= Y(`span`, { class: `detail-label` }, `云量`, -1)),
                          Y(`strong`, null, j(e.now.cloud || 0) + `%`, 1)
                        ])
                      ]),
                      Y(`div`, os, [
                        (n[27] ||= Li(
                          `<span class="detail-icon"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h8.5a2.5 2.5 0 1 0-2.34-3.24"></path><path d="M3 12h15.5a2.5 2.5 0 1 1-2.34 3.24"></path><path d="M4 16h5.5a2.5 2.5 0 1 1-2.34 3.24"></path></g></svg></span>`,
                          1
                        )),
                        Y(`div`, null, [
                          (n[26] ||= Y(`span`, { class: `detail-label` }, `风级`, -1)),
                          Y(`strong`, null, j(e.now.windScale || 0) + `级`, 1)
                        ])
                      ])
                    ])
                  ])
                ]))
              : Ri(``, !0),
            e.airQualityData && e.airPollutantData
              ? (q(),
                J(`div`, ss, [
                  (n[35] ||= Y(`h2`, { class: `card-header-compact` }, `污染物详情`, -1)),
                  Y(`div`, cs, [
                    Y(`div`, ls, [
                      (n[29] ||= Y(`span`, { class: `pollutant-label` }, `PM2.5`, -1)),
                      Y(`span`, us, j(e.airPollutantData.pm2p5 === void 0 ? `-` : e.airPollutantData.pm2p5), 1),
                      Y(`div`, ds, [
                        Y(
                          `div`,
                          {
                            class: `pollutant-fill`,
                            style: k({
                              width:
                                (e.airPollutantData.pm2p5 === void 0
                                  ? 0
                                  : Math.min((e.airPollutantData.pm2p5 / 150) * 100, 100)) + `%`
                            })
                          },
                          null,
                          4
                        )
                      ])
                    ]),
                    Y(`div`, fs, [
                      (n[30] ||= Y(`span`, { class: `pollutant-label` }, `PM10`, -1)),
                      Y(`span`, ps, j(e.airPollutantData.pm10 === void 0 ? `-` : e.airPollutantData.pm10), 1),
                      Y(`div`, ms, [
                        Y(
                          `div`,
                          {
                            class: `pollutant-fill`,
                            style: k({
                              width:
                                (e.airPollutantData.pm10 === void 0
                                  ? 0
                                  : Math.min((e.airPollutantData.pm10 / 250) * 100, 100)) + `%`
                            })
                          },
                          null,
                          4
                        )
                      ])
                    ]),
                    Y(`div`, hs, [
                      (n[31] ||= Y(`span`, { class: `pollutant-label` }, `O₃`, -1)),
                      Y(`span`, gs, j(e.airPollutantData.o3 === void 0 ? `-` : e.airPollutantData.o3), 1),
                      Y(`div`, _s, [
                        Y(
                          `div`,
                          {
                            class: `pollutant-fill`,
                            style: k({
                              width:
                                (e.airPollutantData.o3 === void 0
                                  ? 0
                                  : Math.min((e.airPollutantData.o3 / 200) * 100, 100)) + `%`
                            })
                          },
                          null,
                          4
                        )
                      ])
                    ]),
                    Y(`div`, vs, [
                      (n[32] ||= Y(`span`, { class: `pollutant-label` }, `NO₂`, -1)),
                      Y(`span`, ys, j(e.airPollutantData.no2 === void 0 ? `-` : e.airPollutantData.no2), 1),
                      Y(`div`, bs, [
                        Y(
                          `div`,
                          {
                            class: `pollutant-fill`,
                            style: k({
                              width:
                                (e.airPollutantData.no2 === void 0
                                  ? 0
                                  : Math.min((e.airPollutantData.no2 / 100) * 100, 100)) + `%`
                            })
                          },
                          null,
                          4
                        )
                      ])
                    ]),
                    Y(`div`, xs, [
                      (n[33] ||= Y(`span`, { class: `pollutant-label` }, `SO₂`, -1)),
                      Y(`span`, Ss, j(e.airPollutantData.so2 === void 0 ? `-` : e.airPollutantData.so2), 1),
                      Y(`div`, Cs, [
                        Y(
                          `div`,
                          {
                            class: `pollutant-fill`,
                            style: k({
                              width:
                                (e.airPollutantData.so2 === void 0
                                  ? 0
                                  : Math.min((e.airPollutantData.so2 / 150) * 100, 100)) + `%`
                            })
                          },
                          null,
                          4
                        )
                      ])
                    ]),
                    Y(`div`, ws, [
                      (n[34] ||= Y(`span`, { class: `pollutant-label` }, `CO`, -1)),
                      Y(`span`, Ts, j(e.airPollutantData.co === void 0 ? `-` : e.airPollutantData.co), 1),
                      Y(`div`, Es, [
                        Y(
                          `div`,
                          {
                            class: `pollutant-fill`,
                            style: k({
                              width:
                                (e.airPollutantData.co === void 0
                                  ? 0
                                  : Math.min((e.airPollutantData.co / 4) * 100, 100)) + `%`
                            })
                          },
                          null,
                          4
                        )
                      ])
                    ])
                  ])
                ]))
              : Ri(``, !0)
          ],
          2
        )
      );
    }
  };
function Os(e, t = !1) {
  return { app: t ? $a(Ds, e) : Qa(Ds, e) };
}
var ks = window.__INITIAL_STATE__ || {
  now: {
    obsTime: `XXXX-XX-XXT08:25+08:00`,
    temp: `10`,
    feelsLike: `6`,
    icon: `104`,
    text: `阴`,
    wind360: `21`,
    windDir: `北风`,
    windScale: `2`,
    windSpeed: `10`,
    humidity: `66`,
    precip: `0.0`,
    pressure: `1019`,
    vis: `15`,
    cloud: `10`,
    dew: `3`
  },
  days: [
    {
      fxDate: `XXXX-XX-XX`,
      sunrise: `07:08`,
      sunset: `18:08`,
      moonrise: `09:16`,
      moonset: `21:20`,
      moonPhase: `蛾眉月`,
      moonPhaseIcon: `801`,
      tempMax: `15`,
      tempMin: `10`,
      iconDay: `101`,
      textDay: `多云`,
      iconNight: `151`,
      textNight: `多云`,
      wind360Day: `0`,
      windDirDay: `北风`,
      windScaleDay: `1-3`,
      windSpeedDay: `16`,
      wind360Night: `0`,
      windDirNight: `北风`,
      windScaleNight: `1-3`,
      windSpeedNight: `3`,
      humidity: `51`,
      precip: `0.0`,
      pressure: `1022`,
      vis: `25`,
      cloud: `5`,
      uvIndex: `4`,
      week: `今日`,
      date: `1月22日`
    },
    {
      fxDate: `2026-01-23`,
      sunrise: `07:08`,
      sunset: `18:08`,
      moonrise: `09:51`,
      moonset: `22:18`,
      moonPhase: `蛾眉月`,
      moonPhaseIcon: `801`,
      tempMax: `17`,
      tempMin: `12`,
      iconDay: `101`,
      textDay: `多云`,
      iconNight: `151`,
      textNight: `多云`,
      wind360Day: `0`,
      windDirDay: `北风`,
      windScaleDay: `1-3`,
      windSpeedDay: `3`,
      wind360Night: `0`,
      windDirNight: `北风`,
      windScaleNight: `1-3`,
      windSpeedNight: `3`,
      humidity: `65`,
      precip: `0.0`,
      pressure: `1020`,
      vis: `25`,
      cloud: `3`,
      uvIndex: `5`,
      week: `周五`,
      date: `1月23日`
    },
    {
      fxDate: `2026-01-24`,
      sunrise: `07:07`,
      sunset: `18:09`,
      moonrise: `10:27`,
      moonset: `23:17`,
      moonPhase: `蛾眉月`,
      moonPhaseIcon: `801`,
      tempMax: `20`,
      tempMin: `16`,
      iconDay: `101`,
      textDay: `多云`,
      iconNight: `151`,
      textNight: `多云`,
      wind360Day: `0`,
      windDirDay: `北风`,
      windScaleDay: `1-3`,
      windSpeedDay: `3`,
      wind360Night: `0`,
      windDirNight: `北风`,
      windScaleNight: `1-3`,
      windSpeedNight: `3`,
      humidity: `77`,
      precip: `0.0`,
      pressure: `1018`,
      vis: `25`,
      cloud: `1`,
      uvIndex: `5`,
      week: `周六`,
      date: `1月24日`
    }
  ],
  city: `某城市`,
  warning: {
    metadata: { tag: `90d977eaeb27fd914610eb4811d292521a057ce1913a6bc1eaeb7b167f1ff887`, zeroResult: !0 },
    alerts: []
  },
  airQualityData: {
    code: `cn-mee`,
    name: `AQI (CN)`,
    aqi: 34,
    aqiDisplay: `34`,
    level: `1`,
    category: `优`,
    color: { red: 0, green: 228, blue: 0, alpha: 1 },
    primaryPollutant: null,
    health: {
      effect: `空气质量令人满意，基本无空气污染。`,
      advice: { generalPopulation: `各类人群可正常活动。`, sensitivePopulation: `各类人群可正常活动。` }
    },
    air_color: `#00e400`
  },
  airPollutantData: { pm2p5: 18.5, pm10: 33.5, no2: 18, o3: 24.5, so2: 6, co: 0.5 },
  hours: [
    {
      fxTime: `XXXX-XX-XXT09:00+08:00`,
      temp: `11`,
      icon: `100`,
      text: `晴`,
      wind360: `6`,
      windDir: `北风`,
      windScale: `3-4`,
      windSpeed: `25`,
      humidity: `57`,
      pop: `0`,
      precip: `0.0`,
      pressure: `1021`,
      cloud: `83`,
      dew: `2`,
      hour: `9AM`,
      temp_percent: `50px`
    },
    {
      fxTime: `XXXX-XX-XXT10:00+08:00`,
      temp: `12`,
      icon: `101`,
      text: `多云`,
      wind360: `12`,
      windDir: `北风`,
      windScale: `3-4`,
      windSpeed: `25`,
      humidity: `55`,
      pop: `0`,
      precip: `0.0`,
      pressure: `1021`,
      cloud: `82`,
      dew: `3`,
      hour: `10AM`,
      temp_percent: `63px`
    },
    {
      fxTime: `XXXX-XX-XXT11:00+08:00`,
      temp: `13`,
      icon: `101`,
      text: `多云`,
      wind360: `18`,
      windDir: `北风`,
      windScale: `3-4`,
      windSpeed: `25`,
      humidity: `54`,
      pop: `0`,
      precip: `0.0`,
      pressure: `1022`,
      cloud: `81`,
      dew: `3`,
      hour: `11AM`,
      temp_percent: `75px`
    },
    {
      fxTime: `XXXX-XX-XXT12:00+08:00`,
      temp: `14`,
      icon: `101`,
      text: `多云`,
      wind360: `14`,
      windDir: `北风`,
      windScale: `3-4`,
      windSpeed: `25`,
      humidity: `54`,
      pop: `0`,
      precip: `0.0`,
      pressure: `1022`,
      cloud: `74`,
      dew: `4`,
      hour: `12PM`,
      temp_percent: `88px`
    },
    {
      fxTime: `XXXX-XX-XXT13:00+08:00`,
      temp: `14`,
      icon: `101`,
      text: `多云`,
      wind360: `10`,
      windDir: `北风`,
      windScale: `3-4`,
      windSpeed: `25`,
      humidity: `54`,
      pop: `0`,
      precip: `0.0`,
      pressure: `1022`,
      cloud: `66`,
      dew: `4`,
      hour: `1PM`,
      temp_percent: `88px`
    },
    {
      fxTime: `XXXX-XX-XXT14:00+08:00`,
      temp: `15`,
      icon: `100`,
      text: `晴`,
      wind360: `5`,
      windDir: `北风`,
      windScale: `3-4`,
      windSpeed: `25`,
      humidity: `54`,
      pop: `0`,
      precip: `0.0`,
      pressure: `1023`,
      cloud: `58`,
      dew: `4`,
      hour: `2PM`,
      temp_percent: `100px`
    },
    {
      fxTime: `XXXX-XX-XXT15:00+08:00`,
      temp: `15`,
      icon: `100`,
      text: `晴`,
      wind360: `4`,
      windDir: `北风`,
      windScale: `3-4`,
      windSpeed: `25`,
      humidity: `54`,
      pop: `0`,
      precip: `0.0`,
      pressure: `1023`,
      cloud: `42`,
      dew: `4`,
      hour: `3PM`,
      temp_percent: `100px`
    },
    {
      fxTime: `XXXX-XX-XXT16:00+08:00`,
      temp: `15`,
      icon: `100`,
      text: `晴`,
      wind360: `2`,
      windDir: `北风`,
      windScale: `3-4`,
      windSpeed: `25`,
      humidity: `54`,
      pop: `0`,
      precip: `0.0`,
      pressure: `1023`,
      cloud: `26`,
      dew: `4`,
      hour: `4PM`,
      temp_percent: `100px`
    },
    {
      fxTime: `XXXX-XX-XXT17:00+08:00`,
      temp: `14`,
      icon: `100`,
      text: `晴`,
      wind360: `1`,
      windDir: `北风`,
      windScale: `3-4`,
      windSpeed: `25`,
      humidity: `54`,
      pop: `0`,
      precip: `0.0`,
      pressure: `1022`,
      cloud: `10`,
      dew: `5`,
      hour: `5PM`,
      temp_percent: `88px`
    },
    {
      fxTime: `XXXX-XX-XXT18:00+08:00`,
      temp: `14`,
      icon: `100`,
      text: `晴`,
      wind360: `64`,
      windDir: `东北风`,
      windScale: `3-4`,
      windSpeed: `25`,
      humidity: `57`,
      pop: `0`,
      precip: `0.0`,
      pressure: `1022`,
      cloud: `10`,
      dew: `5`,
      hour: `6PM`,
      temp_percent: `88px`
    },
    {
      fxTime: `XXXX-XX-XXT19:00+08:00`,
      temp: `14`,
      icon: `150`,
      text: `晴`,
      wind360: `121`,
      windDir: `东南风`,
      windScale: `3-4`,
      windSpeed: `25`,
      humidity: `57`,
      pop: `0`,
      precip: `0.0`,
      pressure: `1022`,
      cloud: `9`,
      dew: `4`,
      hour: `7PM`,
      temp_percent: `88px`
    },
    {
      fxTime: `XXXX-XX-XXT20:00+08:00`,
      temp: `14`,
      icon: `151`,
      text: `多云`,
      wind360: `354`,
      windDir: `北风`,
      windScale: `3-4`,
      windSpeed: `25`,
      humidity: `56`,
      pop: `0`,
      precip: `0.0`,
      pressure: `1022`,
      cloud: `8`,
      dew: `4`,
      hour: `8PM`,
      temp_percent: `88px`
    }
  ],
  theme: `light`
};
delete window.__INITIAL_STATE__;
var { app: As } = Os(ks, !1);
As.mount(`#app`, !0);

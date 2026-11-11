/*
 * WIPS site runtime
 * -----------------
 * A very small renderer for the page templates in this repo.
 * Each page has:
 *   <template id="page-template">  markup with {{ holes }}, <sc-for> loops and <sc-if> conditionals
 *   <script> class Component extends DCLogic { state = {...}; renderVals() { return {...}; } }
 * WIPS.mount(Component) renders the template into #app and re-renders on setState().
 *
 * Template rules
 *   {{ a.b }}                    dotted lookup into the values returned by renderVals()
 *   <sc-for list="{{ xs }}" as="x">   repeat children for each item, with `x` in scope
 *   <sc-if value="{{ cond }}">        render children only when cond is truthy
 *   onClick / onChange / onSubmit / onMouseEnter / onMouseLeave="{{ fn }}"  event handlers
 */
(function () {
  'use strict';

  var HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;
  var WHOLE = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/;
  var EVENTS = { onclick: 'click', onchange: 'change', onsubmit: 'submit', onmouseenter: 'mouseenter', onmouseleave: 'mouseleave', oninput: 'input' };

  function lookup(scope, path) {
    path = path.trim();
    if (path === 'true') return true;
    if (path === 'false') return false;
    var parts = path.split('.');
    var v = scope[parts[0]];
    for (var i = 1; i < parts.length; i++) {
      if (v == null) return undefined;
      v = v[parts[i]];
    }
    return v;
  }

  function evalValue(raw, scope) {
    var m = raw.match(WHOLE);
    if (m) return lookup(scope, m[1]);
    if (raw.indexOf('{{') === -1) return raw;
    return raw.replace(HOLE, function (_, p) { var v = lookup(scope, p); return v == null ? '' : String(v); });
  }

  function DCLogic() { this.state = {}; }
  DCLogic.prototype.setState = function (patch) {
    var next = typeof patch === 'function' ? patch(this.state) : patch;
    this.state = Object.assign({}, this.state, next);
    if (this.__quiet) return;
    if (this.__schedule) this.__schedule();
  };

  function isTextInput(el) {
    var tag = el.localName;
    if (tag === 'textarea') return true;
    if (tag !== 'input') return false;
    var t = (el.getAttribute('type') || 'text').toLowerCase();
    return t !== 'checkbox' && t !== 'radio' && t !== 'submit' && t !== 'button';
  }

  function build(node, scope, comp, out) {
    if (node.nodeType === 3) {
      var t = node.nodeValue;
      out.appendChild(document.createTextNode(t.indexOf('{{') === -1 ? t : evalValue(t, scope)));
      return;
    }
    if (node.nodeType !== 1) return;
    var tag = node.localName;

    if (tag === 'sc-for') {
      var list = evalValue(node.getAttribute('list') || '', scope) || [];
      var as = node.getAttribute('as') || 'item';
      for (var i = 0; i < list.length; i++) {
        var child = Object.create(scope);
        child[as] = list[i];
        for (var c = node.firstChild; c; c = c.nextSibling) build(c, child, comp, out);
      }
      return;
    }
    if (tag === 'sc-if') {
      if (evalValue(node.getAttribute('value') || '', scope)) {
        for (var d = node.firstChild; d; d = d.nextSibling) build(d, scope, comp, out);
      }
      return;
    }

    var el = document.createElementNS(node.namespaceURI, node.localName);
    var pendingValue = null, pendingChecked = null;
    for (var a = 0; a < node.attributes.length; a++) {
      var attr = node.attributes[a];
      var name = attr.name;
      if (name.indexOf('hint-') === 0) continue;
      var lower = name.toLowerCase();
      if (EVENTS[lower]) {
        var fn = evalValue(attr.value, scope);
        if (typeof fn === 'function') attachEvent(el, node, lower, fn, comp);
        continue;
      }
      var val = evalValue(attr.value, scope);
      if (lower === 'value' && (tag === 'input' || tag === 'textarea')) { pendingValue = val == null ? '' : String(val); continue; }
      if (lower === 'checked') { pendingChecked = !!val; continue; }
      if (val === undefined || val === null) continue;
      el.setAttribute(name, String(val));
    }
    for (var e = node.firstChild; e; e = e.nextSibling) build(e, scope, comp, el);
    if (pendingValue !== null) { if (tag === 'textarea') el.textContent = pendingValue; el.value = pendingValue; }
    if (pendingChecked !== null) el.checked = pendingChecked;
    out.appendChild(el);
  }

  function attachEvent(el, tplNode, lower, fn, comp) {
    var type = EVENTS[lower];
    if (lower === 'onchange' && isTextInput(tplNode)) {
      // Update state while typing without re-rendering (keeps focus and caret).
      el.addEventListener('input', function (ev) {
        comp.__quiet = true;
        try { fn(ev); } finally { comp.__quiet = false; }
      });
      return;
    }
    el.addEventListener(type, fn);
  }

  function pathOf(root, el) {
    var path = [];
    while (el && el !== root) {
      var p = el.parentNode; if (!p) return null;
      path.unshift(Array.prototype.indexOf.call(p.childNodes, el));
      el = p;
    }
    return el === root ? path : null;
  }
  function nodeAt(root, path) {
    var n = root;
    for (var i = 0; i < path.length && n; i++) n = n.childNodes[path[i]];
    return n;
  }

  function mount(Component) {
    var tpl = document.getElementById('page-template');
    var app = document.getElementById('app');
    var comp = new Component();
    var pending = false;

    function render() {
      pending = false;
      var focusPath = pathOf(app, document.activeElement);
      var vals = comp.renderVals();
      var frag = document.createDocumentFragment();
      for (var n = tpl.content.firstChild; n; n = n.nextSibling) build(n, vals, comp, frag);
      app.replaceChildren(frag);
      if (focusPath) {
        var f = nodeAt(app, focusPath);
        if (f && typeof f.focus === 'function') { try { f.focus({ preventScroll: true }); } catch (e) {} }
      }
    }
    comp.__schedule = function () { if (!pending) { pending = true; queueMicrotask(render); } };
    render();
    // Entrance animations play once; later re-renders shouldn't replay them.
    setTimeout(function () { document.documentElement.classList.add('dc-ready'); }, 1600);
    if (typeof comp.componentDidMount === 'function') comp.componentDidMount();
    window.addEventListener('pagehide', function () { if (typeof comp.componentWillUnmount === 'function') comp.componentWillUnmount(); });
  }

  window.DCLogic = DCLogic;
  window.WIPS = { mount: mount };
})();

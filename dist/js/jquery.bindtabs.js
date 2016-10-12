(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/// <reference path="./dynamictabgen-options.d.ts" />
/// <reference path="./dynamictabgen-init-opts.d.ts" />
"use strict";
var DEFAULT_TABNAME = "<em>New Tab</em>";
var NEWTAB_PLACEHOLDER = "";
var DYN_CLASS = 'bt_dynamic';
var TAB_CLASS = '';
var TABLI_CLASS = '';
var CNTR_CLASS = '';
var TABNAME_WRAP_CLASS = '';
var DynamicTabGen = (function () {
    function DynamicTabGen(options) {
        this._setNewConsts(options);
    }
    DynamicTabGen.prototype._setNewConsts = function (conf) {
        TAB_CLASS = conf.tabClass;
        TABLI_CLASS = conf.tabLiClass;
        TABNAME_WRAP_CLASS = conf.tabNameWrapClass;
        CNTR_CLASS = conf.cntrClass;
    };
    DynamicTabGen.prototype.newTab = function (options) {
        var checkedOpts = this._checkCustIdVariations(options);
        var newTab = this._buildNewTab(checkedOpts);
        var newTabLi = this._buildNewTabLi(newTab);
        var newCntr = this._buildNewCntr(checkedOpts);
        return {
            tab: newTab,
            tabLi: newTabLi,
            cntr: newCntr
        };
    };
    DynamicTabGen.prototype._buildNewTab = function (options) {
        var tabNameWrap = $('<span>', {
            class: TABNAME_WRAP_CLASS,
            html: options.tabName || DEFAULT_TABNAME
        });
        var customTabClass = this._checkForCustTabClass(options);
        var newTabAtts = {
            class: TAB_CLASS + " " + DYN_CLASS + " " + customTabClass,
            'data-pairid': options.pairid,
            'data-custid': options.custId,
            title: options.tabName
        };
        var newTab = $('<li>', newTabAtts).append(tabNameWrap);
        return newTab;
    };
    DynamicTabGen.prototype._buildNewTabLi = function (newTab) {
        var newTabLi = newTab.clone()
            .toggleClass(TAB_CLASS + " " + TABLI_CLASS);
        return newTabLi;
    };
    DynamicTabGen.prototype._buildNewCntr = function (options) {
        var customCntrClass = this._checkForCustCntrClass(options);
        var newCntrAtts = {
            class: CNTR_CLASS + " " + DYN_CLASS + " " + customCntrClass,
            'data-pairid': options.pairid
        };
        var newCntr = $('<div>', newCntrAtts);
        return newCntr;
    };
    DynamicTabGen.prototype._checkCustIdVariations = function (options) {
        if (!options.hasOwnProperty('custId')) {
            ['custid', 'custID'].forEach(function (key) {
                if (options.hasOwnProperty(key)) {
                    options.custId = key;
                }
            });
        }
        return options;
    };
    DynamicTabGen.prototype._checkForCustTabClass = function (options) {
        return options.hasOwnProperty('tabClass') ? options.tabClass : '';
    };
    DynamicTabGen.prototype._checkForCustCntrClass = function (options) {
        return options.hasOwnProperty('cntrClass') ? options.cntrClass : '';
    };
    return DynamicTabGen;
}());
exports.DynamicTabGen = DynamicTabGen;
/*
all new tabs need at LEAST the following:
- tab name (defaults to New Tab)
- tab class *
- container class *
        * will always min have "bt-tab" & "bt-cntr"
- pairid (generated from BindTabs object?)
*/ 

},{}],2:[function(require,module,exports){
/// <reference path="./jquery.d.ts" />
/// <reference path="./bindtabs-options.d.ts" />
/// <reference path="./dynamictabgen-init-opts.d.ts" />
/// <reference path="./bindtabs-event-registry-object.d.ts" />
"use strict";
var bindtabs_dynamictabgen_ts_1 = require('./bindtabs-dynamictabgen.ts');
var pluginName = 'bindTabs';
var pluginNs = 'moc';
var defaults = {
    closable: false,
    tablist: true
};
var tabgen;
var consoleStyles = ['BindTabs', 'font-weight:bold'];
/*
possible additions:
- callbacks before major events (show, close, load, ...)
    -> these are in contrast to events fired after actions finish (show, closed, loaded, ...)
 */
var pluginClass = 'bind_tabs';
var TAB_CLASS = 'bt_tab';
var TABLI_CLASS = 'bt_listItem';
var CNTR_CLASS = 'bt_cntr';
var showClass = 'is-showing';
var tabNameWrapClass = 'tabNameWrap';
var closeIconClass = 'bt_closeTab';
var closableClass = 'bt_closable';
var BindTabs = (function () {
    function BindTabs(element, options) {
        this.iid = generateUniqInstanceId();
        this.pairIds = [];
        this.tabNameWrapMarkup = "<span class=\"" + tabNameWrapClass + "\">";
        this.eventRegistry = {};
        this.element = $(element);
        this.options = $.extend({}, defaults, options);
        this._name = pluginName;
        this._defaults = defaults;
        this._initDynTabGen();
        this._create();
        return this;
    }
    BindTabs.prototype._create = function () {
        this._checkOptions();
        this._addPluginMarkup();
        this._initListeners();
        this.element.trigger('ready:bindtabs');
    };
    BindTabs.prototype._checkOptions = function () {
        var opts = this.options;
        if (!isEmpty(opts.tabs) && !isEmpty(opts.containers)) {
            this._assignRelations('tabs', opts.tabs);
            this._assignRelations('containers', opts.containers);
        }
        else {
            this._checkMarkupForElems();
        }
        if (!is('boolean', opts.tablist)) {
            opts.tablist = true;
        }
    };
    BindTabs.prototype._assignRelations = function (prop, elem) {
        var plugin = this;
        if (isJQuery(elem) && elem.length > 0) {
            plugin[prop] = elem;
        }
        else {
            var findTabs = plugin.element.find(elem).not("." + pluginClass);
            if (findTabs.length > 0) {
                plugin[prop] = findTabs;
            }
        }
    };
    BindTabs.prototype._checkMarkupForElems = function () {
        var dataAtts = this.element.data();
        var tabs, containers;
        if (!isEmpty(dataAtts.boundtabs) && !isEmpty(dataAtts.boundcontainers)) {
            tabs = "." + dataAtts.boundtabs;
            containers = "." + dataAtts.boundcontainers;
        }
        else {
            tabs = this.element.children('ul').first();
            containers = this.element.children('div').first();
        }
        this._assignRelations('tabs', tabs);
        this._assignRelations('containers', containers);
    };
    BindTabs.prototype._addPluginMarkup = function () {
        this._addIid();
        this._addPluginClass();
        this._addPluginElClasses();
        this._addTabnameWrapper();
        this._addPairId();
        this._showStartingTab();
        this._checkForTablist();
    };
    BindTabs.prototype._addIid = function () {
        this.element.data('btIid', this.iid);
    };
    BindTabs.prototype._addPluginClass = function () {
        var plugin = this;
        $.each([plugin.element, plugin.tabs, plugin.containers], function (index, item) {
            $(item).addClass(pluginClass);
        });
    };
    BindTabs.prototype._addPluginElClasses = function () {
        var plugin = this;
        this.element.addClass('bt_wrapper');
        this.tabs.addClass('bt_tabs');
        this.containers.addClass('bt_containers');
        addClassToEach(TAB_CLASS, this.tabs.children());
        addClassToEach(CNTR_CLASS, this.containers.children());
    };
    BindTabs.prototype._addTabnameWrapper = function () {
        var closeMarkup = $('<span>', {
            class: closeIconClass,
            html: '&times;'
        });
        var tabs = this.tabs.children('.bt_tab');
        tabs.wrapInner(this.tabNameWrapMarkup);
        if (this.options.closable) {
            tabs.addClass(closableClass).append((closeMarkup));
        }
    };
    BindTabs.prototype._addPairId = function () {
        var _this = this;
        // make this chunk conditional; eventually dynamicTabGen will
        // create tabs/cntrs and add pairs too
        this.tabs.children('.bt_tab').each(function (index, tab) {
            var pairId = _this._makeNewPairId();
            var $tab = $(tab);
            var $cntr = _this.containers.children(":eq(" + $tab.index() + ")");
            $tab.attr('data-pairid', pairId);
            $cntr.attr('data-pairid', pairId);
        });
    };
    BindTabs.prototype._makeNewPairId = function () {
        var newId = makeDateId();
        // while($.inArray(newId, this.pairIds) > -1) {
        while (this._isPairid(newId)) {
            newId = makeDateId();
        }
        this.pairIds.push(newId);
        return newId;
    };
    BindTabs.prototype._showStartingTab = function (showFirstInSet) {
        if (showFirstInSet === void 0) { showFirstInSet = false; }
        this.show(this.tabs.children().first());
    };
    BindTabs.prototype._checkForTablist = function () {
        if (this.options.tablist) {
            var tabsWithoutList = this.tabs.html();
            var tabListBtn = $('<li>', { class: 'notab' }).appendTo(this.tabs);
            var tabListToggle = $('<span>', { class: 'bt_toggle' }).appendTo(tabListBtn);
            var tabList = $('<ul>', { class: 'bt_list', html: tabsWithoutList }).appendTo(tabListBtn);
            tabList.find('.bt_tab').toggleClass('bt_tab bt_listItem');
        }
    };
    BindTabs.prototype._isPairid = function (idToCheck) {
        return $.inArray(idToCheck, this.pairIds) > -1;
    };
    BindTabs.prototype._initListeners = function () {
        var plugin = this;
        plugin.tabs
            .on('click', '.bt_tab', function showClkdPair(event) {
            plugin.show(event.currentTarget);
        })
            .on('click', '.bt_closeTab', closeClkdPair);
        if (plugin.options.tablist) {
            plugin.tabs
                .on('click', '.notab', toggleTabList)
                .on('click', '.bt_listItem', showTabFromTablist);
        }
        function closeClkdPair(event) {
            var pairId;
            var $this = $(this);
            var tab = $this.closest('.bt_tab');
            if (tab.length === 0) {
                pairId = $this.closest('.bt_listItem').data('pairid');
                tab = plugin.tabs.children("[data-pairid=\"" + pairId + "\"]");
            }
            plugin.close(tab);
            event.stopPropagation();
        }
        function toggleTabList(event) {
            plugin.showList(this);
        }
        function showTabFromTablist(event) {
            var pairId = $(this).data('pairid');
            var tab = plugin.tabs.children("[data-pairid=\"" + pairId + "\"]");
            plugin.show(tab);
        }
    };
    /**
     * Checks passed element for JQuery type and returns either JQuery object or null with error
     * @param {any} elem
     * @method
     */
    BindTabs.prototype._checkElem = function (elem) {
        if (!is('string', elem) && !is('object', elem)) {
            console.error('You must pass an object or string selector to _checkElem(). This was passed:', elem);
            return null;
        }
        if (elem.length === 0) {
            console.warn('The element you passed to _checkElem() was empty:', elem);
            console.trace('Empty _checkElem()');
            return null;
        }
        switch (typeof elem) {
            case 'string': return this.element.find(elem);
            case 'object': return (elem instanceof jQuery) ? elem : $(elem);
        }
    };
    BindTabs.prototype._assignElems = function (elem) {
        var elements = {
            tab: null,
            cntr: null
        };
        if (isEmpty(elem)) {
            elements.tab = this.getCurTab();
            elements.cntr = this.getCurCntr();
        }
        else if (elem.hasClass('bt_cntr')) {
            elements.tab = this.pairedTo(elem);
            elements.cntr = elem;
        }
        else if (elem.hasClass('bt_tab')) {
            elements.tab = elem;
            elements.cntr = this.pairedTo(elem);
        }
        return elements;
    };
    BindTabs.prototype._removeShowClass = function (tab, container) {
        if (tab === void 0) { tab = $(); }
        if (container === void 0) { container = $(); }
        var showSelector = '.' + showClass;
        var elements = $();
        if (isEmpty(tab.length)) {
            tab = tab.add(this.tabs.children('.' + showClass));
        }
        elements = elements.add(tab);
        if (isEmpty(container.length)) {
            container = this.containers.children('.' + showClass);
        }
        elements = elements.add(container);
        elements.removeClass(showClass).trigger('blur:bindtabs');
    };
    BindTabs.prototype._addShowClass = function (tab, container) {
        this.element.find(tab).addClass(showClass);
        this.element.find(container).addClass(showClass);
    };
    BindTabs.prototype._trigger = function (event, collection, data) {
        if (data === void 0) { data = null; }
        var evt = event + ":bindtabs";
        $.each(collection, function triggerEventOnCollection(index, elem) {
            $(elem).trigger(evt, data);
        });
    };
    BindTabs.prototype._checkTabDisplay = function (tab) {
        var $tab = this._checkElem(tab);
        if ($tab.hasClass(showClass)) {
            this.show(this.getTabs().first()); // show first tab when closing showing tab
        }
    };
    BindTabs.prototype.pairedTo = function (elem) {
        var group;
        var el = this._checkElem(elem);
        if (el === null)
            return;
        if (el.hasClass('bt_tab')) {
            group = 'containers';
        }
        else if (el.hasClass('bt_cntr') || el.hasClass('notab')) {
            group = 'tabs';
        }
        else {
            console.error('Something went wrong; passed element does not have the right class:', el);
            return null;
        }
        return this[group].children("[data-pairid=\"" + el.data('pairid') + "\"]");
    };
    BindTabs.prototype.getCurrent = function (toGet) {
        var toReturn = $();
        switch (toGet) {
            case 'tab':
                toReturn = this.tabs.children('.' + showClass);
                break;
            case 'container':
            case 'cntr':
                toReturn = this.containers.children('.' + showClass);
                break;
            default:
                toReturn = toReturn.add(this.tabs.children('.' + showClass));
                toReturn = toReturn.add(this.containers.children('.' + showClass));
                break;
        }
        return toReturn;
    };
    BindTabs.prototype.getCurTab = function () {
        return this.getCurrent('tab');
    };
    BindTabs.prototype.getCurCntr = function () {
        return this.getCurrent('container');
    };
    BindTabs.prototype.getTabs = function () {
        return this.tabs.children('.bt_tab');
    };
    BindTabs.prototype.getContainers = function () {
        return this.containers.children('.bt_cntr');
    };
    BindTabs.prototype.getTabListItems = function () {
        return this.tabs.find('.' + TABLI_CLASS);
    };
    BindTabs.prototype.show = function (srcElem) {
        var tab, cntr;
        var elem = this._checkElem(srcElem);
        if (elem === null)
            return;
        var elems = this._assignElems(elem);
        tab = elems.tab;
        cntr = elems.cntr;
        if (this._showing(tab) ||
            this._disabled(tab) ||
            this._checkEventRegistry('show', tab) === false)
            return;
        this._removeShowClass();
        this._addShowClass(tab, cntr);
        // show current tablist item
        this._trigger('show', [tab, cntr]);
        return tab;
    };
    BindTabs.prototype._showing = function (tab) {
        var showSelector = '.' + showClass;
        var showingTab = this.tabs.children(showSelector);
        if (showingTab.length === 0)
            return false;
        return (tab.data('pairid') === showingTab.data('pairid'));
    };
    BindTabs.prototype._disabled = function (tab) {
        return tab.hasClass('is-disabled');
    };
    BindTabs.prototype.showList = function (clicked) {
        var elem = $(clicked);
        var targetClasses = $(elem).attr('class');
        if (this._checkEventRegistry('showlist', elem) === false)
            return;
        elem.toggleClass(showClass);
        this._trigger('showlist', [elem]);
    };
    BindTabs.prototype.close = function (srcElem) {
        var tab;
        var cntr;
        var elem = this._checkElem(srcElem);
        var elements = this._assignElems(elem);
        tab = elements.tab;
        cntr = elements.cntr;
        if (!tab.hasClass('bt_closable')) {
            console.warn('This tab is not closable');
            console.trace('close');
            return;
        }
        if (this._checkEventRegistry('close', tab) === false)
            return;
        var $elems = $().add(tab).add(cntr);
        var prevTab = tab.prev();
        if (this.options.closable) {
            var pairId = tab.data('pairid');
            var pairedTabLi = this.tabs.children('.notab').find(".bt_listItem[data-pairid=\"" + pairId + "\"]");
            $elems = $elems.add(pairedTabLi);
        }
        this._trigger('close', [$elems]);
        $elems.remove();
        this._checkTabDisplay(tab);
        this._trigger('closed', [this.element], { tab: tab, cntr: cntr });
    };
    BindTabs.prototype.addEventHook = function (event, tab, fn) {
        var jqTab = (tab instanceof $) ? tab : $(tab);
        var preppedTab = this._prepTabForHook(jqTab);
        fn = this._prepFnForHook(fn);
        this._addEventRegistry(event, { tab: preppedTab, fn: fn });
    };
    BindTabs.prototype.addShowHook = function (tab, func) {
        this.addEventHook('show', tab, func);
    };
    BindTabs.prototype.addShowlistHook = function (func) {
        // get .notab
        var notab = this.tabs.children('.notab');
        this.addEventHook('showlist', notab, func);
    };
    BindTabs.prototype.addCloseHook = function (tab, func) {
        this.addEventHook('close', tab, func);
    };
    BindTabs.prototype._prepTabForHook = function (tab) {
        if (tab.hasClass(CNTR_CLASS)) {
            tab = this.pairedTo(tab);
        }
        else if (!tab.hasClass(TAB_CLASS) && !tab.hasClass('notab')) {
            throw new ReferenceError('Event hook elements must be either a tab or container; none were passed');
        }
        return tab;
    };
    BindTabs.prototype._prepFnForHook = function (fn) {
        if (!$.isFunction(fn) && fn !== false) {
            throw new TypeError('Event hook callbacks must either be a function or boolean false (to prevent action from occurring)');
        }
        else
            return fn;
    };
    BindTabs.prototype._addEventRegistry = function (event, regObj) {
        if (this.eventRegistry[event] === undefined) {
            this.eventRegistry[event] = [];
        }
        this.eventRegistry[event].push(regObj);
    };
    BindTabs.prototype._checkEventRegistry = function (event, tab) {
        var plugin = this;
        var evtReg = this.eventRegistry[event];
        var doEvent = true;
        if (evtReg !== undefined) {
            evtReg.forEach(checkEachReg);
        }
        return doEvent;
        function checkEachReg(regObj) {
            var checkTab = plugin._checkElem(regObj.tab);
            if (tab.attr('id') === checkTab.attr('id')) {
                if (regObj.fn() === false) {
                    doEvent = false;
                }
            }
        }
    };
    BindTabs.prototype._initDynTabGen = function () {
        // var pairId: string = this._makeNewPairId();
        var initOpts = {
            tabClass: TAB_CLASS,
            tabLiClass: TABLI_CLASS,
            tabNameWrapClass: tabNameWrapClass,
            cntrClass: CNTR_CLASS
        };
        tabgen = new bindtabs_dynamictabgen_ts_1.DynamicTabGen(initOpts);
    };
    BindTabs.prototype.dynamicTabGen = function (opts, custId) {
        var dynOpts = {
            pairid: generateUniqInstanceId()
        };
        if (is('object', opts)) {
            $.extend(dynOpts, opts);
        }
        else if (is('string', opts)) {
            dynOpts.tabName = opts;
        }
        if (is('string', custId)) {
            console.warn('%cBindTabs:', 'font-weight:bold', '2nd param of .dynamicTabGen() deprecated; please pass custId as init object property');
            dynOpts.custId = custId;
        }
        var elems = tabgen.newTab(dynOpts);
        this._addToDom(elems, dynOpts);
        this.show(elems.tab);
        return elems.cntr;
    };
    BindTabs.prototype._addToDom = function (elems, options) {
        var target = {
            tab: null,
            tabListItem: null,
            container: null
        };
        if (!isEmpty(options.after)) {
            target = this._getAfterTarget(options.after);
        }
        else {
            target.tab = this.getTabs().last();
            target.tabListItem = this.getTabListItems().last();
            target.container = this.getContainers().last();
        }
        target.tab.after(elems.tab);
        target.tabListItem.after(elems.tabLi);
        target.container.after(elems.cntr);
    };
    BindTabs.prototype._getAfterTarget = function (after) {
        var newAfter; // needs to eventually be pairid of afterTarget
        if (is('string', after)) {
            if (isNaN(+after)) {
                newAfter = this._checkStrForAfter(after);
            }
            else {
                if (this._isPairid(after)) {
                    newAfter = after;
                }
            }
        }
        if (is('number', after)) {
            newAfter = '' + after;
        }
        if (is('object', after)) {
            var pairid = getPairidFromObject(after);
            if (pairid !== undefined) {
                newAfter = pairid;
            }
        }
        if (isEmpty(newAfter)) {
            console.error(pluginName, '>> "after" option used, but element not found; after arg = ', after);
        }
        var filterPattern = "[data-pairid=\"" + newAfter + "\"]";
        return {
            tab: this.getTabs().filter(filterPattern),
            tabListItem: this.getTabListItems().filter(filterPattern),
            container: this.getContainers().filter(filterPattern)
        };
    };
    BindTabs.prototype._checkStrForAfter = function (after) {
        var toReturn = '';
        if (this._isPairid(after)) {
            toReturn = after;
        }
        var matchedPairid = this._checkTabIds(after);
        if (matchedPairid) {
            toReturn = matchedPairid;
        }
        return toReturn;
    };
    BindTabs.prototype._checkTabIds = function (after) {
        var toReturn = '';
        // loop tabs looking for id matching after
        this.getTabs().each(function (index, tab) {
            if (after === tab.id && isEmpty(toReturn)) {
                toReturn = after;
            }
        });
        return toReturn;
    };
    BindTabs.prototype.destroy = function () {
        this._teardown();
    };
    BindTabs.prototype._teardown = function () {
        var _this = this;
        this.element.removeClass(pluginClass)
            .children().removeClass('bt_tabs bt_cntrs ' + pluginClass).end()
            .find('.notab').remove().end()
            .find('[data-pairId]').removeAttr('data-pairId').end()
            .find('.' + showClass).removeClass(showClass).end()
            .find('.' + TAB_CLASS).removeClass(TAB_CLASS).end()
            .find('.' + CNTR_CLASS).removeClass(CNTR_CLASS).end();
        $.each(['mocBindTabs', 'btIid'], function (index, key2rm) {
            $.removeData(_this.element[0], key2rm);
        });
    };
    return BindTabs;
}());
function addClassToEach(className, elems) {
    $(elems).each(function (index, elem) {
        $(elem).addClass(className);
    });
}
function makeDateId() {
    return Date.now().toString().substr(-4);
}
// Utilities
function isJQuery(toCheck) {
    return toCheck instanceof jQuery;
}
function isEmpty(mixed_var) {
    var undef, key, i, len;
    var emptyValues = [undef, null, false, 0, '', '0'];
    for (i = 0, len = emptyValues.length; i < len; i++) {
        if (mixed_var === emptyValues[i]) {
            return true;
        }
    }
    if (typeof mixed_var === 'object') {
        for (key in mixed_var) {
            return false;
        }
        return true;
    }
    return false;
}
function is(type, toCheck) {
    type = (type === 'set') ? 'undefined' : type;
    return typeof toCheck === type;
}
function isInString(needle, haystack, useAnd) {
    var glue, rxp, pattern;
    useAnd = (typeof useAnd === 'boolean') ? useAnd : false;
    glue = useAnd ? '&' : '|';
    pattern = (Array.isArray(needle)) ? needle.join(glue) : needle;
    rxp = new RegExp(pattern);
    return haystack.search(rxp) > -1;
}
function generateUniqInstanceId() {
    var salt = '5137';
    var tmpId = makeDateId();
    var insertionPoint = getRandomArbitrary(0, tmpId.length);
    return parseInt(injectText(salt, tmpId, insertionPoint));
}
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
function injectText(needle, haystack, position) {
    var half1 = haystack.substr(0, position);
    var half2 = haystack.substring(position);
    return half1 + needle + half2;
}
function getPairidFromObject(after) {
    var $after;
    if (after instanceof HTMLElement) {
        $after = $(after);
    }
    if (after instanceof jQuery) {
        $after = after;
    }
    return $after.data('pairid');
}
$.fn[pluginName] = function (options, retElems) {
    var _this = this;
    if (retElems === void 0) { retElems = false; }
    var namespaced = pluginNs + "-" + pluginName;
    var instances = $();
    this.each(function () {
        var $this = $(_this);
        if (!$this.data(namespaced)) {
            $this.data(namespaced, new BindTabs(_this, options));
        }
        instances = instances.add($this.data(namespaced));
    });
    return retElems ? this : instances;
};

},{"./bindtabs-dynamictabgen.ts":1}]},{},[2,1])


//# sourceMappingURL=jquery.bindtabs.js.map

/// <reference path="./jquery.d.ts" />
/// <reference path="./bindtabs-options.d.ts" />
/// <reference path="./bindtabs-event-registry-object.d.ts" />
/*
    Custom Events:
    - shown
    - closed
 */
;
(function pluginSetupWrapper() {
    var pluginName = 'bindTabs', pluginNs = 'moc';
    var defaults = {
        closable: false,
        tablist: true
    };
    /*
    possible additions:
    - callbacks before major events (show, close, load, ...)
        -> these are in contrast to events fired after actions finish (show, closed, loaded, ...)
     */
    var pluginClass = 'bind_tabs';
    var tabClass = 'bt_tab';
    var cntrClass = 'bt_cntr';
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
            addClassToEach(tabClass, this.tabs.children());
            addClassToEach(cntrClass, this.containers.children());
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
            while ($.inArray(newId, this.pairIds) > -1) {
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
        BindTabs.prototype._disabled = function (tab) {
            return tab.hasClass('is-disabled');
        };
        BindTabs.prototype._showing = function (tab) {
            var showSelector = '.' + showClass;
            var showingTab = this.tabs.children(showSelector);
            if (showingTab.length === 0)
                return false;
            return (tab.data('pairid') === showingTab.data('pairid'));
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
            if (tab.hasClass(cntrClass)) {
                tab = this.pairedTo(tab);
            }
            else if (!tab.hasClass(tabClass) && !tab.hasClass('notab')) {
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
                .find('.' + tabClass).removeClass(tabClass).end()
                .find('.' + cntrClass).removeClass(cntrClass).end();
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
})();

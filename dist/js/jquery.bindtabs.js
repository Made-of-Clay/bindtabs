/// <reference path="./jquery.d.ts" />
/// <reference path="./bindtabs-options.d.ts" />
;
(function pluginSetupWrapper() {
    var pluginName = 'bindTabs', pluginNs = 'moc';
    var defaults = {
        wheels: 4
    };
    var _pluginClass = 'bind_tabs';
    var _tabClass = 'bt_tab';
    var _cntrClass = 'bt_cntr';
    var _showClass = 'is-showing';
    var BindTabs = (function () {
        function BindTabs(element, options) {
            this.pairIds = [];
            this.element = $(element);
            this.options = $.extend({}, defaults, options);
            this._name = pluginName;
            this._defaults = defaults;
            this._create();
            return this;
        }
        Object.defineProperty(BindTabs.prototype, "_pluginClass", {
            get: function () {
                return _pluginClass;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BindTabs.prototype, "_tabClass", {
            get: function () {
                return _tabClass;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BindTabs.prototype, "_cntrClass", {
            get: function () {
                return _cntrClass;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BindTabs.prototype, "_showClass", {
            get: function () {
                return _showClass;
            },
            enumerable: true,
            configurable: true
        });
        BindTabs.prototype._create = function () {
            this._checkOptions();
            this._addPluginMarkup();
            this._initListeners();
        };
        BindTabs.prototype._checkOptions = function () {
            var opts = this.options;
            // assign tabs & containers
            if (!isEmpty(opts.tabs) && !isEmpty(opts.containers)) {
                this._assignRelations('tabs', opts.tabs);
                this._assignRelations('containers', opts.containers);
            }
            else {
                // check data atts
                // if even THOSE fail, default to what's in markup
                this._checkMarkupForElems();
            }
        };
        BindTabs.prototype._assignRelations = function (prop, elem) {
            var plugin = this;
            if (isJQuery(elem) && elem.length > 0) {
                plugin[prop] = elem;
            }
            else {
                var findTabs = plugin.element.find(elem).not("." + plugin._pluginClass);
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
            this._addPluginClass();
            this._addPluginElClasses();
            this._addPairId();
            this._showStartingTab();
        };
        BindTabs.prototype._addPluginClass = function () {
            var plugin = this;
            $.each([plugin.element, plugin.tabs, plugin.containers], function (index, item) {
                $(item).addClass(plugin._pluginClass);
            });
        };
        BindTabs.prototype._addPluginElClasses = function () {
            var plugin = this;
            this.element.addClass('bt_wrapper');
            this.tabs.addClass('bt_tabs');
            this.containers.addClass('bt_containers');
            addClassToEach(this._tabClass, this.tabs.children());
            addClassToEach(this._cntrClass, this.containers.children());
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
        BindTabs.prototype._initListeners = function () {
            var plugin = this;
            plugin.element
                .on('click', '.bt_tab', showClkdPair);
            function showClkdPair(event) {
                plugin.show(event.target);
            }
        };
        BindTabs.prototype._checkElem = function (elem) {
            if (!isString(elem) && typeof elem !== 'object') {
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
        BindTabs.prototype._assignElems = function (tab, cntr, elem) {
            var elements = {
                tab: null,
                cntr: null
            };
            if (elem.hasClass('bt_cntr')) {
                elements.cntr = elem;
                elements.tab = this.pairedTo(elem);
            }
            else {
                elements.tab = elem;
                elements.cntr = this.pairedTo(elem);
            }
            return elements;
        };
        BindTabs.prototype._disabled = function (tab) {
            return tab.hasClass('is-disabled');
        };
        BindTabs.prototype._showing = function (tab) {
            var showSelector = '.' + this._showClass;
            var showingTab = this.tabs.children(showSelector);
            if (showingTab.length === 0)
                return false;
            return (tab.data('pairid') === showingTab.data('pairid'));
        };
        BindTabs.prototype._removeShowClass = function (tab, container) {
            if (tab === void 0) { tab = $(); }
            if (container === void 0) { container = $(); }
            var showSelector = '.' + this._showClass;
            var elements = $();
            if (isEmpty(tab.length)) {
                tab = tab.add(this.tabs.children('.is-showing'));
            }
            elements = elements.add(tab);
            if (isEmpty(container.length)) {
                container = this.containers.children('.is-showing');
            }
            elements = elements.add(container);
            elements.removeClass(this._showClass).trigger('blur:bindtabs');
        };
        BindTabs.prototype._addShowClass = function (tab, container) {
            this.element.find(tab).addClass(this._showClass);
            this.element.find(container).addClass(this._showClass);
        };
        BindTabs.prototype._trigger = function (event, collection) {
            var evt = event + ":bindtabs";
            $.each(collection, function (index, elem) {
                $(elem).trigger(evt);
            });
        };
        BindTabs.prototype.pairedTo = function (elem) {
            var group;
            var el = this._checkElem(elem);
            if (el === null)
                return;
            if (el.hasClass('bt_tab')) {
                group = 'containers';
            }
            else if (el.hasClass('bt_cntr')) {
                group = 'tabs';
            }
            else {
                console.error('Something went wrong; passed element does not have the right class:', el);
                return null;
            }
            return this[group].children("[data-pairid=\"" + el.data('pairid') + "\"]");
        };
        BindTabs.prototype.show = function (srcElem) {
            var tab, cntr;
            var elem = this._checkElem(srcElem);
            if (elem === null)
                return;
            var elems = this._assignElems(tab, cntr, elem);
            tab = elems.tab;
            cntr = elems.cntr;
            if (this._disabled(tab)) {
                return;
            }
            if (this._showing(tab)) {
                return;
            }
            this._removeShowClass();
            this._addShowClass(tab, cntr);
            // show current tablist item
            this._trigger('show', [tab, cntr]);
            tab.trigger('show:bindtabs');
            return tab;
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
    function isSet(toCheck) {
        return typeof toCheck !== 'undefined';
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
    function isString(toCheck) {
        return typeof toCheck === 'string';
    }
    $.fn[pluginName] = function (options, retElems) {
        if (retElems === void 0) { retElems = false; }
        var namespaced = pluginNs + "-" + pluginName;
        var instances = $();
        this.each(function () {
            var $this = $(this);
            if (!$this.data(namespaced)) {
                $this.data(namespaced, new BindTabs(this, options));
            }
            instances = instances.add($this.data(namespaced));
        });
        return retElems ? this : instances;
    };
})();

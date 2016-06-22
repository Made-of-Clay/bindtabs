/// <reference path="./jquery.d.ts" />
/// <reference path="./bindtabs-options.d.ts" />
;
(function pluginSetupWrapper() {
    var pluginName = 'bindTabs', pluginNs = 'moc';
    var defaults = {
        wheels: 4
    };
    var BindTabs = (function () {
        function BindTabs(element, options) {
            this._pluginClass = 'bind_tabs';
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
        };
        BindTabs.prototype._checkOptions = function () {
            var opts = this.options;
            // assign tabs & containers
            if (!isEmpty(opts.tabs) && opts.containers) {
                this._assignRelations('tabs', opts.tabs);
                this._assignRelations('containers', opts.containers);
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
        BindTabs.prototype._addPluginMarkup = function () {
            this._addPluginClass();
        };
        BindTabs.prototype._addPluginClass = function () {
            var plugin = this;
            $.each([plugin.element, plugin.tabs, plugin.containers], function (index, item) {
                $(item).addClass(plugin._pluginClass);
            });
        };
        BindTabs.prototype._initListeners = function () {
            var plugin = this;
            plugin.element;
        };
        return BindTabs;
    }());
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
    $.fn[pluginName] = function (options) {
        var namespaced = pluginNs + "-" + pluginName;
        return this.each(function () {
            if (!$(this).data(namespaced)) {
                $(this).data(namespaced, new BindTabs(this, options));
            }
        });
    };
})();

/// <reference path="./jquery.d.ts" />
/// <reference path="./bindtabs-options.d.ts" />
;(function pluginSetupWrapper() {
    var pluginName: string = 'bindTabs',
        pluginNs: string = 'moc';
    var defaults = {
            wheels: 4
        };

    class BindTabs {
        element: JQuery;
        tabs: JQuery;
        containers: JQuery;

        options: BtOptions;

        _name: String;
        _defaults: Object;

        _pluginClass = 'bind_tabs';

        constructor(element, options) {
            this.element = $(element);
            this.options = $.extend({}, defaults, options) as BtOptions;
            this._name = pluginName;
            this._defaults = defaults;
            this._create();
            return this;
        }

        _create() {
            this._checkOptions();
            this._addPluginMarkup();
            this._initListeners();
        }

        _checkOptions() {
            var opts = this.options;
            // assign tabs & containers
            if(!isEmpty(opts.tabs) && opts.containers) {
                this._assignRelations('tabs', opts.tabs);
                this._assignRelations('containers', opts.containers);
            }
        }
        _assignRelations(prop, elem) {
            var plugin = this;

            if(isJQuery(elem) && elem.length > 0) {
                plugin[prop] = elem;
            } else {
                var findTabs = plugin.element.find(elem).not(`.${plugin._pluginClass}`);
                if(findTabs.length > 0) {
                    plugin[prop] = findTabs;
                }
            }
        }

        _addPluginMarkup() {
            this._addPluginClass();
        }
        _addPluginClass() {
            var plugin = this;
            $.each([plugin.element, plugin.tabs, plugin.containers], (index, item) => {
                $(item).addClass(plugin._pluginClass);
            });
        }
        
        _initListeners() {
            var plugin = this;
            plugin.element
            ;
        }
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

    $.fn[pluginName] = function(options: Object) {
        var namespaced: string = `${pluginNs}-${pluginName}`;
        return this.each(function() {
            if (!$(this).data(namespaced)) {
                $(this).data(namespaced, new BindTabs(this, options));
            }
        });
    }
})();
/// <reference path="./jquery.d.ts" />
/// <reference path="./bindtabs-options.d.ts" />
;(function pluginSetupWrapper() {
    var pluginName: string = 'bindTabs',
        pluginNs: string = 'moc';
    var defaults = {
            wheels: 4
        };

    const _pluginClass = 'bind_tabs';
    const _tabClass = 'bt_tab';
    const _cntrClass = 'bt_cntr';

    class BindTabs {
        element: JQuery;
        tabs: JQuery;
        containers: JQuery;
        pairIds: string[] = [];

        options: BtOptions;

        _name: String;
        _defaults: Object;

        constructor(element, options) {
            this.element = $(element);
            this.options = $.extend({}, defaults, options) as BtOptions;
            this._name = pluginName;
            this._defaults = defaults;
            this._create();
            return this;
        }

        get _pluginClass() {
            return _pluginClass;
        }
        get _tabClass() {
            return _tabClass;
        }
        get _cntrClass() {
            return _cntrClass;
        }

        _create() {
            this._checkOptions();
            this._addPluginMarkup();
            this._initListeners();
        }

        _checkOptions() {
            var opts = this.options;
            // assign tabs & containers
            if(!isEmpty(opts.tabs) && !isEmpty(opts.containers)) {
                this._assignRelations('tabs', opts.tabs);
                this._assignRelations('containers', opts.containers);
            } else {
                // check data atts
                // if even THOSE fail, default to what's in markup
                this._checkMarkupForElems();
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
        _checkMarkupForElems() {
            var dataAtts = this.element.data();
            var tabs, containers;

            if(!isEmpty(dataAtts.boundtabs) && !isEmpty(dataAtts.boundcontainers)) {
                tabs = `.${dataAtts.boundtabs}`;
                containers = `.${dataAtts.boundcontainers}`;
            } else {
                tabs = this.element.children('ul').first();
                containers = this.element.children('div').first();
            }
            this._assignRelations('tabs', tabs);
            this._assignRelations('containers', containers);
        }

        _addPluginMarkup() {
            this._addPluginClass();
            this._addPluginElClasses();
            this._addPairId();
        }
        _addPluginClass() {
            var plugin = this;
            $.each([plugin.element, plugin.tabs, plugin.containers], (index, item) => {
                $(item).addClass(plugin._pluginClass);
            });
        }
        _addPluginElClasses() {
            var plugin = this;

            this.element.addClass('bt_wrapper');
            this.tabs.addClass('bt_tabs');
            this.containers.addClass('bt_containers');

            addClassToEach(this._tabClass, this.tabs.children());
            addClassToEach(this._cntrClass, this.containers.children());
        }
        _addPairId() {
            // make this chunk conditional; eventually dynamicTabGen will
            // create tabs/cntrs and add pairs too
            this.tabs.children('.bt_tab').each((index, tab) => {
                let pairId: string = this._makeNewPairId();
                let $tab = $(tab);
                let $cntr = this.containers.children(`:eq(${$tab.index()})`);
                $tab.attr('data-pairid', pairId);
                $cntr.attr('data-pairid', pairId);
            });
        }
        _makeNewPairId() {
            var newId = makeDateId();
            while($.inArray(newId, this.pairIds) > -1) {
                newId = makeDateId();
            }
            this.pairIds.push(newId);
            return newId;
        }

        _initListeners() {
            var plugin = this;
            plugin.element
            ;
        }

        _checkElem(elem) {
            if(!isString(elem) && typeof elem !== 'object') {
                console.error('You must pass an object or string selector to _checkElem(). This was passed:',elem);
                return null;
            }
            if(elem.length === 0) {
                console.warn('The element you passed to _checkElem() was empty:', elem);
                return null;
            }

            switch(typeof elem) {
                case 'string': return this.element.find(elem);
                case 'object': return (elem instanceof jQuery) ? elem : $(elem);
            }
        }

        pairedTo(elem: JQuery | HTMLElement) {
            var group: string;
            var el: any = this._checkElem(elem);
            if (el === null) return;

            if(el.hasClass('bt_tab')) {
                group = 'containers';
            } else if(el.hasClass('bt_cntr')) {
                group = 'tabs';
            } else {
                console.error('Something went wrong; passed element does not have the right class:', el);
                return null;
            }
            return this[group].children(`[data-pairid="${el.data('pairid')}"]`);
        }
    }

    function addClassToEach(className, elems) {
        $(elems).each((index, elem) => {
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

    $.fn[pluginName] = function(options: Object, retElems: boolean = false) {
        var namespaced: string = `${pluginNs}-${pluginName}`;
        var instances = $();

        this.each(function() {
            var $this = $(this);
            if (!$this.data(namespaced)) {
                $this.data(namespaced, new BindTabs(this, options));
            }
            instances = instances.add($this.data(namespaced));
        });
        return retElems ? this : instances;
    }
})();
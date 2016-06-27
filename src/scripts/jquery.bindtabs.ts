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
    const _showClass = 'is-showing';

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
        get _showClass() {
            return _showClass;
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
            this._showStartingTab();
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
        _showStartingTab(showFirstInSet: boolean = false) {
            this.show(this.tabs.children().first());
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
                console.trace('Empty _checkElem()');
                return null;
            }

            switch(typeof elem) {
                case 'string': return this.element.find(elem);
                case 'object': return (elem instanceof jQuery) ? elem : $(elem);
            }
        }


        _assignElems(tab, cntr, elem:JQuery) {
            var elements: { tab:any, cntr:any } = {
                tab: null,
                cntr: null
            };
            if(elem.hasClass('bt_cntr')) {
                elements.cntr = elem;
                elements.tab = this.pairedTo(elem);
            } else {
                elements.tab = elem;
                elements.cntr = this.pairedTo(elem);
            }

            return elements;
        }

        _disabled(tab: JQuery) {
            return tab.hasClass('is-disabled');
        }

        _showing(tab:JQuery) {
            var showSelector = '.'+this._showClass;
            var showingTab = this.tabs.children(showSelector);

            if(showingTab.length === 0) return false;
            return (tab.attr('id') === showingTab.attr('id'));
        }

        _removeShowClass(tab:JQuery, container:JQuery) {
            var showSelector = '.'+this._showClass;
            var plugin = this;

            $.each([tab, container], (index, elem) => {
                let collection = ($(elem).hasClass('bt_tab')) ? 'tabs' : 'containers';
                // plugin[collection].children(showSelector)
                plugin.element.find(elem)
                    .removeClass(plugin._showClass)
                    .trigger('blur:bindtabs');
            });
        }

        _addShowClass(tab:JQuery, container:JQuery) {
            this.element.find(tab).addClass(this._showClass);
            this.element.find(container).addClass(this._showClass);
        }

        _trigger(event:string, collection:JQuery[]) {
            var evt:string = `${event}:bindtabs`;
            $.each(collection, (index, elem) => {
                $(elem).trigger(evt);
            });
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

        show(srcElem: JQuery | string) {
            var tab: JQuery, cntr: JQuery;
            var elem = this._checkElem(srcElem);
            if(elem === null) return;

            var elems = this._assignElems(tab, cntr, elem);
            tab = elems.tab;
            cntr = elems.cntr;

            // tab = elems.tab;
            if(this._disabled(tab)) return;
            if(this._showing(tab)) return;

            this._removeShowClass(tab, cntr);
            this._addShowClass(tab, cntr);
            // show current tablist item
            this._trigger('show', [tab, cntr]);

            return tab;
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
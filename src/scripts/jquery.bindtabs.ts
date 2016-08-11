/// <reference path="./jquery.d.ts" />
/// <reference path="./bindtabs-options.d.ts" />
/// <reference path="./bindtabs-event-registry-object.d.ts" />

/*
    Custom Events:
    - shown
    - closed
 */
;(function pluginSetupWrapper() {
    var pluginName: string = 'bindTabs',
        pluginNs: string = 'moc';
    var defaults = {
        closable: false,
        tablist: true
    };

    /*
    possible additions:
    - callbacks before major events (show, close, load, ...)
        -> these are in contrast to events fired after actions finish (show, closed, loaded, ...)
     */

    const pluginClass = 'bind_tabs';
    const tabClass = 'bt_tab';
    const cntrClass = 'bt_cntr';
    const showClass = 'is-showing';
    const tabNameWrapClass = 'tabNameWrap';
    const closeIconClass = 'bt_closeTab';
    const closableClass = 'bt_closable';

    class BindTabs {
        element: JQuery;
        tabs: JQuery;
        containers: JQuery;
        pairIds: string[] = [];
        tabNameWrapMarkup: string = `<span class="${tabNameWrapClass}">`;

        options: BtOptions;

        eventRegistry = {};

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

        _create() {
            this._checkOptions();
            this._addPluginMarkup();
            this._initListeners();

            this.element.trigger('ready:bindtabs');
        }

        _checkOptions() {
            var opts = this.options;

            if(!isEmpty(opts.tabs) && !isEmpty(opts.containers)) {
                this._assignRelations('tabs', opts.tabs);
                this._assignRelations('containers', opts.containers);
            } else {
                this._checkMarkupForElems();
            }

            if(!is('boolean', opts.tablist)) {
                opts.tablist = true;
            }
        }
        _assignRelations(prop, elem) {
            var plugin = this;

            if(isJQuery(elem) && elem.length > 0) {
                plugin[prop] = elem;
            } else {
                var findTabs = plugin.element.find(elem).not(`.${pluginClass}`);
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
            this._addTabnameWrapper();
            this._addPairId();
            this._showStartingTab();
            this._checkForTablist();
        }
        _addPluginClass() {
            var plugin = this;
            $.each([plugin.element, plugin.tabs, plugin.containers], (index, item) => {
                $(item).addClass(pluginClass);
            });
        }
        _addPluginElClasses() {
            var plugin = this;

            this.element.addClass('bt_wrapper');
            this.tabs.addClass('bt_tabs');
            this.containers.addClass('bt_containers');

            addClassToEach(tabClass, this.tabs.children());
            addClassToEach(cntrClass, this.containers.children());
        }
        _addTabnameWrapper() {
            var closeMarkup = $('<span>', {
                class: closeIconClass,
                html: '&times;'
            });
            var tabs = this.tabs.children('.bt_tab');
            tabs.wrapInner(this.tabNameWrapMarkup);

            if(this.options.closable) {
                tabs.addClass(closableClass).append((closeMarkup));
            }
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

        _checkForTablist() {
            if(this.options.tablist) {
                var tabsWithoutList = this.tabs.html();
                var tabListBtn = $('<li>', { class:'notab' }).appendTo(this.tabs);
                var tabListToggle = $('<span>', { class:'bt_toggle' }).appendTo(tabListBtn)
                var tabList = $('<ul>', { class:'bt_list', html:tabsWithoutList }).appendTo(tabListBtn);

                tabList.find('.bt_tab').toggleClass('bt_tab bt_listItem');
            }
        }

        _initListeners() {
            var plugin = this;

            plugin.tabs
                .on('click', '.bt_tab', function showClkdPair(event) {
                    plugin.show(event.currentTarget);
                })
                .on('click', '.bt_closeTab', closeClkdPair)
            ;

            if(plugin.options.tablist) {
                plugin.tabs
                    .on('click', '.notab', toggleTabList)
                    .on('click', '.bt_listItem', showTabFromTablist)
                ;
            }

            function closeClkdPair(event) {
                var pairId;
                var $this = $(this);
                var tab:JQuery = $this.closest('.bt_tab');
                if(tab.length === 0) {
                    pairId = $this.closest('.bt_listItem').data('pairid');
                    tab = plugin.getTabs().filter(`[data-pairid="${pairId}"]`)
                }
                plugin.close(tab);
                event.stopPropagation();
            }
            function toggleTabList(event) {
                var targetClasses : string = $(event.target).attr('class');
                if(isInString(['notab','bt_toggle'], targetClasses)) {
                    $(event.currentTarget).toggleClass(showClass);
                }
            }
            function showTabFromTablist(event) {
                var pairId = $(this).data('pairid');
                var tab = plugin.getTabs().filter(`[data-pairid="${pairId}"]`);
                plugin.show(tab);
            }
        }

        /**
         * Checks passed element for JQuery type and returns either JQuery object or null with error
         * @param {any} elem
         * @method
         */
        _checkElem(elem) {
            // if(!isString(elem) && typeof elem !== 'object') {
            if(!is('string', elem) && !is('object', elem)) {
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

        _assignElems(elem:JQuery) {
            var elements: { tab:any, cntr:any } = {
                tab: null,
                cntr: null
            };

            if(isEmpty(elem)) {
                elements.tab = this.getCurTab();
                elements.cntr = this.getCurCntr();
            } else if(elem.hasClass('bt_cntr')) {
                elements.tab = this.pairedTo(elem);
                elements.cntr = elem;
            } else if(elem.hasClass('bt_tab')) {
                elements.tab = elem;
                elements.cntr = this.pairedTo(elem);
            }

            return elements;
        }

        _disabled(tab: JQuery) {
            return tab.hasClass('is-disabled');
        }

        _showing(tab:JQuery) {
            var showSelector = '.'+showClass;
            var showingTab = this.tabs.children(showSelector);

            if(showingTab.length === 0) return false;
            return (tab.data('pairid') === showingTab.data('pairid'));
        }

        _removeShowClass(tab:JQuery = $(), container:JQuery = $()) {
            var showSelector = '.'+showClass;
            var elements = $();

            if(isEmpty(tab.length)) {
                tab = tab.add(this.tabs.children('.'+showClass));
            }
            elements = elements.add(tab);

            if(isEmpty(container.length)) {
                container = this.containers.children('.'+showClass);
            }
            elements = elements.add(container);

            elements.removeClass(showClass).trigger('blur:bindtabs');
        }

        _addShowClass(tab:JQuery, container:JQuery) {
            this.element.find(tab).addClass(showClass);
            this.element.find(container).addClass(showClass);
        }

        _trigger(event:string, collection:JQuery[], data: any = null) {
            var evt:string = `${event}:bindtabs`;
            $.each(collection, function triggerEventOnCollection(index, elem) {
                $(elem).trigger(evt, data);
            });
        }

        _checkTabDisplay(tab: JQuery | HTMLElement) {
            var $tab: JQuery = this._checkElem(tab);
            if($tab.hasClass(showClass)) {
                this.show(this.getTabs().first()); // show first tab when closing showing tab
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

        getCurrent(toGet?: string) {
            var toReturn: JQuery = $();

            switch(toGet) {
                case 'tab':
                    toReturn = this.tabs.children('.'+showClass);
                    break;

                case 'container':
                case 'cntr':
                    toReturn = this.containers.children('.'+showClass);
                    break;

                default:
                    toReturn = toReturn.add(this.tabs.children('.'+showClass));
                    toReturn = toReturn.add(this.containers.children('.'+showClass));
                    break;
            }
            return toReturn;
        }
        getCurTab() {
            return this.getCurrent('tab');
        }
        getCurCntr() {
            return this.getCurrent('container');
        }

        getTabs() {
            return this.tabs.children('.bt_tab');
        }
        getContainers() {
            return this.containers.children('.bt_cntr');
        }

        show(srcElem: JQuery | string | HTMLElement) {
            var tab: JQuery, cntr: JQuery;
            var elem = this._checkElem(srcElem);
            if(elem === null) return;

            var elems = this._assignElems(elem);
            tab = elems.tab;
            cntr = elems.cntr;

            if(this._showing(tab)  ||
               this._disabled(tab) ||
               this._checkEventRegistry('show', tab) === false) return;

            this._removeShowClass();
            this._addShowClass(tab, cntr);
            // show current tablist item
            this._trigger('show', [tab, cntr]);
            // tab.trigger('show:bindtabs');
            return tab;
        }

        close(srcElem?: JQuery | HTMLElement) {
            var tab: JQuery;
            var cntr: JQuery;
            var elem: JQuery = this._checkElem(srcElem);
            var elements = this._assignElems(elem);
            tab = elements.tab;
            cntr = elements.cntr;

            if(!tab.hasClass('bt_closable')) {
                console.warn('This tab is not closable');
                console.trace('close');
                return;
            }

            if(this._checkEventRegistry('close', tab) === false) return;

            var $elems = $().add(tab).add(cntr);
            var prevTab = tab.prev();

            if(this.options.closable) {
                var pairId = tab.data('pairid');
                var pairedTabLi = this.tabs.children('.notab').find(`.bt_listItem[data-pairid="${pairId}"]`);
                $elems = $elems.add(pairedTabLi);
            }

            // check closable
            // check event registry

            this._trigger('close', [$elems]);
            $elems.remove();
            this._checkTabDisplay(tab);
            this._trigger('closed', [this.element], {tab:tab, cntr:cntr});
        }


        addEventHook(event:string, tab, fn) {
            tab = this._prepTabForHook(tab);
            fn = this._prepFnForHook(fn);
            this._addEventRegistry(event, { tab:tab, fn:fn });
        }
        addShowHook(tab, func) {
            this.addEventHook('show', tab, func)
        }
        addCloseHook(tab, func) {
            this.addEventHook('close', tab, func);
        }
        _prepTabForHook(tab: JQuery | HTMLElement) {
            var checkedEl = this._checkElem(tab);
            if(checkedEl.hasClass(cntrClass)) {
                tab = this.pairedTo(checkedEl);
            } else if(!checkedEl.hasClass(tabClass)) {
                throw new ReferenceError('Event hook elements must be either a tab or container; none were passed');
            }
            return tab;
        }
        _prepFnForHook(fn) {
            if(!$.isFunction(fn) && fn !== false) {
                throw new TypeError('Event hook callbacks must either be a function or boolean false (to prevent action from occurring)');
            } else return fn;
        }
        _addEventRegistry(event:string, regObj:BtEventRegistryObject) {
            if(this.eventRegistry[event] === undefined) {
                this.eventRegistry[event] = [];
            }
            this.eventRegistry[event].push(regObj);
        }
        _checkEventRegistry(event:string, tab:JQuery) {
            var plugin = this;
            var evtReg = this.eventRegistry[event];
            var doEvent = true;

            if(evtReg !== undefined) {
                evtReg.forEach(checkEachReg);
            }

            return doEvent;

            function checkEachReg(regObj) {
                var checkTab = plugin._checkElem(regObj.tab);
                if(tab.attr('id') === checkTab.attr('id')) {
                    if(regObj.fn() === false) {
                        doEvent = false;
                    }
                }
            }
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
    // function isSet(toCheck) {
    //     return typeof toCheck !== 'undefined';
    // }
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
    function is(type:string, toCheck) {
        type = (type === 'set') ? 'undefined' : type;
        return typeof toCheck === type;
    }
    // function isString(toCheck) {
    //     return typeof toCheck === 'string';
    // }
    // function isObject(toCheck) {
    //     return typeof toCheck === 'object';
    // }
    function isInString(needle:string|string[], haystack:string, useAnd?:boolean) {
        var glue:string, rxp, pattern:string;
        useAnd  = (typeof useAnd === 'boolean') ? useAnd : false;
        glue    = useAnd ? '&' : '|';
        pattern = (Array.isArray(needle)) ? needle.join(glue) : needle;
        rxp     = new RegExp(pattern);
        return haystack.search(rxp) > -1;
    }
    // function isBool(toCheck) {
    //     return typeof toCheck === 'boolean';
    // }

    $.fn[pluginName] = function(options: Object, retElems: boolean = false) {
        var namespaced: string = `${pluginNs}-${pluginName}`;
        var instances = $();

        this.each(() => {
            var $this = $(this);
            if (!$this.data(namespaced)) {
                $this.data(namespaced, new BindTabs(this, options));
            }
            instances = instances.add($this.data(namespaced));
        });
        return retElems ? this : instances;
    }
})();
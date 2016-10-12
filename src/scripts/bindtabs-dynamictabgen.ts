/// <reference path="./dynamictabgen-options.d.ts" />
/// <reference path="./dynamictabgen-init-opts.d.ts" />

const DEFAULT_TABNAME: string = `<em>New Tab</em>`;
const NEWTAB_PLACEHOLDER: string = ``;
const DYN_CLASS: string = 'bt_dynamic';
var   TAB_CLASS: string  = '';
var   TABLI_CLASS: string  = '';
var   CNTR_CLASS: string = '';
var   TABNAME_WRAP_CLASS: string = '';

export class DynamicTabGen {
    constructor(options: DynTabGenInitOpts) {
        this._setNewConsts(options);
    }

    _setNewConsts(conf) {
        TAB_CLASS = conf.tabClass;
        TABLI_CLASS = conf.tabLiClass;
        TABNAME_WRAP_CLASS = conf.tabNameWrapClass;
        CNTR_CLASS = conf.cntrClass;
    }

    newTab(options: DynTabGenOptions) {
        var checkedOpts: DynTabGenOptions = this._checkCustIdVariations(options);
        var newTab: JQuery = this._buildNewTab(checkedOpts);
        var newTabLi: JQuery = this._buildNewTabLi(newTab);
        var newCntr: JQuery = this._buildNewCntr(checkedOpts);
        return {
            tab: newTab,
            tabLi: newTabLi,
            cntr: newCntr
        };
    }
    _buildNewTab(options: DynTabGenOptions) {
        var tabNameWrap: JQuery = $('<span>', { 
            class: TABNAME_WRAP_CLASS,
            html: options.tabName || DEFAULT_TABNAME
        });
        var customTabClass = this._checkForCustTabClass(options);
        var newTabAtts = {
            class: `${TAB_CLASS} ${DYN_CLASS} ${customTabClass}`,
            'data-pairid': options.pairid,
            'data-custid': options.custId,
            title: options.tabName
        };
        var newTab: JQuery = $('<li>', newTabAtts).append(tabNameWrap);
        return newTab;
    }
    _buildNewTabLi(newTab: JQuery) {
        var newTabLi: JQuery = newTab.clone()
            .toggleClass(`${TAB_CLASS} ${TABLI_CLASS}`)
        ;
        return newTabLi;
    }
    _buildNewCntr(options: DynTabGenOptions) {
        var customCntrClass = this._checkForCustCntrClass(options);
        var newCntrAtts = {
            class: `${CNTR_CLASS} ${DYN_CLASS} ${customCntrClass}`,
            'data-pairid': options.pairid
        };
        var newCntr: JQuery = $('<div>', newCntrAtts);
        return newCntr;
    }
    _checkCustIdVariations(options: DynTabGenOptions): DynTabGenOptions {
        if(!options.hasOwnProperty('custId')) {
            ['custid','custID'].forEach(key => {
                if(options.hasOwnProperty(key)) {
                    options.custId = key;
                }
            });
        }
        return options;
    }
    _checkForCustTabClass(options: DynTabGenOptions) {
        return options.hasOwnProperty('tabClass') ? options.tabClass : '';
    }
    _checkForCustCntrClass(options: DynTabGenOptions) {
        return options.hasOwnProperty('cntrClass') ? options.cntrClass : '';
    }
}


/*
all new tabs need at LEAST the following:
- tab name (defaults to New Tab)
- tab class *
- container class *
        * will always min have "bt-tab" & "bt-cntr"
- pairid (generated from BindTabs object?)
*/
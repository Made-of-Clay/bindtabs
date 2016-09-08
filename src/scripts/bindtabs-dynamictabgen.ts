/// <reference path="./dynamictabgen-options.d.ts" />
/// <reference path="./dynamictabgen-init-opts.d.ts" />

const NEWTAB_PLACEHOLDER:string = 'New Tab';
const DEFAULT_TABNAME:string = `<em>${NEWTAB_PLACEHOLDER}</em>`;

export class DynamicTabGen {
    foo: string;

    constructor(options: DynTabGenInitOpts) {
        this._setNewConsts(options);
    }

    _setNewConsts({tabClass, cntrClass}) {
        const TAB_CLASS: string = tabClass;
        const CNTR_CLASS: string = cntrClass;
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
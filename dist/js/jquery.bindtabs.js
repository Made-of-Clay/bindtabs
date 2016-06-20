var jQuery = jQuery || {}; // shuts TypeScript up
(function pluginSetupWrapper($) {
    // var pluginName: string = 'bindTabs',
    //     pluginNs: string = 'moc';
    // var defaults = {
    //         wheels: 4
    //     };
    // class BindTabs {
    //     element: Object;
    //     options: Object;
    //     _name: String;
    //     _defaults: Object;
    //     constructor(element, options) {
    //         this.element = $(element);
    //         this.options = $.extend({}, defaults, options);
    //         this._name = pluginName;
    //         this._defaults = defaults;
    //         this._create();
    //     }
    //     _create() {
    //         this.element.addClass('vehicle-class');
    //         _initListeners(this);
    //     }
    //     honk() {
    //         alert('beep beep');
    //     }
    // }
    // function _initListeners(plugin) {
    //     plugin.element.on('click', 'button.horn', (event) => {
    //         plugin.honk();
    //     });
    // }
    // $.fn[pluginName] = function(options: Object) {
    //     var namespaced: string = `${pluginName}-${pluginNs}`;
    //     return this.each(function() {
    //         if (!$.data(this, namespaced)) {
    //             $.data(this, namespaced), new BindTabs(this, options);
    //         }
    //     });
    // }
})(jQuery);

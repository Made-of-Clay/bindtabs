/// <reference path="./jquery.d.ts" />
(function pluginSetupWrapper() {
    var pluginName = 'bindTabs', pluginNs = 'moc';
    var defaults = {
        wheels: 4
    };
    var BindTabs = (function () {
        function BindTabs(element, options) {
            this.element = $(element);
            this.options = $.extend({}, defaults, options);
            this._name = pluginName;
            this._defaults = defaults;
            this._create();
        }
        BindTabs.prototype._create = function () {
            this.element.addClass('vehicle-class');
            _initListeners(this);
        };
        return BindTabs;
    }());
    function _initListeners(plugin) {
        plugin.element.on('click', 'button.horn', function (event) {
            plugin.honk();
        });
    }
    $.fn[pluginName] = function (options) {
        var namespaced = pluginName + "-" + pluginNs;
        return this.each(function () {
            if (!$(this).data(namespaced)) {
                $(this).data(namespaced), new BindTabs(this, options);
            }
        });
    };
})();

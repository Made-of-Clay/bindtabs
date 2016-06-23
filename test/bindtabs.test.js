describe('bindTabs', function () {
    var bt, bto;
    describe('initialization', function () {
        afterEach(function() {
            $('.wrapper').not('#template, .ignore').remove();
            bt = null;
            bto = null;
        })
        it('should accept object init options', function () {
            var wrapId = 'simple-wrapper';
            var bt = clone(wrapId);

            var opts = {
                tabs: '.tabs',
                containers: $(`#${wrapId} > .containers`)
            };

            bt.bindTabs(opts);

            // after init - has classes
            bt.hasClass('bind_tabs').should.be.true;
            bt.children('.bind_tabs').length.should.equal(2);
        });
        it('should accept data-attr init options', function() {
            var wrapId = 'simple-wrapper';
            var bt = clone(wrapId);

            bt.attr({
                'data-boundtabs':'tabs',
                'data-boundcontainers':'containers'
            });

            bt.bindTabs();

            // after init - has classes
            bt.hasClass('bind_tabs').should.be.true;
            bt.children('.bind_tabs').length.should.equal(2);
        });
        it('should assume if no options are sent, to initialize based on existing markup', function() {
            var wrapId = 'def-init';
            var bt = clone(wrapId);

            bt.bindTabs();

            // after init - has classes
            bt.hasClass('bind_tabs').should.be.true;
            bt.children('.bind_tabs').length.should.equal(2);
        });
        it('should add plugin element classes to the wrapper, tabs, and containers', function () {
            var wrapId = 'add-el-classes';
            var bt = clone(wrapId);

            bt.bindTabs();

            // after init - has classes
            bt.hasClass('bt_wrapper').should.be.true;
            bt.children('.bt_tabs').length.should.equal(1);
            bt.children('.bt_containers').length.should.equal(1);
        });
        it('should return an instance of the initialized object');
    });
});

function clone(id) {
    return $('#template').clone().appendTo(document.body).attr('id', id);
}
function noRemove(el) {
    el.addClass('ignore');
}
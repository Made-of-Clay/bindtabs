describe('bindTabs', function () {
    var bt, bto;
    describe('initialization', function () {
        it('should accept object init options', function () {
            var opts = {
                tabs: '#simple-tabs',
                containers: $('#simple-containers')
            };
            bt = $('#simple-wrapper');

            expect(bt.hasClass('bind_tabs')).to.be.false;
            expect(bt.children('.bind_tabs').length).to.equal(0);

            bto = bt.bindTabs(opts);

            expect(bt.hasClass('bind_tabs')).to.be.true;
            expect(bt.children('.bind_tabs').length).to.equal(2);
        });
        it('should accept data-attr init options');
        it('should assume if no options are sent, to initialize based on existing markup');
        it('should add plugin classes to the wrapper, tabs, and containers');
        it('should return an instance of the initialized object');
    });
});
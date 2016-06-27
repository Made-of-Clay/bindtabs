describe('bindTabs', function () {
    var bt, bto;
    showClass = 'is-showing';

    afterEach(function() {
        $('.wrapper').not('#template, .ignore').remove();
        bt = null;
        bto = null;
    });
    
    describe('initialization', function () {
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
        it('should return an instance of the initialized object', function () {
            var wrapId = 'add-el-classes';
            var bt = clone(wrapId);

            bto = bt.bindTabs();

            bto[0]._name.should.equal('bindTabs');
        });
        it('should add element-specific plugin class for tabs', function () {
            var wrapId = '';
            var bt = clone(wrapId);

            bto = bt.bindTabs();
            bto = bto[0];
            var tabsHaveClass = eachHasClass('bt_tab', bto.tabs.children());

            tabsHaveClass.should.be.true;
        });
        it('should add element-specific plugin class for containers', function () {
            var wrapId = 'add-cntr-class';
            var bt = clone(wrapId);

            bto = bt.bindTabs();
            bto = bto[0];
            var cntrsHaveClass = eachHasClass('bt_cntr', bto.containers.children());

            cntrsHaveClass.should.be.true;
        });
        it('should have added data-pairid to each tab and container', function () {
            var bt = clone();

            bto = bt.bindTabs();
            bto = bto[0];

            var allHavePairIds = true;
            bto.element.find('.bt_tab, .bt_cntr').each(function (index, elem) {
                expect($(elem).data('pairid')).to.be.ok;
                if($(elem).data('pairid') === undefined) {
                    allHavePairIds = false;
                }
            });
            // allHavePairIds.should.be.true;
        });
        it('should hide all containers except for what "is-showing"', function () {
            var bt = clone();

            bto = bt.bindTabs();
            bto = bto[0];
            var showingTab = bto.tabs.children('.'+showClass);
            var showingCntr = bto.pairedTo(showingTab);
            var onlyPairedCntrShows = checkIfCntrsHidden(bto.containers.children(), showingCntr);

            expect(showingTab).to.be.ok;
            expect(showingCntr).to.be.ok;
            onlyPairedCntrShows.should.be.true;
        });
    });

    describe('DOM events', function () {
        it('should show related container when tab is clicked', function () {
            var bt = clone();
noRemove(bt);
            bto = bt.bindTabs();
            bto = bto[0];
            var containers = bto.containers.children();
            var firstCntr = containers.first();
            var lastCntr = containers.last();
            bto.pairedTo(lastCntr).click();

            lastCntr.hasClass('is-showing').should.be.true;
            firstCntr.hasClass('is-showing').should.be.false;
        });
        // it('');
        // it('');
        // it('');
        // it('');
        // it('');
    });
});

function clone(id) {
    id = (id !== undefined) ? id : '';
    return $('#template').clone().appendTo(document.body).attr('id', id);
}
function noRemove(el) {
    el.addClass('ignore');
}
function eachHasClass(className, elems) {
    var allElemsHaveClass = true;
    elems.each(function (index, elem) {
        if(!$(elem).hasClass(className)) {
            allElemsHaveClass = false;
        }
    });
    return allElemsHaveClass;
}
function checkIfCntrsHidden(containers, showingCntr) {
    var allButShowingAreHidden = true;
    $(containers).each(function(index, cntr) {
        // var $cntr = $(cntr);
        if(isShowing(cntr) && $(cntr).data('pairid') !== showingCntr.data('pairid')) {
            allButShowingAreHidden = false;
        }
    });
    return allButShowingAreHidden;
}
function isShowing(container) {
    if(container instanceof jQuery === false) {
        container = $(container);
    }
    return container.hasClass(showClass);
}
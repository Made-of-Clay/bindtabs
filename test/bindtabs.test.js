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
        it('should add a text wrapper around the tab name', function () {
            var bt = clone();
            bto = bt.bindTabs();
            bto = bto[0];

            bto.tabs.children().each(function (index, elem) {
                $(elem).children('.tabNameWrap').length.should.be.above(0);
            });
        });
    });

    describe('init options', function () {
        it('should add a close icon if the option is set to true', function () {
            var bt = clone();
            bto = bt.bindTabs({
                closable: true
            });
            bto = bto[0];

            bto.tabs.children().each(function (index, elem) {
                $(elem).children('.bt_closeTab').length.should.be.above(0);
            });
        });
    });

    describe('DOM events', function () {
        it('should show related container when tab is clicked', function () {
            var bt = clone();
            bto = bt.bindTabs();
            bto = bto[0];
            var containers = bto.containers.children();
            var firstCntr = containers.first();
            var lastCntr = containers.last();
            bto.pairedTo(lastCntr).click();

            lastCntr.hasClass('is-showing').should.be.true;
            firstCntr.hasClass('is-showing').should.be.false;
        });
        it('should close the tab/cntr pair when the close icon is clicked', function () {
            var bt = clone();
            bto = bt.bindTabs({
                closable: true
            });
            bto = bto[0];
            var tabs = bto.tabs.children('.bt_tab');
            var cntrs = bto.containers.children('.bt_cntr');
            var tabCount = tabs.length;
            var cntrCount = cntrs.length;

            tabs.first().find('.bt_closeTab').click();

            bto.getTabs().length.should.equal(tabCount-1);
            bto.getContainers().length.should.equal(cntrCount-1);
        });
        // it('');
        // it('');
        // it('');
        // it('');
    });

    describe('custom published events', function () {
        it('should fire ready events when bindtabs is ready', function (done) {
            var bt = clone();
            bt.on('ready:bindtabs', function(event) {
                expect(event.type).to.equal('ready:bindtabs');
                done();
            });
            bt.bindTabs();
        });
        it('should fire show events when showing tabs', function () {
            var bt = clone();
            bto = bt.bindTabs();
            bto = bto[0];
            bto.getTabs().first().on('show:bindtabs', function () {
                expect(event.type).to.equal('show:bindtabs');
            })

            lastCntr.hasClass('is-showing').should.be.true;
            firstCntr.hasClass('is-showing').should.be.false;
        });
        it('should fire close(d) events when closing tabs');
    });

    describe('API', function () {
        it('should expose show()', function () {
            var bt = clone();
            bto = bt.bindTabs();
            bto = bto[0];
            var lastTab = bto.tabs.children('.bt_tab').last();
            bto.show(lastTab);

            expect(lastTab.hasClass(showClass)).to.be.true;
        });
        it('should expose getCurrent()', function () {
            var bt = clone();
            bto = bt.bindTabs();
            bto = bto[0];
            var firstTab = bto.tabs.children('').first();
            var curTab = bto.getCurrent('tab');

            expect(firstTab.data('pairid')).to.equal(curTab.data('pairid'));
        });
        it('should expose an alias to getCurrent() called getCurTab()', function () {
            var bt = clone();
            bto = bt.bindTabs();
            bto = bto[0];
            var firstTab = bto.tabs.children('').first();
            var curTab = bto.getCurTab('tab');

            expect(firstTab.data('pairid')).to.equal(curTab.data('pairid'));
        });
        it('should expose an alias to getCurrent() called getCurCntr()', function () {
            var bt = clone();
            bto = bt.bindTabs();
            bto = bto[0];
            var firstCntr = bto.containers.children('').first();
            var curCntr = bto.getCurCntr('container');

            expect(firstCntr.data('pairid')).to.equal(curCntr.data('pairid'));
        });
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
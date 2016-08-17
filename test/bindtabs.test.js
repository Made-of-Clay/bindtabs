describe('bindTabs', function () {
    var bt, bto;
    showClass = 'is-showing';

    beforeEach(function() {
        bt = clone();
    })
    afterEach(cleanup);
    
    describe('initialization', function () {
        it('should accept object init options', function () {
            var wrapId = 'simple-wrapper';
            bt = clone(wrapId);
            var opts = {
                tabs: '.tabs',
                containers: $(`#${wrapId} > .containers`)
            };

            bt.bindTabs(opts);

            // after init - has classes
            bt.hasClass('bind_tabs').should.be.true;
            bt.children('.bind_tabs').length.should.equal(2);
        });
        it('should generate an instance id and add it to the bt element', function () {
            bto = bt.bindTabs()[0];
            var iid = bt.data('iid');

            expect(bto.iid).to.be.ok;
            expect(iid).to.be.ok;
            expect(bto.iid).to.equal(iid);
        });
        it('should accept data-attr init options', function() {
            var wrapId = 'simple-wrapper';
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
            bt.bindTabs();

            // after init - has classes
            bt.hasClass('bind_tabs').should.be.true;
            bt.children('.bind_tabs').length.should.equal(2);
        });
        it('should add plugin element classes to the wrapper, tabs, and containers', function () {
            var wrapId = 'add-el-classes';
            bt.bindTabs();

            // after init - has classes
            bt.hasClass('bt_wrapper').should.be.true;
            bt.children('.bt_tabs').length.should.equal(1);
            bt.children('.bt_containers').length.should.equal(1);
        });
        it('should return an instance of the initialized object', function () {
            var wrapId = 'add-el-classes';
            bto = bt.bindTabs()[0];

            bto._name.should.equal('bindTabs');
        });
        it('should add element-specific plugin class for tabs', function () {
            var wrapId = '';
            bto = bt.bindTabs()[0];
            var tabsHaveClass = eachHasClass('bt_tab', bto.getTabs());

            tabsHaveClass.should.be.true;
        });
        it('should add element-specific plugin class for containers', function () {
            var wrapId = 'add-cntr-class';
            bto = bt.bindTabs()[0];
            var cntrsHaveClass = eachHasClass('bt_cntr', bto.containers.children());

            cntrsHaveClass.should.be.true;
        });
        it('should have added data-pairid to each tab and container', function () {
            bto = bt.bindTabs()[0];

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
            bto = bt.bindTabs()[0];
            var showingTab = bto.tabs.children('.'+showClass);
            var showingCntr = bto.pairedTo(showingTab);
            var onlyPairedCntrShows = checkIfCntrsHidden(bto.containers.children(), showingCntr);

            expect(showingTab).to.be.ok;
            expect(showingCntr).to.be.ok;
            onlyPairedCntrShows.should.be.true;
        });
        it('should add a text wrapper around the tab name', function () {
            bto = bt.bindTabs()[0];

            bto.getTabs().each(function (index, elem) {
                $(elem).children('.tabNameWrap').length.should.be.above(0);
            });
        });
        it('should generate an id for the instance and make accessible via API', function () {
            bto = bt.bindTabs()[0];

            expect(bto.iid).to.be.ok;
        });
    });

    describe('init options', function () {
        it('should add a close icon if the option is set to true', function () {
            bto = bt.bindTabs({
                closable: true
            });
            bto = bto[0];

            bto.getTabs().each(function (index, elem) {
                var closeTabCount = $(elem).children('.bt_closeTab').length;
                closeTabCount.should.be.above(0);
            });
        });
        it('should add the tablist if the option is set to true', function () {
            bto = bt.bindTabs({ tablist:true })[0];

            // :::TODO ::: change "notab" to "bt_notab" and then eventually "bt-notab"
            var listToggle = bto.tabs.children('.notab');
            var listToggleCount = listToggle.length;

            var tabListItems = listToggle.find('.bt_listItem');
            var tabListItemCount = tabListItems.length;
            var oneTabLiPerTab = (bto.getTabs().length === tabListItemCount);

            listToggleCount.should.equal(1); // should be one list toggle item
            expect(oneTabLiPerTab).to.be.true; // one tab li for each tab
        });
    });

    describe('DOM events', function () {
        it('should show related container when tab is clicked', function () {
            bto = bt.bindTabs();
            bto = bto[0];
            var containers = bto.containers.children();
            var firstCntr = containers.first();
            var lastCntr = containers.last();
            bto.pairedTo(lastCntr).click();

            lastCntr.hasClass(showClass).should.be.true;
            firstCntr.hasClass(showClass).should.be.false;
        });
        it('should close the tab/cntr pair when the close icon is clicked', function () {
            bto = bt.bindTabs({
                closable: true
            });
            bto = bto[0];
            var tabs = bto.getTabs();
            var cntrs = bto.containers.children('.bt_cntr');
            var tabCount = tabs.length;
            var cntrCount = cntrs.length;

            tabs.first().find('.bt_closeTab').click();

            bto.getTabs().length.should.equal(tabCount-1);
            bto.getContainers().length.should.equal(cntrCount-1);
        });
        it('should hide tabs behind a toggle-able dropdown once the space for tabs runs out');
        it('should show the tablist when the tablist icon is clicked', function () {
            bto = bt.bindTabs()[0];
            var notab = bto.tabs.find('.notab');
            var tablistShowingBeforeClick = notab.hasClass(showClass);

            notab.click();
            var tablistShowingAfterClick = notab.hasClass(showClass);

            expect(tablistShowingBeforeClick).to.be.false;
            expect(tablistShowingAfterClick).to.be.true;
        });
        it('should show a tab when its corresponding tablist item is clicked', function () {
            bto = bt.bindTabs()[0];
            var notab = bto.tabs.find('.notab');
            notab.click();

            notab.find('.bt_listItem').last().click();
            var lastTabShowing = bto.getTabs().last().hasClass(showClass);

            expect(lastTabShowing).to.be.true;
        });
        it('should close a tab when its corresponding tablist item is closed', function () {
            bto = bt.bindTabs({ closable:true })[0];
            var firstTabPairId = bto.getTabs().first().data('pairid');
            var tabCountBefore = bto.getTabs().length;
            var notab = bto.tabs.find('.notab');
            notab.click();

            var lastTabListItem = notab.find('.bt_listItem').last();
            var lastTabListItemCloseIcon = lastTabListItem.children('.bt_closeTab');
            var tabListItemHasClosableIcon = lastTabListItemCloseIcon.length > 0;
            lastTabListItemCloseIcon.click();

            var tabCountAfter = bto.getTabs().length;
            var lastTabPairId = bto.getTabs().last().data('pairid');
            var tablistCount = notab.find('.bt_listItem').length;

            tabCountBefore.should.be.above(tabCountAfter);
            lastTabPairId.should.equal(firstTabPairId); // 'cause tab 2 was closed, so last tab is now tab 1
            tabCountAfter.should.equal(tablistCount);
        });
        // it('');
        // it('');
        // it('');
    });

    describe('custom published events', function () {
        it('should fire ready event after bindtabs is ready', function (done) {
            var readySpy = sinon.spy(btReady);
            bt.on('ready:bindtabs', readySpy);
            bt.bindTabs();

            function btReady(event) {
                done();
            }
            readySpy.should.have.been.calledOnce;
        });
        it('should fire show event after showing a tab', function (done) {
            var showSpy = sinon.spy(btShown);
            bto = bt.bindTabs()[0];
            var tabs = bto.getTabs();

            tabs.on('show:bindtabs', showSpy);
            tabs.last().click();

            function btShown(event) {
                done();
            }
            showSpy.should.have.been.calledOnce;
        });
        it('should fire close event after closing a tab', function (done) {
            var closeSpy = sinon.spy(btClose);
            bto = bt.bindTabs({ closable:true })[0];

            var tabs = bto.getTabs();
            var lastTab = tabs.last();
            var count = 0;

            bto.tabs.on('close:bindtabs', '.bt_tab', closeSpy);
            bto.element.on('closed:bindtabs', closeSpy);
            lastTab.children('.bt_closeTab').click();

            function btClose(event) {
                count++;
                if(count === 2) { done(); }
            }
            closeSpy.should.have.been.calledTwice;
        });
    });

    describe('custom event hooking', function () {
        beforeEach(function () {
            bto = bt.bindTabs()[0];
        });
        it('should allow hooking into individual tabs (via tab or container)', function (done) {
            var lastTab = bto.getTabs().last();
            var lastCntr = bto.pairedTo(lastTab);
            var showSpy = sinon.spy(showHook);
            var callCount = 0;

            bto.addEventHook('show', lastTab, showSpy);
            bto.addEventHook('show', lastCntr, showSpy);
            lastTab.click();

            function showHook() {
                if(++callCount === 2) {
                    done();
                }
            }
            showSpy.should.have.been.calledTwice;
        });
        it('should throw reference error if passed "tab" isn\'t tab|container', function () {
            function badHook() {
                bto.addEventHook('show', 'poop', $.noop);
            }
            expect(badHook).to.throw(ReferenceError);
        });
        it('should throw an error when function is not function|false', function () {
            var firstTab = bto.getTabs().first();
            function goodFuncHook()     { bto.addEventHook('show', firstTab, $.noop); }
            function goodFuncBoolHook() { bto.addEventHook('show', firstTab, false); }
            function badStringHook()    { bto.addEventHook('show', firstTab, 'foobar'); }
            function badFalseyHook()    { bto.addEventHook('show', firstTab); }

            expect(goodFuncHook).to.not.throw(TypeError);
            expect(goodFuncBoolHook).to.not.throw(TypeError);
            expect(badStringHook).to.throw(TypeError);
            expect(badFalseyHook).to.throw(TypeError);
        });
        it('should provide a hook for the show event', function (done) {
            var lastTab = bto.getTabs().last();
            var lastCntr = bto.pairedTo(lastTab);
            var showSpy = sinon.spy(showHook);
            var callCount = 0;

            bto.addShowHook(lastTab, showSpy);
            bto.addShowHook(lastCntr, showSpy);
            lastTab.click();

            function showHook() {
                if(++callCount === 2) {
                    done();
                }
            }
            showSpy.should.have.been.calledTwice;
        });
        it('should provide a hook for the close event', function (done) {
            cleanup();
            bt = clone();
            bto = bt.bindTabs({ closable:true })[0];
            var lastTab = bto.getTabs().last();
            var lastCntr = bto.pairedTo(lastTab);
            var closeSpy = sinon.spy(closeHook);
            var callCount = 0;

            bto.addCloseHook(lastTab, closeSpy);
            bto.addCloseHook(lastCntr, closeSpy);

            lastTab.find('.bt_closeTab').click();

            function closeHook() {
                if(++callCount === 2) {
                    done();
                }
            }
            closeSpy.should.have.been.calledTwice;
        });
        it('should provide a hook for the showlist event', function (done) {
            var showlistSpy = sinon.spy(showListHook);
            bto.addShowlistHook(showlistSpy);
            bto.tabs.children('.notab').click();

            showlistSpy.should.have.been.calledOnce;

            function showListHook() {
                done();
            }
        });
    });

    describe('API', function () {
        beforeEach(function () {
            bto = bt.bindTabs()[0];
        });
        it('should expose show()', function () {
            var lastTab = bto.getTabs().last();
            bto.show(lastTab);

            expect(lastTab.hasClass(showClass)).to.be.true;
        });
        it('should expose getCurrent()', function () {
            var firstTab = bto.tabs.children('').first();
            var curTab = bto.getCurrent('tab');

            expect(firstTab.data('pairid')).to.equal(curTab.data('pairid'));
        });
        it('should expose an alias to getCurrent() called getCurTab()', function () {
            var firstTab = bto.tabs.children('').first();
            var curTab = bto.getCurTab('tab');

            expect(firstTab.data('pairid')).to.equal(curTab.data('pairid'));
        });
        it('should expose an alias to getCurrent() called getCurCntr()', function () {
            var firstCntr = bto.containers.children('').first();
            var curCntr = bto.getCurCntr('container');

            expect(firstCntr.data('pairid')).to.equal(curCntr.data('pairid'));
        });
        it('should not close tabs that are not closable', function () {
            console.groupCollapsed('Test: should not close unclosable tabs');
            var firstTab = bto.getTabs().first();
            var firstTabPairId = firstTab.data('pairid');

            bto.close(firstTab);
            bto.getTabs().first().data('pairid').should.equal(firstTabPairId);
            console.groupEnd();
        });
    });
});

function cleanup() {
    $('.wrapper').not('#template, .ignore').remove();
    bt = null;
    bto = null;
}
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
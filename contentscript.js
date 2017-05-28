(function(window) {
    // start of IIFE

    function AdBlocker() { return this; }
    AdBlocker.prototype.WebKitMutationObserve = window.WebKitMutationObserver;
    AdBlocker.prototype.hideElement = function(el) {
        if (!el || !el.style) return;
        el.style.display = 'none';
    };
    AdBlocker.prototype.htmlCollectionToArray = function (htmlCollection) {
        if (!htmlCollection || htmlCollection.length === 0) return [];
        return [].slice.call(htmlCollection);
    };
    AdBlocker.prototype.waitForElementToDisplay = function(selector, time, cb) {
        var target = document.querySelector(selector);
        if( target != null ) {
            return cb.bind(this)(target);
        }  else {
            setTimeout(function() {
                this.waitForElementToDisplay(selector, time);
            }.bind(this), time);
        }
    };
    AdBlocker.prototype.elAttrsChangeObserver = function (target, cb, cbCallInstanty) {
        var mutationObserver = new this.WebKitMutationObserve(function(mutations) {
            mutations.forEach(cb.bind(this));
        }.bind(this));
        mutationObserver.observe(target, { attributes: true, attributeOldValue: true });
        if (cbCallInstanty) cb()
    };
    AdBlocker.prototype.whenDomAdded = function (parentEl, cssSelector, cb, cbCallInstantly) {

        parentEl.addEventListener("DOMNodeInserted", function(e) {
            var appendedEl = e.target;
            var ads = appendedEl && appendedEl.querySelector && appendedEl.querySelector(cssSelector);
            if (ads) cb.bind(this)(ads)
        }.bind(this));

        if (cbCallInstantly) {
            this.htmlCollectionToArray(
                parentEl.querySelectorAll(cssSelector)
            ).forEach(function (ad) {
                this.hideElement(ad);
            }.bind(this));
        }
    };

    var adBlockerInstance = new AdBlocker();

    var CONFIGS = {
        DEFAULT_TIMEOUT: 2000,
        LEFT_AD_SELECTOR: "#ads_left",
        FEED_ROWS_SELECTOR: '#feed_rows',
        NEWS_ITEM_SELECTOR: "[data-ad]"
    };

    adBlockerInstance.waitForElementToDisplay(
        CONFIGS.LEFT_AD_SELECTOR,
        CONFIGS.DEFAULT_TIMEOUT,
        function (adsLeftElement) {
            if (!adsLeftElement) return;
            this.elAttrsChangeObserver(
                adsLeftElement,
                function (mutation) { this.hideElement(adsLeftElement) }.bind(this),
                true
            );
        }
    );

    adBlockerInstance.waitForElementToDisplay(
        CONFIGS.FEED_ROWS_SELECTOR,
        CONFIGS.DEFAULT_TIMEOUT,
        function (feedRowsElement) {
            if (!feedRowsElement) return;
            this.whenDomAdded(
                feedRowsElement,
                CONFIGS.NEWS_ITEM_SELECTOR,
                this.hideElement, true
            );
        }
    );

    // end of IIFE
})(this);
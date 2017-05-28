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
    AdBlocker.prototype.waitForElementToDisplay = function(cssSelector, time, cb, endless) {
        var target = document.querySelector(cssSelector);
        if( target != null ) {
            return cb.bind(this)(target);
        }  else {
            setTimeout(function() {
                this.waitForElementToDisplay(cssSelector, time);
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
            ).forEach(cb);
        }
    };

    var adBlockerInstance = new AdBlocker();

    var CONFIGS = {
        DEFAULT_TIMEOUT: 2000,
        DEFAULT_INTERVAL: 2000,
        LEFT_AD_SELECTOR: "#ads_left",
        FEED_ROWS_SELECTOR: '#feed_rows',
        NEWS_ITEM_SELECTOR: "[data-ad]"
    };

    // manage to hide the ads block on the left
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

    // manage to hide ads in news feed
    var feedRowsElement = null;
    var detectAdsInFeedInitialized = false;
    var intervalId = setInterval(function () {
        var el = document.querySelector(CONFIGS.FEED_ROWS_SELECTOR);
        if (!el || !el.nodeName) {
            feedRowsElement = null;
            detectAdsInFeedInitialized = false;
        }
        if (!detectAdsInFeedInitialized && el) {
            adBlockerInstance.whenDomAdded(
                el,
                CONFIGS.NEWS_ITEM_SELECTOR,
                adBlockerInstance.hideElement,
                true
            );
            feedRowsElement = el;
            detectAdsInFeedInitialized = true;
        }
    }, CONFIGS.DEFAULT_INTERVAL)

    // end of IIFE
})(this);
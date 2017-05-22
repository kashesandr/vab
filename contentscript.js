function waitForElementToDisplay(selector, time, cb) {
    var target = document.querySelector(selector);
    if( target!=null ) {
        return cb(target);
    }  else {
        setTimeout(function() {
            waitForElementToDisplay(selector, time);
        }, time);
    }
}

var MutationObserver = window.WebKitMutationObserver;
var adsSelector = "#ads_left";

waitForElementToDisplay(adsSelector, 2000, function (target) {

    if (!target) return;

    target.style.display = "none";

    var adsElementObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            target.style.display = "none";
        });
    });

    adsElementObserver.observe(target, { attributes: true, attributeOldValue: true });

});
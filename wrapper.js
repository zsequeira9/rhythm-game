"use strict";

(function() {
    const script = document.createElement("script");
    script.type = "module";
    script.src = browser.runtime.getURL("src/main.js");
    document.head.appendChild(script);
})();
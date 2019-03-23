"use strict";

let RandomMatching = {};

(() => {
    { // GA
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag("js", new Date());
        gtag("config", "UA-136115470-1");
    }
    let modal = (txt) => {
        document.getElementById("modal_body").innerHTML = txt;
        $("#modal").modal("show");
    }

    RandomMatching.copyLink = (target, text) => {
        // dummy dom
        let span = document.createElement("span");
        span.textContent = text;
        let body = document.getElementsByTagName("body")[0];
        body.appendChild(span);

        // cancel select
        let s = window.getSelection();
        if (s.rangeCount > 0) s.removeAllRanges();

        // drag dummy dom
        let range = document.createRange();
        range.selectNode(span);
        s.addRange(range);

        document.execCommand("copy");

        span.remove();
        modal("コピーしました");
    };

})();

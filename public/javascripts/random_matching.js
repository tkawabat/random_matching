"use strict";

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

    let links = document.querySelectorAll("a.copylink");
    links.forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();

            let txt = link.getAttribute("href");

            // dummy dom
            let span = document.createElement("span");
            span.textContent = txt;
            let b = document.getElementsByTagName("body")[0];
            b.appendChild(span);

            // cancel select
            let s = window.getSelection();
            if (s.rangeCount > 0) s.removeAllRanges();

            // drag dummy dom
            let r = document.createRange();
            r.selectNode(span);
            s.addRange(r);

            document.execCommand("copy");

            span.remove();
            modal("コピーしました");
        });
    });
})();

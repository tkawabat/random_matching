"use strict";

let RandomMatching = {};

(() => {
    { // GA
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag("js", new Date());
        gtag("config", "UA-136115470-1");
    }
    {
        let modal = $("#modal");
        let modalBody = document.getElementById("modal_body");
        RandomMatching.modal = (text) => {
            modalBody.innerHTML = text;
            modal.modal("show");
        }
    }

    RandomMatching.copyLink = (text) => {
        // dummy dom
        let span = document.createElement("span");
        span.innerHTML = text;
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
    };

    // user
    RandomMatching.user = {};
    {
        let sample = document.getElementById("user_ng_list_input_sample");
        let plus = document.getElementById("user_ng_list_plus");
        RandomMatching.user.addNgListInput = () => {
            if (sample.parentNode.querySelectorAll("[name='ng_list[]']").length >= 21) {
                // hiddenがあるので21個からエラー
                modal("NGリストは20個までです。");
                return;
            }
            let add = sample.cloneNode(true);
            add.removeAttribute("id");
            add.querySelector("input").removeAttribute("disabled");
            sample.parentNode.insertBefore(add, sample);
        }
        RandomMatching.user.removeNgListInput = (button) => {
            let element = button;
            while (element.tagName.toLowerCase() !== "body") {
                if (element.classList.contains("input-group")) {
                    element.classList.add("fadeOut");
                    setTimeout(() => element.remove(), 400);
                    break;
                }
                element = element.parentNode;
            }
        }
    }

    // reserve
    RandomMatching.reserve = {}
    {
        let offerModal = $("#reserve_offer_modal");
        let offerModalBody = document.getElementById("reserve_offer_modal_body");
        RandomMatching.reserve.offer = (text) => {
            RandomMatching.copyLink(text);
            offerModalBody.innerHTML = text;
            offerModal.modal("show");
        }
    }
})();

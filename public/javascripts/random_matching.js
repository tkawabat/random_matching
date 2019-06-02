"use strict";

let RandomMatching = {};

(() => {
    { // GA
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag("js", new Date());
        gtag("config", "UA-136115470-1");
    }
    { // help
        $(() => {
            $(".btn_help a").popover({
                container: "body"
                , trigger: "focus"
            })
        });
    }
    { // tags
        let tagify = new Tagify(document.querySelector("input.tags"), {
            whitelist: []
        });
        RandomMatching.addTag = (text) => {
            tagify.addTags([text]);
        }
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

    RandomMatching.removeInput = (button) => {
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

    // user
    RandomMatching.user = {};
    {
        let sample = document.getElementById("user_ng_list_input_sample");
        let plus = document.getElementById("user_ng_list_plus");
        RandomMatching.user.addNgListInput = () => {
            if (sample.parentNode.querySelectorAll("[name='ng_list[]']").length >= 21) {
                // hiddenがあるので21個からエラー
                RandomMatching.modal("NGリストは20個までです。");
                return;
            }
            let add = sample.cloneNode(true);
            add.removeAttribute("id");
            add.querySelector("input").removeAttribute("disabled");
            sample.parentNode.insertBefore(add, sample);
        }
    }

    // reserve detail
    RandomMatching.reserve = {}
    {
        let offerModal = $("#reserve_offer_modal");
        let offerModalBody = document.getElementById("reserve_offer_modal_body");
        RandomMatching.reserve.offer = (text) => {
            RandomMatching.copyLink(text);
            offerModalBody.innerHTML = text;
            offerModal.modal("show");
        }

        let registGuestModal = $("#reserve_regist_guest_modal");
        let registGuestCharaId = document.getElementById("reserve_guest_chara_id");
        let registGuestName = document.getElementById("reserve_guest_name");
        RandomMatching.reserve.registGuest = (id) => {
            registGuestCharaId.value = id;
            registGuestName.value = "";
            registGuestModal.modal("show");
        }
    }

    // reserve create
    {
        let root = document.getElementById("reserve_create_chara");
        let sample = document.getElementById("reserve_create_chara_sample");
        let plus = document.getElementById("reserve_create_chara_plus");

        RandomMatching.reserve.fixCreateCharaInputNumber = () => {
            let divList = root.querySelectorAll(".input-group");
            for (let i = 0; i < divList.length; i++) {
                for (let radio of divList[i].querySelectorAll("[type='radio']")) {
                    radio.name = "sex_list["+i+"]";
                }
            }
        }
        RandomMatching.reserve.addCreateCharaInput = () => {
            if (sample.parentNode.querySelectorAll("[name='chara_list[]']").length >= 51) {
                // hiddenがあるので51個からエラー
                RandomMatching.modal("役は50個までです。");
                return;
            }
            let add = sample.cloneNode(true);
            add.removeAttribute("id");
            for (let input of add.querySelectorAll("input")) {
                input.removeAttribute("disabled");
            }
            sample.parentNode.insertBefore(add, sample);
            RandomMatching.reserve.fixCreateCharaInputNumber();
        }
    }
})();

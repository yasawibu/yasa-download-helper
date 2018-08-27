// ==UserScript==
// @name         Yasa Download Helper
// @namespace    https://github.com/yasawibu/yasa-download-helper
// @version      0.0.1
// @description  Automate your download task
// @author       Putu Ardi Dharmayasa
// @supportURL   https://github.com/yasawibu/yasa-download-helper/issues
// @downloadURL  https://yasawibu.github.io/yasa-download-helper/release/yasa-download-helper.user.js
// @grant        none
// @run-at       document-start
// @include      http://*
// @include      https://*
// ==/UserScript==

(function() {
    'use strict';

    /* * * * * * * * *
     * Main Program *
     * * * * * * * */

    const supportedFileHostings = [
        {
            host: /^(?:\w+\.)?(anifiles\.org)$/,
            path: /^\/[^-/]+$/
        }, {
            host: /^(?:\w+\.)?(zippyshare\.com)$/,
            path: /^\/v\/.+\/file\.html$/
        }
    ];

    const host = window.location.hostname;
    const path = window.location.pathname + window.location.search;
    for (let i = 0; i !== supportedFileHostings.length; ++i) {
        let checkedHost = matchStringPattern(host, supportedFileHostings[i].host);
        if (checkedHost) {
            let checkedPath = matchPathPattern(path, supportedFileHostings[i].path);
            if (checkedPath) {
                download(checkedHost);
            }
            break;
        }
    }

    /* * * * * * * * * * *
     * Others Functions *
     * * * * * * * * * */

    // serialize-0.2.js
    // author: Dimitar Ivanov
    // source: https://code.google.com/archive/p/form-serialize/
    function serialize(form) {
        if (!form || form.nodeName !== "FORM") {
            return;
        }
        var i, j, q = [];
        for (i = form.elements.length - 1; i >= 0; i = i - 1) {
            if (form.elements[i].name === "") {
                continue;
            }
            switch (form.elements[i].nodeName) {
                case 'INPUT':
                    switch (form.elements[i].type) {
                        case 'text':
                        case 'hidden':
                        case 'password':
                        case 'button':
                        case 'reset':
                        case 'submit':
                            q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                            break;
                        case 'checkbox':
                        case 'radio':
                            if (form.elements[i].checked) {
                                q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                            }
                            break;
                        case 'file':
                            break;
                    }
                    break;
                case 'TEXTAREA':
                    q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                    break;
                case 'SELECT':
                    switch (form.elements[i].type) {
                        case 'select-one':
                            q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                            break;
                        case 'select-multiple':
                            for (j = form.elements[i].options.length - 1; j >= 0; j = j - 1) {
                                if (form.elements[i].options[j].selected) {
                                    q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].options[j].value));
                                }
                            }
                            break;
                    }
                    break;
                case 'BUTTON':
                    switch (form.elements[i].type) {
                        case 'reset':
                        case 'submit':
                        case 'button':
                            q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                            break;
                    }
                    break;
            }
        }
        return q.join("&");
    }

    /* * * * * * * *
     * Functions *
     * * * * * */

    function domReady(callback) {
        if (typeof callback === 'function') {
            window.document.addEventListener('DOMContentLoaded', callback);
        }
    }

    function linkNotFound() {
        const message = 'Yasa Download Helper - Link not found!';
        window.document.title = message;
        alert(message);
    }

    function openLink(url) {
        if (url) {
            window.document.title = 'Yasa Download Helper - ' + url;
            window.location.href = url;
        } else {
            linkNotFound();
        }
    }

    function selectElement(selector) {
        return window.document.querySelector(selector);
    }

    function selectElementFromDocument(document, selector) {
        return document.querySelector(selector);
    }

    function getUrlFromElement(selector, attribute) {
        const element = selectElement(selector);
        if (element) {
            return element[attribute];
        } else {
            return null;
        }
    }

    function getUrlFromElementDocument(document, selector, attribute) {
        const element = selectElementFromDocument(document, selector);
        if (element) {
            return element[attribute];
        } else {
            return null;
        }
    }

    function matchPathPattern(path, pattern) {
        path = path.match(pattern);
        if (path) {
            return path[0];
        } else {
            return null;
        }
    }

    function matchStringPattern(string, pattern) {
        string = string.match(pattern);
        if (string) {
            return string[1];
        } else {
            return null;
        }
    }

    function getUrlFromScript(pattern) {
        const scripts = window.document.querySelectorAll('script');
        if (scripts.length > 0) {
            for (let i = 0; i !== scripts.length; ++i) {
                const url = scripts[i].textContent.match(pattern);
                if (url) {
                    return url[1];
                }
            }
        } else {
            return null;
        }
    }

    function getUrlFromScriptDocument(document, pattern) {
        const scripts = document.querySelectorAll('script');
        if (scripts.length > 0) {
            for (let i = 0; i !== scripts.length; ++i) {
                const url = scripts[i].textContent.match(pattern);
                if (url) {
                    return url[1];
                }
            }
        } else {
            return null;
        }
    }

    function getUrlFromAddressBar(pattern) {
        const url = window.location.href.match(pattern);
        if (url) {
            return url[1];
        } else {
            return null;
        }
    }

    function decodeBase64(string) {
        if (string) {
            return atob(string);
        } else {
            return null;
        }
    }

    function POST(url, data, headers) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = () => {
                if (xhr.status === 200) {
                    resolve(xhr.responseText);
                } else {
                    reject(xhr.status);
                }
            }
            xhr.open('POST', url, true);
            if (headers) {
                for (let i = 0; i !== headers.length; ++i) {
                    xhr.setRequestHeader(headers[i][0], headers[i][1]);
                }
            }
            xhr.send(data);
        });
    }

    function GET(url, headers) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = () => {
                if (xhr.status === 200) {
                    resolve(xhr.responseText);
                } else {
                    reject(xhr.status);
                }
            };
            xhr.open('GET', url, true);
            if (headers) {
                for (let i = 0; i !== headers.length; ++i) {
                    xhr.setRequestHeader(headers[i][0], headers[i][1]);
                }
            }
            xhr.send();
        });
    }

    function newDocument(content) {
        let document = window.document.implementation.createHTMLDocument();
        document.open();
        document.write(content);
        document.close();
        return document;
    }

    async function getDocument(url) {
        const content = await GET(url);
        const document = newDocument(content);
        return document;
    }


    /* * * * * * * * * * *
     * Download Methods *
     * * * * * * * * * */

    function anifiles() {
        domReady(() => {
            let query = window.location.search.match(/^\?pt=/);
            if (query) {
                window.stop();
                let url = getUrlFromElement('td a', 'href');
                openLink(url);
            } else {
                let loop = setInterval(() => {
                    if (window.seconds < 0) {
                        window.stop();
                        clearInterval(loop);
                        let url = getUrlFromScript(/<a href='([^']+)/);
                        if (!url) {
                            url = getUrlFromScript(/btn-default' href='([^']+)/);
                        }
                        openLink(url);
                    }
                }, 1000);
            }
        });
    }

    function zippyshare() {
        domReady(() => {
            window.stop();
            let url = getUrlFromElement('#dlbutton', 'href');
            openLink(url);
        });
    }

    function download(host) {
        window.document.title = 'Yasa Download Helper - Wait a moment ...';
        switch (host) {
            case 'anifiles.org': return anifiles();
            case 'zippyshare.com': return zippyshare();
        }
    }
})();

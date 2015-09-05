/**
 * Asynchronous javascript file loader.
 *
 * @example
 */
;var ScriptLoader = function ScriptLoader() {
    'use strict';

    var loadDecrement  = 0,
        onScriptLoaded = function() {},
        onAllLoaded    = function() {},
        onError        = function() {};

    // -----------------------------------------------------------------------------------------------------------------

    function loaded() {
        if (!--loadDecrement) {
            onAllLoaded();
        }
    }


    function writeScript(src) {
        var script = document.createElement('script'),
            head   = document.getElementsByTagName('head')[0];

        script.type  = "text/javascript";
        script.async = true;
        script.src   = src;

        if(script.addEventListener) {
            script.addEventListener('load', function () {
                onScriptLoaded(script);
                loaded();
            }, false);
        }
        else if(script.attachEvent) {
            script.attachEvent('load', function () {
                onScriptLoaded(script);
                loaded();
            });
        }
        else {
            script.onreadystatechange = function() {
                if (script.readyState in { loaded : 1, complete : 1 }) {
                    onScriptLoaded(script);
                    loaded();
                }
            };
        }

        script.onerror = function() {
            onError(src);
            loaded();
        };

        head.appendChild(script);
    }

    
    /**
     *
     */
    function require (parameters) {
        var i          = 0,
            param      = parameters  || {},
            files      = param.files || [],
            fileAmount = files.length;

        onScriptLoaded = param.onScriptLoaded || function() {};
        onAllLoaded    = param.onAllLoaded    || function() {};
        onError        = param.onError        || function() {};
        loadDecrement  = fileAmount;

        for (; i < fileAmount; i++) {
            writeScript(files[i]);
        }
    }

    // -----------------------------------------------------------------------------------------------------------------

    return {
        require : require
    };
};

/**
 * Asynchronous javascript file loader.
 *
 * @return {{require:function()}}
 * @example
 * var scriptLoader = new ScriptLoader();
 *
 * scriptLoader.require({
 *     files : [
 *         'path/to/file1.js',
 *         'path/to/file2.js'
 *     ],
 *     onScriptLoaded : onScriptLoaded,
 *     onAllLoaded    : onAllLoaded,
 *     onError        : onError
 * });
 *
 * function onAllLoaded() {
 *     console.log('All script files has been loaded.')
 * }
 *
 * function onScriptLoaded(script) {
 *     console.log('Script file ' + script.src + ' has been loaded.');
 * }
 *
 * function onError(filename) {
 *     console.log('Script file ' + filename + ' could not be loaded.');
 * }
*/
;var ScriptLoader = function ScriptLoader() {
    'use strict';

    var loadDecrement  = 0,
        onScriptLoaded = function() {},
        onAllLoaded    = function() {},
        onError        = function() {};

    // --------------------------------------------------------------------------------------------------------- Helpers

    /**
     * Checks if the type of the given parameter is an array.
     *
     * @param  {*} value
     * @return {boolean}
     */
    function isArray(value) {
        return Object.prototype.toString.call(value) == "[object Array]";
    }

    /**
     * Checks if the type of the given parameter is a function.
     *
     * @param  {*} value
     * @return {boolean}
     */
    function isFunction(value) {
        return Object.prototype.toString.call(value) == "[object Function]";
    }

    // --------------------------------------------------------------------------------------------------------- Private

    /**
     * Checks if all files has been loaded and callbacks the onAllLoaded-Function.
     */
    function loaded() {
        if (!--loadDecrement) {
            onAllLoaded();
        }
    }


    /**
     * Adds the given script file to the head of the DOM if possible and callbacks the onScriptLoad-Function. If an
     * error occurred the callback onError will be called.
     *
     * @param {String} src - Location of the script file
     */
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

    // ---------------------------------------------------------------------------------------------------------- Public

    /**
     *
     *
     * @param {Object} parameters                   - Parameter-Object
     * @param {Array}  parameters.files             - List of files that should be loaded
     * @param {Function}  parameters.onScriptLoaded - Callback function that will be called when a file has been successfully loaded
     * @param {Function}  parameters.onAllLoaded    - Callback function that will be called when all files has been loaded
     * @param {Function}  parameters.onError        - Callback function that will be called if an error occurs
     */
    function require (parameters) {
        var param = parameters  || {},
            i, amount;

        if (!isArray(param.files)) {
            param.files = [];
        }

        if (!isFunction(param.onScriptLoaded)) {
            param.onScriptLoaded = function() {};
        }

        if (!isFunction(param.onAllLoaded)) {
            param.onAllLoaded = function() {};
        }

        if (!isFunction(param.onError)) {
            param.onError = function() {};
        }


        amount         = param.files.length;
        loadDecrement  = amount;
        onScriptLoaded = param.onScriptLoaded;
        onAllLoaded    = param.onAllLoaded;
        onError        = param.onError;

        for (i = 0; i < amount; i++) {
            writeScript(param.files[i]);
        }
    }

    // ---------------------------------------------------------------------------------------------------------- Return

    return {
        require : require
    };
};

/**
 * Asynchronous file loader - Implements javascript and css file into the DOM-Head.
 *
 * @version 0.2.0
 * @return {{require:function()}}
 * @link https://github.com/hans-sperling/file-loader
 * @example
 * var fileLoader = new FileLoader();
 *
 * fileLoader.require({
 *     files : [
 *         'loading-files/file1.js',
           'loading-files/file2.min.js',
           'load/a/non-existing/file.abc',
           'loading-files/file3.css'
 *     ],
 *     onFileLoaded : onFileLoaded,
 *     onAllLoaded  : onAllLoaded,
 *     onError      : onError
 * });
 *
 * function onAllLoaded() {
 *     console.info('All files has been loaded.')
 * }
 *
 * function onFileLoaded(filename) {
 *     console.log('File <' + filename + '> has been loaded.');
 * }
 *
 * function onError(filename) {
 *     console.warn('File <' + filename + '> could not be loaded.');
 * }
*/
;var FileLoader = function FileLoader() {
    'use strict';

    var loadDecrement = 0,
        onFileLoaded  = function() {},
        onAllLoaded   = function() {},
        onError       = function() {};

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
     * Returns a HTML-Link-Element for given href.
     *
     * @param {String} href
     * @returns {HTMLElement}
     */
    function getCSS(href) {
        var fileObject = document.createElement('link');

        fileObject.rel  = 'stylesheet';
        fileObject.async = true;
        fileObject.href  = href;

        return fileObject;
    }


    /**
     * Returns a HTML-Script-Element for given source file.
     *
     * @param {String} src
     * @returns {HTMLElement}
     */
    function getJS(src) {
        var fileObject = document.createElement('script');

        fileObject.type  = 'text/javascript';
        fileObject.async = true;
        fileObject.src   = src;

        return fileObject;
    }


    /**
     * Adds the given file to the head of the DOM if possible and callbacks the onFileLoad-Function. If an error
     * occurred the callback onError will be called.
     *
     * @param {String} src - Location of the file
     */
    function addFile(src) {
        var fileObject = null,
            head       = document.getElementsByTagName('head')[0],
            splitList  = src.split('.'),
            ext        = splitList[splitList.length - 1];

        switch (ext.toLocaleLowerCase()) {
            case 'js':
                fileObject = getJS(src);
                break;
            case 'css':
                fileObject = getCSS(src);
                break;
            default:
                onError(src);
                loaded();
                return;
                break;
        }

        if(fileObject.addEventListener) {
            fileObject.addEventListener('load', function () {
                onFileLoaded(src);
                loaded();
            }, false);
        }
        else if(fileObject.attachEvent) {
            fileObject.attachEvent('load', function () {
                onFileLoaded(src);
                loaded();
            });
        }
        else {
            fileObject.onreadystatechange = function() {
                if (fileObject.readyState in { loaded : 1, complete : 1 }) {
                    onFileLoaded(src);
                    loaded();
                }
            };
        }

        fileObject.onerror = function() {
            onError(src);
            loaded();
        };

        head.appendChild(fileObject);
    }

    // ---------------------------------------------------------------------------------------------------------- Public

    /**
     *
     *
     * @param {Object} parameters                   - Parameter-Object
     * @param {Array}  parameters.files             - List of files that should be loaded
     * @param {Function}  parameters.onFileLoaded - Callback function that will be called when a file has been successfully loaded
     * @param {Function}  parameters.onAllLoaded    - Callback function that will be called when all files has been loaded
     * @param {Function}  parameters.onError        - Callback function that will be called if an error occurs
     */
    function require (parameters) {
        var param = parameters  || {},
            i, amount;

        if (!isArray(param.files)) {
            param.files = [];
        }

        if (!isFunction(param.onFileLoaded)) {
            param.onFileLoaded = function() {};
        }

        if (!isFunction(param.onAllLoaded)) {
            param.onAllLoaded = function() {};
        }

        if (!isFunction(param.onError)) {
            param.onError = function() {};
        }


        amount        = param.files.length;
        loadDecrement = amount;
        onFileLoaded  = param.onFileLoaded;
        onAllLoaded   = param.onAllLoaded;
        onError       = param.onError;

        for (i = 0; i < amount; i++) {
            addFile(param.files[i]);
        }
    }

    // ---------------------------------------------------------------------------------------------------------- Return

    return {
        require : require
    };
};

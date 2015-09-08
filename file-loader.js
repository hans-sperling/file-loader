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
     * @param {number} amount
     * @returns {Array} - List of HTMLElements
     */
    function getCSS(href, amount) {
        var fileObject = [],
            i;

        for ( i = 0; i < amount; i++) {
            fileObject[i]       = document.createElement('link');
            fileObject[i].rel   = 'stylesheet';
            fileObject[i].async = true;
            fileObject[i].href  = href;
        }

        return fileObject;
    }


    /**
     * Returns a HTML-Script-Element for given source file.
     *
     * @param {String} src
     * @param {Number} amount
     * @returns {Array} - List of HTMLElements
     */
    function getJS(src, amount) {
        var fileObject = [],
            i;

        for ( i = 0; i < amount; i++) {
            fileObject[i]       = document.createElement('script');
            fileObject[i].type  = 'text/javascript';
            fileObject[i].async = true;
            fileObject[i].src   = src;
        }

        return fileObject;
    }


    function getTemplate(src) {
        var fileContent = '';


        //fileObject.src   = src; // ???

        return fileContent;
    }


    /**
     * Adds the given file to the head of the DOM if possible and callbacks the onFileLoad-Function. If an error
     * occurred the callback onError will be called.
     *
     * @param {String} src         - Location of the file
     * @param {String} domSelector -
     */
    function addFile(src, domSelector) {
        var fileObjects = [],
            splitList  = src.split('.'),
            ext        = splitList[splitList.length - 1],
            selector   = domSelector || null,
            selectorList, selectorListAmount, i;

        if (!selector) {
            onError(src, domSelector);
            loaded();
            return;
        }

        selectorList       = document.querySelectorAll(domSelector);
        selectorListAmount = selectorList.length;

        switch (ext.toLocaleLowerCase()) {
            case 'js':
                fileObjects = getJS(src, selectorListAmount);
                break;
            case 'css':
                fileObjects = getCSS(src, selectorListAmount);
                break;
            case 'html':
            case 'phtml':
            case 'php':
            default:
                fileObjects = getTemplate(src);
        }


        for ( i = 0; i < selectorListAmount; i++) {
            if (fileObjects[i].addEventListener) {
                fileObjects[i].addEventListener('load', function () {
                    onFileLoaded(src);
                    loaded();
                }, false);
            }
            else if (fileObjects[i].attachEvent) {
                fileObjects[i].attachEvent('load', function () {
                    onFileLoaded(src);
                    loaded();
                });
            }
            else {
                fileObjects[i].onreadystatechange = function () {
                    if (this.readyState in {loaded: 1, complete: 1}) {
                        onFileLoaded(src);
                        loaded();
                    }
                };
            }

            fileObjects[i].onerror = function () {
                onError(src, domSelector);
                loaded();
            };

            selectorList[i].appendChild(fileObjects[i]);
        }
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

        if (!isArray(param.list)) {
            param.list = [];
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


        amount        = param.list.length;
        loadDecrement = amount;
        onFileLoaded  = param.onFileLoaded;
        onAllLoaded   = param.onAllLoaded;
        onError       = param.onError;

        for (i = 0; i < amount; i++) {
            addFile(param.list[i].file, param.list[i].selector);
        }
    }

    // ---------------------------------------------------------------------------------------------------------- Return

    return {
        require : require
    };
};

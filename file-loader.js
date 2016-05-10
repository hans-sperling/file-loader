/**
 * Asynchronous file loader - Implements javascript and css wrapped and other files content into a given HTML-Node.
 *
 * @version 0.3.0
 * @return {{require:function()}}
 * @example
 * var fileLoader = new FileLoader();
 *
 * fileLoader.require({
 *     list : [
 *         { file : 'loading-files/style1.css',     selector : document.querySelectorAll('head') },
 *         { file : 'loading-files/script1.js',     selector : document.querySelectorAll('head') },
 *         { file : 'loading-files/script2.min.js', selector : document.querySelectorAll('body') },
 *         { file : 'load/a/non-existing/file',     selector : document.querySelectorAll('head') },
 *         { file : 'loading-files/template1.html', selector : document.querySelectorAll('.insert-template.t1') },
 *         { file : 'loading-files/template2.html', selector : document.querySelectorAll('.insert-template.t2') }
 *     ],
 *     onFileLoaded : onFileLoaded,
 *     onAllLoaded  : onAllLoded,
 *     onError      : onError
 * });
 *
 * function onAllLoaded() {
 *     console.log('All files has been loaded.')
 * }
 *
 * function onFileLoaded(filename) {
 *     console.log('File <' + filename + '> has been loaded.');
 * }
 *
 * function onError(filename) {
 *     console.log('File <' + filename + '> could not be loaded.');
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
     * @param  {String} file - Location of the file
     * @return {Object}      - HTML-Element
     */
    function getCssObject(file) {
        var fileObject       = document.createElement('link');
            fileObject.rel   = 'stylesheet';
            fileObject.async = true;
            fileObject.href  = file;

        return fileObject;
    }


    /**
     * Returns a HTML-Script-Element for given source file.
     *
     * @param  {String} file - Location of the file
     * @return {Object}      - HTML-Element
     */
    function getJsObject(file) {
        var fileObject       = document.createElement('script');
            fileObject.type  = 'text/javascript';
            fileObject.async = true;
            fileObject.src   = file;

        return fileObject;
    }


    /**
     * Adds the content of the given file into the given HTML-Elements.
     *
     * @param {String} file     - Location of the file
     * @param {Array}  elements - List of HTML-Elements to inset the files content
     */
    function addFile(file, elements) {
        var xhr = new XMLHttpRequest(),
            i;

        xhr.open("GET", file, true);
        xhr.setRequestHeader('Content-type', 'text/html');
        xhr.send();

        xhr.onreadystatechange = function (e) {
            if (xhr.readyState == 4 && xhr.status == 200) {
                for (i = 0; i < elements.length; i++) {
                    elements[i].innerHTML = xhr.responseText;
                    onFileLoaded(file);
                    loaded();
                }
            }/*
            else if (xhr.readyState == 4 && xhr.status == 404) {
                console.info('404');
            }*/
        };
    }


    /**
     * Adds the content of the given file wrapped in a specific HTML-Node and adds it into given HTML-Elements.
     *
     * @param {String} file       - Location of the file
     * @param {Array}  elements   - List of HTML-Elements to inset the files content
     * @param {Object} fileObject - HTML-Element to add into elements
     */
    function addNode(file, elements, fileObject) {
        var i, fileObjectClone;

        for (i = 0; i < elements.length; i++) {
            fileObjectClone = fileObject.cloneNode(true);
            elements[i].appendChild(fileObjectClone);

            if (fileObjectClone.addEventListener) {
                fileObjectClone.addEventListener('load', function () {
                    onFileLoaded(file);
                    loaded();
                }, false);
            }
            else if (fileObjectClone.attachEvent) {
                fileObjectClone.attachEvent('load', function () {
                    onFileLoaded(file);
                    loaded();
                });
            }
            else {
                fileObjectClone.onreadystatechange = function () {
                    if (this.readyState in {loaded: 1, complete: 1}) {
                        onFileLoaded(file);
                        loaded();
                    }
                };
            }

            fileObjectClone.onerror = function () {
                onError(file);
                loaded();
            };
        }
    }


    /**
     * Manages the file handling.
     *
     * @param {Object} item
     * @param {String} item.file     - Location of the file
     * @param {String} item.selector - HTML-Element to append the file to
     */
    function manageFileLoading(item) {
        var param     = item || {},
            file      = param.file,
            selector  = param.selector,
            splitList = file.split('.'),
            ext       = splitList[splitList.length - 1];

        if (!file || !selector) {
            onError(item);
            loaded();
            return;
        }

        switch (ext.toLocaleLowerCase()) {
            case 'js':
                addNode(file, selector, getJsObject(file));
                break;
            case 'css':
                addNode(file, selector, getCssObject(file));
                break;
            default:
                addFile(file, selector);
                return;
        }
    }


    // ---------------------------------------------------------------------------------------------------------- Public

    /**
     *
     *
     * @param {Object}    parameters
     * @param {Array}     parameters.list
     * @param {String}    parameters.list.file     - Location of the file
     * @param {String}    parameters.list.selector - HTML-Element to append the file to
     * @param {Function}  parameters.onFileLoaded  - Callback function that will be called when a file has been successfully loaded
     * @param {Function}  parameters.onAllLoaded   - Callback function that will be called when all files has been loaded
     * @param {Function}  parameters.onError       - Callback function that will be called if an error occurs
     */
    this.require = function require(parameters) {
        var param = parameters  || {},
            i, amount;

        // Validation
        if (!isArray(param.list))            { param.list         = []; }
        if (!isFunction(param.onFileLoaded)) { param.onFileLoaded = function() {}; }
        if (!isFunction(param.onAllLoaded))  { param.onAllLoaded  = function() {}; }
        if (!isFunction(param.onError))      { param.onError      = function() {}; }

        amount        = param.list.length;
        loadDecrement = amount;
        onFileLoaded  = param.onFileLoaded;
        onAllLoaded   = param.onAllLoaded;
        onError       = param.onError;

        for (i = 0; i < amount; i++) {
            manageFileLoading(param.list[i]);
        }
    };
};

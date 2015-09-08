/**
 * Asynchronous file loader - Implements javascript and css file into the DOM-Head.
 *
 * @version 0.2.0
 * @return {{require:function()}}
 * @link https://github.com/hans-sperling/file-loader
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
     * @param {String} file
     * @returns {Array} - List of HTMLElements
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
     * @param {String} file
     * @returns {Array} - List of HTMLElements
     */
    function getJsObject(file) {
        var fileObject       = document.createElement('script');
            fileObject.type  = 'text/javascript';
            fileObject.async = true;
            fileObject.src   = file;

        return fileObject;
    }


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
            }
            else if (xhr.readyState == 4 && xhr.status == 404) {
                console.info('404');
            }
        };
    }


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
     * Adds the given file to the head of the DOM if possible and callbacks the onFileLoad-Function. If an error
     * occurred the callback onError will be called.
     *
     * @param {Object} item         - Location of the file
     * @param {String} domSelector -
     */
    function manageFileLoading(item) {
        var fileObjects = [],
            param       = item || {},
            file        = param.file,
            selector    = param.selector,
            splitList   = file.split('.'),
            ext         = splitList[splitList.length - 1],
            elements, elementsAmount, i;

        if (!file || !selector) {
            onError(item);
            loaded();
            return;
        }

        elements       = document.querySelectorAll(selector);
        elementsAmount = elements.length;

        switch (ext.toLocaleLowerCase()) {
            case 'js':
                addNode(file, elements, getJsObject(file));
                break;
            case 'css':
                addNode(file, elements, getCssObject(file));
                break;
            case 'html':
            case 'phtml':
            case 'php':
            default:
                addFile(file, elements);
                return;
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
    }

    // ---------------------------------------------------------------------------------------------------------- Return

    return {
        require : require
    };
};

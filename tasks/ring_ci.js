/*
 * grunt-ring-ci
 * https://github.com/dostokhan/grunt-ring-ci
 *
 * Copyright (c) 2016 Moniruzzaman Monir
 * Licensed under the MIT license.
 */

'use strict';

var Chalk = require('chalk');
var Cssmin = require('cssmin');
var Uglifyjs = require('uglify-js');
var Crypto = require('crypto');
var Annotate = require*('ng-annotate');

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('ring_ci', 'Conginuous Integration for Angularjs 1 SPA', function() {
    var self = this,
        uglifyOptions = {
                banner: "/*! @copywrite Ringid.com  %s */\n",
                footer: '',
                compress: {
                    hoist_funs: false,
                    hoist_vars: false,
                    drop_console: true
                },
                mangle: {},
                beautify: false,
                report: 'min',
                expression: false,
                maxLineLen: 32000,
                ASCIIOnly: false,
                screwIE8: true,
                quoteStyle: 0
        },
        VENDOR_SCRIPTS = [],
        SCRIPT_FILES = [],
        STYLE_SHEETS = [],
        srcFiles = [];
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      punctuation: '.',
      separator: ', ',
        target:'dev',
        protocol:'nonssl',
        apiversion:'141',
        branch:'master'
    });


    // HELPER METHODS
    var ringHelper = require('./lib/helpers').init(grunt, options);
    // END HELPER METHODS


    // #COPY all app source files except 'bower_modules' to build path
    function copySrcToBuild() {
        grunt.log.writeln(Chalk.bold.magenta('$$$$$$$$$$$$$$$$$$$$ COPY SOURCE FILES from: ' + options.appSrcPath + ' TO :'+ options.appBuildPath + '. $$$$$$$$$$$$$$$$$$$$'));
        var srcPath = ringHelper.unixifyPath(options.appSrcPath),
            buildPath = ringHelper.unixifyPath(options.appBuildPath);
        // destinations exists? delete and recreate
        if (!grunt.file.exists(buildPath)) {
            grunt.log.writeln(Chalk.black('BuildPath:' + buildPath + ' does not exists. Creating'));
            grunt.file.mkdir(buildPath);
        }


        // check if app/developer.config.js exists or create one
        if (!grunt.file.exists('app/developer.config.js')) {
            grunt.log.writeln(Chalk.black('Creating app/developer.config.js'));
            grunt.file.copy('app/developer.config.dist.js', 'app/developer.config.js');
        }

        var i,k;
        for(k = 0; k < options.appModules.length; k++) {
            for(i = 0; i < options.appModules[k].files.length; i++) {
                srcPath = ringHelper.unixifyPath(options.appSrcPath + options.appModules[k].files[i]);
                buildPath = ringHelper.unixifyPath(options.appBuildPath + options.appModules[k].files[i]);
                //grunt.log.writeln('src:' + srcPath + ' dest:' + buildPath);
                if (grunt.file.exists(srcPath)) {
                    if (!(options.minifyScripts || options.target === 'live') && options.appModules[k].name !== 'globals') {
                        grunt.file.write( buildPath,
                                "(function(angular, window) { 'use strict'; \n" +
                                    grunt.file.read(srcPath, {encoding: 'utf8'}) +
                                 " \n})(angular, window);"
                        );
                    } else {
                        grunt.file.copy(srcPath, buildPath);
                    }
                    srcFiles.push(buildPath);
                    //grunt.log.writeln(Chalk.cyan(srcPath) + ' > ' + Chalk.red(buildPath)) ;
                } else {
                    grunt.fail.warn(Chalk.bold.red('File: ' + srcPath + ' does not exist'));
                }
            }

        }
        grunt.log.writeln(Chalk.bold.green('^^^^ END COPYING SOURCE FILES TO BUILD DIRECTORY. ^^^^ '));
    }



    // #TASK update apiversion, protocol, settings(analytics,debugEnabled,secure) etc using regex
    function updateSettings() {
        grunt.log.writeln(Chalk.bold.magenta('$$$$$$$$$$$$$$$$$$$$ UPDATE APIVERSION, PROTOCOL, SETTINGS(ANALYTICS,DEBUGENABLED,SECURE) ETC $$$$$$$$$$$$$$$$$$$$'));
        var searches =  [/(['|"]apiVersion['|"]\s*:\s*[0-9]+)/g],
            replaces = ['"apiVersion":' + options.apiVersion],
            protocolSearches,
            protocolReplaces;

        if (options.target === 'live') {
            // set replacement parameters
            protocolSearches =  (options.protocol === 'ssl') ? [/http:\/\/dev|http:\/\//g, /ws:\/\//g] : [/https:\/\/dev|https:\/\//g, /wss:\/\//g] ;
            protocolReplaces = (options.protocol === 'ssl') ? ['https://', 'wss://'] : ['http://', 'ws://'];
        } else {
            // set replacement parameters
            protocolSearches =  (options.protocol === 'ssl') ? [/http:\/\//g, /ws:\/\//g] : [/https:\/\//g, /wss:\/\//g] ;
            protocolReplaces = (options.protocol === 'ssl') ? ['https://', 'wss://'] : ['http://', 'ws://'];
        }

        searches = searches.concat(protocolSearches);
        replaces = replaces.concat(protocolReplaces);

        searches = searches.concat([/secure\s*:\s*\w+,/]);
        replaces = replaces.concat( options.protocol === 'ssl' ? ['secure:true,'] :  ['secure:false,'] );

        searches = searches.concat([/analytics\s*:\s*\w+,/, /debugEnabled\s*:\s*\w+,/]);
        replaces = replaces.concat( options.target === 'live' ?  ['analytics:true,', 'debugEnabled:false,'] : ['analytics:false,', 'debugEnabled:true,'] );

        // Modify settingsFile
        ringHelper.replace(options.settingsFile, searches, replaces);
        // Modify Template files
        ringHelper.replace(options.protocolFixTemplates, protocolSearches[0], protocolReplaces[0], true);
        // MOdify Worker Files
        ringHelper.replace(options.protocolFixScripts, protocolSearches[1], protocolReplaces[1]);

        grunt.log.writeln(Chalk.bold.green('^^^^ END UPDATE APIVERSION, PROTOCOL, SETTINGS(ANALYTICS,DEBUGENABLED,SECURE) ETC ^^^^ '));
    }

    function buildModules() {
        grunt.log.writeln(Chalk.bold.magenta('$$$$$$$$$$$$$$$$$$$$ BUILD APP MODULES in: ' + options.appBuildPath + 'modules/. $$$$$$$$$$$$$$$$$$$$'));
        var i,k,d, srcPath, moduleFile, fileName,
            moduleContent = '',
            moduleContentStart = '',
            moduleContentEnd = '';


        // build APP MODULES
        for(k = 0; k < options.appModules.length; k++) {
            moduleContent = '';
            moduleContentStart = "(function(angular, window) { 'use strict'; ";
            moduleContentEnd = "})(angular, window);";

            moduleFile = ringHelper.unixifyPath(options.appBuildPath + 'modules/' + options.appModules[k].name + '.module.js');
            if (!options.buildModules) {
                SCRIPT_FILES.push(moduleFile); // debug enabled.  including all scripts as it is
            }
            for(i = 0; i < options.appModules[k].files.length; i++) {
                srcPath = ringHelper.unixifyPath(options.appBuildPath + options.appModules[k].files[i]);
                fileName = srcPath.substr(srcPath.lastIndexOf('/') + 1);
                if (grunt.file.exists(srcPath)) {
                    if (options.buildModules) {
                        // concat contents
                        moduleContent += '\n// File: ' + fileName + "\n" + moduleContentStart +  String(grunt.file.read(srcPath, {encoding:'utf8'})) + moduleContentEnd;
                    } else {
                        SCRIPT_FILES.push(srcPath); // debug enabled including all scripts as it is
                    }
                } else {
                    grunt.fail.warn(Chalk.bold.red('File: ' + srcPath + ' does not exist'));
                }
            }

            if (options.appModules[k].name !== 'globals' ) {
                // insert dependency modules
                if (options.appModules[k].dependencies.length > 0) {
                    moduleContentStart += " angular.module('" + options.appModules[k].name + "', [ ";
                    for(d = 0; d < options.appModules[k].dependencies.length; d++) {
                        moduleContentStart += "'" + options.appModules[k].dependencies[d] + "', ";
                    }
                    moduleContentStart = moduleContentStart.substr(0, moduleContentStart.length -2);
                    moduleContentStart += " ]); ";
                } else {
                    moduleContentStart += " angular.module('" + options.appModules[k].name + "', []); ";
                }
                if (options.buildModules) {
                    moduleContent = moduleContentStart + moduleContentEnd + moduleContent;
                } else {
                    moduleContent = moduleContentStart + moduleContent + moduleContentEnd;
                }
            }

            grunt.file.write(moduleFile, moduleContent);

            if (options.buildModules) {
                SCRIPT_FILES.push(moduleFile);
            }
            grunt.log.writeln('Module:' + Chalk.blue(options.appModules[k].name) + ' > ' + Chalk.green(moduleFile));
        }


        grunt.log.writeln(Chalk.bold.green('^^^^ END APP MODULES BUILD. ^^^^ '));
    }


    function removeDebugCode(files) {
        grunt.log.writeln(Chalk.bold.magenta('$$$$$$$$$$$$$$$$$$$$ REMOVE DEBUG CODE from APP MODULES  $$$$$$$$$$$$$$$$$$$$'));
        var moduleFile, i, moduleContent,
            debugRegex = /DIGEST_DEBUG_START([\s\S]*?)(DIGEST_DEBUG_END)/gm,
            ringloggerRegex = /RingLogger([\s\S]*?;)/g;

        grunt.log.writeln(Chalk.bold.blue('Removed DIGEST_DEBUG && RingLogger from: ' + files.length + ' files'));
        //for(i = 0; i < files.length; i++) {
            //moduleFile = ringHelper.unixifyPath(options.appBuildPath + 'modules/' +  options.appModules[i].name + '.module.js');
            ringHelper.replace(files, [debugRegex, ringloggerRegex], ['',''], true, true);
        //}
        grunt.log.writeln(Chalk.bold.green('^^^^ END REMOVE DEBUG CODE from APP MODULES  ^^^^ '));
    }


    function prepareWorkerFiles() {
        var importScriptsRegex = /importScripts\(['|"]([^'|"])*["|']\);/g,
            regexMatches,
            workerFile,
            supportFiles = [],
            workerFileContent = '',
            srcPath,
            srcFile,
            dest = 'js/worker/';

        for(var i = 0; i < options.workerFiles.length; i++) {
            srcPath = options.appSrcPath + options.workerFiles[i].substr(0, options.workerFiles[i].lastIndexOf('/') + 1);
            workerFile = options.workerFiles[i].substr(options.workerFiles[i].lastIndexOf('/') + 1);

            grunt.log.writeln(Chalk.blue('worker file: ' + srcPath+workerFile));
            if (grunt.file.exists(srcPath+workerFile)) {
                var mainWorker = String(grunt.file.read(srcPath+workerFile, {encoding:'utf8'}));
                // process all worker files
                regexMatches = mainWorker.match(importScriptsRegex);
                if (regexMatches && regexMatches.length > 0) {

                    for(var j = 0; j < regexMatches.length; j++) {
                        srcFile = regexMatches[j].substr(15, regexMatches[j].length-15-3);
                        grunt.log.writeln('worker support files: ' + srcFile);
                        if (grunt.file.exists(srcPath+srcFile)) {
                            if (options.minifyScripts === true || options.target === 'live') {
                                // insert all supportFiles inside worker file content;
                                workerFileContent += String(grunt.file.read(srcPath+srcFile, {encoding: 'utf8'})) + '\n';
                                mainWorker = mainWorker.replace(regexMatches[j], '');
                            } else {
                                grunt.file.copy( (srcPath+srcFile), (dest+srcFile) );
                            }
                        } else {
                            grunt.fail.warn(Chalk.bold.red('Worker File ' + srcPath+srcFile+ ' Not Found'));
                        }
                    }

                    if (options.minifyScripts=== true || options.target === 'live') {
                        //workerFileContent += grunt.file.read(srcPath + workerFile, {encoding: 'utf8'});
                        grunt.log.writeln('worker file:' + dest+workerFile);
                        grunt.file.write(dest+workerFile, workerFileContent + '\n' + mainWorker);
                        ringHelper.uglify(dest+workerFile, dest+workerFile, uglifyOptions);
                    } else {
                        grunt.file.copy( (srcPath+workerFile),  (dest+workerFile) );
                    }

                } else {
                     grunt.fail.warn(Chalk.bold.red('Import Scripts regex match failed' + srcPath+workerFile));
                }

            } else {
                 grunt.fail.warn(Chalk.bold.red('File: ' + srcPath+workerFile + ' Not found'));
            }


        }
    }


    function prepareVendorScripts() {
        grunt.log.writeln(Chalk.bold.magenta('$$$$$$$$$$$$$$$$$$$$ BUILDING app.vendor.min $$$$$$$$$$$$$$$$$$$$'));

        var vendorMinFile = 'js/' + Crypto.createHash('md5').update('app-vendor.min.js' + new Date().getTime()).digest('hex') + '.js',
            srcPath = '',
            minSrcPath = '',
            scriptContent = '',
            minifiedScript = '',
            err;

        for(var i = 0; i < options.vendorFiles.length; i++) {
            srcPath = ringHelper.unixifyPath(options.vendorFiles[i]);
            if (grunt.file.exists(srcPath)) {
                // is a minified file?
                if (srcPath.indexOf('min') === -1) {
                    minSrcPath = srcPath.substr(0, srcPath.lastIndexOf('.')) + '.min' + srcPath.substr(srcPath.lastIndexOf('.'));
                    grunt.log.writeln('Got minified file: ' + minSrcPath);
                    // exists a minified file already in the same dir of the src file?
                    if (grunt.file.exists(minSrcPath)) {
                        minifiedScript += grunt.file.read(minSrcPath, {encoding: 'utf8'});
                    } else {
                        // no minified file. uglify and build one
                        grunt.log.writeln(Chalk.cyan('MINIFYING File: ' + srcPath ));
                        try {
                            minifiedScript += Uglifyjs.minify(srcPath, uglifyOptions).code;
                        } catch(e) {
                            err = new Error('Uglification failed.');
                            if (e.message) {
                                err.message += '\n' + e.message + '. \n';
                                if (e.line) {
                                    err.message += 'Line ' + e.line + ' in ' + srcPath + '\n';
                                }

                            }
                            err.origError = e;
                            grunt.log.warn(Chalk.bold.red('Uglifying source ' + srcPath + ' failed.'));
                            grunt.warn.error(err);
                        }
                    }
                } else {
                    scriptContent = String(grunt.file.read(srcPath, {encoding:'utf8'}));
                    grunt.log.writeln(Chalk.cyan('File: ' + srcPath ));
                    // already minified  no need to minify
                    minifiedScript += scriptContent;
                }
            } else {
                grunt.fail.warn(Chalk.bold.red('File: ' + srcPath + ' does not exist'));
            }
        }

        grunt.file.write(ringHelper.unixifyPath(vendorMinFile), minifiedScript);
        VENDOR_SCRIPTS = [vendorMinFile];
        grunt.log.writeln(Chalk.red('Vendor Script: ' + vendorMinFile));

        grunt.log.writeln(Chalk.bold.green('^^^^ END BUILDING app.vendor.min  ^^^^ '));
    }

    function uglifyModules() {
        grunt.log.writeln(Chalk.bold.magenta('$$$$$$$$$$$$$$$$$$$$ UGLIFY SOURCE MODULES $$$$$$$$$$$$$$$$$$$$'));

        var appMinFile = 'js/' + Crypto.createHash('md5').update('app.min.js' + new Date().getTime()).digest('hex') + '.js',
            src,
            fileName,
            appScriptsContent = '',
            content = '',
            lastDotIndex;

        for(var i = 0; i < SCRIPT_FILES.length; i++) {
            if (grunt.file.exists(SCRIPT_FILES[i])) {
                appScriptsContent += String(grunt.file.read(SCRIPT_FILES[i], {encoding:'utf8'})) + '\n';
            } else {
                grunt.fail.warn(Chalk.bold.red('File: ' + SCRIPT_FILES[i]+ ' does not exist'));
            }
        }

        grunt.file.write(appMinFile, appScriptsContent);
        ringHelper.uglify(appMinFile, appMinFile, uglifyOptions);
        SCRIPT_FILES = [appMinFile];
        grunt.log.writeln(Chalk.red('App Script: ' + appMinFile));

        grunt.log.writeln(Chalk.bold.green('^^^^ END UGLIFY SOURCE MODULES   ^^^^ '));
    }


    function minifyStyles() {
        grunt.log.writeln(Chalk.bold.magenta('$$$$$$$$$$$$$$$$$$$$ MINIFY STYLESHEETS USING CSSMIN $$$$$$$$$$$$$$$$$$$$'));

        var stylesMinFile= 'css/' + Crypto.createHash('md5').update('styles.min.css' + new Date().getTime()).digest('hex') + '.css',
            cssfile,
            minifiedStyle = '';
        for(var i = 0; i < options.appStyles.length; i++) {
            cssfile = ringHelper.unixifyPath(options.appStyles[i]);
            if (!grunt.file.exists(cssfile)) {
                grunt.fail.warn(Chalk.bold.red('File: ' + cssfile+ ' does not exist'));
            } else {
                minifiedStyle += String(grunt.file.read(cssfile, {encoding:'utf8'}));
            }
        }

        grunt.file.write(stylesMinFile, Cssmin(minifiedStyle));
        STYLE_SHEETS = [stylesMinFile];
        grunt.log.writeln(Chalk.red('App Styles: ' + stylesMinFile));

        grunt.log.writeln(Chalk.bold.green('^^^^ END MINIFY STYLESHEETS USING CSSMIN   ^^^^ '));
    }


    function linkScriptsStyles() {
        grunt.log.writeln(Chalk.bold.magenta('$$$$$$$$$$$$$$$$$$$$ LINK SOURCE SCRIPTS AND STYLESHEETS $$$$$$$$$$$$$$$$$$$$'));

        var styleStartTag = '<!--STYLES-->',
            styleEndTag = '<!--STYLES END-->',
            styleFileTmpl = "<link rel='stylesheet' type='text/css' href='%s' />",
            scriptStartTag = '<!--SCRIPTS-->',
            scriptEndTag = '<!--SCRIPTS END-->',
            scriptFileTmpl = '<script src="%s"></script>';

        if (options.target === 'live') {
            ringHelper.linkFiles(VENDOR_SCRIPTS.concat(SCRIPT_FILES), scriptFileTmpl, scriptStartTag, scriptEndTag,  options.linkerFiles);
        } else {
            ringHelper.linkFiles(VENDOR_SCRIPTS.concat(options.debugFiles.concat(SCRIPT_FILES)), scriptFileTmpl, scriptStartTag, scriptEndTag,  options.linkerFiles);
        }
        ringHelper.linkFiles(STYLE_SHEETS, styleFileTmpl, styleStartTag, styleEndTag,  options.linkerFiles);

        grunt.log.writeln(Chalk.bold.green('^^^^ END LINK SOURCE SCRIPTS AND STYLESHEETS  ^^^^ '));
    }

    // INITIALIZE
    VENDOR_SCRIPTS = options.vendorFiles;
    STYLE_SHEETS = options.appStyles;

    // RUN ALL TASKS
    // 1. copy src to build folder
    grunt.log.writeln();
    copySrcToBuild();
    // 2. update settings files
    grunt.log.writeln();
    updateSettings();
    // 3. build modules
    grunt.log.writeln();
    buildModules();
    // 4. remove debug codes if necessary
    grunt.log.writeln();
    if (options.target === 'live') {
         removeDebugCode(SCRIPT_FILES);
    }

    prepareWorkerFiles();
     //5. uglify modules if necessary
    grunt.log.writeln();
    if (options.minifyScripts || options.target === 'live') {
        prepareVendorScripts();
        uglifyModules();
    }
    // 6. minify css if necessary
    grunt.log.writeln();
    if (options.minifyStyles || options.target === 'live') {
        minifyStyles();
    } else {
        STYLE_SHEETS = options.appStyles;
    }
    // 7. link javascript files
    grunt.log.writeln();
    linkScriptsStyles();

  });

};

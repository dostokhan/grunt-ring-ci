/*
 * grunt-ring-ci
 * https://github.com/dostokhan/grunt-ring-ci
 *
 * Copyright (c) 2016 Moniruzzaman Monir
 * Licensed under the MIT license.
 */

'use strict';

var Chalk = require('chalk'),
    cssmin = require('cssmin'),
    Uglifyjs = require('uglify-js'),
    Crypto = require('crypto');
    // Annotate = require('ng-annotate');

module.exports = function ringci(grunt) {
  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks
    var taskSuccess = false;

    grunt.registerMultiTask('ring_ci', 'Conginuous Integration for Angularjs 1 SPA', function ringciTask() {
        var uglifyOptions = {
                banner: '/*! @copywrite Ringid.com  %s */\n',
                footer: '',
                compress: {
                    hoist_funs: false,
                    hoist_vars: false,
                    drop_console: true,
                },
                mangle: {},
                beautify: false,
                report: 'min',
                expression: false,
                maxLineLen: 32000,
                ASCIIOnly: false,
                screwIE8: true,
                quoteStyle: 0,
            },
            VENDOR_SCRIPTS = [],
            SCRIPT_FILES = [],
            STYLE_SHEETS = [],
            srcFiles = [],
    // Merge task-specific and/or target-specific options with these defaults.
            options = this.options({
                punctuation: '.',
                separator: ', ',
                target: 'dev',
                protocol: 'nonssl',
                apiversion: '145',
                branch: 'master',
            }),
            ringHelper = require('./lib/helpers').init(grunt, options);


    // HELPER METHODS
    // END HELPER METHODS


    // #COPY all app source files except 'bower_modules' to build path
        function copySrcToBuild() {
            var i,
                k,
                lintConfig = options.eslintOptions || {
                    configFile: '.eslintrc.json',
                },
                srcPath = ringHelper.unixifyPath(options.appSrcPath),
                enableLinting = true, // = (!options.eslintModules || options.eslintModules.length === 0),
                forceEslint = false,
                buildPath = ringHelper.unixifyPath(options.appBuildPath);


            /* eslint-disable max-len */
            grunt.log.writeln(Chalk.bold.magenta('$$$$$$$$$$$$$$$$$$$$ COPY SOURCE FILES from: ' + options.appSrcPath + ' TO :' + options.appBuildPath + '. $$$$$$$$$$$$$$$$$$$$'));
            /* eslint-enable max-len */


            if (options.eslintModules.length === 0) {
                forceEslint = true;
            } else {
                forceEslint = true;
                for (i = 0; i < options.appModules.length; i++) {
                    if (options.eslintModules[0] === options.appModules[i].name) {
                        forceEslint = false;
                        break;
                    }
                }
            }


            grunt.log.writeln(Chalk.bold.red('Linting all Modules: ') + Chalk.bold.green(forceEslint));
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

            function copyFile(src, dest, index) {
                var fileContent = grunt.file.read(src, { encoding: 'utf8' });

                if (options.templateReplaceFiles.indexOf(src) > -1) {
                    // need to remplade templateurl with actual template
                    ringHelper.log('success', 'templateURLReplace', src);
                    fileContent = ringHelper.templateURLReplace(fileContent);

                    if (!fileContent) {
                        ringHelper.log('warning', 'templateURLReplace', 'templateUrl not found');
                    }
                }

                if (!(options.minifyScripts || options.target === 'live') && options.appModules[index].name !== 'globals') {
                    grunt.file.write(dest,
                        '(function(angular, window) { \'use strict\'; \n' +
                            fileContent +
                         ' \n})(angular, window);'
                );
                } else {
                    // grunt.file.copy(src, dest);
                    grunt.file.write(dest, fileContent);
                }
                srcFiles.push(dest);
            }

            for (k = 0; k < options.appModules.length; k++) {
                enableLinting = forceEslint ||
                (options.eslintModules.indexOf(options.appModules[k].name) > -1);

                if (enableLinting) {
                    grunt.log.writeln(Chalk.bold.green('Module: ' + options.appModules[k].name));
                }
                for (i = 0; i < options.appModules[k].files.length; i++) {
                    srcPath = ringHelper.unixifyPath(options.appSrcPath + options.appModules[k].files[i]);
                    buildPath = ringHelper.unixifyPath(options.appBuildPath + options.appModules[k].files[i]);
                    // grunt.log.writeln('src:' + srcPath + ' dest:' + buildPath);
                    if (grunt.file.exists(srcPath)) {
                    // grunt.log.writeln('Module :' + options.appModules[k].name+ ' Lint:' +enableLinting );
                        if (enableLinting) {
                            if (ringHelper.lintScript(srcPath, lintConfig)) {
                                copyFile(srcPath, buildPath, k);
                            } else {
                                grunt.fail.fatal(Chalk.bold.red('Linting Failed: ' + srcPath));
                                grunt.fail.warn();
                                return false;
                            }
                        } else {
                            copyFile(srcPath, buildPath, k);
                        }
                    } else {
                        grunt.fail.warn(Chalk.bold.red('File: ' + srcPath + ' does not exist'));
                        return false;
                    }
                }
            }
            grunt.log.writeln(Chalk.bold.green('^^^^ END COPYING SOURCE FILES TO BUILD DIRECTORY. ^^^^ '));
            return true;
        }


    // #TASK update apiversion, protocol, settings(analytics,debugEnabled,secure) etc using regex
        function updateSettings() {
            var searches = [/(apiVersion\s*:\s*[0-9]+)/g],
                replaces = ['apiVersion:' + options.apiVersion],
                protocolSearches,
                protocolReplaces;

            /* eslint-disable max-len */
            grunt.log.writeln(Chalk.bold.magenta('$$$$$$$$$$$$$$$$$$$$ UPDATE APIVERSION, PROTOCOL, SETTINGS(ANALYTICS,DEBUGENABLED,SECURE) ETC $$$$$$$$$$$$$$$$$$$$'));
            /* eslint-enable max-len */

            if (options.target === 'live') {
            // set replacement parameters
                protocolSearches = (options.protocol === 'ssl') ? [/http:\/\/dev|http:\/\//g, /ws:\/\//g] : [/https:\/\/dev|https:\/\//g, /wss:\/\//g];
                protocolReplaces = (options.protocol === 'ssl') ? ['https://', 'wss://'] : ['http://', 'ws://'];
            } else {
            // set replacement parameters
                protocolSearches = (options.protocol === 'ssl') ? [/http:\/\//g, /ws:\/\//g] : [/https:\/\//g, /wss:\/\//g];
                protocolReplaces = (options.protocol === 'ssl') ? ['https://', 'wss://'] : ['http://', 'ws://'];
            }

            searches = searches.concat(protocolSearches);
            replaces = replaces.concat(protocolReplaces);

            searches = searches.concat([/secure\s*:\s*\w+,/]);
            replaces = replaces.concat(options.protocol === 'ssl' ? ['secure:true,'] : ['secure:false,']);

            searches = searches.concat([/analytics\s*:\s*\w+,/, /debugEnabled\s*:\s*\w+,/]);
            replaces = replaces.concat(options.target === 'live' ? ['analytics:true,', 'debugEnabled:false,'] : ['analytics:false,', 'debugEnabled:true,']);

        // Modify settingsFile
            ringHelper.replace(options.settingsFile, searches, replaces);
        // Modify Template files
            ringHelper.replace(options.protocolFixTemplates, protocolSearches[0], protocolReplaces[0], true);
        // MOdify Worker Files
            ringHelper.replace(options.protocolFixScripts, protocolSearches[1], protocolReplaces[1]);

            grunt.log.writeln(Chalk.bold.green('^^^^ END UPDATE APIVERSION, PROTOCOL, SETTINGS(ANALYTICS,DEBUGENABLED,SECURE) ETC ^^^^ '));
            return true;
        }

        function buildModules() {
            var i,
                k,
                d,
                srcPath,
                moduleFile,
                fileName,
                moduleContent = '',
                moduleContentStart = '',
                moduleContentEnd = '';

            /* eslint-disable max-len */
            grunt.log.writeln(Chalk.bold.magenta('$$$$$$$$$$$$$$$$$$$$ BUILD APP MODULES in: ' + options.appBuildPath + 'modules/. $$$$$$$$$$$$$$$$$$$$'));
            /* eslint-enable max-len */

        // build APP MODULES
            for (k = 0; k < options.appModules.length; k++) {
                moduleContent = '';
                moduleContentStart = '(function(angular, window) { \'use strict\'; ';
                moduleContentEnd = '})(angular, window);';

                moduleFile = ringHelper.unixifyPath(options.appBuildPath + 'modules/' + options.appModules[k].name + '.module.js');
                if (!options.buildModules) {
                    SCRIPT_FILES.push(moduleFile); // debug enabled.  including all scripts as it is
                }
                for (i = 0; i < options.appModules[k].files.length; i++) {
                    srcPath = ringHelper.unixifyPath(options.appBuildPath + options.appModules[k].files[i]);
                    fileName = srcPath.substr(srcPath.lastIndexOf('/') + 1);
                    if (grunt.file.exists(srcPath)) {
                        if (options.buildModules) {
                        // concat contents
                            moduleContent += '\n// File: ' +
                                fileName + '\n' + moduleContentStart +
                                String(grunt.file.read(srcPath, { encoding: 'utf8' })) + moduleContentEnd;
                        } else {
                            SCRIPT_FILES.push(srcPath); // debug enabled including all scripts as it is
                        }
                    } else {
                        grunt.fail.warn(Chalk.bold.red('File: ' + srcPath + ' does not exist'));
                        return false;
                    }
                }

                if (options.appModules[k].name !== 'globals') {
                // insert dependency modules
                    if (options.appModules[k].dependencies.length > 0) {
                        moduleContentStart += ' angular.module(\'' + options.appModules[k].name + '\', [ ';
                        for (d = 0; d < options.appModules[k].dependencies.length; d++) {
                            moduleContentStart += '\'' + options.appModules[k].dependencies[d] + '\', ';
                        }
                        moduleContentStart = moduleContentStart.substr(0, moduleContentStart.length - 2);
                        moduleContentStart += ' ]); ';
                    } else {
                        moduleContentStart += ' angular.module(\'' + options.appModules[k].name + '\', []); ';
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
            return true;
        }


        function removeDebugCode(fileList) {
            var files = fileList || SCRIPT_FILES,
                debugRegex = /DIGEST_DEBUG_START([\s\S]*?)(DIGEST_DEBUG_END)/gm,
                ringloggerRegex = /RingLogger([\s\S]*?;)/g;

            grunt.log.writeln(Chalk.bold.magenta('$$$$$$$$$$$$$$$$$$$$ REMOVE DEBUG CODE from APP MODULES  $$$$$$$$$$$$$$$$$$$$'));

            grunt.log.writeln(Chalk.bold.blue('Removed DIGEST_DEBUG && RingLogger from: ' + files.length + ' files'));
            ringHelper.replace(files, [debugRegex, ringloggerRegex], ['', ''], true, true);
            grunt.log.writeln(Chalk.bold.green('^^^^ END REMOVE DEBUG CODE from APP MODULES  ^^^^ '));
            return true;
        }


        function prepareWorkerFiles() {
            var importScriptsRegex = /importScripts\(['|"]([^'|"])*["|']\);/g,
                regexMatches,
                workerFile,
                // supportFiles = [],
                i,
                j,
                mainWorker,
                workerFileContent = '',
                srcPath,
                srcFile,
                dest = 'js/worker/';

            for (i = 0; i < options.workerFiles.length; i++) {
                srcPath = options.appSrcPath + options.workerFiles[i].substr(0, options.workerFiles[i].lastIndexOf('/') + 1);
                workerFile = options.workerFiles[i].substr(options.workerFiles[i].lastIndexOf('/') + 1);

                grunt.log.writeln(Chalk.blue('worker file: ' + srcPath + workerFile));
                if (grunt.file.exists(srcPath + workerFile)) {
                    mainWorker = String(grunt.file.read(srcPath + workerFile, { encoding: 'utf8' }));
                // process all worker files
                    regexMatches = mainWorker.match(importScriptsRegex);
                    if (regexMatches && regexMatches.length > 0) {
                        for (j = 0; j < regexMatches.length; j++) {
                            srcFile = regexMatches[j].substr(15, regexMatches[j].length - 15 - 3);
                            grunt.log.writeln('worker support files: ' + srcFile);
                            if (grunt.file.exists(srcPath + srcFile)) {
                                if (options.minifyScripts === true || options.target === 'live') {
                                // insert all supportFiles inside worker file content;
                                    workerFileContent += String(grunt.file.read(srcPath + srcFile, { encoding: 'utf8' })) + '\n';
                                    mainWorker = mainWorker.replace(regexMatches[j], '');
                                } else {
                                    grunt.file.copy((srcPath + srcFile), (dest + srcFile));
                                }
                            } else {
                                grunt.fail.warn(Chalk.bold.red('Worker File ' + srcPath + srcFile + ' Not Found'));
                                return false;
                            }
                        }

                        if (options.minifyScripts === true || options.target === 'live') {
                        // workerFileContent += grunt.file.read(srcPath + workerFile, {encoding: 'utf8'});
                            grunt.log.writeln('worker file:' + dest + workerFile);
                            grunt.file.write(dest + workerFile, workerFileContent + '\n' + mainWorker);
                            if (!ringHelper.uglify(dest + workerFile, dest + workerFile, uglifyOptions)) {
                                return false;
                            }
                        } else {
                            grunt.file.copy((srcPath + workerFile), (dest + workerFile));
                        }
                    } else {
                        grunt.fail.warn(Chalk.bold.red('Import Scripts regex match failed' + srcPath + workerFile));
                        return false;
                    }
                } else {
                    grunt.fail.warn(Chalk.bold.red('File: ' + srcPath + workerFile + ' Not found'));
                    return false;
                }
            }
            return true;
        }


        function prepareVendorScripts() {
            var vendorMinFile = 'js/' + Crypto.createHash('md5').update('app-vendor.min.js' + new Date().getTime()).digest('hex') + '.js',
                srcPath = '',
                minSrcPath = '',
                scriptContent = '',
                minifiedScript = '',
                i,
                err;

            grunt.log.writeln(Chalk.bold.magenta('$$$$$$$$$$$$$$$$$$$$ BUILDING app.vendor.min $$$$$$$$$$$$$$$$$$$$'));


            for (i = 0; i < options.vendorFiles.length; i++) {
                srcPath = ringHelper.unixifyPath(options.vendorFiles[i]);
                if (grunt.file.exists(srcPath)) {
                // is a minified file?
                    if (srcPath.indexOf('min') === -1) {
                        minSrcPath = srcPath.substr(0, srcPath.lastIndexOf('.')) + '.min' + srcPath.substr(srcPath.lastIndexOf('.'));
                        grunt.log.writeln('Got minified file: ' + minSrcPath);
                    // exists a minified file already in the same dir of the src file?
                        if (grunt.file.exists(minSrcPath)) {
                            minifiedScript += grunt.file.read(minSrcPath, { encoding: 'utf8' });
                        } else {
                        // no minified file. uglify and build one
                            grunt.log.writeln(Chalk.cyan('MINIFYING File: ' + srcPath));
                            try {
                                minifiedScript += Uglifyjs.minify(srcPath, uglifyOptions).code;
                            } catch (e) {
                                err = new Error('Uglification failed.');
                                if (e.message) {
                                    err.message += '\n' + e.message + '. \n';
                                    if (e.line) {
                                        err.message += 'Line ' + e.line + ' in ' + srcPath + '\n';
                                    }
                                }
                                err.origError = e;
                                grunt.log.warn(Chalk.bold.red('Uglifying source ' + srcPath + ' failed.'));
                                grunt.fail.warn(err);
                                return false;
                            }
                        }
                    } else {
                        scriptContent = String(grunt.file.read(srcPath, { encoding: 'utf8' }));
                        grunt.log.writeln(Chalk.cyan('File: ' + srcPath));
                    // already minified  no need to minify
                        minifiedScript += scriptContent;
                    }
                } else {
                    grunt.fail.warn(Chalk.bold.red('File: ' + srcPath + ' does not exist'));
                    return false;
                }
            }

            grunt.file.write(ringHelper.unixifyPath(vendorMinFile), minifiedScript);
            VENDOR_SCRIPTS = [vendorMinFile];
            grunt.log.writeln(Chalk.red('Vendor Script: ' + vendorMinFile));

            grunt.log.writeln(Chalk.bold.green('^^^^ END BUILDING app.vendor.min  ^^^^ '));
            return true;
        }

        function uglifyModules() {
            var appMinFile = 'js/' + Crypto.createHash('md5').update('app.min.js' + new Date().getTime()).digest('hex') + '.js',
                i,
                appScriptsContent = '';

            grunt.log.writeln(Chalk.bold.magenta('$$$$$$$$$$$$$$$$$$$$ UGLIFY SOURCE MODULES $$$$$$$$$$$$$$$$$$$$'));

            for (i = 0; i < SCRIPT_FILES.length; i++) {
                if (grunt.file.exists(SCRIPT_FILES[i])) {
                    appScriptsContent += String(grunt.file.read(SCRIPT_FILES[i], { encoding: 'utf8' })) + '\n';
                } else {
                    grunt.fail.warn(Chalk.bold.red('File: ' + SCRIPT_FILES[i] + ' does not exist'));
                    return false;
                }
            }

            grunt.file.write(appMinFile, appScriptsContent);
            if (!ringHelper.uglify(appMinFile, appMinFile, uglifyOptions)) {
                return false;
            }
            SCRIPT_FILES = [appMinFile];
            grunt.log.writeln(Chalk.red('App Script: ' + appMinFile));

            grunt.log.writeln(Chalk.bold.green('^^^^ END UGLIFY SOURCE MODULES   ^^^^ '));
            return true;
        }


        function minifyStyles() {
            var stylesMinFile = 'css/' + Crypto.createHash('md5').update('styles.min.css' + new Date().getTime()).digest('hex') + '.css',
                cssfile,
                i,
                minifiedStyle = '';

            grunt.log.writeln(Chalk.bold.magenta('$$$$$$$$$$$$$$$$$$$$ MINIFY STYLESHEETS USING CSSMIN $$$$$$$$$$$$$$$$$$$$'));

            for (i = 0; i < options.appStyles.length; i++) {
                cssfile = ringHelper.unixifyPath(options.appStyles[i]);
                if (!grunt.file.exists(cssfile)) {
                    grunt.fail.warn(Chalk.bold.red('File: ' + cssfile + ' does not exist'));
                    return false;
                }

                minifiedStyle += String(grunt.file.read(cssfile, { encoding: 'utf8' }));
            }

            grunt.file.write(stylesMinFile, cssmin(minifiedStyle));
            STYLE_SHEETS = [stylesMinFile];
            grunt.log.writeln(Chalk.red('App Styles: ' + stylesMinFile));

            grunt.log.writeln(Chalk.bold.green('^^^^ END MINIFY STYLESHEETS USING CSSMIN   ^^^^ '));
            return true;
        }


        function linkScriptsStyles() {
            var i,
                styleStartTag = '<!--STYLES-->',
                styleEndTag = '<!--STYLES END-->',
                styleFileTmpl = '<link rel=\'stylesheet\' type=\'text/css\' href=\'%s\' />',
                scriptStartTag = '<!--SCRIPTS-->',
                scriptEndTag = '<!--SCRIPTS END-->',
                scriptFileTmpl = '<script src="%s"></script>';

            grunt.log.writeln(Chalk.bold.magenta('$$$$$$$$$$$$$$$$$$$$ LINK SOURCE SCRIPTS AND STYLESHEETS $$$$$$$$$$$$$$$$$$$$'));

            for (i = 0; i < options.linkerFiles.length; i++) {
                grunt.log.writeln(Chalk.bold.green(options.linkerFiles[i]));
            }

            if (options.target === 'live') {
                ringHelper.linkFiles(VENDOR_SCRIPTS.concat(SCRIPT_FILES), scriptFileTmpl, scriptStartTag, scriptEndTag, options.linkerFiles);
            } else {
                ringHelper.linkFiles(VENDOR_SCRIPTS.concat(options.debugFiles.concat(SCRIPT_FILES)),
                    scriptFileTmpl, scriptStartTag, scriptEndTag, options.linkerFiles);
            }
            ringHelper.linkFiles(STYLE_SHEETS, styleFileTmpl, styleStartTag, styleEndTag, options.linkerFiles);

            grunt.log.writeln(Chalk.bold.green('^^^^ END LINK SOURCE SCRIPTS AND STYLESHEETS  ^^^^ '));

            return true;
        }

    // INITIALIZE
        VENDOR_SCRIPTS = options.vendorFiles;
        STYLE_SHEETS = options.appStyles;

    // RUN ALL TASKS
    // 1. copy src to build folder
        grunt.log.writeln();
        taskSuccess = copySrcToBuild();

    // 2. update settings files
        if (taskSuccess) {
            grunt.log.writeln();
            // THIS TASK ALWAYS SUCCEEDS intentionally
            taskSuccess = updateSettings();
        }

    // 3. build modules
        if (taskSuccess) {
            grunt.log.writeln();
            taskSuccess = buildModules();
        }

    // 4. remove debug codes if necessary
        if (taskSuccess && options.target === 'live') {
            grunt.log.writeln();
            // THIS TASK ALWAYS SUCCEEDS intentionally
            taskSuccess = removeDebugCode();
        }

    // 5. prepare worker files
        if (taskSuccess) {
            grunt.log.writeln();
            taskSuccess = prepareWorkerFiles();
        }

     // 6. uglify modules if necessary
        if (taskSuccess && (options.minifyScripts || options.target === 'live')) {
            grunt.log.writeln();
            taskSuccess = prepareVendorScripts();
            if (taskSuccess) {
                taskSuccess = uglifyModules();
            }
        }
    // 7. minify css if necessary
        if (taskSuccess) {
            if (options.minifyStyles || options.target === 'live') {
                grunt.log.writeln();
                taskSuccess = minifyStyles();
            } else {
                STYLE_SHEETS = options.appStyles;
            }
        }
    // 8. link javascript files
        if (taskSuccess) {
            grunt.log.writeln();
            linkScriptsStyles();
        }
    });
};

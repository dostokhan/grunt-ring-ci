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

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('ring_ci', 'Conginuous Integration for Angularjs 1 SPA', function() {
    var self = this,
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
        grunt.log.writeln(Chalk.bold.green('$$$$ COPY SOURCE FILES from: ' + options.appSrcPath + ' TO :'+ options.appBuildPath + '. $$$$'));
        var srcPath = ringHelper.unixifyPath(options.appSrcPath),
            buildPath = ringHelper.unixifyPath(options.appBuildPath);
        // destinations exists? delete and recreate
        if (grunt.file.exists(buildPath)) {
            grunt.log.write(Chalk.black('BuildPath:' + buildPath + ' exists. Recreating'));
            grunt.file.delete(buildPath);
        }
        grunt.file.mkdir(buildPath);

        var i,k;
        for(k = 0; k < options.appModules.length; k++) {
            for(i = 0; i < options.appModules[k].files.length; i++) {
                srcPath = ringHelper.unixifyPath(options.appSrcPath + options.appModules[k].files[i]);
                buildPath = ringHelper.unixifyPath(options.appBuildPath + options.appModules[k].files[i]);
                //grunt.log.writeln('src:' + srcPath + ' dest:' + buildPath);
                if (grunt.file.exists(srcPath)) {
                    grunt.file.copy(srcPath, buildPath);
                    srcFiles.push(buildPath);
                    grunt.log.writeln(Chalk.cyan(srcPath) + ' > ' + Chalk.red(buildPath)) ;
                } else {
                    grunt.fail.warn(Chalk.bold.red('File: ' + srcPath + ' does not exist'));
                }
            }

        }
        grunt.log.writeln(Chalk.bold.green('^^^^ END COPYING SOURCE FILES TO BUILD DIRECTORY. ^^^^ '));
    }



    // #TASK update apiversion, protocol, settings(analytics,debugEnabled,secure) etc using regex
    function updateSettings() {
        grunt.log.writeln(Chalk.bold.green('$$$$ UPDATE APIVERSION, PROTOCOL, SETTINGS(ANALYTICS,DEBUGENABLED,SECURE) ETC $$$$'));
        var searches =  [/(['|"]apiVersion['|"]\s*:\s*[0-9]+)/g],
            replaces = ['"apiVersion":' + options.apiVersion],
            protocolSearches,
            protocolReplaces;
        // set replacement parameters
        protocolSearches =  (options.protocol === 'ssl') ? [/http:\/\//g, /ws:\/\//g] : [/https:\/\//g, /wss:\/\//g] ;
        protocolReplaces = (options.protocol === 'ssl') ? ['https://', 'wss://'] : ['http://', 'ws://'];

        searches = searches.concat(protocolSearches);
        replaces = replaces.concat(protocolReplaces);

        searches = searches.concat([/secure\s*:\s*\w+,/]);
        replaces = replaces.concat( options.protocol === 'ssl' ? ['secure:true,'] :  ['secure:false,'] );

        searches = searches.concat([/analytics\s*:\s*\w+,/, /debugEnabled\s*:\s*\w+,/]);
        replaces = replaces.concat( options.target === 'live' ?  ['analytics:true,', 'debugEnabled:false,'] : ['analytics:false,', 'debugEnabled:true,'] );

        //grunt.log.writeflags(searches);
        //grunt.log.writeflags(replaces);
        // Modify settingsFile
        ringHelper.replace(options.settingsFile, searches, replaces);
        // Modify Template files
        ringHelper.replace(options.protocolFixTemplates, protocolSearches[0], protocolReplaces[0], true);
        // MOdify Worker Files
        ringHelper.replace(options.workerFiles, protocolSearches[1], protocolReplaces[1]);

        grunt.log.writeln(Chalk.bold.green('^^^^ END UPDATE APIVERSION, PROTOCOL, SETTINGS(ANALYTICS,DEBUGENABLED,SECURE) ETC ^^^^ '));
    }

    function buildModules() {
        grunt.log.writeln(Chalk.bold.green('$$$$ BUILD APP MODULES in: ' + options.appBuildPath + 'modules/. $$$$'));
        var i,k,d, srcPath, moduleFile,
            moduleContent = '',
            moduleContentStart = '',
            moduleContentEnd = '';


        for(k = 0; k < options.appModules.length; k++) {
            moduleContent = '';
            moduleContentStart = "(function() { 'use strict'; ";
            moduleContentEnd = "})();";

            grunt.log.writeln('Module ' + Chalk.red(options.appModules[k].name) );
            moduleFile = ringHelper.unixifyPath(options.appBuildPath + 'modules/' + options.appModules[k].name + '.module.js');
            for(i = 0; i < options.appModules[k].files.length; i++) {
                srcPath = ringHelper.unixifyPath(options.appBuildPath + options.appModules[k].files[i]);
                if (grunt.file.exists(srcPath)) {
                    // concat contents
                    moduleContent += String(grunt.file.read(srcPath, {encoding:'utf8'}));
                    grunt.log.writeln(Chalk.cyan(srcPath));
                } else {
                    grunt.fail.warn(Chalk.bold.red('File: ' + srcPath + ' does not exist'));
                }
            }

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

            moduleContent = moduleContentStart + moduleContent + moduleContentEnd;
            grunt.file.write(moduleFile, moduleContent);

            SCRIPT_FILES.push(moduleFile);
            grunt.log.writeln('BUILD MODULE: ' + Chalk.red(moduleFile));
        }
        grunt.log.writeln(Chalk.bold.green('^^^^ END APP MODULES BUILD. ^^^^ '));
    }


    function removeDebugCode() {
        grunt.log.writeln(Chalk.bold.green('$$$$ REMOVE DEBUG CODE from APP MODULES  $$$$'));
        var moduleFile, i, moduleContent,
            debugRegex = /DIGEST_DEBUG_START([\s\S]*?)(DIGEST_DEBUG_END)/gm,
            ringloggerRegex = /RingLogger([\s\S]*?;)/g;

        for(i = 0; i < options.appModules.length; i++) {
            moduleFile = ringHelper.unixifyPath(options.appBuildPath + 'modules/' +  options.appModules[i].name + '.module.js');
            ringHelper.replace(moduleFile, [debugRegex, ringloggerRegex], ['',''], true);
        }
        grunt.log.writeln(Chalk.bold.green('^^^^ END REMOVE DEBUG CODE from APP MODULES  ^^^^ '));
    }


    function uglifyModules() {
        SCRIPT_FILES = [];
        grunt.log.writeln(Chalk.bold.green('$$$$ UGLIFY SOURCE MODULES $$$$'));
        var uglifyOptions = {
                    banner: '',
                    footer: '',
                    compress: {
                        warnings: false
                    },
                    mangle: {},
                    beautify: false,
                    report: 'min',
                    expression: false,
                    maxLineLen: 32000,
                    ASCIIOnly: false,
                    screwIE8: false,
                    quoteStyle: 0
            },
            src,
            fileName,
            lastDotIndex,
            dest = 'js/dist/';

        for(var i = 0; i < options.appModules.length; i++) {
            dest = 'js/dist/';
            src = ringHelper.unixifyPath(options.appBuildPath + 'modules/' +  options.appModules[i].name + '.module.js');
            fileName = src.substr(src.lastIndexOf('/') + 1);
            dest += fileName.substr(0, fileName.lastIndexOf('.')) + '.min' + fileName.substr(fileName.lastIndexOf('.'));
            ringHelper.uglify(src, dest, uglifyOptions);
            SCRIPT_FILES.push(dest);
        }

        grunt.log.writeln(Chalk.bold.green('^^^^ END UGLIFY SOURCE MODULES   ^^^^ '));
    }


    function minifyStyles() {
        grunt.log.writeln(Chalk.bold.green('$$$$ MINIFY STYLESHEETS USING CSSMIN $$$$'));
        var cssfile, minifiedStyle = '';
        for(var i = 0; i < options.appStyles.length; i++) {
            cssfile = ringHelper.unixifyPath(options.appStyles[i]);
            if (!grunt.file.exists(cssfile)) {
                grunt.fail.warn(Chalk.bold.red('File: ' + cssfile+ ' does not exist'));
            } else {
                minifiedStyle += String(grunt.file.read(cssfile, {encoding:'utf8'}));
            }
        }

        grunt.file.write('css/styles.min.css', Cssmin(minifiedStyle));
        STYLE_SHEETS = ['css/styles.min.css'];
        grunt.log.writeln(Chalk.bold.green('^^^^ END MINIFY STYLESHEETS USING CSSMIN   ^^^^ '));
    }


    function linkScriptsStyles() {
        grunt.log.writeln(Chalk.bold.green('$$$$ LINK SOURCE SCRIPTS AND STYLESHEETS $$$$'));

        var styleStartTag = '<!--STYLES-->',
            styleEndTag = '<!--STYLES END-->',
            styleFileTmpl = "<link rel='stylesheet' type='text/css' href='%s' />",
            scriptStartTag = '<!--SCRIPTS-->',
            scriptEndTag = '<!--SCRIPTS END-->',
            scriptFileTmpl = '<script src="%s"></script>';

        ringHelper.linkFiles(SCRIPT_FILES, scriptFileTmpl, scriptStartTag, scriptEndTag,  options.linkerFiles);
        ringHelper.linkFiles(STYLE_SHEETS, styleFileTmpl, styleStartTag, styleEndTag,  options.linkerFiles);

        grunt.log.writeln(Chalk.bold.green('^^^^ END LINK SOURCE SCRIPTS AND STYLESHEETS  ^^^^ '));
    }


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
         removeDebugCode();
    }
    // 5. uglify modules if necessary
    grunt.log.writeln();
    if (options.target === 'live') {
        uglifyModules();
    }
    // 6. minify css if necessary
    grunt.log.writeln();
    if (options.target === 'live') {
        minifyStyles();
    } else {
        STYLE_SHEETS = options.appStyles;
    }
    // 7. link javascript files
    grunt.log.writeln();
    linkScriptsStyles();


  });

};

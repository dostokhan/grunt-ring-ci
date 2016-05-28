/*
 * grunt-ring-ci
 * https://github.com/dostokhan/grunt-ring-ci
 *
 * Copyright (c) 2016 Moniruzzaman Monir
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('ring_ci', 'Conginuous Integration for Angularjs 1 SPA', function() {
    var self = this,
        srcFiles = [],
        isWindows = process.platform === 'win32',
        Chalk = require('chalk');
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
    function unixifyPath (filePath) {
        return isWindows ?  filePath.replace(/\\/g, '/') : filePath;
    }
    function replace(files, search, replace, doNotPrependPath) {
        grunt.log.writeln(Chalk.bold.green('$$$$ REPLACE FILE CONTENT. $$$$'));
        // fix file paths with buildpath

        for(var i = 0; i < files.length; i++) {
            files[i] = unixifyPath(
                !!doNotPrependPath ?  files[i] :  options.appBuildPath + files[i]
            );
        }

        var filePaths = grunt.file.expand(files),
            fileContent,
            updatedContent;

        if (!(search instanceof Array)) {
            grunt.log.writeln('# Replace:' + Chalk.cyan(search) + ' With:' + Chalk.red(replace));
        }
        filePaths.forEach(function(filepath) {
            //grunt.log.writeln(filepath);

            if (!grunt.file.exists(filepath)) {
                grunt.fail.warn(Chalk.red('Source file "' + filepath + '" not found.'));
            } else {
                grunt.log.writeln('File:' + Chalk.yellow(filepath));
                fileContent = grunt.file.read(filepath, {encoding:'utf8'});
                if (search instanceof Array) {
                    updatedContent = fileContent;
                    for(var i = 0; i < search.length; i++) {
                        grunt.log.writeln(i + '# Replace:' + Chalk.cyan(search[i]) + ' With:' + Chalk.red(replace[i]));
                        if (search[i].test(String(updatedContent))) {
                            updatedContent = String(updatedContent).replace(search[i], replace[i]);
                        } else {
                            grunt.fail.warn('No Match Found');
                        }
                    }
                } else {
                    updatedContent = fileContent;
                    if (search.test(String(updatedContent))) {
                        updatedContent = String(updatedContent).replace(search, replace);
                    } else {
                        grunt.fail.warn('No Match Found');
                    }
                }
                grunt.file.write(filepath, updatedContent);
            }
        });
        grunt.log.writeln(Chalk.bold.green('^^^^ END REPLACE FILE CONTENT. ^^^^ '));
    }

    // END HELPER METHODS


    // #COPY all app source files except 'bower_modules' to build path
    function copySrcToBuild() {
        grunt.log.writeln(Chalk.bold.green('$$$$ COPY SOURCE FILES from: ' + options.appSrcPath + ' TO :'+ options.appBuildPath + '. $$$$'));
        var srcPath = unixifyPath(options.appSrcPath),
            buildPath = unixifyPath(options.appBuildPath);
        // destinations exists? delete and recreate
        if (grunt.file.exists(buildPath)) {
            grunt.log.write(Chalk.black('BuildPath:' + buildPath + ' exists. Recreating'));
            grunt.file.delete(buildPath);
        }
        grunt.file.mkdir(buildPath);

        var i,k;
        for(k = 0; k < options.appModules.length; k++) {
            for(i = 0; i < options.appModules[k].files.length; i++) {
                srcPath = unixifyPath(options.appSrcPath + options.appModules[k].files[i]);
                buildPath = unixifyPath(options.appBuildPath + options.appModules[k].files[i]);
                //grunt.log.writeln('src:' + srcPath + ' dest:' + buildPath);
                if (grunt.file.exists(srcPath)) {
                    grunt.file.copy(srcPath, buildPath);
                    srcFiles.push(buildPath);
                    grunt.log.writeln(Chalk.cyan(srcPath) + ' > ' + Chalk.red(buildPath)) ;
                } else {
                    grunt.fail.warn('File: ' + Chalk.red(srcPath) + ' does not exist');
                }
            }

        }
        grunt.log.writeln(Chalk.bold.green('^^^^ END COPYING SOURCE FILES TO BUILD DIRECTORY. ^^^^ '));
    }



    // #TASK update apiversion, protocol, settings(analytics,debugEnabled,secure) etc using regex
    function updateSettings() {

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
        replace(options.settingsFile, searches, replaces);
        // Modify Template files
        replace(options.protocolFixTemplates, protocolSearches[0], protocolReplaces[0], true);
        // MOdify Worker Files
        replace(options.workerFiles, protocolSearches[1], protocolReplaces[1]);

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
            moduleFile = unixifyPath(options.appBuildPath + 'modules/' + options.appModules[k].name + '.module.js');
            for(i = 0; i < options.appModules[k].files.length; i++) {
                srcPath = unixifyPath(options.appBuildPath + options.appModules[k].files[i]);
                if (grunt.file.exists(srcPath)) {
                    // concat contents
                    moduleContent += String(grunt.file.read(srcPath, {encoding:'utf8'}));
                    grunt.log.writeln(Chalk.cyan(srcPath));
                } else {
                    grunt.fail.warn('File: ' + Chalk.red(srcPath) + ' does not exist');
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
            moduleFile = unixifyPath(options.appBuildPath + 'modules/' +  options.appModules[i].name + '.module.js');
            replace(moduleFile, [debugRegex, ringloggerRegex], ['',''], true);
        }
        grunt.log.writeln(Chalk.bold.green('^^^^ END REMOVE DEBUG CODE from APP MODULES  ^^^^ '));
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
    // 6. link javascript files




    // #TASK pull latest branch
    function updateBranch() {
        var Git = require('nodegit');
        var asyncDone = self.async();
        Git.Repository.open(".").then(function(repo) {
            grunt.log.writeln('');
            grunt.log.writeln('OPENED REPO. now opening branch:' + options.branch);
            repo.getBranchCommit(options.branch).then(function(commit) {
                grunt.log.writeln('got branch commit');
                grunt.log.writeln(commit.date());
                asyncDone();
            });
        });
    }

    // Iterate over all specified file groups.
    this.files.forEach(function(f) {
      // Concat specified files.
      var src = f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function(filepath) {
        // Read file source.
        return grunt.file.read(filepath);
      }).join(grunt.util.normalizelf(options.separator));

      // Handle options.
      src += options.punctuation;

      // Write the destination file.
      grunt.file.write(f.dest, src);

      // Print a success message.
      grunt.log.writeln('File "' + f.dest + '" created.');
    });
  });

};

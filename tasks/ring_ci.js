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
    var self = this;
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      punctuation: '.',
      separator: ', ',
        target:'dev',
        protocol:'nonssl',
        apiversion:'141',
        branch:'master'
    });


    var Fs = require('fs');
    function replace(files, search, replace) {
        grunt.log.writeln('REPLACE FILE CONTENT. fix ApiVersion');
        //grunt.log.write(files);
        //grunt.log.write(search);
        //grunt.log.write(replace);
        var filePaths = grunt.file.expand(files),
            fileContent,
            updatedContent;
        filePaths.forEach(function(filepath) {
            if (!grunt.file.exists(filepath)) {
                grunt.fail.warn('Source file "' + filepath + '" not found.');
            } else {
                grunt.log.writeln('File:' + filepath);
                fileContent = grunt.file.read(filepath, {encoding:'utf8'});
                if (search instanceof Array) {
                    updatedContent = fileContent;
                    grunt.log.writeln('search array length:' + search.length);
                    for(var i = 0; i < search.length; i++) {
                        grunt.log.writeln(i + '# Replace:' + search[i] + ' With:' + replace[i]);
                        if (search[i].test(String(updatedContent))) {
                            updatedContent = String(updatedContent).replace(search[i], replace[i]);
                        } else {
                            grunt.fail.warn('No Match Found');
                        }
                    }
                } else {
                    if (search.test(String(updatedContent))) {
                        updatedContent = String(fileContent).replace(search, replace);
                    } else {
                        grunt.fail.warn('No Match Found');
                    }
                }
                //grunt.log.write(updatedContent);
                grunt.file.write(filepath, updatedContent);
                //grunt.log.write(grunt.file.read(filepath, {encoding:'utf8'}));
                //asyncDone();
            }
        });
    }



    // #TASK pull latest branch
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


    // #TASK update apiversion,protocol etc using regex
    grunt.log.writeln('');
    replace(options.settingsFile,
           [
               /(['|"]apiVersion['|"]\s*:\s*[0-9]+)/g,
               /http:\/\//g,
               /ws:\/\//g,
               /analytics\s*:\s*\w+,/,
               /debugEnabled\s*:\s*\w+,/,
               /secure\s*:\s*\w+,/,
           ],
           [
               '"apiVersion":' + options.apiVersion,
               'https://',
               'wss://',
               'analytics:true,',
               'debugEnabled:false,',
               'secure:true,'
           ]
    );




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

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
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      punctuation: '.',
      separator: ', ',
        target:'dev',
        protocol:'nonssl',
        apiversion:'141',
        branch:'master'
    });

    var Git = require('nodegit');

    // #TASK pull latest branch
    Git.Repository.open(".").then(function(repo) {
        repo.getBranchCommit(options.branch).then(function(commit) {
            grunt.log.wrinteln('commit author:' + commit.author());
        });
    });


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

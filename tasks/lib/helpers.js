'use strict';


var Chalk = require('chalk'),
    Eslint = require('eslint'),
    Util = require('util'),
    Uglifyjs = require('uglify-js');

module.exports.init = function initFunc(grunt, options) {
    var exports = {},
        /* eslint-disable no-undef */
        isWindows = process.platform === 'win32';
        /* eslint-enable no-undef */


    exports.unixifyPath = unixifyPath;
    exports.lintScript = lintScript;
    exports.replace = replaceFunction;
    exports.uglify = uglify;
    exports.linkFiles = linkFiles;

    function unixifyPath(filePath) {
        return isWindows ? filePath.replace(/\\/g, '/') : filePath;
    }


    function lintScript(fileSrc, opts) {
        var engine = new Eslint.CLIEngine(opts),
            results,
            tooManyWarnings,
            formatter = Eslint.CLIEngine.getFormatter(opts.format),
            report;

        if (!formatter) {
            grunt.log.warn(Chalk.bold.red('Could not find formtter:' + opts.format));
            return false;
        }


        try {
            report = engine.executeOnFiles([fileSrc]);
        } catch (err) {
            grunt.warn(err);
            return false;
        }

        if (opts.fix) {
            Eslint.CLIEngine.outputFixes(report);
        }


        results = report.results;
        Chalk.yellow(formatter(results));

        if (opts.quiet) {
            results = Eslint.CLIEngine.getErrorResults(results);
        }

        tooManyWarnings = opts.maxWarnings >= 0 && report.warningCount > opts.maxWarnings;

        if (report.errorCount === 0 && tooManyWarnings) {
            grunt.log.warn(Chalk.bold.red('ESLint found too many warnings (maximum:' + opts.maxWarnings + ')'));
        }

        return report.errorCount === 0;
    }

    function replaceFunction(files, search, replace, doNotPrependPath, noOutput) {
        // fix file paths with buildpath
        var noDebugOutput = !!noOutput,
            filePaths,
            fileContent,
            updatedContent,
            i;

        for (i = 0; i < files.length; i++) {
            files[i] = exports.unixifyPath(
                !!doNotPrependPath ? files[i] : options.appBuildPath + files[i]
            );
        }

        filePaths = grunt.file.expand(files);

        if (!(search instanceof Array)) {
            grunt.log.writeln('# Replace:' + Chalk.cyan(search) + ' With:' + Chalk.red(replace));
        }

        filePaths.forEach(forEachFunction);

        function forEachFunction(filepath) {
            // grunt.log.writeln(filepath);

            if (!grunt.file.exists(filepath)) {
                grunt.fail.warn(Chalk.bold.red('Source file "' + filepath + '" not found.'));
            } else {
                if (!noDebugOutput) {
                    grunt.log.writeln('File:' + Chalk.yellow(filepath));
                }
                fileContent = grunt.file.read(filepath, { encoding: 'utf8' });
                if (search instanceof Array) {
                    updatedContent = fileContent;
                    for (i = 0; i < search.length; i++) {
                        if (!noDebugOutput) {
                            grunt.log.writeln(i + '# Replace:' + Chalk.cyan(search[i]) + ' With:' + Chalk.red(replace[i]));
                        }
                        if (search[i].test(String(updatedContent))) {
                            updatedContent = String(updatedContent).replace(search[i], replace[i]);
                        } else if (!noDebugOutput) {
                            grunt.log.warn(Chalk.bold.red('No Match Found'));
                        }
                    }
                } else {
                    updatedContent = fileContent;
                    if (search.test(String(updatedContent))) {
                        updatedContent = String(updatedContent).replace(search, replace);
                    } else {
                        grunt.log.warn(Chalk.bold.red('No Match Found'));
                    }
                }
                grunt.file.write(filepath, updatedContent);
            }
        }
    }

    function uglify(srcPath, destPath, uglifyOptions) {
        var result,
            output,
            src,
            dest,
            err;
        src = exports.unixifyPath(srcPath);
        dest = exports.unixifyPath(destPath);

        try {
            result = Uglifyjs.minify(src, uglifyOptions);
        } catch (e) {
            err = new Error('Uglification failed.');
            if (e.message) {
                err.message += '\n' + e.message + '. \n';
                if (e.line) {
                    err.message += 'Line ' + e.line + ' in ' + src + '\n';
                }
            }
            err.origError = e;
            grunt.log.warn(Chalk.bold.red('Uglifying source ' + src + ' failed.'));
            grunt.fail.warn(err);
        }

        output = Util.format(uglifyOptions.banner, grunt.template.today('yyyy-mm-dd')) + result.code;

        grunt.file.write(dest, output);
        grunt.log.writeln(src + ' > ' + dest);
    }


    function linkFiles(srcFiles, template, startTag, endTag, destFiles) {
        var page,
            counter = 0,
            newPage,
            start,
            end,
            scripts;

        scripts = srcFiles.filter(filterFunc).map(mapFunc);

        function filterFunc(filepath) {
            // Warn on and remove invalid source files (if nonull was set).
            if (!grunt.file.exists(filepath)) {
                grunt.fail.warn('Source file "' + filepath + '" not found.');
                return false;
            }
            return true;
        }
        function mapFunc(filepath) {
            counter++;
            // grunt.log.writeln(filepath);
            return Util.format(template, filepath);
        }

        grunt.file.expand({}, destFiles).forEach(forEachFunc);

        function forEachFunc(dest) {
            var padding,
                ind;
            page = grunt.file.read(dest);
            start = page.indexOf(startTag);
            end = page.indexOf(endTag);

            if (start !== -1 && end !== -1 && start < end) {
                padding = '';
                ind = start - 1;
                while (/[^\S\n]/.test(page.charAt(ind))) {
                    padding += page.charAt(ind);
                    ind -= 1;
                }
                // console.log('padding length', padding.length);
                newPage = page.substr(0, start + startTag.length) +
                         grunt.util.linefeed +
                         padding +
                         scripts.join(grunt.util.linefeed + padding) +
                         grunt.util.linefeed +
                         padding +
                         page.substr(end);

                // Insert the scripts
                grunt.file.write(dest, newPage);
                grunt.log.writeln(Chalk.cyan('Inserted ' + counter + ' links into File "' + dest));
            }
        }
    }


    // return exports;
};

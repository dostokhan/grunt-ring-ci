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
    exports.templateURLReplace = templateURLReplace;
    exports.log = log;

    function log(type, task, input, output) {
        switch (type) {
            case 'success':
                grunt.log.writeln(Chalk.bold.cyan(task) + ' ' + Chalk.blue(input) + (output ? ' > ' + Chalk.green(output) : ''));
                break;
            case 'warning':
                grunt.fail.warn(Chalk.bold.cyan(task) + ' ' + Chalk.bold.red(input) + (output ? ' > ' + Chalk.yellow(output) : ''));
                break;
            case 'error':
                grunt.fail.fatal(Chalk.bold.cyan(task) + ' ' + Chalk.bold.red(input) + (output ? ' > ' + Chalk.yellow(output) : ''));
                break;
            case 'info':
                grunt.log.writeln(Chalk.yellow(task) + ' ' + Chalk.blue(input) + (output ? ' > ' + Chalk.green(output) : ''));
                break;
            case 'taskstart':
                grunt.log.writeln();
                grunt.log.writeln('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%  ' + Chalk.bold.red(task) + '  %%%%%%%%%%%%%%%%%%%');
                break;
            case 'taskend':
                grunt.log.writeln('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%  ' + Chalk.bold.green(task) + '  %%%%%%%%%%%%%%%%%%%');
                break;
            default:
                grunt.log.writeln(Chalk.bold.cyan(task) + ' ' + Chalk.blue(input) + (output ? ' > ' + Chalk.green(output) : ''));
        }
    }

    function unixifyPath(filePath) {
        return isWindows ? filePath.replace(/\\/g, '/') : filePath;
    }


    function templateURLReplace(fileContent) {
        var modifiedContent = fileContent.toString(),
            templateRegex = /templateUrl[\s]*?:[\s]*?'([\w\W]+?)'/g;

            // regex = /(\/{2,}([\s]+)?)?templateUrl\s?:([\s]+)?'([\w\W]+?)'(,)?/g,
            // full = /(\/{2,}([\s]+)?)?templateUrl\s?:([\s]+)?'([\w\W]+?)'(,)?(([\n]+)?template\s?:([\s]+)?'([\w\W]+?)([^\\]')(,)?([\n]+)?)?/g,
            // regexw = /template\s?:([\s]+)?'([\w\W]+?)([^\\]')(,)?([\n]+)?/g;


        if (!templateRegex.test(modifiedContent)) {
            return false;
        }

        function escapeString(str) {
            var escapedStr;
            escapedStr = str.replace(/\\/g, '\\\\')
                     .replace(/'/g, "\\'");
            return escapedStr;
        }

        modifiedContent = modifiedContent.replace(templateRegex, function regexReplace(match, templatePath) {
            var templateContent,
                returnVal;

            if (grunt.file.exists(templatePath)) {
                templateContent = grunt.file.read(templatePath, { encoding: 'utf8' });
                returnVal = 'template: \'' + escapeString(templateContent.toString()) + '\'';
                log('success', 'Replace', match, templatePath);
            } else {
                returnVal = match;
                log('warning', 'Replace', templatePath, 'Not Found');
            }

            return returnVal;
        });

        return modifiedContent;
        // return false;
    }


    function lintScript(fileSrc, opts) {
        var engine = new Eslint.CLIEngine(opts),
            results,
            tooManyWarnings,
            formatter = Eslint.CLIEngine.getFormatter(opts.format),
            report;

        if (!formatter) {
            log('error', 'Linting', 'Could not find formtter:', opts.format);
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
            log('error', 'Linting ', fileSrc, ' Too many warning > ' + opts.maxWarnings);
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
            log('info', 'Replace', search, replace);
        }

        filePaths.forEach(forEachFunction);

        function forEachFunction(filepath) {

            if (!grunt.file.exists(filepath)) {
                log('error', 'Replace', filepath, 'Not found');
            } else {
                if (!noDebugOutput) {
                    log('info', 'Replace in File', filepath);
                }
                fileContent = grunt.file.read(filepath, { encoding: 'utf8' });
                if (search instanceof Array) {
                    updatedContent = fileContent;
                    for (i = 0; i < search.length; i++) {
                        if (!noDebugOutput) {
                            log('info', 'Replace', search[i], replace[i]);
                        }
                        if (search[i].test(String(updatedContent))) {
                            updatedContent = String(updatedContent).replace(search[i], replace[i]);
                        } else if (!noDebugOutput) {
                            log('warning', 'Replace', search[i], replace[i]);
                        }
                    }
                } else {
                    updatedContent = fileContent;
                    if (search.test(String(updatedContent))) {
                        updatedContent = String(updatedContent).replace(search, replace);
                    } else {
                        log('warning', 'Replace', search, replace);
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
            log('error', 'Uglify', src);
            return false;
        }

        output = Util.format(uglifyOptions.banner, grunt.template.today('yyyy-mm-dd')) + result.code;

        grunt.file.write(dest, output);
        log('success', 'Uglify', src, dest);
        return true;
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
                log('error', 'Linking', filepath, 'Not found');
                return false;
            }
            return true;
        }
        function mapFunc(filepath) {
            counter++;
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
                log('success', 'Linking', dest, counter);
            }
        }
    }


    return exports;
};

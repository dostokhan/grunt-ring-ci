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
    exports.linkTestFiles = linkTestFiles;

    exports.templateURLReplace = templateURLReplace;
    exports.log = log;

    function log(type, task, input, output) {
        switch (type) {
            case 'success':
                grunt.log.writeln(Chalk.bold.cyan(task) + ' ' + Chalk.blue(input) + (output ? ' > ' + Chalk.green(output) : ''));
                break;
            case 'warning':
                grunt.log.writeln(Chalk.bold.cyan(task) + ' ' + Chalk.bold.red(input) + (output ? ' > ' + Chalk.yellow(output) : ''));
                break;
            case 'error':
                grunt.fail.fatal(Chalk.bold.cyan(task) + ' ' + Chalk.bold.red(input) + (output ? ' > ' + Chalk.yellow(output) : ''));
                break;
            case 'info':
                grunt.log.writeln(Chalk.underline.magenta(task) + ' ' + Chalk.blue(input) + (output ? ' > ' + Chalk.green(output) : ''));
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

        if (!templateRegex.test(modifiedContent)) {
            return false;
        }

        function escapeStringAndNewline(str) {
            var escapedStr;
            /* eslint-disable quotes */
            escapedStr = str.replace(/\\/g, '\\\\')
                     .replace(/'/g, "\\'");
            /* eslint-enable quotes */
            escapedStr = escapedStr.replace(/(?:\r\n|\r|\n)/g, '\' + \n \'');
            return escapedStr;
        }

        modifiedContent = modifiedContent.replace(templateRegex, function regexReplace(match, templatePath) {
            var templateContent,
                returnVal;

            if (grunt.file.exists(templatePath)) {
                templateContent = grunt.file.read(templatePath, { encoding: 'utf8' });
                returnVal = 'template: \'' + escapeStringAndNewline(templateContent.toString()) + '\'';
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
            log('warning', 'Lint', err);
            return false;
        }

        if (opts.fix) {
            Eslint.CLIEngine.outputFixes(report);
        }


        results = report.results;
        grunt.log.write(Chalk.yellow(formatter(results)));

        if (opts.quiet) {
            results = Eslint.CLIEngine.getErrorResults(results);
        }

        tooManyWarnings = opts.maxWarnings >= 0 && report.warningCount > opts.maxWarnings;

        if (report.errorCount === 0 && tooManyWarnings) {
            log('error', 'Linting ', fileSrc, ' Too many warning > ' + opts.maxWarnings);
        }

        return report.errorCount === 0;
    }

    function replaceFunction(files, search, replace, doNotPrependPath, appendBuildPath) {
        // fix file paths with buildpath
        var noDebugOutput = Boolean(doNotPrependPath),
            fileContent,
            updatedContent,
            i;

        for (i = 0; i < files.length; i++) {
            files[i] = exports.unixifyPath(
                !!appendBuildPath ? files[i] : options.appBuildPath + files[i]
            );
        }

        // filePaths = grunt.file.expand(files);
        files.forEach(forEachFunction);

        function forEachFunction(filepath) {
            if (!grunt.file.exists(filepath)) {
                log('error', 'Replace', filepath, 'Not found');
            } else {
                if (!noDebugOutput) {
                    log('info', 'File', filepath);
                }
                fileContent = grunt.file.read(filepath, { encoding: 'utf8' });
                if (search instanceof Array) {
                    updatedContent = fileContent;
                    for (i = 0; i < search.length; i++) {
                        if (search[i].test(String(updatedContent))) {
                            updatedContent = String(updatedContent).replace(search[i], replace[i]);
                            if (!noDebugOutput) {
                                log('success', 'Replace', search[i], replace[i]);
                            }
                        } else if (!noDebugOutput) {
                            log('warning', 'Replace', search[i], replace[i]);
                        }
                    }
                } else {
                    updatedContent = fileContent;
                    if (search.test(String(updatedContent))) {
                        updatedContent = String(updatedContent).replace(search, replace);
                        if (!noDebugOutput) {
                            log('success', 'Replace', search, replace);
                        }
                    } else if (!noDebugOutput) {
                        log('warning', 'Replace', search, replace);
                    }
                }
                grunt.file.write(filepath, updatedContent);
            }
        }
    }

    function uglify(srcPath, destPath, uglifyOptions, returnMinified) {
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

        log('success', 'Uglify', src, dest);

        if (returnMinified) {
            return String(output);
        }
        grunt.file.write(dest, output);
        return true;
    }


    function linkTestFiles(srcFiles) {
        var dest = 'karma.conf.js',
            startTag = '// APP_SCRIPTS',
            endTag = '// END_APP_SCRIPTS',
            template = '\'%s\',',
            padding,
            scripts,
            start,
            end,
            newPage,
            ind,
            page;

        log('info', 'LINKIKNG TEST FILES', ' IN karma.conf.js');

        if (!grunt.file.exists(dest)) {
            log('warning', dest, 'Not Found');
            return;
        }

        page = grunt.file.read(dest);
        start = page.indexOf(startTag);
        end = page.indexOf(endTag);



        function filterFunc(filepath) {
            // Warn on and remove invalid source files (if nonull was set).
            if (!grunt.file.exists(filepath)) {
                log('error', 'Src File: ', filepath, 'Not found');
                return false;
            }
            return true;
        }

        function mapFunc(filepath) {
            return Util.format(template, filepath);
        }

        if (start !== -1 && end !== -1 && start < end) {
            padding = '';
            ind = start - 1;
            while (/[^\S\n]/.test(page.charAt(ind))) {
                padding += page.charAt(ind);
                ind -= 1;
            }

            scripts = srcFiles.filter(filterFunc).map(mapFunc);

            newPage = page.substr(0, start + startTag.length) +
                     grunt.util.linefeed +
                     padding +
                     scripts.join(grunt.util.linefeed + padding) +
                     grunt.util.linefeed +
                     padding +
                     page.substr(end);

            // Insert the scripts
            grunt.file.write(dest, newPage);
        }
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
                log('success', 'Linking', dest, counter + ' files');
            }
        }
    }


    return exports;
};

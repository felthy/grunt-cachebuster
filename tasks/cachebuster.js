/*
 * grunt-cachebuster
 * https://github.com/felthy/grunt-cachebuster
 *
 * Copyright (c) 2013 Pete Feltham
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  var crypto = require('crypto');
  var path = require('path');

  var formatters = {
    json: function(hashes, banner) {
      return banner + JSON.stringify(hashes);
    },
    php: function(hashes, banner) {
      var output = '<?php\n' + banner + '\nreturn ';

      function writeArray(object, depth) {
        output += 'array(\n';
        var indent = new Array(depth + 1).join('\t');
        for (var key in object) {
          output += indent + "\t'" + key + "' => ";

          switch (typeof object[key]) {
            case 'object':
              writeArray(object[key], depth + 1);
              output += ",\n";
              break;
            case 'number':
              output += object[key] + ",\n";
              break;
            default:
              output += "'" + object[key] + "',\n";
          }
        }
        output += indent + ')';
      }
      writeArray(hashes, 0);
      output += ';\n';

      return output;
    }
  };

  grunt.registerMultiTask('cachebuster', 'Generates a file containing file hashes.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      format: 'json',
      banner: '',
      hash: 'md5',
      includeDirs: false
    });
    options.formatter = options.formatter || formatters[options.format];

    var basedir = null;
    if (options.basedir) {
      basedir = path.resolve(options.basedir);
    }

    // Iterate over all specified file groups.
    var self = this;
    this.files.forEach(function(f) {
      grunt.log.write('Generating cachebuster file "' + f.dest + '"...');
      var warnings = false;
      var hashes_cache = {};
      var hashes = {};

      function makeKey(filename) {
          return (basedir) ? path.relative(basedir, filename) : filename;
      }

      function doHash(data) {
            var fn = typeof options.hash === 'function' ?
              options.hash :
              function (source) {
                return crypto.
                  createHash(options.hash).
                  update(source).
                  digest('hex');
              };
            return fn.call(self, data).
              slice(0, options.length);
      }

      function getOrCompute(filename) {
        var key = makeKey(filename);

        if (!(key in hashes_cache)) {
          if (grunt.file.isDir(filename)) {
            var child_hashes = [];
            grunt.file.recurse(filename, function (abspath, rootdir, subdir, filename) {
              child_hashes.push(getOrCompute(abspath));
            });
            hashes_cache[key] = doHash(child_hashes.join(''));
          } else {
            var source = grunt.file.read(filename, {
              encoding: null
            });
            hashes_cache[key] = doHash(source);
          }
        }
        return hashes_cache[key];
      }

      // Concat specified files.
      f.src.forEach(function(filename) {
        if (grunt.file.exists(filename)) {
          var key = makeKey(filename);

          if (!grunt.file.isDir(filename) || options.includeDirs) {
            hashes[key] = getOrCompute(filename);
          }
        } else {
          grunt.log.warn('Source file "' + filename + '" not found.');
          warnings = true;
        }
      });

      if (typeof options.complete === 'function') {
        hashes = options.complete.call(self, hashes);
      }

      if (f.dest && hashes) {
        // Write the destination file.
        grunt.file.write(f.dest, options.formatter.call(self, hashes, options.banner));
      } else {
        grunt.verbose.writeln('Not writing output file.');
      }

      // Print a success message.
      if (warnings) {
        grunt.log.warn('Cachebuster file "' + f.dest + '" created, with warnings.');
      } else {
        grunt.log.ok();
      }
    });
  });

};

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
      length: 32
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
      var hashes = {};
      // Concat specified files.
      f.src.forEach(function(filename) {
        if (grunt.file.exists(filename)) {
          if (!grunt.file.isDir(filename)) {
            var source = grunt.file.read(filename, {
              encoding: null
            });
            var hash = crypto.
              createHash('md5').
              update(source).
              digest('hex').
              slice(0, options.length);

            var key = filename;
            if (basedir) {
              key = path.relative(basedir, filename);
            }

            hashes[key] = hash;
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

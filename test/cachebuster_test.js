'use strict';

var grunt = require('grunt');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.cachebuster = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },
  default_options: function(test) {
    var actual = grunt.file.read('tmp/default_options');
    var expected = grunt.file.read('test/expected/default_options');
    test.equal(actual, expected, 'Should generate a json file with default options');

    test.done();
  },
  custom_options: function(test) {
    var actual = grunt.file.read('tmp/custom_options');
    var expected = grunt.file.read('test/expected/custom_options');
    test.equal(actual, expected, 'Should generate a PHP file with a banner');

    test.done();
  },
  custom_formatter: function(test) {
    var actual = grunt.file.read('tmp/custom_formatter.csv');
    var expected = grunt.file.read('test/expected/custom_formatter.csv');
    test.equal(actual, expected, 'Should generate a custom file in CSV format');

    test.done();
  },
  custom_php: function(test) {
    var actual = grunt.file.read('tmp/custom_php');
    var expected = grunt.file.read('test/expected/custom_php');
    test.equal(actual, expected, 'Should generate a PHP file two levels deep');

    test.done();
  },
  no_dest: function(test) {
    var actual = grunt.file.read('tmp/no_dest_result');
    test.equal(actual, '{"test/fixtures/testing":"fa6a5a3224d7da66d9e0bdec25f62cf0"}', 'no_dest complete handler in Gruntfile.js should have written tmp/no_dest_result');

    test.done();
  },
  international: function(test) {
    var actual = grunt.file.read('tmp/international');
    var expected = grunt.file.read('test/expected/international');
    test.equal(actual, expected, 'Should generate a json file for international content');

    test.done();
  },
  directories: function(test) {
    var actual = grunt.file.read('tmp/directories.php');
    var expected = grunt.file.read('test/expected/directories.php');
    test.equal(actual, expected, 'Should generate a json file for content containing directories');

    test.done();
  },
  hash_length: function(test) {
    var actual = grunt.file.read('tmp/hash_length');
    var expected = grunt.file.read('test/expected/hash_length');
    test.equal(actual, expected, 'Should generate a php file without a banner and with md5 hashes truncated to 8 characters');

    test.done();
  }

};

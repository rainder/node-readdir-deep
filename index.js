'use strict';

const co = require('co');
const fs = require('fs');
const path = require('path');

module.exports = {
  read,
  readSync
};

/**
 *
 * @param dir {String}
 * @param options {{filter, directory_filter}}
 * @returns {*}
 */
function read(dir, options = {}) {
  const noop_filter = () => true;
  const filter = options.filter || noop_filter;
  const directory_filter = options.directory_filter || noop_filter;

  return co(go);

  /**
   *
   * @returns {Array}
   */
  function *go() {
    const result = [];
    const files = [path.resolve(dir)];

    for (let file of files) {
      const stat = yield cb => fs.stat(file, cb);

      if (stat.isDirectory()) {
        yield processDirectory(files, file)
        continue;
      }

      if (filter(file) === false) {
        continue;
      }

      result.push(file);
    }

    return result;
  }

  /**
   *
   * @param files
   * @param file
   */
  function *processDirectory(files, file) {
    if (directory_filter(file) === false) {
      return;
    }

    const newFiles = yield cb => fs.readdir(file, cb);
    Array.prototype.push.apply(files, newFiles.map(item => path.resolve(file, item)));
  }
}

function readSync(dir, options = {}) {
  const noop_filter = () => true;
  const filter = options.filter || noop_filter;
  const directory_filter = options.directory_filter || noop_filter;

  return go();

  /**
   *
   * @returns {Array}
   */
  function go() {
    const result = [];
    const files = [path.resolve(dir)];

    for (let file of files) {
      const stat = fs.statSync(file);

      if (stat.isDirectory()) {
        processDirectory(files, file)
        continue;
      }

      if (filter(file) === false) {
        continue;
      }

      result.push(file);
    }

    return result;
  }

  /**
   *
   * @param files
   * @param file
   */
  function processDirectory(files, file) {
    if (directory_filter(file) === false) {
      return;
    }

    const newFiles = fs.readdirSync(file);
    Array.prototype.push.apply(files, newFiles.map(item => path.resolve(file, item)));
  }
}

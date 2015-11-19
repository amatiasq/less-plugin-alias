/* eslint-env node */
var isProtocol = /:\/\//;
var hasAlias = /^\w+:/;
var hasStartSlash = /^\//;
var hasEndSlash = /\/$/;


module.exports = function(maps) {
  return {
    minVersion: [ 2, 0, 0 ],

    install: function(less, pluginManager) {
      var FileManager = less.FileManager;
      var loadFile = FileManager.prototype.loadFile || identity;


      function AliasFileManager() {
        FileManager.apply(this);
        this.maps = maps || {};
      }

      AliasFileManager.prototype = Object.create(FileManager.prototype);

      AliasFileManager.prototype.loadFile = function(filename, currentDirectory, options, environment) {
        if (isProtocol.test(filename) || !hasAlias.test(filename))
          return loadFile.call(this, filename, currentDirectory, options, environment);

        var split = filename.split(':');
        var alias = split[0];
        var path = split[1];
        var base = this.maps[alias];

        if (!base) {
          console.error('Unknown alias "' + alias + '" in "' + filename + '"');
          throw new Error('Unknown alias "' + alias + '" in "' + filename + '"');
        }

        if (!hasStartSlash.test(path) && !hasEndSlash.test(base))
          base += '/';

        return loadFile.call(this, base + path, currentDirectory, options, environment);
      };


      pluginManager.addFileManager(new AliasFileManager());
    },
  };
};


function identity(value) {
  return value;
}

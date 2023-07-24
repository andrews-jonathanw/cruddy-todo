const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  // var id = counter.getNextUniqueId();
  // items[id] = text;//
  // callback(null, { id, text });
  counter.getNextUniqueId((err, data) =>
    fs.writeFile(path.join(exports.dataDir, `${data}.txt`), text, (err) => {
      {
        if (err) {
          throw ('error getting uniqueId');
        } else {
          callback(null, {id: data, text: text}); // call back from server.js
        }
      }
    })
  );
};

exports.readAll = (callback) => {
  // var data = _.map(items, (text, id) => {
  //   return { id, text };
  // });
  // callback(null, data);

  // get array of files
  // remove counter?
  // map to object // {id: id, text: id}

  fs.readdir(exports.dataDir, (err, contents) => {
    if (err) {
      throw ('error listing all files');
    } else {
      var output = contents.map((file) => { return {id: file.substring(0, 5), text: file.substring(0, 5)}; });
    }
    callback(null, output);
  });

  //callback(null, output);


};

exports.readOne = (id, callback) => {
  var text = items[id];
  if (!text) {
    callback(new Error(`No item with id: ${id}`));
  } else {
    callback(null, { id, text });
  }
};

exports.update = (id, text, callback) => {
  var item = items[id];
  if (!item) {
    callback(new Error(`No item with id: ${id}`));
  } else {
    items[id] = text;
    callback(null, { id, text });
  }
};

exports.delete = (id, callback) => {
  var item = items[id];
  delete items[id];
  if (!item) {
    // report an error if item not found
    callback(new Error(`No item with id: ${id}`));
  } else {
    callback();
  }
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};

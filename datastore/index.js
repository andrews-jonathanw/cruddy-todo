const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require('bluebird');


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

var promisifiedReaddir = Promise.promisify(require('fs').readdir);
var promisifiedReadFile = Promise.promisify(require('fs').readFile);
exports.readAll = (callback) => {
  return promisifiedReaddir(exports.dataDir)
    .then((files) => {
      var filesInDir = files.map((file) => {
        return promisifiedReadFile(path.join(exports.dataDir, file), 'utf8')
          .then((text) => {
            return {file, text};
          });
      });
      Promise.all(filesInDir)
        .then((values) => {
          // console.log('values', values);
          callback(null, values.map( (val) => {
            var id = val.file.substring(0, 5);
            var text = val.text;
            return {id: id, text: text};
          }));
        })
        .catch((err) => {
          console.log('error returning todo list', err);
        });
    })
    .catch((err) => {
      console.log('error reading files', err);
    });
};
///// OLD SOLUTION ////////////////////////////////////////////////////////
// fs.readdir(exports.dataDir, (err, contents) => {
//   if (err) {
//     throw ('error listing all files');
//   } else {
//     callback(null, contents.map((file) => {
//       return {id: file.substring(0, 5), text: file.substring(0, 5)};
//     }));
//   }
// });

exports.readOne = (id, callback) => {
  // var text = items[id];
  // if (!text) {
  //   callback(new Error(`No item with id: ${id}`));
  // } else {
  //   callback(null, { id, text });
  // }
  // console.log(id);
  fs.readFile(path.join(exports.dataDir, `${id}.txt`), 'utf8', (err, text) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`)); // ???
    } else {
      callback(null, {id: id, text: text});
    }
  });

};

exports.update = (id, text, callback) => {
  // var item = items[id];
  // if (!item) {
  //   callback(new Error(`No item with id: ${id}`));
  // } else {
  //   items[id] = text;
  //   callback(null, { id, text });
  // }
  this.readOne(id, (err, todo) => {
    if (todo) {
      fs.writeFile(path.join(exports.dataDir, `${id}.txt`), text, 'utf8', (err) => {
        callback(null, {id: id, text: text});
      });
    } else {
      callback(new Error(`No item with id: ${id}`));
    }
  });
};

exports.delete = (id, callback) => {
  // var item = items[id];
  // delete items[id];
  // if (!item) {
  //   // report an error if item not found
  //   callback(new Error(`No item with id: ${id}`));
  // } else {
  //   callback();
  // }

  fs.unlink(path.join(exports.dataDir, `${id}.txt`), (err) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback();
    }
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};

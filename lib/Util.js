"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Util = function () {
  function Util(model) {
    _classCallCheck(this, Util);

    this.model = model;
  }

  _createClass(Util, [{
    key: "getWhenDone",
    value: function getWhenDone() {
      for (var _len = arguments.length, items = Array(_len), _key = 0; _key < _len; _key++) {
        items[_key] = arguments[_key];
      }

      var that = this;

      return new Promise(function (resolve, reject) {
        that.model.syncAll(function (err, data) {
          if (err) {
            return console.log(err);
          }

          that.model.get().then(function (data) {
            if (data) {
              var keys = Object.keys(data);
              if (items.every(function (el) {
                return keys.indexOf(el) > -1;
              })) {
                resolve(data);
              }
            }
          });
        });
      });
    }
  }], [{
    key: "setModel",
    value: function setModel(model) {
      return new Util(model);
    }
  }]);

  return Util;
}();

exports.default = Util;
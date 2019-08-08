"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Storage", {
  enumerable: true,
  get: function get() {
    return _Storage["default"];
  }
});
Object.defineProperty(exports, "utils", {
  enumerable: true,
  get: function get() {
    return _Utils["default"];
  }
});
exports.defaultConfig = exports.createStorage = exports.storages = void 0;

var _Storage = _interopRequireDefault(require("./Storage.js"));

var _Utils = _interopRequireDefault(require("./Utils.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var storages = _Utils["default"].storages;
exports.storages = storages;
var createStorage = _Utils["default"].createStorage;
exports.createStorage = createStorage;
var defaultConfig = _Utils["default"].defaultConfig;
exports.defaultConfig = defaultConfig;
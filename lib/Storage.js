"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

require("babel-polyfill");

var _events = _interopRequireDefault(require("events"));

var _deepmerge = _interopRequireDefault(require("deepmerge"));

var _clone = _interopRequireDefault(require("clone"));

var _v = _interopRequireDefault(require("uuid/v4"));

var _CreateProp = _interopRequireDefault(require("./CreateProp"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var eventEmitter = new _events["default"]();
var eventsNamesStorage = {
  local: {},
  global: []
};

var Storage =
/*#__PURE__*/
function () {
  function Storage(config) {
    _classCallCheck(this, Storage);

    this._setup(config);
  }

  _createClass(Storage, [{
    key: "_setup",
    value: function _setup(config) {
      var _this = this;

      this._prepareVars(config);

      this._importStorage();

      this._defineProps();

      this._prepareMethods();

      this._prepareVirtualProps();

      this._prepareSchema().then(function () {
        if (_this.init) {
          _this.init();
        }
      });
    }
  }, {
    key: "createInstance",
    value: function createInstance() {
      return new Storage(this.config);
    }
  }, {
    key: "_importStorage",
    value: function _importStorage() {
      if (!this.config.storage) {
        throw new Error('You need to define a storage for this model. Learn how at https://github.com/sophiware/stagync#storage');
      }

      try {
        var ConfigStorage = this.config.storage;
        this.storage = new ConfigStorage(this);
      } catch (err) {
        throw new Error('An error occurred while trying to load storage', err);
      }
    }
  }, {
    key: "_prepareVars",
    value: function _prepareVars(config) {
      this.config = config;
      this.props = {};
      this.name = config.name;
      this.database = config.database;
      this.table = config.table;
      this.methods = config.methods || null;
      this.key = "@".concat(this.database, ":").concat(this.table || this.name);
      this.prefixNameEvent = "".concat(this.key, ":");
      this.schema = config.schema || null;
      this.uuid = (0, _v["default"])();
      eventsNamesStorage.local[this.uuid] = [];
      this.virtualProps = {};
      this._virtualProps = {};
      this.stillEmitter = config.still || false;
      this.propsTypes = {};

      if (config.methods.syncErrorHandler) {
        this.syncErrorHandler = config.methods.syncErrorHandler;
      } else if (config.syncErrorHandler !== undefined) {
        this.syncErrorHandler = config.syncErrorHandler;
      } else {
        this.syncErrorHandler = null;
      }
    }
  }, {
    key: "_prepareSchema",
    value: function () {
      var _prepareSchema2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee() {
        var key, prop;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (this.schema) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt("return", null);

              case 2:
                _context.t0 = regeneratorRuntime.keys(this.schema);

              case 3:
                if ((_context.t1 = _context.t0()).done) {
                  _context.next = 12;
                  break;
                }

                key = _context.t1.value;
                prop = this.schema[key];

                if ('type' in prop) {
                  this.propsTypes[key] = prop.type;
                }

                if (!('default' in prop)) {
                  _context.next = 10;
                  break;
                }

                _context.next = 10;
                return this.setIfEmpty(key, prop["default"]);

              case 10:
                _context.next = 3;
                break;

              case 12:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function _prepareSchema() {
        return _prepareSchema2.apply(this, arguments);
      }

      return _prepareSchema;
    }() // TODO: Criar for para props de setIfEmpty

  }, {
    key: "setIfEmpty",
    value: function () {
      var _setIfEmpty = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(key, prop) {
        var data, value;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.prev = 0;
                _context2.next = 3;
                return this.get(key);

              case 3:
                data = _context2.sent;

                if (!(data !== null)) {
                  _context2.next = 6;
                  break;
                }

                return _context2.abrupt("return", null);

              case 6:
                _context2.next = 11;
                break;

              case 8:
                _context2.prev = 8;
                _context2.t0 = _context2["catch"](0);
                return _context2.abrupt("return", _context2.t0);

              case 11:
                _context2.next = 13;
                return this.set(_defineProperty({}, key, prop));

              case 13:
                value = _context2.sent;
                return _context2.abrupt("return", value);

              case 15:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[0, 8]]);
      }));

      function setIfEmpty(_x, _x2) {
        return _setIfEmpty.apply(this, arguments);
      }

      return setIfEmpty;
    }()
    /**
     * _prepareVirtualProps
     * @description Prepara e atualizad os virual property
     */

  }, {
    key: "_prepareVirtualProps",
    value: function _prepareVirtualProps() {
      var _this2 = this;

      if (!this.schema) {
        return null;
      }

      var _loop = function _loop(key) {
        var prop = _this2.schema[key];

        if (typeof prop.get === 'function') {
          _this2._virtualProps[key] = prop;
          var instance = (0, _clone["default"])(_this2); // Substitui o this.get para evitar loop infinito

          instance.get = instance._virtualPropGet;
          instance.getVirtualProps = instance._virtualPropGetError;
          Object.defineProperty(_this2.virtualProps, key, {
            enumerable: true,
            get: prop.get.bind(instance)
          }); // Definindo sync para virtual props

          if (prop.listener) {
            _this2.syncMany(prop.listener,
            /*#__PURE__*/
            _asyncToGenerator(
            /*#__PURE__*/
            regeneratorRuntime.mark(function _callee3() {
              var data;
              return regeneratorRuntime.wrap(function _callee3$(_context3) {
                while (1) {
                  switch (_context3.prev = _context3.next) {
                    case 0:
                      _context3.next = 2;
                      return _this2.getVirtualProps(key);

                    case 2:
                      data = _context3.sent;

                      _this2.emit(_defineProperty({}, key, data));

                    case 4:
                    case "end":
                      return _context3.stop();
                  }
                }
              }, _callee3);
            })));
          }
        }
      };

      for (var key in this.schema) {
        _loop(key);
      }
    }
  }, {
    key: "_virtualPropGetError",
    value: function _virtualPropGetError(item) {
      throw new Error("Unable to get virtual properties from a virtual property: ".concat(item));
    }
  }, {
    key: "_virtualPropGet",
    value: function _virtualPropGet(item) {
      if (this.schema[item] && this.schema[item].get) {
        return this._virtualPropGetError(item);
      }

      return this.getStorageProps(item);
    }
  }, {
    key: "_prepareMethods",
    value: function _prepareMethods() {
      if (this.methods) {
        for (var key in this.methods) {
          if (!(key in this)) {
            this[key] = this.methods[key].bind(this);
          }
        }
      }
    }
  }, {
    key: "addEventStorage",
    value: function addEventStorage(name) {
      if (eventsNamesStorage.local[this.uuid].indexOf(name) === -1 && eventsNamesStorage.global.indexOf(name) === -1) {
        eventsNamesStorage.local[this.uuid].push(name);
        eventsNamesStorage.global.push(name);
        return true;
      }

      return false;
    }
  }, {
    key: "getEventName",
    value: function getEventName(prop) {
      var uuid = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var name = "".concat(this.prefixNameEvent).concat(prop);

      if (uuid) {
        name += ":".concat(this.uuid);
      }

      return name;
    }
  }, {
    key: "addEvent",
    value: function addEvent(name, listener) {
      var eventName = this.getEventName(name, true);
      this.addEventStorage(eventName);
      eventEmitter.addListener(eventName, listener);
    }
  }, {
    key: "getVirtualPropsListeners",
    value: function getVirtualPropsListeners(name) {
      if (this._virtualProps[name] && this._virtualProps[name].listener) {
        return this._virtualProps[name].listener;
      }

      return null;
    }
  }, {
    key: "getAllEventsNames",
    value: function getAllEventsNames(name) {
      var eventsNames = [];
      var prefix = this.getEventName(name, false);
      eventsNamesStorage.global.map(function (eventName) {
        if (eventName.indexOf(prefix) > -1) {
          eventsNames.push(eventName);
        }
      });
      return eventsNames;
    }
  }, {
    key: "emitEvent",
    value: function emitEvent(name) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var eventsNames = this.getAllEventsNames(name);
      eventsNames.map(function (eventName) {
        eventEmitter.emit.apply(eventEmitter, [eventName].concat(args));
      });
    }
    /**
     * sync
     * @description Sincrozina as propriedades, e executa o callback a cada atualização
     */

  }, {
    key: "sync",
    value: function sync(props) {
      var _this3 = this;

      var getStart = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      for (var key in props) {
        this.addEvent(key, props[key]);
      }

      if (getStart) {
        this.getStorageProps().then(function (data) {
          for (var _key2 in data) {
            if (_key2 in props) {
              if (!_this3.syncErrorHandler) {
                props[_key2](null, data[_key2]);
              } else {
                props[_key2](data[_key2]);
              }
            }
          }
        });
      }
    }
    /**
     * syncAll
     * @description Sincrozina todas as propriedades executanto um unico callback
     */

  }, {
    key: "syncAll",
    value: function syncAll(callback) {
      this.addEvent('all', callback);
    }
    /**
     * syncMany
     * @description sincroniza um array de objetos retonando em um callback único
     */

  }, {
    key: "syncMany",
    value: function syncMany(objs, callback) {
      var getStart = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var props = {};
      objs.map(function (key) {
        props[key] = function (err, val) {
          if (err) {
            return callback(err);
          }

          callback(null, _defineProperty({}, key, val));
        };
      });
      this.sync(props, getStart);
    }
    /**
     * emit
     * @description Quando sucesso: os emit's são passados em conjunto como objeto
     * @description Quando erro: os emit's são passados individualmente com o erro
     **/

  }, {
    key: "emit",
    value: function emit(props, err) {
      if (this.stillEmitter) {
        return null;
      }

      if (!this.syncErrorHandler) {
        this.emitEvent('all', err, props);
      } else if (!err) {
        this.emitEvent('all', props);
      }

      if (err && this.syncErrorHandler) {
        this.syncErrorHandler(err);
      } else if (err && !this.syncErrorHandler) {
        this.emitEvent(props, err);
      } else if (!err) {
        /**
         * Atualização de virtual props
         * Na atualização de qualquer dado, todas as vp são atualizadas para que
         * o this contenha os dados atuais do Storage
         */
        for (var key in props) {
          if (!this.syncErrorHandler) {
            this.emitEvent(key, null, props[key]);
          } else {
            this.emitEvent(key, props[key]);
          }
        }
      }
    }
  }, {
    key: "format",
    value: function () {
      var _format = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4(props) {
        var result, defaultError, key;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                result = {};
                defaultError = 'Data formatting error';
                _context4.t0 = regeneratorRuntime.keys(props);

              case 3:
                if ((_context4.t1 = _context4.t0()).done) {
                  _context4.next = 20;
                  break;
                }

                key = _context4.t1.value;

                if (!(this.schema && this.schema[key] && this.schema[key].format)) {
                  _context4.next = 17;
                  break;
                }

                _context4.prev = 6;
                _context4.next = 9;
                return this.schema[key].format(props[key]);

              case 9:
                result[key] = _context4.sent;
                return _context4.abrupt("continue", 3);

              case 13:
                _context4.prev = 13;
                _context4.t2 = _context4["catch"](6);
                this.emit(key, _context4.t2 || defaultError);
                return _context4.abrupt("continue", 3);

              case 17:
                result[key] = props[key];
                _context4.next = 3;
                break;

              case 20:
                return _context4.abrupt("return", result);

              case 21:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this, [[6, 13]]);
      }));

      function format(_x3) {
        return _format.apply(this, arguments);
      }

      return format;
    }()
  }, {
    key: "validation",
    value: function () {
      var _validation = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee5(props) {
        var result, defaultError, key, response;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                result = {};
                defaultError = 'Invalid data';
                _context5.t0 = regeneratorRuntime.keys(props);

              case 3:
                if ((_context5.t1 = _context5.t0()).done) {
                  _context5.next = 21;
                  break;
                }

                key = _context5.t1.value;

                if (!(this.schema && this.schema[key] && this.schema[key].validation)) {
                  _context5.next = 18;
                  break;
                }

                _context5.prev = 6;
                response = this.schema[key].validation(props[key]);

                if (!(typeof response === 'boolean' && response === false)) {
                  _context5.next = 10;
                  break;
                }

                throw new Error('Error validation.');

              case 10:
                _context5.next = 12;
                return this.schema[key].validation(props[key]);

              case 12:
                _context5.next = 18;
                break;

              case 14:
                _context5.prev = 14;
                _context5.t2 = _context5["catch"](6);
                this.emit(key, _context5.t2 || defaultError);
                return _context5.abrupt("continue", 3);

              case 18:
                result[key] = props[key];
                _context5.next = 3;
                break;

              case 21:
                return _context5.abrupt("return", result);

              case 22:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this, [[6, 14]]);
      }));

      function validation(_x4) {
        return _validation.apply(this, arguments);
      }

      return validation;
    }()
  }, {
    key: "_functionName",
    value: function _functionName(fun) {
      var ret = fun.toString();
      ret = ret.substr('function '.length);
      ret = ret.substr(0, ret.indexOf('('));
      return ret;
    }
  }, {
    key: "checkPropTypes",
    value: function checkPropTypes(props) {
      for (var key in props) {
        var type = _typeof(props[key]);

        var compare = this.propsTypes[key];

        if (compare === 'array') {
          if (!Array.isArray(props[key])) {
            throw new Error("The ".concat(key, " property should be a ").concat(compare, ", but it is ").concat(type));
          }

          continue;
        }

        if (type !== compare) {
          throw new Error("The ".concat(key, " property should be a ").concat(compare, ", but it is ").concat(type));
        }
      }

      return true;
    }
  }, {
    key: "_findInSchema",
    value: function _findInSchema(props) {
      for (var key in props) {
        if (!this.schema[key]) {
          throw new Error("The ".concat(key, " property does not exist without scheme"));
        }
      }

      return true;
    }
  }, {
    key: "_transform",
    value: function _transform(props) {
      if (!props) {
        return props;
      }

      var obj = {};
      Object.keys(props).map(function (key) {
        obj[key] = {
          _data: props[key]
        };
      });
      return obj;
    }
  }, {
    key: "_resolve",
    value: function _resolve(props) {
      if (!props) {
        return props;
      }

      var obj = {};
      Object.keys(props).map(function (key) {
        obj[key] = props[key]._data;
      });
      return obj;
    }
    /**
     * set
     * @description Modifica uma propriedade
     */

  }, {
    key: "set",
    value: function () {
      var _set = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee6(props) {
        var _this4 = this;

        var force,
            key,
            that,
            _args6 = arguments;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                force = _args6.length > 1 && _args6[1] !== undefined ? _args6[1] : false;

                if (!this.virtualProps) {
                  _context6.next = 9;
                  break;
                }

                _context6.t0 = regeneratorRuntime.keys(props);

              case 3:
                if ((_context6.t1 = _context6.t0()).done) {
                  _context6.next = 9;
                  break;
                }

                key = _context6.t1.value;

                if (!this.virtualProps[key]) {
                  _context6.next = 7;
                  break;
                }

                throw new Error("You can not modify a virtual property: ".concat(key));

              case 7:
                _context6.next = 3;
                break;

              case 9:
                if (force) {
                  _context6.next = 14;
                  break;
                }

                if (!(this._findInSchema(props) && this.propsTypes && this.checkPropTypes(props))) {
                  _context6.next = 14;
                  break;
                }

                _context6.next = 13;
                return this.validation(props);

              case 13:
                props = _context6.sent;

              case 14:
                if (props) {
                  _context6.next = 16;
                  break;
                }

                return _context6.abrupt("return", true);

              case 16:
                _context6.next = 18;
                return this.format(props);

              case 18:
                props = _context6.sent;
                props = this._transform(props);
                that = this;
                _context6.prev = 21;
                _context6.next = 24;
                return new Promise(function (resolve, reject) {
                  _this4.storage.setItem(that.key, props, function (err) {
                    props = that._resolve(props);

                    if (err) {
                      that.emit(props, err);
                      return reject(err);
                    }

                    that.emit(props);
                    resolve(true);
                  });
                });

              case 24:
                return _context6.abrupt("return", _context6.sent);

              case 27:
                _context6.prev = 27;
                _context6.t2 = _context6["catch"](21);
                throw _context6.t2.message;

              case 30:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this, [[21, 27]]);
      }));

      function set(_x5) {
        return _set.apply(this, arguments);
      }

      return set;
    }()
    /**
     * still
     * @description Força a não emissão do evento ao modificar uma propriedade
     */

  }, {
    key: "still",
    value: function still() {
      var that = this;
      that.stillEmitter = true;
      return that;
    }
    /**
     * clear
     * @description Limpa toda tabela
     */

  }, {
    key: "clear",
    value: function () {
      var _clear = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee7() {
        var exec;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return this.storage.removeItem(this.key);

              case 2:
                exec = _context7.sent;
                return _context7.abrupt("return", exec);

              case 4:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function clear() {
        return _clear.apply(this, arguments);
      }

      return clear;
    }()
    /**
     * remove
     * @description Remove uma propriedade
     */

  }, {
    key: "remove",
    value: function () {
      var _remove = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee8(prop) {
        var exec;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.next = 2;
                return this.set(_defineProperty({}, prop, null), true);

              case 2:
                exec = _context8.sent;
                return _context8.abrupt("return", exec);

              case 4:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function remove(_x6) {
        return _remove.apply(this, arguments);
      }

      return remove;
    }()
  }, {
    key: "getStorageProps",
    value: function getStorageProps() {
      var that = this;
      return new Promise(function (resolve, reject) {
        that.storage.getItem(that.key, function (err, value) {
          if (err) {
            return reject(err);
          }

          resolve(that._resolve(value));
        });
      });
    }
  }, {
    key: "getVirtualProps",
    value: function () {
      var _getVirtualProps = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee9(item) {
        var data, result, key, prop;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                if (!item) {
                  _context9.next = 5;
                  break;
                }

                _context9.next = 3;
                return this.virtualProps[item];

              case 3:
                data = _context9.sent;
                return _context9.abrupt("return", data);

              case 5:
                result = {};
                _context9.t0 = regeneratorRuntime.keys(this.virtualProps);

              case 7:
                if ((_context9.t1 = _context9.t0()).done) {
                  _context9.next = 15;
                  break;
                }

                key = _context9.t1.value;
                _context9.next = 11;
                return this.virtualProps[key];

              case 11:
                prop = _context9.sent;
                result[key] = prop;
                _context9.next = 7;
                break;

              case 15:
                return _context9.abrupt("return", result);

              case 16:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function getVirtualProps(_x7) {
        return _getVirtualProps.apply(this, arguments);
      }

      return getVirtualProps;
    }()
  }, {
    key: "getItem",
    value: function getItem(item) {
      return this.get(item);
    }
    /**
     * get
     * @description Pega as propriedadades
     */

  }, {
    key: "get",
    value: function () {
      var _get = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee10(item) {
        var _data, dataStorage, data, vProps;

        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                _context10.prev = 0;

                if (!item) {
                  _context10.next = 13;
                  break;
                }

                if (!(item in this.virtualProps)) {
                  _context10.next = 7;
                  break;
                }

                _context10.next = 5;
                return this.getVirtualProps(item);

              case 5:
                _data = _context10.sent;
                return _context10.abrupt("return", _data);

              case 7:
                _context10.next = 9;
                return this.getStorageProps();

              case 9:
                dataStorage = _context10.sent;

                if (!(dataStorage === null || dataStorage === undefined || !(item in dataStorage))) {
                  _context10.next = 12;
                  break;
                }

                return _context10.abrupt("return", null);

              case 12:
                return _context10.abrupt("return", dataStorage[item]);

              case 13:
                _context10.next = 15;
                return this.getStorageProps();

              case 15:
                data = _context10.sent;
                _context10.next = 18;
                return this.getVirtualProps();

              case 18:
                vProps = _context10.sent;
                return _context10.abrupt("return", (0, _deepmerge["default"])(data, vProps));

              case 22:
                _context10.prev = 22;
                _context10.t0 = _context10["catch"](0);
                throw _context10.t0.message;

              case 25:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this, [[0, 22]]);
      }));

      function get(_x8) {
        return _get.apply(this, arguments);
      }

      return get;
    }()
    /**
     * discontinue
     * @description Remove o sincronismo de uma propriedade
     */

  }, {
    key: "discontinue",
    value: function discontinue(name) {
      var eventName = this.getEventName(name, true);
      var index = eventsNamesStorage.local[this.uuid].indexOf(eventName);

      if (index > -1) {
        eventEmitter.removeAllListeners(eventName);
        this.removeByEventNameStorage(eventName);
      }

      return eventName;
    }
  }, {
    key: "restoreDefaultValues",
    value: function () {
      var _restoreDefaultValues = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee11() {
        var keys, i, key, prop;
        return regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                keys = Object.keys(this.schema);
                i = 0;

              case 2:
                if (!(i < keys.length)) {
                  _context11.next = 16;
                  break;
                }

                key = keys[i];
                prop = this.schema[key];

                if (!('default' in prop)) {
                  _context11.next = 10;
                  break;
                }

                _context11.next = 8;
                return this.set(_defineProperty({}, key, prop["default"]), true);

              case 8:
                _context11.next = 13;
                break;

              case 10:
                if ('get' in prop) {
                  _context11.next = 13;
                  break;
                }

                _context11.next = 13;
                return this.set(_defineProperty({}, key, null), true);

              case 13:
                i++;
                _context11.next = 2;
                break;

              case 16:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function restoreDefaultValues() {
        return _restoreDefaultValues.apply(this, arguments);
      }

      return restoreDefaultValues;
    }()
  }, {
    key: "removeByEventNameStorage",
    value: function removeByEventNameStorage(eventName) {
      var localIndex = eventsNamesStorage.local[this.uuid].indexOf(eventName);
      var globalIndex = eventsNamesStorage.global.indexOf(eventName);

      if (localIndex > -1) {
        eventsNamesStorage.local[this.uuid].splice(localIndex, 1);
      }

      if (globalIndex > -1) {
        eventsNamesStorage.global.splice(globalIndex, 1);
      }
    }
    /**
     * discontinueAll
     * @description Remove o sincronismo de todas as propriedades
     */

  }, {
    key: "discontinueAll",
    value: function discontinueAll() {
      var _this5 = this;

      var removed = [];

      var local = _toConsumableArray(eventsNamesStorage.local[this.uuid]);

      local.map(function (eventName) {
        eventEmitter.removeAllListeners(eventName);
        removed.push(eventName);

        _this5.removeByEventNameStorage(eventName);
      });
      return removed;
    }
  }, {
    key: "discontinueGlobalAll",
    value: function discontinueGlobalAll() {
      var _this6 = this;

      var removed = [];

      if (eventsNamesStorage.global.length > 0) {
        eventsNamesStorage.global.map(function (eventName) {
          eventEmitter.removeAllListeners(eventName);
          removed.push(eventName);

          _this6.removeByEventNameStorage(eventName, true);
        });
      }

      return removed;
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.discontinueAll();
      return this.clear();
    }
  }, {
    key: "_defineProps",
    value: function _defineProps() {
      for (var key in this.config.schema) {
        this.props[key] = new _CreateProp["default"](this, key);
      }
    }
  }]);

  return Storage;
}();

exports["default"] = Storage;
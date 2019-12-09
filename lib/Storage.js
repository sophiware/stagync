"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("babel-polyfill");

var _events = _interopRequireDefault(require("events"));

var _deepmerge = _interopRequireDefault(require("deepmerge"));

var _clone = _interopRequireDefault(require("clone"));

var _v = _interopRequireDefault(require("uuid/v4"));

var _CreateProp = _interopRequireDefault(require("./CreateProp"));

var _Memory = _interopRequireDefault(require("./Memory"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

var eventEmitter = new _events.default();
var eventsNamesStorage = {
  local: {},
  global: []
};

var Storage =
/*#__PURE__*/
function () {
  function Storage(config) {
    _classCallCheck(this, Storage);

    this.memory = new _Memory.default();
    this._rawConfig = config;

    this._setup(config);
  }

  _createClass(Storage, [{
    key: "_isReady",
    value: function _isReady() {
      var _this = this;

      if (!this.__ready) {
        return new Promise(function (resolve) {
          eventEmitter.on(_this._localEventReadName, function () {
            return resolve();
          });
        });
      }

      return Promise.resolve();
    }
  }, {
    key: "_setup",
    value: function _setup(config) {
      var _this2 = this;

      this._prepareVars(config);

      this._importDriver();

      this._defineProps();

      this._prepareMethods();

      this._prepareVirtualProps();

      this._prepareSchema();

      this._isReady().then(function () {
        if (_this2.init) {
          _this2.init();
        }

        if (_this2._init) {
          _this2._init();
        }
      });
    }
  }, {
    key: "createInstance",
    value: function createInstance() {
      return new Storage(this._rawConfig);
    }
  }, {
    key: "scope",
    value: function scope() {
      return this.createInstance();
    }
  }, {
    key: "useDrive",
    value: function useDrive(action) {
      var _this$driver;

      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      if (!this.driver) {
        var _this$memory;

        return (_this$memory = this.memory)[action].apply(_this$memory, args);
      }

      return (_this$driver = this.driver)[action].apply(_this$driver, args);
    }
  }, {
    key: "_importDriver",
    value: function _importDriver() {
      if (!this.config.driver) {
        this.driver = null;
        return null;
      }

      try {
        var Driver = this.config.driver;
        this.driver = new Driver(this);
      } catch (err) {
        throw new Error('An error occurred while trying to load storage', err);
      }
    }
  }, {
    key: "_prepareVars",
    value: function _prepareVars(config) {
      this.config = config;
      this.__ready = false;
      this.props = {};
      this.name = config.name;
      this.database = config.database;
      this.table = config.table;
      this.methods = config.methods || null;
      this.key = "@".concat(this.database, ":").concat(this.table || this.name);
      this.prefixNameEvent = "".concat(this.key, ":");
      this.schema = config.schema || null;
      this.uuid = (0, _v.default)();
      eventsNamesStorage.local[this.uuid] = [];
      this.virtualProps = {};
      this._virtualProps = {};
      this.stillEmitter = config.still || false;
      this.stillEmitterJustNow = false;
      this.propsTypes = {};
      this._localEventReadName = "local:".concat(this.uuid, ":isRead");

      if (config.methods && config.methods.syncErrorHandler) {
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
        var item, prop, _item, _prop;

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
                  _context.next = 11;
                  break;
                }

                item = _context.t1.value;
                prop = this.schema[item];

                if ('type' in prop) {
                  _context.next = 8;
                  break;
                }

                throw Error('No type in item.');

              case 8:
                this.propsTypes[item] = prop.type;
                _context.next = 3;
                break;

              case 11:
                _context.t2 = regeneratorRuntime.keys(this.schema);

              case 12:
                if ((_context.t3 = _context.t2()).done) {
                  _context.next = 22;
                  break;
                }

                _item = _context.t3.value;
                _prop = this.schema[_item];

                if (!('default' in _prop)) {
                  _context.next = 18;
                  break;
                }

                _context.next = 18;
                return this.setIfEmpty(_item, _prop.default);

              case 18:
                _context.next = 20;
                return this._syncLocalMemory(_item);

              case 20:
                _context.next = 12;
                break;

              case 22:
                this.__ready = true;
                eventEmitter.emit(this._localEventReadName);

              case 24:
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
    }()
  }, {
    key: "_syncLocalMemory",
    value: function () {
      var _syncLocalMemory2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(item) {
        var driveItem;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.getItemDrive(item);

              case 2:
                driveItem = _context2.sent;
                this.memory.setItem(this.key, _defineProperty({}, item, {
                  _data: driveItem
                }));

              case 4:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function _syncLocalMemory(_x) {
        return _syncLocalMemory2.apply(this, arguments);
      }

      return _syncLocalMemory;
    }()
  }, {
    key: "setIfEmpty",
    value: function () {
      var _setIfEmpty = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(key, prop) {
        var data;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.prev = 0;
                _context3.next = 3;
                return this.getItemDrive(key);

              case 3:
                data = _context3.sent;

                if (!(data !== null)) {
                  _context3.next = 6;
                  break;
                }

                return _context3.abrupt("return", null);

              case 6:
                _context3.next = 11;
                break;

              case 8:
                _context3.prev = 8;
                _context3.t0 = _context3["catch"](0);
                return _context3.abrupt("return", _context3.t0);

              case 11:
                _context3.next = 13;
                return this.setItemDrive(_defineProperty({}, key, prop));

              case 13:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this, [[0, 8]]);
      }));

      function setIfEmpty(_x2, _x3) {
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
      var _this3 = this;

      if (!this.schema) {
        return null;
      }

      var _loop = function _loop(key) {
        var prop = _this3.schema[key];

        if (typeof prop.get === 'function') {
          _this3._virtualProps[key] = prop;
          var instance = (0, _clone.default)(_this3); // Substitui o this.get para evitar loop infinito

          instance.get = instance._virtualPropGet;
          instance.getVirtualProps = instance._virtualPropGetError;
          Object.defineProperty(_this3.virtualProps, key, {
            enumerable: true,
            get: prop.get.bind(instance)
          }); // Definindo sync para virtual props

          if (prop.listener) {
            _this3.syncMany(prop.listener,
            /*#__PURE__*/
            _asyncToGenerator(
            /*#__PURE__*/
            regeneratorRuntime.mark(function _callee4() {
              var data;
              return regeneratorRuntime.wrap(function _callee4$(_context4) {
                while (1) {
                  switch (_context4.prev = _context4.next) {
                    case 0:
                      data = _this3.getVirtualProps(key);

                      _this3.emit(_defineProperty({}, key, data));

                    case 2:
                    case "end":
                      return _context4.stop();
                  }
                }
              }, _callee4);
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
      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
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
      var _this4 = this;

      var getStart = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      for (var key in props) {
        this.addEvent(key, props[key]);
      }

      if (getStart) {
        this._isReady().then(function () {
          var data = _this4.memory.getItem(_this4.key);

          for (var _key3 in data) {
            if (_key3 in props) {
              if (!_this4.syncErrorHandler) {
                props[_key3](null, data[_key3]);
              } else {
                props[_key3](data[_key3]);
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
  }, {
    key: "isStill",
    value: function isStill() {
      if (this.stillEmitter) {
        return true;
      }

      if (this.stillEmitterJustNow) {
        this.stillEmitterJustNow = false;
        return true;
      }

      return false;
    }
    /**
     * emit
     * @description Quando sucesso: os emit's são passados em conjunto como objeto
     * @description Quando erro: os emit's são passados individualmente com o erro
     **/

  }, {
    key: "emit",
    value: function emit(props, err) {
      if (this.isStill()) {
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
    value: function format(props) {
      var result = {};
      var defaultError = 'Data formatting error';

      for (var key in props) {
        if (this.schema && this.schema[key] && this.schema[key].format) {
          try {
            result[key] = this.schema[key].format(props[key]);
            continue;
          } catch (err) {
            this.emit(key, err || defaultError);
            continue;
          }
        }

        result[key] = props[key];
      }

      return result;
    }
  }, {
    key: "validation",
    value: function validation(props) {
      var result = {};
      var defaultError = 'Invalid data';

      for (var key in props) {
        if (this.schema && this.schema[key] && this.schema[key].validation) {
          try {
            var response = this.schema[key].validation(props[key]);

            if (typeof response === 'boolean' && response === false) {
              throw new Error('Error validation.');
            }

            this.schema[key].validation(props[key]);
          } catch (err) {
            this.emit(key, err || defaultError);
            continue;
          }
        }

        result[key] = props[key];
      }

      return result;
    }
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
  }, {
    key: "set",
    value: function set(props) {
      var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      return this.setItemDrive(props, force, true);
    }
    /**
     * set
     * @description Modifica uma propriedade
     */

  }, {
    key: "setItemDrive",
    value: function setItemDrive(props) {
      var _this5 = this;

      var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var awaitReady = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      if (this.virtualProps) {
        for (var key in props) {
          if (this.virtualProps[key]) {
            throw new Error("You can not modify a virtual property: ".concat(key));
          }
        }
      } // Força a execução sem a validação


      if (!force) {
        if (this._findInSchema(props) && this.propsTypes && this.checkPropTypes(props)) {
          props = this.validation(props);
        }
      }

      if (!props) {
        return true;
      } // Formata os valores caso a formação esteja configura no schema


      props = this.format(props);
      props = this._transform(props);
      this.memory.setItem(this.key, props);

      if (!this.driver) {
        if (awaitReady) {
          return new Promise(function (resolve) {
            _this5._isReady().then(function () {
              _this5.emit(_this5._resolve(props));

              resolve(true);
            });
          });
        }

        this.emit(this._resolve(props));
        return new Promise(function (resolve) {
          return resolve();
        });
      }

      try {
        return new Promise(
        /*#__PURE__*/
        function () {
          var _ref2 = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee5(resolve, reject) {
            return regeneratorRuntime.wrap(function _callee5$(_context5) {
              while (1) {
                switch (_context5.prev = _context5.next) {
                  case 0:
                    if (!awaitReady) {
                      _context5.next = 3;
                      break;
                    }

                    _context5.next = 3;
                    return _this5._isReady();

                  case 3:
                    _this5.useDrive('setItem', _this5.key, props, function (err) {
                      if (err) {
                        _this5.emit(null, err);

                        return reject(err);
                      }

                      _this5.emit(_this5._resolve(props));

                      resolve(true);
                    });

                  case 4:
                  case "end":
                    return _context5.stop();
                }
              }
            }, _callee5);
          }));

          return function (_x4, _x5) {
            return _ref2.apply(this, arguments);
          };
        }());
      } catch (err) {
        throw err.message;
      }
    }
    /**
     * still
     * @description Força a não emissão do evento ao modificar uma propriedade
     */

  }, {
    key: "still",
    value: function still() {
      this.stillEmitterJustNow = true;
      return this;
    }
    /**
     * clear
     * @description Limpa toda tabela
     */

  }, {
    key: "clear",
    value: function clear() {
      this.memory.removeItem(this.key);
      var exec = this.useDrive('removeItem', this.key);
      return exec;
    }
    /**
     * remove
     * @description Remove uma propriedade
     */

  }, {
    key: "remove",
    value: function () {
      var _remove = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee6(prop) {
        var exec;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                exec = this.setItemDrive(_defineProperty({}, prop, null), true);
                return _context6.abrupt("return", exec);

              case 2:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function remove(_x6) {
        return _remove.apply(this, arguments);
      }

      return remove;
    }()
  }, {
    key: "getStorageProps",
    value: function () {
      var _getStorageProps = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee7() {
        var that;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                that = this;
                return _context7.abrupt("return", new Promise(function (resolve, reject) {
                  that.useDrive('getItem', that.key, function (err, value) {
                    if (err) {
                      return reject(err);
                    }

                    resolve(that._resolve(value));
                  });
                }));

              case 2:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function getStorageProps() {
        return _getStorageProps.apply(this, arguments);
      }

      return getStorageProps;
    }()
  }, {
    key: "getVirtualProps",
    value: function () {
      var _getVirtualProps = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee8(item) {
        var data, result, key, prop;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                if (!item) {
                  _context8.next = 3;
                  break;
                }

                data = this.virtualProps[item];
                return _context8.abrupt("return", data);

              case 3:
                result = {};

                for (key in this.virtualProps) {
                  prop = this.virtualProps[key];
                  result[key] = prop;
                }

                return _context8.abrupt("return", result);

              case 6:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function getVirtualProps(_x7) {
        return _getVirtualProps.apply(this, arguments);
      }

      return getVirtualProps;
    }()
    /**
     * get
     * @description Pega as propriedadades
     */

  }, {
    key: "get",
    value: function get(item) {
      var memory = this.memory.getItem(this.key);

      if (!memory) {
        return null;
      }

      return this._resolve(memory)[item] || null;
    }
  }, {
    key: "getItemDrive",
    value: function () {
      var _getItemDrive = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee9(item) {
        var awaitReady,
            _data,
            dataStorage,
            data,
            vProps,
            _args9 = arguments;

        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                awaitReady = _args9.length > 1 && _args9[1] !== undefined ? _args9[1] : false;
                _context9.prev = 1;

                if (!awaitReady) {
                  _context9.next = 5;
                  break;
                }

                _context9.next = 5;
                return this._isReady();

              case 5:
                if (!item) {
                  _context9.next = 17;
                  break;
                }

                if (!(item in this.virtualProps)) {
                  _context9.next = 11;
                  break;
                }

                _context9.next = 9;
                return this.getVirtualProps(item);

              case 9:
                _data = _context9.sent;
                return _context9.abrupt("return", _data);

              case 11:
                _context9.next = 13;
                return this.getStorageProps();

              case 13:
                dataStorage = _context9.sent;

                if (!(dataStorage === null || dataStorage === undefined || !(item in dataStorage))) {
                  _context9.next = 16;
                  break;
                }

                return _context9.abrupt("return", null);

              case 16:
                return _context9.abrupt("return", dataStorage[item]);

              case 17:
                _context9.next = 19;
                return this.getStorageProps();

              case 19:
                data = _context9.sent;
                _context9.next = 22;
                return this.getVirtualProps();

              case 22:
                vProps = _context9.sent;
                return _context9.abrupt("return", (0, _deepmerge.default)(data, vProps));

              case 26:
                _context9.prev = 26;
                _context9.t0 = _context9["catch"](1);
                throw _context9.t0.message;

              case 29:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this, [[1, 26]]);
      }));

      function getItemDrive(_x8) {
        return _getItemDrive.apply(this, arguments);
      }

      return getItemDrive;
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
    value: function restoreDefaultValues() {
      var keys = Object.keys(this.schema);

      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var prop = this.schema[key];

        if ('default' in prop) {
          this.setItemDrive(_defineProperty({}, key, prop.default), true);
        } else if (!('get' in prop)) {
          this.setItemDrive(_defineProperty({}, key, null), true);
        }
      }
    }
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
      var _this6 = this;

      var removed = [];

      var local = _toConsumableArray(eventsNamesStorage.local[this.uuid]);

      local.map(function (eventName) {
        eventEmitter.removeAllListeners(eventName);
        removed.push(eventName);

        _this6.removeByEventNameStorage(eventName);
      });
      return removed;
    }
  }, {
    key: "discontinueGlobalAll",
    value: function discontinueGlobalAll() {
      var _this7 = this;

      var removed = [];

      var global = _toConsumableArray(eventsNamesStorage.global);

      global.map(function (eventName) {
        eventEmitter.removeAllListeners(eventName);
        removed.push(eventName);

        _this7.removeByEventNameStorage(eventName);
      });
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
        this.props[key] = new _CreateProp.default(this, key);
      }
    }
  }]);

  return Storage;
}();

exports.default = Storage;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('babel-polyfill');

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _deepmerge = require('deepmerge');

var _deepmerge2 = _interopRequireDefault(_deepmerge);

var _clone = require('clone');

var _clone2 = _interopRequireDefault(_clone);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var eventEmitter = new _events2.default();

var Model = function () {
  function Model(config) {
    _classCallCheck(this, Model);

    this._prepareVars(config);
    this._importStorage();
    this._prepareMethods();
    this._prepareVirtualProps();
    this._prepareSchema();

    // Caso tenha definido init em methods
    if (this.init) {
      this.init();
    }
  }

  _createClass(Model, [{
    key: '_importStorage',
    value: function _importStorage() {
      if (!this.config.storage) {
        throw new Error('You need to define a storage for this model. Learn how at https://github.com/sophiware/stagync#storage');
      }

      try {
        this.storage = new this.config.storage(this);
      } catch (err) {
        throw new Error('An error occurred while trying to load storage', err);
      }
    }
  }, {
    key: '_prepareVars',
    value: function _prepareVars(config) {
      this.config = config;
      this.database = config.database;
      this.table = config.table;
      this.methods = config.methods || null;
      this.key = '@' + this.database + ':' + this.table;
      this.prefixNameEvent = this.key + ':';
      this.schema = config.schema || null;
      this.type = config.type || null;
      this.eventsNames = [];
      this.virtualProps = {};
      this.stillEmitter = config.still || false;
      this.propsTypes = {};
    }
  }, {
    key: '_prepareSchema',
    value: function _prepareSchema() {
      var emitter = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      if (!this.schema) {
        return null;
      }

      for (var key in this.schema) {
        var prop = this.schema[key];

        if ('type' in prop) {
          this.propsTypes[key] = prop.type;
        }

        if ('default' in prop) {
          this.setIfEmpty(key, prop.default);
        }
      }
    }

    // TODO: Criar for para props de setIfEmpty

  }, {
    key: 'setIfEmpty',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(key, prop) {
        var data;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                _context.next = 3;
                return this.get(key);

              case 3:
                data = _context.sent;

                if (!(data !== null)) {
                  _context.next = 6;
                  break;
                }

                return _context.abrupt('return', null);

              case 6:
                _context.next = 11;
                break;

              case 8:
                _context.prev = 8;
                _context.t0 = _context['catch'](0);
                return _context.abrupt('return', _context.t0);

              case 11:

                this.set(_defineProperty({}, key, prop));

              case 12:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[0, 8]]);
      }));

      function setIfEmpty(_x2, _x3) {
        return _ref.apply(this, arguments);
      }

      return setIfEmpty;
    }()

    /**
     * _prepareVirtualProps
     * @description Prepara e atualizad os virual property
     */

  }, {
    key: '_prepareVirtualProps',
    value: function _prepareVirtualProps() {
      var _this = this;

      if (!this.schema) {
        return null;
      }

      var _loop = function _loop(key) {
        var prop = _this.schema[key];

        if (typeof prop.get === 'function') {
          var instance = (0, _clone2.default)(_this);

          // Substitui o this.get para evitar loop infinito
          instance.get = instance._virtualPropGet;
          instance.getVirtualProps = instance._virtualPropGetError;

          Object.defineProperty(_this.virtualProps, key, {
            enumerable: true,
            get: prop.get.bind(instance)
          });

          // Definindo sync para virtual props
          if (prop.listener) {
            _this.syncMany(prop.listener, _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
              var data;
              return regeneratorRuntime.wrap(function _callee2$(_context2) {
                while (1) {
                  switch (_context2.prev = _context2.next) {
                    case 0:
                      _context2.next = 2;
                      return _this.getVirtualProps(key);

                    case 2:
                      data = _context2.sent;

                      _this.emit(_defineProperty({}, key, data));

                    case 4:
                    case 'end':
                      return _context2.stop();
                  }
                }
              }, _callee2, _this);
            })));
          }
        }
      };

      for (var key in this.schema) {
        _loop(key);
      }
    }
  }, {
    key: '_virtualPropGetError',
    value: function _virtualPropGetError(item) {
      throw new Error('Unable to get virtual properties from a virtual property: ' + item);
    }
  }, {
    key: '_virtualPropGet',
    value: function _virtualPropGet(item) {
      if (this.schema[item] && this.schema[item].get) {
        return this._virtualPropGetError(item);
      }

      return this.getStorageProps(item);
    }
  }, {
    key: '_prepareMethods',
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
    key: 'addEventName',
    value: function addEventName(name) {
      if (this.eventsNames.indexOf(name) === -1) {
        this.eventsNames.push(name);
      }
    }
  }, {
    key: 'getPrefixName',
    value: function getPrefixName(prop, prefix) {
      var name = prefix ? '' + prefix + prop + ':' + this.type : '' + this.prefixNameEvent + prop + ':' + this.type;
      this.addEventName(name);
      return name;
    }

    /**
     * sync
     * @description Sincrozina as propriedades, e executa o callback a cada atualização
     */

  }, {
    key: 'sync',
    value: function sync(props) {
      var getStart = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      for (var key in props) {
        eventEmitter.addListener(this.getPrefixName(key), props[key]);
      }

      if (getStart) {
        this.getStorageProps().then(function (data) {
          for (var _key in data) {
            if (_key in props) {
              props[_key](null, data[_key]);
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
    key: 'syncAll',
    value: function syncAll(callback) {
      eventEmitter.addListener(this.getPrefixName('all'), callback);
    }

    /**
     * syncMany
     * @description sincroniza um array de objetos retonando em um callback único
     */

  }, {
    key: 'syncMany',
    value: function syncMany(objs, callback) {
      var props = {};

      objs.map(function (key) {
        props[key] = function (err, val) {
          if (err) {
            return callback(err);
          }

          callback(null, _defineProperty({}, key, val));
        };
      });

      this.sync(props);
    }

    /**
     * emit
     * @description Quando sucesso: os emit's são passados em conjunto como objeto
     * @description Quando erro: os emit's são passados individualmente com o erro
     **/

  }, {
    key: 'emit',
    value: function emit(props, err) {
      if (this.stillEmitter) {
        return null;
      }

      eventEmitter.emit(this.getPrefixName('all'), err, props);

      if (err) {
        eventEmitter.emit(this.getPrefixName(props), err);
      } else {
        /**
         * Atualização de virtual props
         * Na atualização de qualquer dado, todas as vp são atualizadas para que
         * o this contenha os dados atuais do Model
         */
        for (var key in props) {
          eventEmitter.emit(this.getPrefixName(key), null, props[key]);
        }
      }
    }
  }, {
    key: 'format',
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(props) {
        var result, defaultError, key;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                result = {};
                defaultError = 'Data formatting error';
                _context3.t0 = regeneratorRuntime.keys(props);

              case 3:
                if ((_context3.t1 = _context3.t0()).done) {
                  _context3.next = 20;
                  break;
                }

                key = _context3.t1.value;

                if (!(this.schema && this.schema[key] && this.schema[key].format)) {
                  _context3.next = 17;
                  break;
                }

                _context3.prev = 6;
                _context3.next = 9;
                return this.schema[key].format(props[key]);

              case 9:
                result[key] = _context3.sent;
                return _context3.abrupt('continue', 3);

              case 13:
                _context3.prev = 13;
                _context3.t2 = _context3['catch'](6);

                this.emit(key, _context3.t2 || defaultError);
                return _context3.abrupt('continue', 3);

              case 17:

                result[key] = props[key];
                _context3.next = 3;
                break;

              case 20:
                return _context3.abrupt('return', result);

              case 21:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this, [[6, 13]]);
      }));

      function format(_x5) {
        return _ref3.apply(this, arguments);
      }

      return format;
    }()
  }, {
    key: 'validation',
    value: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(props) {
        var result, defaultError, key;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                result = {};
                defaultError = 'Invalid data';
                _context4.t0 = regeneratorRuntime.keys(props);

              case 3:
                if ((_context4.t1 = _context4.t0()).done) {
                  _context4.next = 18;
                  break;
                }

                key = _context4.t1.value;

                if (!(this.schema && this.schema[key] && this.schema[key].validation)) {
                  _context4.next = 15;
                  break;
                }

                _context4.prev = 6;
                _context4.next = 9;
                return this.schema[key].validation(props[key]);

              case 9:
                _context4.next = 15;
                break;

              case 11:
                _context4.prev = 11;
                _context4.t2 = _context4['catch'](6);

                this.emit(key, _context4.t2 || defaultError);
                return _context4.abrupt('continue', 3);

              case 15:

                result[key] = props[key];
                _context4.next = 3;
                break;

              case 18:
                return _context4.abrupt('return', result);

              case 19:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this, [[6, 11]]);
      }));

      function validation(_x6) {
        return _ref4.apply(this, arguments);
      }

      return validation;
    }()

    /**
     * merge
     * @description Mescla novos dados com os dados já salvos
     */

  }, {
    key: 'merge',
    value: function () {
      var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(props) {
        var _this2 = this;

        var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var key, that;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                if (!this.virtualProps) {
                  _context5.next = 8;
                  break;
                }

                _context5.t0 = regeneratorRuntime.keys(props);

              case 2:
                if ((_context5.t1 = _context5.t0()).done) {
                  _context5.next = 8;
                  break;
                }

                key = _context5.t1.value;

                if (!this.virtualProps[key]) {
                  _context5.next = 6;
                  break;
                }

                throw new Error('You can not modify a virtual property: ' + key);

              case 6:
                _context5.next = 2;
                break;

              case 8:
                if (force) {
                  _context5.next = 13;
                  break;
                }

                if (!(this._findInSchema(props) && this.propsTypes && this.checkPropTypes(props))) {
                  _context5.next = 13;
                  break;
                }

                _context5.next = 12;
                return this.validation(props);

              case 12:
                props = _context5.sent;

              case 13:
                if (props) {
                  _context5.next = 15;
                  break;
                }

                return _context5.abrupt('return', true);

              case 15:
                _context5.next = 17;
                return this.format(props);

              case 17:
                props = _context5.sent;
                that = this;
                _context5.prev = 19;
                _context5.next = 22;
                return new Promise(function (resolve, reject) {
                  _this2.storage.mergeItem(that.key, props, function (err) {
                    if (err) {
                      that.emit(props, err);
                      return reject(err);
                    }

                    that.emit(props);
                    resolve(true);
                  });
                });

              case 22:
                return _context5.abrupt('return', _context5.sent);

              case 25:
                _context5.prev = 25;
                _context5.t2 = _context5['catch'](19);
                throw _context5.t2.message;

              case 28:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this, [[19, 25]]);
      }));

      function merge(_x8) {
        return _ref5.apply(this, arguments);
      }

      return merge;
    }()
  }, {
    key: '_functionName',
    value: function _functionName(fun) {
      var ret = fun.toString();
      ret = ret.substr('function '.length);
      ret = ret.substr(0, ret.indexOf('('));
      return ret;
    }
  }, {
    key: 'checkPropTypes',
    value: function checkPropTypes(props) {
      for (var key in props) {
        var type = _typeof(props[key]);
        var compare = this.propsTypes[key];

        if (compare === 'array') {
          if (!Array.isArray(props[key])) {
            throw new Error('The ' + key + ' property should be a ' + compare + ', but it is ' + type);
          }

          continue;
        }

        if (type !== compare) {
          throw new Error('The ' + key + ' property should be a ' + compare + ', but it is ' + type);
        }
      }

      return true;
    }
  }, {
    key: '_findInSchema',
    value: function _findInSchema(props) {
      for (var key in props) {
        if (!this.schema[key]) {
          throw new Error('The ' + key + ' property does not exist without scheme');
        }
      }

      return true;
    }

    /**
     * set
     * @description Modifica uma propriedade
     */

  }, {
    key: 'set',
    value: function () {
      var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(props) {
        var _this3 = this;

        var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var key, that;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                if (!this.virtualProps) {
                  _context6.next = 8;
                  break;
                }

                _context6.t0 = regeneratorRuntime.keys(props);

              case 2:
                if ((_context6.t1 = _context6.t0()).done) {
                  _context6.next = 8;
                  break;
                }

                key = _context6.t1.value;

                if (!this.virtualProps[key]) {
                  _context6.next = 6;
                  break;
                }

                throw new Error('You can not modify a virtual property: ' + key);

              case 6:
                _context6.next = 2;
                break;

              case 8:
                if (force) {
                  _context6.next = 13;
                  break;
                }

                if (!(this._findInSchema(props) && this.propsTypes && this.checkPropTypes(props))) {
                  _context6.next = 13;
                  break;
                }

                _context6.next = 12;
                return this.validation(props);

              case 12:
                props = _context6.sent;

              case 13:
                if (props) {
                  _context6.next = 15;
                  break;
                }

                return _context6.abrupt('return', true);

              case 15:
                _context6.next = 17;
                return this.format(props);

              case 17:
                props = _context6.sent;
                that = this;
                _context6.prev = 19;
                _context6.next = 22;
                return new Promise(function (resolve, reject) {
                  _this3.storage.setItem(that.key, props, function (err) {
                    if (err) {
                      that.emit(props, err);
                      return reject(err);
                    }

                    that.emit(props);
                    resolve(true);
                  });
                });

              case 22:
                return _context6.abrupt('return', _context6.sent);

              case 25:
                _context6.prev = 25;
                _context6.t2 = _context6['catch'](19);
                throw _context6.t2.message;

              case 28:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this, [[19, 25]]);
      }));

      function set(_x10) {
        return _ref6.apply(this, arguments);
      }

      return set;
    }()

    /**
     * still
     * @description Força a não emissão do evento ao modificar uma propriedade
     */

  }, {
    key: 'still',
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
    key: 'clear',
    value: function () {
      var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
        var exec;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return this.storage.removeItem(this.key);

              case 2:
                exec = _context7.sent;
                return _context7.abrupt('return', exec);

              case 4:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function clear() {
        return _ref7.apply(this, arguments);
      }

      return clear;
    }()

    /**
     * remove
     * @description Remove uma propriedade
     */

  }, {
    key: 'remove',
    value: function () {
      var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(prop) {
        var exec;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.next = 2;
                return this.set(_defineProperty({}, prop, null), true);

              case 2:
                exec = _context8.sent;
                return _context8.abrupt('return', exec);

              case 4:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function remove(_x11) {
        return _ref8.apply(this, arguments);
      }

      return remove;
    }()
  }, {
    key: 'getStorageProps',
    value: function getStorageProps() {
      var that = this;

      return new Promise(function (resolve, reject) {
        that.storage.getItem(that.key, function (err, value) {
          if (err) {
            return reject(err);
          }

          resolve(value);
        });
      });
    }
  }, {
    key: 'getVirtualProps',
    value: function () {
      var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(item) {
        var data, result, key, _prop;

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
                return _context9.abrupt('return', data);

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
                _prop = _context9.sent;

                result[key] = _prop;
                _context9.next = 7;
                break;

              case 15:
                return _context9.abrupt('return', result);

              case 16:
              case 'end':
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function getVirtualProps(_x12) {
        return _ref9.apply(this, arguments);
      }

      return getVirtualProps;
    }()

    /**
     * get
     * @description Pega as propriedadades
     */

  }, {
    key: 'get',
    value: function () {
      var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(item) {
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
                return _context10.abrupt('return', _data);

              case 7:
                _context10.next = 9;
                return this.getStorageProps();

              case 9:
                dataStorage = _context10.sent;

                if (!(dataStorage === null || typeof dataStorage[item] === 'undefined')) {
                  _context10.next = 12;
                  break;
                }

                return _context10.abrupt('return', null);

              case 12:
                return _context10.abrupt('return', dataStorage[item]);

              case 13:
                _context10.next = 15;
                return this.getStorageProps();

              case 15:
                data = _context10.sent;
                _context10.next = 18;
                return this.getVirtualProps();

              case 18:
                vProps = _context10.sent;
                return _context10.abrupt('return', (0, _deepmerge2.default)(data, vProps));

              case 22:
                _context10.prev = 22;
                _context10.t0 = _context10['catch'](0);
                throw _context10.t0.message;

              case 25:
              case 'end':
                return _context10.stop();
            }
          }
        }, _callee10, this, [[0, 22]]);
      }));

      function get(_x13) {
        return _ref10.apply(this, arguments);
      }

      return get;
    }()

    /**
     * discontinue
     * @description Remove o sincronismo de uma propriedade
     */

  }, {
    key: 'discontinue',
    value: function discontinue(name) {
      var index = this.eventsNames.indexOf(name);
      if (index > -1) {
        eventEmitter.removeListener(this.eventsNames.length[index]);
      }
    }

    /**
     * discontinueAll
     * @description Remove o sincronismo de todas as propriedades
     */

  }, {
    key: 'discontinueAll',
    value: function discontinueAll() {
      if (this.eventsNames.length > 0) {
        for (var key in this.eventsNames.length) {
          eventEmitter.removeListener(this.eventsNames.length[key]);
        }
      }
    }
  }, {
    key: 'destroy',
    value: function destroy(callback) {
      this.discontinueAll();
      return this.clear();
    }
  }]);

  return Model;
}();

exports.default = Model;
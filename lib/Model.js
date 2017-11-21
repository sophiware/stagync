'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('babel-polyfill');

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _deepmerge = require('deepmerge');

var _deepmerge2 = _interopRequireDefault(_deepmerge);

var _clone = require('clone');

var _clone2 = _interopRequireDefault(_clone);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var eventEmitter = new _events2.default();

var Model = function () {
  function Model(config) {
    _classCallCheck(this, Model);

    this._prepareVars(config);
    this._importStorage();
    this._prepareMethods();
    this._prepareVirtualProps();
    this._prepareDefaultValues();

    // Caso tenha definido init em methods
    if (this.init) {
      this.init();
    }
  }

  _createClass(Model, [{
    key: '_importStorage',
    value: function _importStorage() {
      this.storage = require('stagync-storage-' + this.type);

      if (this.storage.default) {
        this.storage = this.storage.default;
      }
    }
  }, {
    key: '_prepareVars',
    value: function _prepareVars(config) {
      this.tagName = config.tagName || '';
      this.config = config;
      this.database = config.database;
      this.table = config.table;
      this.methods = config.methods || null;
      this.key = '@' + this.database + ':' + this.table;
      this.prefixNameEvent = this.key + ':';
      this.schema = config.schema || null;
      this.type = config.type || 'memory';
      this.eventsNames = [];
      this.virtualProps = {};
      this.stillEmitter = config.still || false;
      this.currentVirtualProp = null;
    }
  }, {
    key: '_prepareDefaultValues',
    value: function _prepareDefaultValues() {
      var emitter = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      if (!this.schema) {
        return null;
      }

      for (var key in this.schema) {
        var prop = this.schema[key];

        if ('default' in prop) {
          this.set(_defineProperty({}, key, prop.default), false, emitter);
        }
      }
    }

    /**
     * Prepara e atualizad os virual property
     */

  }, {
    key: '_prepareVirtualProps',
    value: function _prepareVirtualProps() {
      if (!this.schema) {
        return null;
      }

      for (var key in this.schema) {
        var prop = this.schema[key];

        // Substitui o this.get para evitar loop infinito
        // console.log(instance)

        if (typeof prop.get === 'function') {
          var instance = (0, _clone2.default)(this);
          instance.get = instance._virtualPropGet;
          instance.getVirtualProps = instance._virtualPropGetError;

          Object.defineProperty(this.virtualProps, key, {
            enumerable: true,
            get: prop.get.bind(instance)
          });
        }
      }
    }
  }, {
    key: '_virtualPropGetError',
    value: function _virtualPropGetError(item) {
      throw new Error('Unable to get virtual properties from a virtual property');
    }
  }, {
    key: '_virtualPropGet',
    value: function _virtualPropGet(item) {
      if (this.schema[item] && this.schema[item].get) {
        return this._virtualPropGetError();
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
    key: '_setCurrentVirtualProp',
    value: function _setCurrentVirtualProp(prop) {
      this.currentVirtualProp = prop;
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
     * Sincrozina as propriedades, e executa o callback a cada atualização
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
      * @description incroniza um alista de objectos retonando em um callback único
    */

  }, {
    key: 'syncMany',
    value: function syncMany(obj, callback) {
      var props = {};

      var _loop = function _loop(key) {
        props[key] = function (err, val) {
          if (err) {
            return callback(err);
          }

          callback(null, _defineProperty({}, key, val));
        };
      };

      for (var key in obj) {
        _loop(key);
      }

      this.sync(props);
    }

    /**
     * Quando sucesso: os emit's são passados em conjunto como objeto
     * Quando erro: os emit's são passados individualmente com o erro
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
    key: 'setItemOrMergeItem',
    value: function setItemOrMergeItem(result) {
      return result ? this.storage.mergeItem : this.storage.setItem;
    }
  }, {
    key: 'format',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(props) {
        var result, defaultError, key;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                result = {};
                defaultError = 'Data formatting error';
                _context.t0 = regeneratorRuntime.keys(props);

              case 3:
                if ((_context.t1 = _context.t0()).done) {
                  _context.next = 20;
                  break;
                }

                key = _context.t1.value;

                if (!(this.schema && this.schema[key] && this.schema[key].format)) {
                  _context.next = 17;
                  break;
                }

                _context.prev = 6;
                _context.next = 9;
                return this.schema[key].format(props[key]);

              case 9:
                result[key] = _context.sent;
                return _context.abrupt('continue', 3);

              case 13:
                _context.prev = 13;
                _context.t2 = _context['catch'](6);

                this.emit(key, _context.t2 || defaultError);
                return _context.abrupt('continue', 3);

              case 17:

                result[key] = props[key];
                _context.next = 3;
                break;

              case 20:
                return _context.abrupt('return', result);

              case 21:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[6, 13]]);
      }));

      function format(_x3) {
        return _ref.apply(this, arguments);
      }

      return format;
    }()
  }, {
    key: 'validation',
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(props) {
        var result, defaultError, key;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                result = {};
                defaultError = 'Invalid data';
                _context2.t0 = regeneratorRuntime.keys(props);

              case 3:
                if ((_context2.t1 = _context2.t0()).done) {
                  _context2.next = 18;
                  break;
                }

                key = _context2.t1.value;

                if (!(this.schema && this.schema[key] && this.schema[key].validation)) {
                  _context2.next = 15;
                  break;
                }

                _context2.prev = 6;
                _context2.next = 9;
                return this.schema[key].validation(props[key]);

              case 9:
                _context2.next = 15;
                break;

              case 11:
                _context2.prev = 11;
                _context2.t2 = _context2['catch'](6);

                this.emit(key, _context2.t2 || defaultError);
                return _context2.abrupt('continue', 3);

              case 15:

                result[key] = props[key];
                _context2.next = 3;
                break;

              case 18:
                return _context2.abrupt('return', result);

              case 19:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this, [[6, 11]]);
      }));

      function validation(_x4) {
        return _ref2.apply(this, arguments);
      }

      return validation;
    }()

    /**
     * Mescla novos dados com os dados já salvos
     */

  }, {
    key: 'merge',
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(props) {
        var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var current, data;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.getStorageProps();

              case 2:
                current = _context3.sent;
                data = (0, _deepmerge2.default)(current || {}, props);
                return _context3.abrupt('return', this.set(data, force));

              case 5:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function merge(_x6) {
        return _ref3.apply(this, arguments);
      }

      return merge;
    }()

    /**
     * Modifica uma propriedade
     */

  }, {
    key: 'set',
    value: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(props) {
        var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var key, that;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (!this.virtualProps) {
                  _context4.next = 8;
                  break;
                }

                _context4.t0 = regeneratorRuntime.keys(props);

              case 2:
                if ((_context4.t1 = _context4.t0()).done) {
                  _context4.next = 8;
                  break;
                }

                key = _context4.t1.value;

                if (!this.virtualProps[key]) {
                  _context4.next = 6;
                  break;
                }

                return _context4.abrupt('return', Promise.reject(new Error('You can not modify a virtual property: ' + key)));

              case 6:
                _context4.next = 2;
                break;

              case 8:
                if (force) {
                  _context4.next = 12;
                  break;
                }

                _context4.next = 11;
                return this.validation(props);

              case 11:
                props = _context4.sent;

              case 12:
                if (props) {
                  _context4.next = 14;
                  break;
                }

                return _context4.abrupt('return', true);

              case 14:
                _context4.next = 16;
                return this.format(props);

              case 16:
                props = _context4.sent;
                that = this;
                _context4.prev = 18;
                _context4.next = 21;
                return new Promise(function (resolve, reject) {
                  that.getStorageProps().then(function (result) {
                    that.setItemOrMergeItem(result)(that.key, JSON.stringify(props), function (err) {
                      if (err) {
                        that.emit(props, err);
                        return reject(err);
                      }

                      that.emit(props);
                      resolve(true);
                    });
                  }, function (err) {
                    that.emit(props, err);
                    reject(err);
                  });
                });

              case 21:
                return _context4.abrupt('return', _context4.sent);

              case 24:
                _context4.prev = 24;
                _context4.t2 = _context4['catch'](18);
                throw _context4.t2.message;

              case 27:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this, [[18, 24]]);
      }));

      function set(_x8) {
        return _ref4.apply(this, arguments);
      }

      return set;
    }()

    /**
     * Força a não emissão do evento ao modificar uma propriedade
     */

  }, {
    key: 'still',
    value: function still() {
      var that = this;
      that.stillEmitter = true;
      return that;
    }

    /**
     * Limpa toda tabela
     */

  }, {
    key: 'clear',
    value: function () {
      var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(emitter) {
        var exec;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return this.storage.removeItem(this.key);

              case 2:
                exec = _context5.sent;

                this._prepareDefaultValues(emitter);
                return _context5.abrupt('return', exec);

              case 5:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function clear(_x9) {
        return _ref5.apply(this, arguments);
      }

      return clear;
    }()

    /**
     * Remove uma propriedade
     */

  }, {
    key: 'remove',
    value: function () {
      var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(prop) {
        var exec;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return this.set(_defineProperty({}, prop, null), true);

              case 2:
                exec = _context6.sent;
                return _context6.abrupt('return', exec);

              case 4:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function remove(_x10) {
        return _ref6.apply(this, arguments);
      }

      return remove;
    }()
  }, {
    key: 'getStorageProps',
    value: function getStorageProps() {
      var _this = this;

      var that = this;

      return new Promise(function (resolve, reject) {
        that.storage.getItem(that.key, function () {
          var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(err, value) {
            return regeneratorRuntime.wrap(function _callee7$(_context7) {
              while (1) {
                switch (_context7.prev = _context7.next) {
                  case 0:
                    if (!err) {
                      _context7.next = 2;
                      break;
                    }

                    return _context7.abrupt('return', reject(err));

                  case 2:

                    if (typeof value === 'string') {
                      value = JSON.parse(value);
                    } else if (!value) {
                      value = {};
                    }

                    resolve(value);

                  case 4:
                  case 'end':
                    return _context7.stop();
                }
              }
            }, _callee7, _this);
          }));

          return function (_x11, _x12) {
            return _ref7.apply(this, arguments);
          };
        }());
      });
    }
  }, {
    key: 'getVirtualProps',
    value: function () {
      var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(item) {
        var data, result, key, prop;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                if (!item) {
                  _context8.next = 5;
                  break;
                }

                _context8.next = 3;
                return this.virtualProps[item];

              case 3:
                data = _context8.sent;
                return _context8.abrupt('return', data);

              case 5:
                result = {};
                _context8.t0 = regeneratorRuntime.keys(this.virtualProps);

              case 7:
                if ((_context8.t1 = _context8.t0()).done) {
                  _context8.next = 15;
                  break;
                }

                key = _context8.t1.value;
                _context8.next = 11;
                return this.virtualProps[key];

              case 11:
                prop = _context8.sent;

                result[key] = prop;
                _context8.next = 7;
                break;

              case 15:
                return _context8.abrupt('return', result);

              case 16:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function getVirtualProps(_x13) {
        return _ref8.apply(this, arguments);
      }

      return getVirtualProps;
    }()
    /**
     * Pega as propriedadades
     */

  }, {
    key: 'get',
    value: function () {
      var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(item) {
        var _data, dataStorage, data, vProps;

        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                _context9.prev = 0;

                if (!item) {
                  _context9.next = 11;
                  break;
                }

                if (!(item in this.virtualProps)) {
                  _context9.next = 7;
                  break;
                }

                _context9.next = 5;
                return this.getVirtualProps(item);

              case 5:
                _data = _context9.sent;
                return _context9.abrupt('return', _data);

              case 7:
                _context9.next = 9;
                return this.getStorageProps();

              case 9:
                dataStorage = _context9.sent;
                return _context9.abrupt('return', dataStorage[item] || null);

              case 11:
                _context9.next = 13;
                return this.getStorageProps();

              case 13:
                data = _context9.sent;
                _context9.next = 16;
                return this.getVirtualProps();

              case 16:
                vProps = _context9.sent;
                return _context9.abrupt('return', (0, _deepmerge2.default)(data, vProps));

              case 20:
                _context9.prev = 20;
                _context9.t0 = _context9['catch'](0);
                throw _context9.t0.message;

              case 23:
              case 'end':
                return _context9.stop();
            }
          }
        }, _callee9, this, [[0, 20]]);
      }));

      function get(_x14) {
        return _ref9.apply(this, arguments);
      }

      return get;
    }()

    /**
     * Remove o sincronismo de uma propriedade
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
     * Remove o sincronismo de todas as propriedades
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
    value: function destroy() {
      this.discontinueAll();
      this.clear();
    }
  }]);

  return Model;
}();

exports.default = Model;
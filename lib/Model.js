'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _EventEmitter = require('EventEmitter');

var _EventEmitter2 = _interopRequireDefault(_EventEmitter);

var _deepmerge = require('deepmerge');

var _deepmerge2 = _interopRequireDefault(_deepmerge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var eventEmitter = new _EventEmitter2.default();

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

        if (typeof prop.get === 'function') {
          Object.defineProperty(this.virtualProps, key, {
            enumerable: true,
            get: prop.get.bind(this)
          });
        }
      }
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
    key: 'getStorage',
    value: function getStorage() {
      return this.storage;
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
        this.get().then(function (data) {
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
      return result ? this.getStorage().mergeItem : this.getStorage().setItem;
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
                return this.get();

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

                return _context4.abrupt('return', Promise.resolve(true));

              case 14:
                _context4.next = 16;
                return this.format(props);

              case 16:
                props = _context4.sent;
                that = this;
                _context4.prev = 18;
                _context4.next = 21;
                return new Promise(function (resolve, reject) {
                  that.getStorage().getItem(that.key, function (err, result) {
                    if (err) {
                      that.emit(props, err);
                      return reject(err);
                    }

                    that.setItemOrMergeItem(result)(that.key, JSON.stringify(props), function (err) {
                      if (err) {
                        that.emit(props, err);
                        return reject(err);
                      }

                      that.emit(props);
                      resolve(true);
                    });
                  });
                });

              case 21:
                return _context4.abrupt('return', _context4.sent);

              case 24:
                _context4.prev = 24;
                _context4.t2 = _context4['catch'](18);

                console.warn('Stagync', _context4.t2);
                return _context4.abrupt('return', null);

              case 28:
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
                return this.getStorage().removeItem(this.key);

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

    /**
     * Pega as propriedadades
     */

  }, {
    key: 'get',
    value: function () {
      var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(item) {
        var virtualProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
        var that;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                that = this;
                _context7.prev = 1;
                _context7.next = 4;
                return new Promise(function (resolve, reject) {
                  that.getStorage().getItem(that.key, function (err, value) {
                    if (err) {
                      return reject(err);
                    }

                    if (typeof value === 'string') {
                      value = JSON.parse(value);
                    } else if (!value) {
                      value = {};
                    }

                    if (item) {
                      return resolve(that.virtualProps[item] || value[item] || null);
                    }

                    if (virtualProps) {
                      value = (0, _deepmerge2.default)(value, that.virtualProps);
                    }

                    resolve(value);
                  });
                });

              case 4:
                return _context7.abrupt('return', _context7.sent);

              case 7:
                _context7.prev = 7;
                _context7.t0 = _context7['catch'](1);

                console.log('ERROR', _context7.t0);
                return _context7.abrupt('return', null);

              case 11:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this, [[1, 7]]);
      }));

      function get(_x12) {
        return _ref7.apply(this, arguments);
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
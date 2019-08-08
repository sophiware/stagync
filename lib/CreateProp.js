"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var CreateProp =
/*#__PURE__*/
function () {
  function CreateProp(that, propName) {
    _classCallCheck(this, CreateProp);

    this.that = that;
    this.propName = propName;

    if (that.propsTypes[propName] !== 'array' && that.propsTypes[propName] !== 'object') {
      delete this.remove;
    }
  }

  _createClass(CreateProp, [{
    key: "reset",
    value: function reset() {
      return this.that.set(_defineProperty({}, this.propName, this.that.schema[this.propName]["default"]));
    }
  }, {
    key: "get",
    value: function get() {
      return this.that.get(this.propName);
    }
  }, {
    key: "add",
    value: function () {
      var _add = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(newValue) {
        var currentValue, response;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.that.get(this.propName);

              case 2:
                currentValue = _context.sent;

                if (this.that.propsTypes[this.propName] === 'array') {
                  currentValue = [].concat(_toConsumableArray(currentValue), [newValue]);
                } else if (this.that.propsTypes[this.propName] === 'object') {
                  currentValue = _objectSpread({}, currentValue, {}, newValue);
                }

                _context.next = 6;
                return this.that.set(_defineProperty({}, this.propName, currentValue));

              case 6:
                response = _context.sent;
                return _context.abrupt("return", response);

              case 8:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function add(_x) {
        return _add.apply(this, arguments);
      }

      return add;
    }()
  }, {
    key: "remove",
    value: function () {
      var _remove = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(propOrIndex) {
        var value, response;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (!(this.that.propsTypes[this.propName] === 'array' || this.that.propsTypes[this.propName] === 'object')) {
                  _context2.next = 9;
                  break;
                }

                _context2.next = 3;
                return this.get(this.propName);

              case 3:
                value = _context2.sent;

                if (this.that.propsTypes[this.propName] === 'array') {
                  value.splice(propOrIndex, 1);
                } else {
                  delete value[propOrIndex];
                }

                _context2.next = 7;
                return this.set(value);

              case 7:
                response = _context2.sent;
                return _context2.abrupt("return", response);

              case 9:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function remove(_x2) {
        return _remove.apply(this, arguments);
      }

      return remove;
    }()
  }, {
    key: "set",
    value: function set(newValue) {
      return this.that.set(_defineProperty({}, this.propName, newValue));
    }
  }, {
    key: "sync",
    value: function sync(handler) {
      var started = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      return this.that.sync(_defineProperty({}, this.propName, handler), started);
    }
  }, {
    key: "discontinue",
    value: function discontinue() {
      return this.that.discontinue(this.propName);
    }
  }]);

  return CreateProp;
}();

exports["default"] = CreateProp;
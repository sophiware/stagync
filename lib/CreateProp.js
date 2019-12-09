"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

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
      return this.that.set(_defineProperty({}, this.propName, this.that.schema[this.propName].default));
    }
  }, {
    key: "get",
    value: function get() {
      return this.that.get(this.propName);
    }
  }, {
    key: "add",
    value: function add(newValue) {
      var currentValue = this.that.get(this.propName);

      if (this.that.propsTypes[this.propName] === 'array') {
        currentValue = [].concat(_toConsumableArray(currentValue), [newValue]);
      } else if (this.that.propsTypes[this.propName] === 'object') {
        currentValue = _objectSpread({}, currentValue, {}, newValue);
      }

      var response = this.that.set(_defineProperty({}, this.propName, currentValue));
      return response;
    }
  }, {
    key: "remove",
    value: function remove(propOrIndex) {
      if (this.that.propsTypes[this.propName] === 'array' || this.that.propsTypes[this.propName] === 'object') {
        var value = this.get(this.propName);

        if (this.that.propsTypes[this.propName] === 'array') {
          value.splice(propOrIndex, 1);
        } else {
          delete value[propOrIndex];
        }

        var response = this.set(value);
        return response;
      }
    }
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

exports.default = CreateProp;
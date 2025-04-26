/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.PreferenceMap = (function() {

    /**
     * Properties of a PreferenceMap.
     * @exports IPreferenceMap
     * @interface IPreferenceMap
     * @property {Object.<string,IValue>|null} [preferences] PreferenceMap preferences
     */

    /**
     * Constructs a new PreferenceMap.
     * @exports PreferenceMap
     * @classdesc Represents a PreferenceMap.
     * @implements IPreferenceMap
     * @constructor
     * @param {IPreferenceMap=} [properties] Properties to set
     */
    function PreferenceMap(properties) {
        this.preferences = {};
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * PreferenceMap preferences.
     * @member {Object.<string,IValue>} preferences
     * @memberof PreferenceMap
     * @instance
     */
    PreferenceMap.prototype.preferences = $util.emptyObject;

    /**
     * Creates a new PreferenceMap instance using the specified properties.
     * @function create
     * @memberof PreferenceMap
     * @static
     * @param {IPreferenceMap=} [properties] Properties to set
     * @returns {PreferenceMap} PreferenceMap instance
     */
    PreferenceMap.create = function create(properties) {
        return new PreferenceMap(properties);
    };

    /**
     * Encodes the specified PreferenceMap message. Does not implicitly {@link PreferenceMap.verify|verify} messages.
     * @function encode
     * @memberof PreferenceMap
     * @static
     * @param {IPreferenceMap} message PreferenceMap message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PreferenceMap.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.preferences != null && Object.hasOwnProperty.call(message, "preferences"))
            for (var keys = Object.keys(message.preferences), i = 0; i < keys.length; ++i) {
                writer.uint32(/* id 1, wireType 2 =*/10).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                $root.Value.encode(message.preferences[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
            }
        return writer;
    };

    /**
     * Encodes the specified PreferenceMap message, length delimited. Does not implicitly {@link PreferenceMap.verify|verify} messages.
     * @function encodeDelimited
     * @memberof PreferenceMap
     * @static
     * @param {IPreferenceMap} message PreferenceMap message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PreferenceMap.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a PreferenceMap message from the specified reader or buffer.
     * @function decode
     * @memberof PreferenceMap
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {PreferenceMap} PreferenceMap
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PreferenceMap.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PreferenceMap(), key, value;
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    if (message.preferences === $util.emptyObject)
                        message.preferences = {};
                    var end2 = reader.uint32() + reader.pos;
                    key = "";
                    value = null;
                    while (reader.pos < end2) {
                        var tag2 = reader.uint32();
                        switch (tag2 >>> 3) {
                        case 1:
                            key = reader.string();
                            break;
                        case 2:
                            value = $root.Value.decode(reader, reader.uint32());
                            break;
                        default:
                            reader.skipType(tag2 & 7);
                            break;
                        }
                    }
                    message.preferences[key] = value;
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a PreferenceMap message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof PreferenceMap
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {PreferenceMap} PreferenceMap
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PreferenceMap.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a PreferenceMap message.
     * @function verify
     * @memberof PreferenceMap
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    PreferenceMap.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.preferences != null && message.hasOwnProperty("preferences")) {
            if (!$util.isObject(message.preferences))
                return "preferences: object expected";
            var key = Object.keys(message.preferences);
            for (var i = 0; i < key.length; ++i) {
                var error = $root.Value.verify(message.preferences[key[i]]);
                if (error)
                    return "preferences." + error;
            }
        }
        return null;
    };

    /**
     * Creates a PreferenceMap message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof PreferenceMap
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {PreferenceMap} PreferenceMap
     */
    PreferenceMap.fromObject = function fromObject(object) {
        if (object instanceof $root.PreferenceMap)
            return object;
        var message = new $root.PreferenceMap();
        if (object.preferences) {
            if (typeof object.preferences !== "object")
                throw TypeError(".PreferenceMap.preferences: object expected");
            message.preferences = {};
            for (var keys = Object.keys(object.preferences), i = 0; i < keys.length; ++i) {
                if (typeof object.preferences[keys[i]] !== "object")
                    throw TypeError(".PreferenceMap.preferences: object expected");
                message.preferences[keys[i]] = $root.Value.fromObject(object.preferences[keys[i]]);
            }
        }
        return message;
    };

    /**
     * Creates a plain object from a PreferenceMap message. Also converts values to other types if specified.
     * @function toObject
     * @memberof PreferenceMap
     * @static
     * @param {PreferenceMap} message PreferenceMap
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    PreferenceMap.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.objects || options.defaults)
            object.preferences = {};
        var keys2;
        if (message.preferences && (keys2 = Object.keys(message.preferences)).length) {
            object.preferences = {};
            for (var j = 0; j < keys2.length; ++j)
                object.preferences[keys2[j]] = $root.Value.toObject(message.preferences[keys2[j]], options);
        }
        return object;
    };

    /**
     * Converts this PreferenceMap to JSON.
     * @function toJSON
     * @memberof PreferenceMap
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    PreferenceMap.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for PreferenceMap
     * @function getTypeUrl
     * @memberof PreferenceMap
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    PreferenceMap.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/PreferenceMap";
    };

    return PreferenceMap;
})();

$root.Value = (function() {

    /**
     * Properties of a Value.
     * @exports IValue
     * @interface IValue
     * @property {boolean|null} [boolean] Value boolean
     * @property {number|null} [float] Value float
     * @property {number|null} [integer] Value integer
     * @property {number|Long|null} [long] Value long
     * @property {string|null} [string] Value string
     * @property {IStringSet|null} [stringSet] Value stringSet
     * @property {number|null} [double] Value double
     * @property {Uint8Array|null} [bytesArray] Value bytesArray
     */

    /**
     * Constructs a new Value.
     * @exports Value
     * @classdesc Represents a Value.
     * @implements IValue
     * @constructor
     * @param {IValue=} [properties] Properties to set
     */
    function Value(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Value boolean.
     * @member {boolean|null|undefined} boolean
     * @memberof Value
     * @instance
     */
    Value.prototype.boolean = null;

    /**
     * Value float.
     * @member {number|null|undefined} float
     * @memberof Value
     * @instance
     */
    Value.prototype.float = null;

    /**
     * Value integer.
     * @member {number|null|undefined} integer
     * @memberof Value
     * @instance
     */
    Value.prototype.integer = null;

    /**
     * Value long.
     * @member {number|Long|null|undefined} long
     * @memberof Value
     * @instance
     */
    Value.prototype.long = null;

    /**
     * Value string.
     * @member {string|null|undefined} string
     * @memberof Value
     * @instance
     */
    Value.prototype.string = null;

    /**
     * Value stringSet.
     * @member {IStringSet|null|undefined} stringSet
     * @memberof Value
     * @instance
     */
    Value.prototype.stringSet = null;

    /**
     * Value double.
     * @member {number|null|undefined} double
     * @memberof Value
     * @instance
     */
    Value.prototype.double = null;

    /**
     * Value bytesArray.
     * @member {Uint8Array|null|undefined} bytesArray
     * @memberof Value
     * @instance
     */
    Value.prototype.bytesArray = null;

    // OneOf field names bound to virtual getters and setters
    var $oneOfFields;

    /**
     * Value value.
     * @member {"boolean"|"float"|"integer"|"long"|"string"|"stringSet"|"double"|"bytesArray"|undefined} value
     * @memberof Value
     * @instance
     */
    Object.defineProperty(Value.prototype, "value", {
        get: $util.oneOfGetter($oneOfFields = ["boolean", "float", "integer", "long", "string", "stringSet", "double", "bytesArray"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * Creates a new Value instance using the specified properties.
     * @function create
     * @memberof Value
     * @static
     * @param {IValue=} [properties] Properties to set
     * @returns {Value} Value instance
     */
    Value.create = function create(properties) {
        return new Value(properties);
    };

    /**
     * Encodes the specified Value message. Does not implicitly {@link Value.verify|verify} messages.
     * @function encode
     * @memberof Value
     * @static
     * @param {IValue} message Value message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Value.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.boolean != null && Object.hasOwnProperty.call(message, "boolean"))
            writer.uint32(/* id 1, wireType 0 =*/8).bool(message.boolean);
        if (message.float != null && Object.hasOwnProperty.call(message, "float"))
            writer.uint32(/* id 2, wireType 5 =*/21).float(message.float);
        if (message.integer != null && Object.hasOwnProperty.call(message, "integer"))
            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.integer);
        if (message.long != null && Object.hasOwnProperty.call(message, "long"))
            writer.uint32(/* id 4, wireType 0 =*/32).int64(message.long);
        if (message.string != null && Object.hasOwnProperty.call(message, "string"))
            writer.uint32(/* id 5, wireType 2 =*/42).string(message.string);
        if (message.stringSet != null && Object.hasOwnProperty.call(message, "stringSet"))
            $root.StringSet.encode(message.stringSet, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
        if (message.double != null && Object.hasOwnProperty.call(message, "double"))
            writer.uint32(/* id 7, wireType 1 =*/57).double(message.double);
        if (message.bytesArray != null && Object.hasOwnProperty.call(message, "bytesArray"))
            writer.uint32(/* id 8, wireType 2 =*/66).bytes(message.bytesArray);
        return writer;
    };

    /**
     * Encodes the specified Value message, length delimited. Does not implicitly {@link Value.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Value
     * @static
     * @param {IValue} message Value message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Value.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Value message from the specified reader or buffer.
     * @function decode
     * @memberof Value
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Value} Value
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Value.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Value();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.boolean = reader.bool();
                    break;
                }
            case 2: {
                    message.float = reader.float();
                    break;
                }
            case 3: {
                    message.integer = reader.int32();
                    break;
                }
            case 4: {
                    message.long = reader.int64();
                    break;
                }
            case 5: {
                    message.string = reader.string();
                    break;
                }
            case 6: {
                    message.stringSet = $root.StringSet.decode(reader, reader.uint32());
                    break;
                }
            case 7: {
                    message.double = reader.double();
                    break;
                }
            case 8: {
                    message.bytesArray = reader.bytes();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Value message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Value
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Value} Value
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Value.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Value message.
     * @function verify
     * @memberof Value
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Value.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        var properties = {};
        if (message.boolean != null && message.hasOwnProperty("boolean")) {
            properties.value = 1;
            if (typeof message.boolean !== "boolean")
                return "boolean: boolean expected";
        }
        if (message.float != null && message.hasOwnProperty("float")) {
            if (properties.value === 1)
                return "value: multiple values";
            properties.value = 1;
            if (typeof message.float !== "number")
                return "float: number expected";
        }
        if (message.integer != null && message.hasOwnProperty("integer")) {
            if (properties.value === 1)
                return "value: multiple values";
            properties.value = 1;
            if (!$util.isInteger(message.integer))
                return "integer: integer expected";
        }
        if (message.long != null && message.hasOwnProperty("long")) {
            if (properties.value === 1)
                return "value: multiple values";
            properties.value = 1;
            if (!$util.isInteger(message.long) && !(message.long && $util.isInteger(message.long.low) && $util.isInteger(message.long.high)))
                return "long: integer|Long expected";
        }
        if (message.string != null && message.hasOwnProperty("string")) {
            if (properties.value === 1)
                return "value: multiple values";
            properties.value = 1;
            if (!$util.isString(message.string))
                return "string: string expected";
        }
        if (message.stringSet != null && message.hasOwnProperty("stringSet")) {
            if (properties.value === 1)
                return "value: multiple values";
            properties.value = 1;
            {
                var error = $root.StringSet.verify(message.stringSet);
                if (error)
                    return "stringSet." + error;
            }
        }
        if (message.double != null && message.hasOwnProperty("double")) {
            if (properties.value === 1)
                return "value: multiple values";
            properties.value = 1;
            if (typeof message.double !== "number")
                return "double: number expected";
        }
        if (message.bytesArray != null && message.hasOwnProperty("bytesArray")) {
            if (properties.value === 1)
                return "value: multiple values";
            properties.value = 1;
            if (!(message.bytesArray && typeof message.bytesArray.length === "number" || $util.isString(message.bytesArray)))
                return "bytesArray: buffer expected";
        }
        return null;
    };

    /**
     * Creates a Value message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Value
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Value} Value
     */
    Value.fromObject = function fromObject(object) {
        if (object instanceof $root.Value)
            return object;
        var message = new $root.Value();
        if (object.boolean != null)
            message.boolean = Boolean(object.boolean);
        if (object.float != null)
            message.float = Number(object.float);
        if (object.integer != null)
            message.integer = object.integer | 0;
        if (object.long != null)
            if ($util.Long)
                (message.long = $util.Long.fromValue(object.long)).unsigned = false;
            else if (typeof object.long === "string")
                message.long = parseInt(object.long, 10);
            else if (typeof object.long === "number")
                message.long = object.long;
            else if (typeof object.long === "object")
                message.long = new $util.LongBits(object.long.low >>> 0, object.long.high >>> 0).toNumber();
        if (object.string != null)
            message.string = String(object.string);
        if (object.stringSet != null) {
            if (typeof object.stringSet !== "object")
                throw TypeError(".Value.stringSet: object expected");
            message.stringSet = $root.StringSet.fromObject(object.stringSet);
        }
        if (object.double != null)
            message.double = Number(object.double);
        if (object.bytesArray != null)
            if (typeof object.bytesArray === "string")
                $util.base64.decode(object.bytesArray, message.bytesArray = $util.newBuffer($util.base64.length(object.bytesArray)), 0);
            else if (object.bytesArray.length >= 0)
                message.bytesArray = object.bytesArray;
        return message;
    };

    /**
     * Creates a plain object from a Value message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Value
     * @static
     * @param {Value} message Value
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Value.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (message.boolean != null && message.hasOwnProperty("boolean")) {
            object.boolean = message.boolean;
            if (options.oneofs)
                object.value = "boolean";
        }
        if (message.float != null && message.hasOwnProperty("float")) {
            object.float = options.json && !isFinite(message.float) ? String(message.float) : message.float;
            if (options.oneofs)
                object.value = "float";
        }
        if (message.integer != null && message.hasOwnProperty("integer")) {
            object.integer = message.integer;
            if (options.oneofs)
                object.value = "integer";
        }
        if (message.long != null && message.hasOwnProperty("long")) {
            if (typeof message.long === "number")
                object.long = options.longs === String ? String(message.long) : message.long;
            else
                object.long = options.longs === String ? $util.Long.prototype.toString.call(message.long) : options.longs === Number ? new $util.LongBits(message.long.low >>> 0, message.long.high >>> 0).toNumber() : message.long;
            if (options.oneofs)
                object.value = "long";
        }
        if (message.string != null && message.hasOwnProperty("string")) {
            object.string = message.string;
            if (options.oneofs)
                object.value = "string";
        }
        if (message.stringSet != null && message.hasOwnProperty("stringSet")) {
            object.stringSet = $root.StringSet.toObject(message.stringSet, options);
            if (options.oneofs)
                object.value = "stringSet";
        }
        if (message.double != null && message.hasOwnProperty("double")) {
            object.double = options.json && !isFinite(message.double) ? String(message.double) : message.double;
            if (options.oneofs)
                object.value = "double";
        }
        if (message.bytesArray != null && message.hasOwnProperty("bytesArray")) {
            object.bytesArray = options.bytes === String ? $util.base64.encode(message.bytesArray, 0, message.bytesArray.length) : options.bytes === Array ? Array.prototype.slice.call(message.bytesArray) : message.bytesArray;
            if (options.oneofs)
                object.value = "bytesArray";
        }
        return object;
    };

    /**
     * Converts this Value to JSON.
     * @function toJSON
     * @memberof Value
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Value.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Value
     * @function getTypeUrl
     * @memberof Value
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Value.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/Value";
    };

    return Value;
})();

$root.StringSet = (function() {

    /**
     * Properties of a StringSet.
     * @exports IStringSet
     * @interface IStringSet
     * @property {Array.<string>|null} [strings] StringSet strings
     */

    /**
     * Constructs a new StringSet.
     * @exports StringSet
     * @classdesc Represents a StringSet.
     * @implements IStringSet
     * @constructor
     * @param {IStringSet=} [properties] Properties to set
     */
    function StringSet(properties) {
        this.strings = [];
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * StringSet strings.
     * @member {Array.<string>} strings
     * @memberof StringSet
     * @instance
     */
    StringSet.prototype.strings = $util.emptyArray;

    /**
     * Creates a new StringSet instance using the specified properties.
     * @function create
     * @memberof StringSet
     * @static
     * @param {IStringSet=} [properties] Properties to set
     * @returns {StringSet} StringSet instance
     */
    StringSet.create = function create(properties) {
        return new StringSet(properties);
    };

    /**
     * Encodes the specified StringSet message. Does not implicitly {@link StringSet.verify|verify} messages.
     * @function encode
     * @memberof StringSet
     * @static
     * @param {IStringSet} message StringSet message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    StringSet.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.strings != null && message.strings.length)
            for (var i = 0; i < message.strings.length; ++i)
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.strings[i]);
        return writer;
    };

    /**
     * Encodes the specified StringSet message, length delimited. Does not implicitly {@link StringSet.verify|verify} messages.
     * @function encodeDelimited
     * @memberof StringSet
     * @static
     * @param {IStringSet} message StringSet message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    StringSet.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a StringSet message from the specified reader or buffer.
     * @function decode
     * @memberof StringSet
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {StringSet} StringSet
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    StringSet.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.StringSet();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    if (!(message.strings && message.strings.length))
                        message.strings = [];
                    message.strings.push(reader.string());
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a StringSet message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof StringSet
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {StringSet} StringSet
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    StringSet.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a StringSet message.
     * @function verify
     * @memberof StringSet
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    StringSet.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.strings != null && message.hasOwnProperty("strings")) {
            if (!Array.isArray(message.strings))
                return "strings: array expected";
            for (var i = 0; i < message.strings.length; ++i)
                if (!$util.isString(message.strings[i]))
                    return "strings: string[] expected";
        }
        return null;
    };

    /**
     * Creates a StringSet message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof StringSet
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {StringSet} StringSet
     */
    StringSet.fromObject = function fromObject(object) {
        if (object instanceof $root.StringSet)
            return object;
        var message = new $root.StringSet();
        if (object.strings) {
            if (!Array.isArray(object.strings))
                throw TypeError(".StringSet.strings: array expected");
            message.strings = [];
            for (var i = 0; i < object.strings.length; ++i)
                message.strings[i] = String(object.strings[i]);
        }
        return message;
    };

    /**
     * Creates a plain object from a StringSet message. Also converts values to other types if specified.
     * @function toObject
     * @memberof StringSet
     * @static
     * @param {StringSet} message StringSet
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    StringSet.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.arrays || options.defaults)
            object.strings = [];
        if (message.strings && message.strings.length) {
            object.strings = [];
            for (var j = 0; j < message.strings.length; ++j)
                object.strings[j] = message.strings[j];
        }
        return object;
    };

    /**
     * Converts this StringSet to JSON.
     * @function toJSON
     * @memberof StringSet
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    StringSet.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for StringSet
     * @function getTypeUrl
     * @memberof StringSet
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    StringSet.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/StringSet";
    };

    return StringSet;
})();

module.exports = $root;

import * as $protobuf from "protobufjs";
import Long = require("long");
/** Properties of a PreferenceMap. */
export interface IPreferenceMap {

    /** PreferenceMap preferences */
    preferences?: ({ [k: string]: IValue }|null);
}

/** Represents a PreferenceMap. */
export class PreferenceMap implements IPreferenceMap {

    /**
     * Constructs a new PreferenceMap.
     * @param [properties] Properties to set
     */
    constructor(properties?: IPreferenceMap);

    /** PreferenceMap preferences. */
    public preferences: { [k: string]: IValue };

    /**
     * Creates a new PreferenceMap instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PreferenceMap instance
     */
    public static create(properties?: IPreferenceMap): PreferenceMap;

    /**
     * Encodes the specified PreferenceMap message. Does not implicitly {@link PreferenceMap.verify|verify} messages.
     * @param message PreferenceMap message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IPreferenceMap, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PreferenceMap message, length delimited. Does not implicitly {@link PreferenceMap.verify|verify} messages.
     * @param message PreferenceMap message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IPreferenceMap, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PreferenceMap message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns PreferenceMap
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PreferenceMap;

    /**
     * Decodes a PreferenceMap message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns PreferenceMap
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PreferenceMap;

    /**
     * Verifies a PreferenceMap message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PreferenceMap message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PreferenceMap
     */
    public static fromObject(object: { [k: string]: any }): PreferenceMap;

    /**
     * Creates a plain object from a PreferenceMap message. Also converts values to other types if specified.
     * @param message PreferenceMap
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: PreferenceMap, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PreferenceMap to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for PreferenceMap
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Properties of a Value. */
export interface IValue {

    /** Value boolean */
    boolean?: (boolean|null);

    /** Value float */
    float?: (number|null);

    /** Value integer */
    integer?: (number|null);

    /** Value long */
    long?: (number|Long|null);

    /** Value string */
    string?: (string|null);

    /** Value stringSet */
    stringSet?: (IStringSet|null);

    /** Value double */
    double?: (number|null);

    /** Value bytesArray */
    bytesArray?: (Uint8Array|null);
}

/** Represents a Value. */
export class Value implements IValue {

    /**
     * Constructs a new Value.
     * @param [properties] Properties to set
     */
    constructor(properties?: IValue);

    /** Value boolean. */
    public boolean?: (boolean|null);

    /** Value float. */
    public float?: (number|null);

    /** Value integer. */
    public integer?: (number|null);

    /** Value long. */
    public long?: (number|Long|null);

    /** Value string. */
    public string?: (string|null);

    /** Value stringSet. */
    public stringSet?: (IStringSet|null);

    /** Value double. */
    public double?: (number|null);

    /** Value bytesArray. */
    public bytesArray?: (Uint8Array|null);

    /** Value value. */
    public value?: ("boolean"|"float"|"integer"|"long"|"string"|"stringSet"|"double"|"bytesArray");

    /**
     * Creates a new Value instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Value instance
     */
    public static create(properties?: IValue): Value;

    /**
     * Encodes the specified Value message. Does not implicitly {@link Value.verify|verify} messages.
     * @param message Value message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IValue, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Value message, length delimited. Does not implicitly {@link Value.verify|verify} messages.
     * @param message Value message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IValue, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Value message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Value
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Value;

    /**
     * Decodes a Value message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Value
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Value;

    /**
     * Verifies a Value message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a Value message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Value
     */
    public static fromObject(object: { [k: string]: any }): Value;

    /**
     * Creates a plain object from a Value message. Also converts values to other types if specified.
     * @param message Value
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Value, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Value to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for Value
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Properties of a StringSet. */
export interface IStringSet {

    /** StringSet strings */
    strings?: (string[]|null);
}

/** Represents a StringSet. */
export class StringSet implements IStringSet {

    /**
     * Constructs a new StringSet.
     * @param [properties] Properties to set
     */
    constructor(properties?: IStringSet);

    /** StringSet strings. */
    public strings: string[];

    /**
     * Creates a new StringSet instance using the specified properties.
     * @param [properties] Properties to set
     * @returns StringSet instance
     */
    public static create(properties?: IStringSet): StringSet;

    /**
     * Encodes the specified StringSet message. Does not implicitly {@link StringSet.verify|verify} messages.
     * @param message StringSet message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IStringSet, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified StringSet message, length delimited. Does not implicitly {@link StringSet.verify|verify} messages.
     * @param message StringSet message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IStringSet, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a StringSet message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns StringSet
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): StringSet;

    /**
     * Decodes a StringSet message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns StringSet
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): StringSet;

    /**
     * Verifies a StringSet message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a StringSet message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns StringSet
     */
    public static fromObject(object: { [k: string]: any }): StringSet;

    /**
     * Creates a plain object from a StringSet message. Also converts values to other types if specified.
     * @param message StringSet
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: StringSet, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this StringSet to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for StringSet
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

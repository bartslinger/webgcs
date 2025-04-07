/*
 * This file is based on code from the 'node-mavlink' project:
 *   https://github.com/padcom/node-mavlink
 *
 * Original author:
 *   Matthias Hryniszak <padcom@gmail.com>
 *
 * Copyright (C) original contributors - Licensed under the GNU Lesser General Public License (LGPL) v3.0.
 *
 * This file is licensed under the GNU Lesser General Public License (LGPL) v3.0.
 * You should have received a copy of the license along with this file.
 * If not, see <https://www.gnu.org/licenses/lgpl-3.0.html>.
 */

import type {
	int8_t,
	uint8_t,
	int16_t,
	uint16_t,
	int32_t,
	uint32_t,
	int64_t,
	uint64_t,
	float,
	double
} from 'mavlink-mappings';

type Serializer =
	| ((value: any, buffer: DataView, offset: number) => void)
	| ((value: any, buffer: DataView, offset: number, maxLen: number) => void);

type Serializers = { [key: string]: Serializer };

const SPECIAL_TYPES_SERIALIZERS: Serializers = {
	uint8_t_mavlink_version: (value: uint8_t, buffer: DataView, offset: number) =>
		buffer.setUint8(value, offset)
};

const SINGULAR_TYPES_SERIALIZERS: Serializers = {
	char: (value: int8_t, buffer: DataView, offset: number) => buffer.setUint8(value, offset),
	int8_t: (value: int8_t, buffer: DataView, offset: number) => buffer.setInt8(value, offset),
	uint8_t: (value: uint8_t, buffer: DataView, offset: number) => buffer.setUint8(value, offset),
	int16_t: (value: int16_t, buffer: DataView, offset: number) =>
		buffer.setInt16(value, offset, true),
	uint16_t: (value: uint16_t, buffer: DataView, offset: number) =>
		buffer.setUint16(value, offset, true),
	int32_t: (value: int32_t, buffer: DataView, offset: number) =>
		buffer.setInt32(value, offset, true),
	uint32_t: (value: uint32_t, buffer: DataView, offset: number) =>
		buffer.setUint32(value, offset, true),
	int64_t: (value: int64_t, buffer: DataView, offset: number) =>
		buffer.setBigInt64(value, offset, true),
	uint64_t: (value: uint64_t, buffer: DataView, offset: number) =>
		buffer.setBigUint64(value, offset, true),
	float: (value: float, buffer: DataView, offset: number) => buffer.setFloat32(value, offset, true),
	double: (value: double, buffer: DataView, offset: number) =>
		buffer.setFloat64(value, offset, true)
};

const ARRAY_TYPES_SERIALIZERS: Serializers = {
	'char[]': (value: string, buffer: DataView, offset: number, maxLen: number) => {
		for (let i = 0; i < value.length && i < maxLen; i++) {
			const code = value.charCodeAt(i);
			buffer.setUint8(code, offset + i);
		}
	},
	'int8_t[]': (value: uint8_t[], buffer: DataView, offset: number, maxLen: number) => {
		for (let i = 0; i < value.length && i < maxLen; i++) {
			buffer.setInt8(value[i], offset + i);
		}
	},
	'uint8_t[]': (value: uint8_t[], buffer: DataView, offset: number, maxLen: number) => {
		for (let i = 0; i < value.length && i < maxLen; i++) {
			buffer.setUint8(value[i], offset + i);
		}
	},
	'int16_t[]': (value: uint16_t[], buffer: DataView, offset: number, maxLen: number) => {
		for (let i = 0; i < value.length && i < maxLen; i++) {
			buffer.setInt16(value[i], offset + i * 2, true);
		}
	},
	'uint16_t[]': (value: uint16_t[], buffer: DataView, offset: number, maxLen: number) => {
		for (let i = 0; i < value.length && i < maxLen; i++) {
			buffer.setUint16(value[i], offset + i * 2, true);
		}
	},
	'int32_t[]': (value: uint32_t[], buffer: DataView, offset: number, maxLen: number) => {
		for (let i = 0; i < value.length && i < maxLen; i++) {
			buffer.setInt32(value[i], offset + i * 4, true);
		}
	},
	'uint32_t[]': (value: uint32_t[], buffer: DataView, offset: number, maxLen: number) => {
		for (let i = 0; i < value.length && i < maxLen; i++) {
			buffer.setUint32(value[i], offset + i * 4, true);
		}
	},
	'int64_t[]': (value: uint64_t[], buffer: DataView, offset: number, maxLen: number) => {
		for (let i = 0; i < value.length && i < maxLen; i++) {
			buffer.setBigInt64(value[i], offset + i * 8, true);
		}
	},
	'uint64_t[]': (value: uint64_t[], buffer: DataView, offset: number, maxLen: number) => {
		for (let i = 0; i < value.length && i < maxLen; i++) {
			buffer.setBigUint64(value[i], offset + i * 8, true);
		}
	},
	'float[]': (value: float[], buffer: DataView, offset: number, maxLen: number) => {
		for (let i = 0; i < value.length && i < maxLen; i++) {
			buffer.setFloat32(value[i], offset + i * 4, true);
		}
	},
	'double[]': (value: double[], buffer: DataView, offset: number, maxLen: number) => {
		for (let i = 0; i < value.length && i < maxLen; i++) {
			buffer.setFloat64(value[i], offset + i * 8, true);
		}
	}
};

/**
 * A dictionary containing functions that serialize a certain value based on the field type
 */
export const SERIALIZERS = {
	...SPECIAL_TYPES_SERIALIZERS,
	...SINGULAR_TYPES_SERIALIZERS,
	...ARRAY_TYPES_SERIALIZERS
};

type Deserializer =
	| ((buffer: DataView, offset: number) => any)
	| ((buffer: DataView, offset: number, length: number) => any);
type Deserializers = { [key: string]: Deserializer };

const SPECIAL_DESERIALIZERS: Deserializers = {
	uint8_t_mavlink_version: (buffer: DataView, offset: number) => buffer.getUint8(offset)
};

const SINGULAR_TYPES_DESERIALIZERS: Deserializers = {
	char: (buffer: DataView, offset: number) => String.fromCharCode(buffer.getUint8(offset)),
	int8_t: (buffer: DataView, offset: number) => buffer.getInt8(offset),
	uint8_t: (buffer: DataView, offset: number) => buffer.getUint8(offset),
	int16_t: (buffer: DataView, offset: number) => buffer.getInt16(offset, true),
	uint16_t: (buffer: DataView, offset: number) => buffer.getUint16(offset, true),
	int32_t: (buffer: DataView, offset: number) => buffer.getInt32(offset, true),
	uint32_t: (buffer: DataView, offset: number) => buffer.getUint32(offset, true),
	int64_t: (buffer: DataView, offset: number) => buffer.getBigInt64(offset, true),
	uint64_t: (buffer: DataView, offset: number) => buffer.getBigUint64(offset, true),
	float: (buffer: DataView, offset: number) => buffer.getFloat32(offset, true),
	double: (buffer: DataView, offset: number) => buffer.getFloat64(offset, true)
};

const ARRAY_TYPES_DESERIALIZERS: Deserializers = {
	'char[]': (buffer: DataView, offset: number, length: number) => {
		let result = '';
		for (let i = 0; i < length; i++) {
			const charCode = buffer.getUint8(offset + i);
			if (charCode !== 0) {
				result += String.fromCharCode(charCode);
			} else {
				break;
			}
		}
		return result;
	},
	'int8_t[]': (buffer: DataView, offset: number, length: number) => {
		const result = new Array<number>(length);
		for (let i = 0; i < length; i++) result[i] = buffer.getInt8(offset + i);
		return result;
	},
	'uint8_t[]': (buffer: DataView, offset: number, length: number) => {
		const result = new Array<number>(length);
		for (let i = 0; i < length; i++) result[i] = buffer.getUint8(offset + i);
		return result;
	},
	'int16_t[]': (buffer: DataView, offset: number, length: number) => {
		const result = new Array<number>(length);
		for (let i = 0; i < length; i++) result[i] = buffer.getInt16(offset + i * 2, true);
		return result;
	},
	'uint16_t[]': (buffer: DataView, offset: number, length: number) => {
		const result = new Array<number>(length);
		for (let i = 0; i < length; i++) result[i] = buffer.getUint16(offset + i * 2, true);
		return result;
	},
	'int32_t[]': (buffer: DataView, offset: number, length: number) => {
		const result = new Array<number>(length);
		for (let i = 0; i < length; i++) result[i] = buffer.getInt32(offset + i * 4, true);
		return result;
	},
	'uint32_t[]': (buffer: DataView, offset: number, length: number) => {
		const result = new Array<number>(length);
		for (let i = 0; i < length; i++) result[i] = buffer.getUint32(offset + i * 4, true);
		return result;
	},
	'int64_t[]': (buffer: DataView, offset: number, length: number) => {
		const result = new Array<BigInt>(length);
		for (let i = 0; i < length; i++) result[i] = buffer.getBigInt64(offset + i * 8, true);
		return result;
	},
	'uint64_t[]': (buffer: DataView, offset: number, length: number) => {
		const result = new Array<BigInt>(length);
		for (let i = 0; i < length; i++) result[i] = buffer.getBigUint64(offset + i * 8, true);
		return result;
	},
	'float[]': (buffer: DataView, offset: number, length: number) => {
		const result = new Array<number>(length);
		for (let i = 0; i < length; i++) result[i] = buffer.getFloat32(offset + i * 4, true);
		return result;
	},
	'double[]': (buffer: DataView, offset: number, length: number) => {
		const result = new Array<number>(length);
		for (let i = 0; i < length; i++) result[i] = buffer.getFloat64(offset + i * 8, true);
		return result;
	}
};

/**
 * A dictionary containing functions that deserialize a certain value based on the field type
 */
export const DESERIALIZERS: Deserializers = {
	...SPECIAL_DESERIALIZERS,
	...SINGULAR_TYPES_DESERIALIZERS,
	...ARRAY_TYPES_DESERIALIZERS
};

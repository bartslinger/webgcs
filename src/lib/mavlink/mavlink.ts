/*
 * This file is based on code from the 'node-mavlink' project:
 *   https://github.com/padcom/node-mavlink
 *
 * Original author:
 *   Matthias Hryniszak <padcom@gmail.com>
 *
 * Copyright (C) original contributors - Licensed under the GNU Lesser General Public License (LGPL) v3.0.
 *
 * Modifications:
 *   Copyright (C) 2025 Your Name <your.email@example.com>
 *   - I want to use mavlink-mappings to run in the browser. node-mavlink doesn't allow that since it's stream based.
 *     This code is therefore quite different, but I used some snippets from the original code.
 *
 * This file is licensed under the GNU Lesser General Public License (LGPL) v3.0.
 * You should have received a copy of the license along with this file.
 * If not, see <https://www.gnu.org/licenses/lgpl-3.0.html>.
 */

import { type uint8_t, type uint16_t, x25crc } from 'mavlink-mappings';
import { MSG_ID_MAGIC_NUMBER } from 'mavlink-mappings';
import { MavLinkData, type MavLinkDataConstructor } from 'mavlink-mappings';
import { hex } from './utils.js';
import { DESERIALIZERS, SERIALIZERS } from '$lib/mavlink/serialization.js';

/**
 * Header definition of the MavLink packet
 */
export class MavLinkPacketHeader {
	timestamp: bigint | null = null;
	magic: number = 0;
	payloadLength: uint8_t = 0;
	incompatibilityFlags: uint8_t = 0;
	compatibilityFlags: uint8_t = 0;
	seq: uint8_t = 0;
	sysid: uint8_t = 0;
	compid: uint8_t = 0;
	msgid: uint8_t = 0;
}

/**
 * Base class for protocols
 *
 * Implements common functionality like getting the CRC and deserializing
 * data classes from the given payload buffer
 */
export abstract class MavLinkProtocol {
	static NAME = 'unknown';
	static START_BYTE = 0;
	static PAYLOAD_OFFSET = 0;
	static CHECKSUM_LENGTH = 2;

	static SYS_ID: uint8_t = 254;
	static COMP_ID: uint8_t = 1;

	get name(): string {
		return (this.constructor as unknown as { NAME: string }).NAME;
	}

	/**
	 * Serialize a message to a buffer
	 */
	abstract serialize(message: MavLinkData, seq: uint8_t): DataView;

	/**
	 * Deserialize packet header
	 */
	abstract header(buffer: DataView, timestamp?: bigint): MavLinkPacketHeader;

	/**
	 * Deserialize packet checksum
	 */
	abstract crc(buffer: DataView): uint16_t;

	/**
	 * Extract payload buffer
	 *
	 * The returned payload buffer needs to be long enough to read all
	 * the fields, including extensions that are sometimes not being sent
	 * from the transmitting system.
	 */
	abstract payload(buffer: DataView): DataView;

	/**
	 * Deserialize payload into actual data class
	 */
	data<T extends MavLinkData>(payload: DataView, clazz: MavLinkDataConstructor<T>): T {
		console.trace('Deserializing', clazz.MSG_NAME, 'with payload of size', payload.byteLength);

		const instance = new clazz();
		let payloadLength = payload.length;
		for (const field of clazz.FIELDS) {
			const fieldLength = field.length === 0 ? field.size : field.length * field.size;
			const deserialize = DESERIALIZERS[field.type];
			if (!deserialize) {
				throw new Error(`Unknown field type ${field.type}`);
			}

			// Pad the payload if it is trimmed
			// https://mavlink.io/en/guide/serialization.html
			// MAVLink 2 implementations must truncate any empty (zero-filled)
			// bytes at the end of the serialized payload before it is sent.
			if (fieldLength > payloadLength) {
				const diff = fieldLength - payloadLength;
				const newPayloadLength = payload.length + diff;
				const newBuffer = DataView.alloc(newPayloadLength);
				payload.copy(newBuffer, 0, 0, payload.length);
				payload = newBuffer;
			}

			// @ts-ignore
			instance[field.name] = deserialize(payload, field.offset, field.length);
			payloadLength -= fieldLength;
		}

		return instance;
	}
}

/**
 * Interface describing static fields of a protocol classes
 */
interface MavLinkProtocolConstructor {
	NAME: string;
	START_BYTE: number;
	PAYLOAD_OFFSET: number;

	SYS_ID: uint8_t;
	COMP_ID: uint8_t;

	new (): MavLinkProtocol;
}

/**
 * MavLink Protocol V1
 */
export class MavLinkProtocolV1 extends MavLinkProtocol {
	static NAME = 'MAV_V1';
	static START_BYTE = 0xfe;
	static PAYLOAD_OFFSET = 6;

	constructor(
		public sysid: uint8_t = MavLinkProtocol.SYS_ID,
		public compid: uint8_t = MavLinkProtocol.COMP_ID
	) {
		super();
	}

	serialize(message: MavLinkData, seq: number): DataView {
		console.trace('Serializing message (seq:', seq, ')');

		const definition: MavLinkDataConstructor<MavLinkData> = <any>message.constructor;
		const buffer = DataView.from(
			new Uint8Array(
				MavLinkProtocolV1.PAYLOAD_OFFSET +
					definition.PAYLOAD_LENGTH +
					MavLinkProtocol.CHECKSUM_LENGTH
			)
		);

		// serialize header
		buffer.setUint8(MavLinkProtocolV1.START_BYTE, 0);
		buffer.setUint8(definition.PAYLOAD_LENGTH, 1);
		buffer.setUint8(seq, 2);
		buffer.setUint8(this.sysid, 3);
		buffer.setUint8(this.compid, 4);
		buffer.setUint8(definition.MSG_ID, 5);

		// serialize fields
		definition.FIELDS.forEach((field) => {
			const serialize = SERIALIZERS[field.type];
			if (!serialize) throw new Error(`Unknown field type ${field.type}: serializer not found`);
			// @ts-ignore
			serialize(
				message[field.name],
				buffer,
				field.offset + MavLinkProtocolV1.PAYLOAD_OFFSET,
				field.length
			);
		});

		// serialize checksum
		const crc = x25crc(buffer, 1, 2, definition.MAGIC_NUMBER);
		buffer.setUint16(crc, buffer.byteLength - 2, true);

		return buffer;
	}

	header(buffer: DataView, timestamp?: bigint): MavLinkPacketHeader {
		console.trace('Reading header from buffer (len:', buffer.byteLength, ')');

		const startByte = buffer.getUint8(0);
		if (startByte !== MavLinkProtocolV1.START_BYTE) {
			throw new Error(
				`Invalid start byte (expected: ${MavLinkProtocolV1.START_BYTE}, got ${startByte})`
			);
		}

		const result = new MavLinkPacketHeader();
		result.timestamp = timestamp || null;
		result.payloadLength = buffer.getUint8(1);
		result.seq = buffer.getUint8(2);
		result.sysid = buffer.getUint8(3);
		result.compid = buffer.getUint8(4);
		result.msgid = buffer.getUint8(5);

		return result;
	}

	/**
	 * Deserialize packet checksum
	 */
	crc(buffer: DataView): uint16_t {
		console.trace('Reading crc from buffer (len:', buffer.byteLength, ')');

		const plen = buffer.getUint8(1);
		return buffer.getUint16(MavLinkProtocolV1.PAYLOAD_OFFSET + plen, true);
	}

	payload(buffer: DataView): DataView {
		console.trace('Reading payload from buffer (len:', buffer.byteLength, ')');

		const plen = buffer.getUint8(1);
		const payload = buffer.slice(
			MavLinkProtocolV1.PAYLOAD_OFFSET,
			MavLinkProtocolV1.PAYLOAD_OFFSET + plen
		);
		const padding = DataView.from(new Uint8Array(255 - payload.length));
		return DataView.concat([payload, padding]);
	}
}

/**
 * MavLink Protocol V2
 */
export class MavLinkProtocolV2 extends MavLinkProtocol {
	static NAME = 'MAV_V2';
	static START_BYTE = 0xfd;
	static PAYLOAD_OFFSET = 10;

	static INCOMPATIBILITY_FLAGS: uint8_t = 0;
	static COMPATIBILITY_FLAGS: uint8_t = 0;

	static readonly IFLAG_SIGNED = 0x01;

	static readonly SIGNATURE_START_TIME = Date.UTC(2015, 0, 1);

	constructor(
		public sysid: uint8_t = MavLinkProtocol.SYS_ID,
		public compid: uint8_t = MavLinkProtocol.COMP_ID,
		public incompatibilityFlags: uint8_t = MavLinkProtocolV2.INCOMPATIBILITY_FLAGS,
		public compatibilityFlags: uint8_t = MavLinkProtocolV2.COMPATIBILITY_FLAGS
	) {
		super();
	}

	serialize(message: MavLinkData, seq: number): DataView {
		console.trace('Serializing message (seq:', seq, ')');

		const definition: MavLinkDataConstructor<MavLinkData> = <any>message.constructor;
		const buffer = new DataView(
			new Uint8Array(
				MavLinkProtocolV2.PAYLOAD_OFFSET +
					definition.PAYLOAD_LENGTH +
					MavLinkProtocol.CHECKSUM_LENGTH
			)
		);

		buffer.setUint8(MavLinkProtocolV2.START_BYTE, 0);
		buffer.setUint8(this.incompatibilityFlags, 2);
		buffer.setUint8(this.compatibilityFlags, 3);
		buffer.setUint8(seq, 4);
		buffer.setUint8(this.sysid, 5);
		buffer.setUint8(this.compid, 6);
		setUintLE(buffer, definition.MSG_ID, 7, 3);

		definition.FIELDS.forEach((field) => {
			const serialize = SERIALIZERS[field.type];
			if (!serialize) throw new Error(`Unknown field type ${field.type}: serializer not found`);
			// @ts-ignore
			serialize(
				message[field.name],
				buffer,
				field.offset + MavLinkProtocolV2.PAYLOAD_OFFSET,
				field.length
			);
		});

		// calculate actual truncated payload length
		const payloadLength = this.calculateTruncatedPayloadLength(buffer);
		buffer.setUint8(payloadLength, 1);

		// slice out the message buffer
		const result = buffer.slice(
			0,
			MavLinkProtocolV2.PAYLOAD_OFFSET + payloadLength + MavLinkProtocol.CHECKSUM_LENGTH
		);

		const crc = x25crc(result, 1, 2, definition.MAGIC_NUMBER);
		result.setUint16LE(crc, result.length - MavLinkProtocol.CHECKSUM_LENGTH);

		return result;
	}

	/**
	 * Create a signed package buffer
	 *
	 * @param buffer buffer with the original, unsigned package
	 * @param linkId id of the link
	 * @param key key to sign the package with
	 * @param timestamp optional timestamp for packet signing (default: Date.now())
	 * @returns signed package
	 */
	sign(buffer: DataView, linkId: number, key: DataView, timestamp = Date.now()) {
		console.trace('Signing message');

		const result = DataView.concat([
			buffer,
			DataView.from(new Uint8Array(MavLinkPacketSignature.SIGNATURE_LENGTH))
		]);

		const signer = new MavLinkPacketSignature(result);
		signer.linkId = linkId;
		signer.timestamp = (timestamp - MavLinkProtocolV2.SIGNATURE_START_TIME) * 100;
		signer.signature = signer.calculate(key);

		return result;
	}

	private calculateTruncatedPayloadLength(buffer: DataView): number {
		let result = buffer.byteLength;

		for (
			let i = buffer.byteLength - MavLinkProtocol.CHECKSUM_LENGTH - 1;
			i >= MavLinkProtocolV2.PAYLOAD_OFFSET;
			i--
		) {
			result = i;
			if (buffer[i] !== 0) {
				result++;
				break;
			}
		}

		return result - MavLinkProtocolV2.PAYLOAD_OFFSET;
	}

	header(buffer: DataView, timestamp?: bigint): MavLinkPacketHeader {
		console.trace('Reading header from buffer (len:', buffer.byteLength, ')');

		const startByte = buffer.getUint8(0);
		if (startByte !== MavLinkProtocolV2.START_BYTE) {
			throw new Error(
				`Invalid start byte (expected: ${MavLinkProtocolV2.START_BYTE}, got ${startByte})`
			);
		}

		const result = new MavLinkPacketHeader();
		result.timestamp = timestamp || null;
		result.magic = startByte;
		result.payloadLength = buffer.getUint8(1);
		result.incompatibilityFlags = buffer.getUint8(2);
		result.compatibilityFlags = buffer.getUint8(3);
		result.seq = buffer.getUint8(4);
		result.sysid = buffer.getUint8(5);
		result.compid = buffer.getUint8(6);
		result.msgid = getUintLE(buffer, 7, 3);

		return result;
	}

	/**
	 * Deserialize packet checksum
	 */
	crc(buffer: DataView): uint16_t {
		console.trace('Reading crc from buffer (len:', buffer.byteLength, ')');

		const plen = buffer.getUint8(1);
		return buffer.getUint16(MavLinkProtocolV2.PAYLOAD_OFFSET + plen, true);
	}

	payload(buffer: DataView): DataView {
		console.trace('Reading payload from buffer (len:', buffer.byteLength, ')');

		const plen = buffer.getUint8(1);
		const payload = buffer.slice(
			MavLinkProtocolV2.PAYLOAD_OFFSET,
			MavLinkProtocolV2.PAYLOAD_OFFSET + plen
		);
		const padding = DataView.from(new Uint8Array(255 - payload.length));
		return DataView.concat([payload, padding]);
	}

	signature(buffer: DataView, header: MavLinkPacketHeader): MavLinkPacketSignature | null {
		console.trace('Reading signature from buffer (len:', buffer.byteLength, ')');

		if (header.incompatibilityFlags & MavLinkProtocolV2.IFLAG_SIGNED) {
			return new MavLinkPacketSignature(buffer);
		} else {
			return null;
		}
	}
}

/**
 * Registry of known protocols by STX
 */
const KNOWN_PROTOCOLS_BY_STX = {
	[MavLinkProtocolV1.START_BYTE]: MavLinkProtocolV1,
	[MavLinkProtocolV2.START_BYTE]: MavLinkProtocolV2
};

/**
 * MavLink packet signature definition
 */
export class MavLinkPacketSignature {
	static SIGNATURE_LENGTH = 13;

	/**
	 * Calculate key based on secret passphrase
	 *
	 * @param passphrase secret to generate the key
	 * @returns key as a buffer
	 */
	static key(passphrase: string) {
		return createHash('sha256').update(passphrase).digest();
	}

	constructor(private readonly buffer: DataView) {}

	private get offset() {
		return this.buffer.byteLength - MavLinkPacketSignature.SIGNATURE_LENGTH;
	}

	/**
	 * Get the linkId from signature
	 */
	get linkId() {
		return this.buffer.getUint8(this.offset);
	}

	/**
	 * Set the linkId in signature
	 */
	set linkId(value: uint8_t) {
		this.buffer.setUint8(value, this.offset);
	}

	/**
	 * Get the timestamp from signature
	 */
	get timestamp() {
		return getUintLE(this.buffer, this.offset + 1, 6);
	}

	/**
	 * Set the linkId in signature
	 */
	set timestamp(value: number) {
		setUintLE(this.buffer, value, this.offset + 1, 6);
	}

	/**
	 * Get the signature from signature
	 */
	get signature() {
		return this.buffer.slice(this.offset + 7, this.offset + 7 + 6).toString('hex');
	}

	/**
	 * Set the signature in signature
	 */
	set signature(value: string) {
		this.buffer.write(value, this.offset + 7, 'hex');
	}

	/**
	 * Calculates signature of the packet buffer using the provided secret.
	 * The secret is converted to a hash using the sha256 algorithm which matches
	 * the way Mission Planner creates keys.
	 *
	 * @param key the secret key (Buffer)
	 * @returns calculated signature value
	 */
	calculate(key: DataView) {
		const hash = createHash('sha256')
			.update(key)
			.update(this.buffer.slice(0, this.buffer.byteLength - 6))
			.digest('hex')
			.substr(0, 12);

		return hash;
	}

	/**
	 * Checks the signature of the packet buffer against a given secret
	 * The secret is converted to a hash using the sha256 algorithm which matches
	 * the way Mission Planner creates keys.
	 *
	 * @param key key
	 * @returns true if the signature matches, false otherwise
	 */
	matches(key: DataView) {
		return this.calculate(key) === this.signature;
	}

	toString() {
		return `linkid: ${this.linkId}, timestamp ${this.timestamp}, signature ${this.signature}`;
	}
}

/**
 * MavLink packet definition
 */
export class MavLinkPacket {
	constructor(
		readonly buffer: DataView,
		readonly header: MavLinkPacketHeader = new MavLinkPacketHeader(),
		readonly payload: DataView = DataView.from(new Uint8Array(255)),
		readonly crc: uint16_t = 0,
		readonly protocol: MavLinkProtocol = new MavLinkProtocolV1(),
		readonly signature: MavLinkPacketSignature | null = null
	) {}

	/**
	 * Debug information about the packet
	 *
	 * @returns string representing debug information about a packet
	 */
	debug() {
		return (
			'Packet (' +
			// @ts-ignore
			`proto: ${this.protocol.name}, ` +
			`sysid: ${this.header.sysid}, ` +
			`compid: ${this.header.compid}, ` +
			`msgid: ${this.header.msgid}, ` +
			`seq: ${this.header.seq}, ` +
			`plen: ${this.header.payloadLength}, ` +
			`crc: ${hex(this.crc, 4)}` +
			this.signatureToString(this.signature) +
			')'
		);
	}

	private signatureToString(signature?: MavLinkPacketSignature | null) {
		return signature ? `, ${signature.toString()}` : '';
	}
}

/**
 * A transform stream that takes a buffer with data and converts it to MavLinkPacket object
 */
export class MavLinkPacketParser {
	constructor() {}

	private getProtocol(buffer: DataView): MavLinkProtocol {
		const startByte = buffer.getUint8(0);
		switch (startByte) {
			case MavLinkProtocolV1.START_BYTE:
				return new MavLinkProtocolV1();
			case MavLinkProtocolV2.START_BYTE:
				return new MavLinkProtocolV2();
			default:
				throw new Error(`Unknown protocol '${hex(startByte)}'`);
		}
	}

	parse({ buffer = new DataView([]), timestamp = null, ...rest } = {}, encoding: string) {
		const protocol = this.getProtocol(buffer);
		const header = protocol.header(buffer, timestamp || undefined);
		const payload = protocol.payload(buffer);
		const crc = protocol.crc(buffer);
		const signature =
			protocol instanceof MavLinkProtocolV2 ? protocol.signature(buffer, header) : null;

		const packet = new MavLinkPacket(buffer, header, payload, crc, protocol, signature);

		return packet;
	}
}

function setUintLE(view: DataView, value: number, offset: number, byteLength: number): void {
	for (let i = 0; i < byteLength; i++) {
		view.setUint8(offset + i, value & 0xff);
		value >>>= 8;
	}
}

function getUintLE(view: DataView, offset: number, byteLength: number): number {
	let value = 0;
	for (let i = 0; i < byteLength; i++) {
		value += view.getUint8(offset + i) * 2 ** (8 * i);
	}
	return value;
}

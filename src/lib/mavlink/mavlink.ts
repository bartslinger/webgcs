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

import { type uint8_t, type uint16_t } from 'mavlink-mappings';
import { MSG_ID_MAGIC_NUMBER } from 'mavlink-mappings';
import { MavLinkData, type MavLinkDataConstructor } from 'mavlink-mappings';
import { hex, x25crc } from './utils.js';
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
	abstract payload(buffer: DataView): ArrayBuffer | SharedArrayBuffer;

	/**
	 * Deserialize payload into actual data class
	 */
	data<T extends MavLinkData>(payload: DataView, clazz: MavLinkDataConstructor<T>): T {
		//console.trace('Deserializing', clazz.MSG_NAME, 'with payload of size', payload.byteLength);

		const instance = new clazz();
		let payloadLength = payload.byteLength;
		// Pad the payload if it is trimmed
		// https://mavlink.io/en/guide/serialization.html
		// MAVLink 2 implementations must truncate any empty (zero-filled)
		// bytes at the end of the serialized payload before it is sent.
		if (payloadLength < clazz.PAYLOAD_LENGTH) {
			const src = new Uint8Array(payload.buffer, payload.byteOffset, payloadLength);
			const paddedBuffer = new Uint8Array(clazz.PAYLOAD_LENGTH);
			paddedBuffer.set(src);
			payload = new DataView(paddedBuffer.buffer);
		}

		for (const field of clazz.FIELDS) {
			const fieldLength = field.length === 0 ? field.size : field.length * field.size;
			const deserialize = DESERIALIZERS[field.type];
			if (!deserialize) {
				throw new Error(`Unknown field type ${field.type}`);
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
		//console.trace('Serializing message (seq:', seq, ')');

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
		//console.trace('Reading header from buffer (len:', buffer.byteLength, ')');

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
		//console.trace('Reading crc from buffer (len:', buffer.byteLength, ')');

		const plen = buffer.getUint8(1);
		return buffer.getUint16(MavLinkProtocolV1.PAYLOAD_OFFSET + plen, true);
	}

	payload(buffer: DataView): ArrayBuffer | SharedArrayBuffer {
		//console.trace('Reading payload from buffer (len:', buffer.byteLength, ')');

		const plen = buffer.getUint8(1);
		const payload = buffer.buffer.slice(
			MavLinkProtocolV1.PAYLOAD_OFFSET,
			MavLinkProtocolV1.PAYLOAD_OFFSET + plen
		);
		return payload;
		// const padding = DataView.from(new Uint8Array(255 - payload.length));
		// return DataView.concat([payload, padding]);
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
		//console.trace('Serializing message (seq:', seq, ')');

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
		//console.trace('Signing message');

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
		//console.trace('Reading header from buffer (len:', buffer.byteLength, ')');

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
		//console.trace('Reading crc from buffer (len:', buffer.byteLength, ')');

		const plen = buffer.getUint8(1);
		return buffer.getUint16(MavLinkProtocolV2.PAYLOAD_OFFSET + plen, true);
	}

	payload(buffer: DataView): ArrayBuffer | SharedArrayBuffer {
		//console.trace('Reading payload from buffer (len:', buffer.byteLength, ')');

		const plen = buffer.getUint8(1);
		const payload = buffer.buffer.slice(
			MavLinkProtocolV2.PAYLOAD_OFFSET,
			MavLinkProtocolV2.PAYLOAD_OFFSET + plen
		);

		return payload;
		// const padding = DataView.from(new Uint8Array(255 - payload.length));
		// return DataView.concat([payload, padding]);
	}

	signature(buffer: DataView, header: MavLinkPacketHeader): MavLinkPacketSignature | null {
		//console.trace('Reading signature from buffer (len:', buffer.byteLength, ')');

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
		readonly buffer: ArrayBuffer,
		readonly header: MavLinkPacketHeader = new MavLinkPacketHeader(),
		readonly payload: ArrayBuffer | SharedArrayBuffer = new ArrayBuffer(0),
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

	parse({ buffer = new ArrayBuffer(), timestamp = null, ...rest } = {}): MavLinkPacket {
		const view = new DataView(buffer);
		const protocol = this.getProtocol(view);
		const header = protocol.header(view, timestamp || undefined);
		const payload = protocol.payload(view);
		const crc = protocol.crc(view);
		const signature =
			protocol instanceof MavLinkProtocolV2 ? protocol.signature(view, header) : null;

		const packet = new MavLinkPacket(buffer, header, payload, crc, protocol, signature);

		return packet;
	}
}

/**
 * This enum describes the different ways validation of a buffer can end
 */
enum PacketValidationResult {
	VALID,
	INVALID,
	UNKNOWN
}

/**
 * A transform stream that splits the incoming data stream into chunks containing full MavLink messages
 */
export class MavLinkPacketSplitter {
	private buffer = new ArrayBuffer(0);
	private onCrcError: (() => void) | null = null;
	private readonly magicNumbers: Record<string, number>;
	private timestamp: bigint | null = null;
	private _validPackagesCount = 0;
	private _unknownPackagesCount = 0;
	private _invalidPackagesCount = 0;

	/**
	 * @param opts options to pass on to the Transform constructor
	 * @param verbose print diagnostic information
	 * @param onCrcError callback executed if there is a CRC error (mostly for debugging)
	 */
	constructor(
		opts = {},
		{
			onCrcError = () => {},
			magicNumbers = MSG_ID_MAGIC_NUMBER
		}: {
			onCrcError?: null;
			magicNumbers?: Record<string, number>;
		} = {}
	) {
		this.onCrcError = onCrcError;
		this.magicNumbers = magicNumbers;
	}

	parse(chunk: ArrayBuffer) {
		const result: ArrayBuffer[] = [];
		const combined = new Uint8Array(this.buffer.byteLength + chunk.byteLength);
		combined.set(new Uint8Array(this.buffer), 0);
		combined.set(new Uint8Array(chunk), this.buffer.byteLength);
		this.buffer = combined.buffer;

		while (this.buffer.byteLength > 0) {
			const offset = this.findStartOfPacket(this.buffer);
			if (offset === null) {
				// start of the package was not found - need more data
				break;
			}

			// if the current offset is exactly the size of the timestamp field from tlog then read it.
			if (offset >= 8) {
				const view = new DataView(this.buffer);
				this.timestamp = view.getBigUint64(offset - 8, false) / 1000n;
			} else {
				this.timestamp = null;
			}
			// fast-forward the buffer to the first start byte
			if (offset > 0) {
				this.buffer = this.buffer.slice(offset);
			}

			console.debug('Found potential packet start at', offset);

			// get protocol this buffer is encoded with
			const Protocol = this.getPacketProtocol(this.buffer);

			console.debug('Packet protocol is', Protocol.NAME);

			// check if the buffer contains at least the minimum size of data
			if (this.buffer.byteLength < Protocol.PAYLOAD_OFFSET + MavLinkProtocol.CHECKSUM_LENGTH) {
				// current buffer shorter than the shortest message - skipping
				console.debug('Current buffer shorter than the shortest message - skipping');
				break;
			}

			// check if the current buffer contains the entire message
			const expectedBufferLength = this.readPacketLength(this.buffer, Protocol);
			console.debug(
				'Expected buffer length:',
				expectedBufferLength,
				`(${hex(expectedBufferLength)})`
			);
			if (this.buffer.byteLength < expectedBufferLength) {
				// current buffer is not fully retrieved yet - skipping
				console.debug('Current buffer is not fully retrieved yet - skipping');
				break;
			} else {
				console.debug(
					'Current buffer length:',
					this.buffer.byteLength,
					`(${hex(this.buffer.byteLength, 4)})`
				);
			}

			// retrieve the buffer based on payload size
			const buffer = this.buffer.slice(0, expectedBufferLength);
			console.debug(
				'Recognized buffer length:',
				buffer.byteLength,
				`(${hex(buffer.byteLength, 2)})`
			);

			switch (this.validatePacket(buffer, Protocol)) {
				case PacketValidationResult.VALID:
					console.debug('Found a valid packet');
					this._validPackagesCount++;
					result.push(buffer);
					// this.push({ buffer, timestamp: this.timestamp });
					// truncate the buffer to remove the current message
					this.buffer = this.buffer.slice(expectedBufferLength);
					break;
				case PacketValidationResult.INVALID:
					console.debug('Found an invalid packet - skipping');
					this._invalidPackagesCount++;
					// truncate the buffer to remove the wrongly identified STX
					this.buffer = this.buffer.slice(1);
					break;
				case PacketValidationResult.UNKNOWN:
					console.debug('Found an unknown packet - skipping');
					this._unknownPackagesCount++;
					// truncate the buffer to remove the current message
					this.buffer = this.buffer.slice(expectedBufferLength);
					break;
			}
		}
		return result;
	}

	protected findStartOfPacket(buffer: ArrayBuffer, offset: number = 0) {
		const view = new Uint8Array(buffer);
		const stxv1 = view.indexOf(MavLinkProtocolV1.START_BYTE, offset);
		const stxv2 = view.indexOf(MavLinkProtocolV2.START_BYTE, offset);

		if (stxv1 >= 0 && stxv2 >= 0) {
			// in the current buffer both STX v1 and v2 are found - get the first one
			if (stxv1 < stxv2) {
				return stxv1;
			} else {
				return stxv2;
			}
		} else if (stxv1 >= 0) {
			// in the current buffer STX v1 is found
			return stxv1;
		} else if (stxv2 >= 0) {
			// in the current buffer STX v2 is found
			return stxv2;
		} else {
			// no STX found
			return null;
		}
	}

	private getPacketProtocol(buffer: ArrayBuffer) {
		const view = new DataView(buffer);
		return KNOWN_PROTOCOLS_BY_STX[view.getUint8(0)] || null;
	}

	private readPacketLength(buffer: ArrayBuffer, Protocol: MavLinkProtocolConstructor) {
		// check if the current buffer contains the entire message
		const view = new DataView(buffer);
		const payloadLength = view.getUint8(1);
		return (
			Protocol.PAYLOAD_OFFSET +
			payloadLength +
			MavLinkProtocol.CHECKSUM_LENGTH +
			(this.isV2Signed(buffer) ? MavLinkPacketSignature.SIGNATURE_LENGTH : 0)
		);
	}

	private validatePacket(buffer: ArrayBuffer, Protocol: MavLinkProtocolConstructor) {
		const view = new DataView(buffer);
		const protocol = new Protocol();
		const header = protocol.header(view);
		const magic = this.magicNumbers[header.msgid];
		if (magic !== null && magic !== undefined) {
			const crc = protocol.crc(view);
			const trim = this.isV2Signed(buffer)
				? MavLinkPacketSignature.SIGNATURE_LENGTH + MavLinkProtocol.CHECKSUM_LENGTH
				: MavLinkProtocol.CHECKSUM_LENGTH;
			const crc2 = x25crc(buffer, 1, trim, magic);
			if (crc === crc2) {
				// this is a proper message that is known and has been validated for corrupted data
				return PacketValidationResult.VALID;
			} else {
				// CRC mismatch
				const message = [
					`CRC error; expected: ${crc2} (${hex(crc2, 4)}), got ${crc} (${hex(crc, 4)});`,
					`msgid: ${header.msgid} (${hex(header.msgid)}),`,
					`seq: ${header.seq} (${hex(header.seq)}),`,
					`plen: ${header.payloadLength} (${hex(header.payloadLength)}),`,
					`magic: ${magic} (${hex(magic)})`
				];
				console.warn(message.join(' '));
				if (this.onCrcError) this.onCrcError(buffer);

				return PacketValidationResult.INVALID;
			}
		} else {
			// unknown message (as in not generated from the XML sources)
			console.debug(`Unknown message with id ${header.msgid} (magic number not found) - skipping`);

			return PacketValidationResult.UNKNOWN;
		}
	}

	/**
	 * Checks if the buffer contains the entire message with signature
	 *
	 * @param buffer buffer with the message
	 */
	private isV2Signed(buffer: ArrayBuffer) {
		const view = new DataView(buffer);
		const protocol = view.getUint8(0);
		if (protocol === MavLinkProtocolV2.START_BYTE) {
			const flags = view.getUint8(2);
			return !!(flags & MavLinkProtocolV2.IFLAG_SIGNED);
		}
	}

	/**
	 * Number of invalid packages
	 */
	get validPackages() {
		return this._validPackagesCount;
	}

	/**
	 * Reset the number of valid packages
	 */
	resetValidPackagesCount() {
		this._validPackagesCount = 0;
	}

	/**
	 * Number of invalid packages
	 */
	get invalidPackages() {
		return this._invalidPackagesCount;
	}

	/**
	 * Reset the number of invalid packages
	 */
	resetInvalidPackagesCount() {
		this._invalidPackagesCount = 0;
	}

	/**
	 * Number of invalid packages
	 */
	get unknownPackagesCount() {
		return this._unknownPackagesCount;
	}

	/**
	 * Reset the number of invalid packages
	 */
	resetUnknownPackagesCount() {
		this._unknownPackagesCount = 0;
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

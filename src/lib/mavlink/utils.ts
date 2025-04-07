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

/**
 * Convert a number to hexadecimal representation with a minimum
 * number of characters and optional prefix (0x by default)
 *
 * @param n value to convert
 * @param len length of the converted string (without prefix)
 * @param prefix prefix to prepend the generated string with
 */
export function hex(n: number, len: number = 2, prefix = '0x') {
	return `${prefix}${n.toString(16).padStart(len, '0')}`;
}

/**
 * Dump a buffer in a readable form
 *
 * @param buffer buffer to dump
 * @param lineWidth width of the line, in bytes of buffer
 */
export function dump(buffer: Buffer, lineWidth = 16) {
	const line = [];
	let address = 0;
	for (let i = 0; i < buffer.length; i++) {
		line.push(hex(buffer[i], 2, '0x'));
		if (line.length === lineWidth) {
			console.log(hex(address, 4), '|', line.join(' '));
			address += lineWidth;
			line.length = 0;
		}
	}
	if (line.length > 0) {
		console.log(hex(address, 4), '|', line.join(' '));
	}
}

/**
 * Sleep for a given number of milliseconds
 *
 * @param {number} ms of milliseconds to sleep
 */
export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute a callback every <code>interval</code>ms and if it will not return
 * a truthy value in the <code>timeout<code>ms then throw a Timeout exception.
 * This is a very useful utility that will allow you to specify how often
 * a particular expression should be evaluated and how long will it take to end
 * the execution without success. Great for time-sensitive operations.
 *
 * @param cb callback to call every <code>interval</code>ms. Waiting stops if the callback returns a truthy value.
 * @param timeout number of milliseconds that need to pass before the Timeout exception is thrown
 * @param interval number of milliseconds before re-running the callback
 */
export async function waitFor<T>(cb: () => T, timeout = 10000, interval = 100): Promise<T> {
	return new Promise((resolve, reject) => {
		const timeoutTimer = setTimeout(() => {
			cleanup();
			reject('Timeout');
		}, timeout);

		const intervalTimer = setInterval(() => {
			try {
				const result = cb();
				if (result) {
					cleanup();
					resolve(result);
				}
			} catch (error) {
				cleanup();
				reject(error);
			}
		}, interval);

		const cleanup = () => {
			clearTimeout(timeoutTimer);
			clearInterval(intervalTimer);
		};
	});
}

/**
 * Calculate the CRC checksum of a packet.
 * The CRC algorithm is based on the following settings using the polycrc port to JavaScript:
 *
 * import { crc } from 'polycrc'
 * const x25crc = crc(16, 0x1021, 0, 0xffff, false)
 */
export function x25crc(input: ArrayBuffer, start = 0, trim = 0, magic: number | null = null) {
	const buffer = new Uint8Array(input);
	let crc = 0xffff;

	const digest = (byte: number) => {
		let tmp = (byte & 0xff) ^ (crc & 0xff);
		tmp ^= tmp << 4;
		tmp &= 0xff;
		crc = (crc >> 8) ^ (tmp << 8) ^ (tmp << 3) ^ (tmp >> 4);
		crc &= 0xffff;
	};

	for (let i = start; i < buffer.byteLength - trim; i++) {
		digest(buffer[i]);
	}

	if (magic !== null) {
		digest(magic);
	}

	return crc;
}

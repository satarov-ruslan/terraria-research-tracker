class BinaryReader {
    constructor(bytes) {
        this.bytes = bytes;
        this.offset = 0;
    }

    getBuffer(from) {
        return this.bytes.slice(from)
    }

    getOffset() {
        return this.offset
    }

    readInt32() {
        const v =
            this.bytes[this.offset] |
            (this.bytes[this.offset + 1] << 8) |
            (this.bytes[this.offset + 2] << 16) |
            (this.bytes[this.offset + 3] << 24);
        this.offset += 4;
        return v;
    }

    readInt64() {
        let v = 0n;
        for (let i = 0; i < 8; i++) {
            v |= BigInt(this.bytes[this.offset + i]) << (8n * BigInt(i));
        }
        this.offset += 8;

        // Convert to signed if MSB is set
        if (v & (1n << 63n)) {
            v = v - (1n << 64n);
        }
        return v;
    }

    readUInt32() {
        const v =
            (this.bytes[this.offset]) |
            (this.bytes[this.offset + 1] << 8) |
            (this.bytes[this.offset + 2] << 16) |
            (this.bytes[this.offset + 3] << 24);
        this.offset += 4;
        return v >>> 0; // force unsigned
    }

    readUInt64() {
        let result = 0n;
        for (let i = 0; i < 8; i++) {
            result |= BigInt(this.bytes[this.offset + i]) << (8n * BigInt(i));
        }
        this.offset += 8;
        return result;
    }

    readSingle() {
        const view = new DataView(this.bytes.buffer, this.offset, 4);
        const v = view.getFloat32(0, true);
        this.offset += 4;
        return v;
    }

    readByte() {
        return this.bytes[this.offset++];
    }

    readBoolean() {
        return this.readByte() !== 0;
    }

    readString() {
        let length = 0;
        let shift = 0;
        let b;

        do {
            b = this.readByte();
            length |= (b & 0x7f) << shift;
            shift += 7;
        } while (b & 0x80);

        const strBytes = this.bytes.slice(this.offset, this.offset + length);
        this.offset += length;
        return new TextDecoder("utf-8").decode(strBytes);
    }

    readRGB() {
        const r = this.readByte()
        const g = this.readByte()
        const b = this.readByte()
        return (
            "#" +
            r.toString(16).padStart(2, "0") +
            g.toString(16).padStart(2, "0") +
            b.toString(16).padStart(2, "0")
        )
    }
}

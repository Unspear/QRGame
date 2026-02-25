#include "Coder.hpp"

Encoder::Encoder() {
}

void Encoder::Normalize(FILE* stream) {
	while ((low ^ (low + range)) < TOP || range < BOT && ((range = -low & (BOT - 1)), 1)) {
        _PPMD_E_PUTC(low >> 24, stream);
        range <<= 8;
        low <<= 8;
    }
}
void Encoder::EncodeSymbol() {
    low += subRange.LowCount * (range /= subRange.scale);
	range *= subRange.HighCount - subRange.LowCount;
}

void Encoder::ShiftEncodeSymbol(UINT SHIFT) {
    low += subRange.LowCount * (range >>= SHIFT);
	range *= subRange.HighCount - subRange.LowCount;
}

void Encoder::Flush(FILE* stream) {
    for (UINT i = 0; i < 4; i++) {
        _PPMD_E_PUTC(low >> 24, stream);
        low <<= 8;
    }
}

Decoder::Decoder(FILE* stream) {
    for (UINT i = 0; i < 4; i++) {
        code = (code << 8) | _PPMD_D_GETC(stream);
    }
}

void Decoder::Normalize(FILE* stream) {
    while ((low ^ (low + range)) < TOP || range < BOT && ((range = -low & (BOT - 1)), 1)) {
        code = (code << 8) | _PPMD_D_GETC(stream);
        range <<= 8;
        low <<= 8;
    }
}

UINT Decoder::GetCurrentCount() {
	return (code - low) / (range /= subRange.scale);
}

UINT Decoder::GetCurrentShiftCount(UINT SHIFT) {
	return (code - low) / (range >>= SHIFT);
}

void Decoder::RemoveSubrange() {
    low += range * subRange.LowCount;
	range *= subRange.HighCount - subRange.LowCount;
}

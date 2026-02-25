#include "Coder.hpp"

Encoder::Encoder() {
}

void Encoder::Normalize(FILE* stream) {
	while ((ariLow ^ (ariLow + ariRange)) < TOP || ariRange < BOT && ((ariRange = -ariLow & (BOT - 1)), 1)) {
        _PPMD_E_PUTC(ariLow >> 24, stream);
        ariRange <<= 8;
        ariLow <<= 8;
    }
}
void Encoder::EncodeSymbol() {
    ariLow += ariSubRange.LowCount * (ariRange /= ariSubRange.scale);
	ariRange *= ariSubRange.HighCount - ariSubRange.LowCount;
}

void Encoder::ShiftEncodeSymbol(UINT SHIFT) {
    ariLow += ariSubRange.LowCount * (ariRange >>= SHIFT);
	ariRange *= ariSubRange.HighCount - ariSubRange.LowCount;
}

void Encoder::Flush(FILE* stream) {
    for (UINT i = 0; i < 4; i++) {
        _PPMD_E_PUTC(ariLow >> 24, stream);
        ariLow <<= 8;
    }
}

Decoder::Decoder(FILE* stream) {
    for (UINT i = 0; i < 4; i++) {
        ariCode = (ariCode << 8) | _PPMD_D_GETC(stream);
    }
}

void Decoder::Normalize(FILE* stream) {
    while ((ariLow ^ (ariLow + ariRange)) < TOP || ariRange < BOT && ((ariRange = -ariLow & (BOT - 1)), 1)) {
        ariCode = (ariCode << 8) | _PPMD_D_GETC(stream);
        ariRange <<= 8;
        ariLow <<= 8;
    }
}

UINT Decoder::GetCurrentCount() {
	return (ariCode - ariLow) / (ariRange /= ariSubRange.scale);
}

UINT Decoder::GetCurrentShiftCount(UINT SHIFT) {
	return (ariCode - ariLow) / (ariRange >>= SHIFT);
}

void Decoder::RemoveSubrange() {
    ariLow += ariRange * ariSubRange.LowCount;
	ariRange *= ariSubRange.HighCount - ariSubRange.LowCount;
}

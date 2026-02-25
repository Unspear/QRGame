/****************************************************************************
 *  This file is part of PPMd project                                       *
 *  Contents: 'Carryless rangecoder' by Dmitry Subbotin                     *
 *  Comments: this implementation is claimed to be a public domain          *
 ****************************************************************************/
/**********************  Original text  *************************************
////////   Carryless rangecoder (c) 1999 by Dmitry Subbotin   ////////

typedef unsigned int  uint;
typedef unsigned char uc;

#define  DO(n)     for (int _=0; _<n; _++)
#define  TOP       (1<<24)
#define  BOT       (1<<16)


class RangeCoder
{
 uint  low, code, range, passed;
 FILE  *f;

 void OutByte (uc c)           { passed++; fputc(c,f); }
 uc   InByte ()                { passed++; return fgetc(f); }

public:

 uint GetPassed ()             { return passed; }
 void StartEncode (FILE *F)    { f=F; passed=low=0;  range= (uint) -1; }
 void FinishEncode ()          { DO(4)  OutByte(low>>24), low<<=8; }
 void StartDecode (FILE *F)    { passed=low=code=0;  range= (uint) -1;
								 f=F; DO(4) code= code<<8 | InByte();
							   }

 void Encode (uint cumFreq, uint freq, uint totFreq) {
	assert(cumFreq+freq<totFreq && freq && totFreq<=BOT);
	low  += cumFreq * (range/= totFreq);
	range*= freq;
	while ((low ^ low+range)<TOP || range<BOT && ((range= -low & BOT-1),1))
	   OutByte(low>>24), range<<=8, low<<=8;
 }

 uint GetFreq (uint totFreq) {
   uint tmp= (code-low) / (range/= totFreq);
   if (tmp >= totFreq)  throw ("Input data corrupt"); // or force it to return
   return tmp;                                         // a valid value :)
 }

 void Decode (uint cumFreq, uint freq, uint totFreq) {
	assert(cumFreq+freq<totFreq && freq && totFreq<=BOT);
	low  += cumFreq*range;
	range*= freq;
	while ((low ^ low+range)<TOP || range<BOT && ((range= -low & BOT-1),1))
	   code= code<<8 | InByte(), range<<=8, low<<=8;
 }
};
*****************************************************************************/

static struct SUBRANGE {
	DWORD LowCount, HighCount, scale;
} ariSubRange;

enum { TOP = 1 << 24, BOT = 1 << 15 };

static DWORD ariLow, ariCode, ariRange;

inline void ariInitEncoder() {
	ariLow = 0;
	ariRange = DWORD(-1);
}

#define ARI_ENC_NORMALIZE(stream) \
	{ \
		while ((ariLow ^ (ariLow + ariRange)) < TOP || ariRange < BOT && ((ariRange = -ariLow & (BOT - 1)), 1)) { \
			_PPMD_E_PUTC(ariLow >> 24, stream); \
			ariRange <<= 8; \
			ariLow <<= 8; \
		} \
	}

inline void ariEncodeSymbol() {
	ariLow += ariSubRange.LowCount * (ariRange /= ariSubRange.scale);
	ariRange *= ariSubRange.HighCount - ariSubRange.LowCount;
}

inline void ariShiftEncodeSymbol(UINT SHIFT) {
	ariLow += ariSubRange.LowCount * (ariRange >>= SHIFT);
	ariRange *= ariSubRange.HighCount - ariSubRange.LowCount;
}

#define ARI_FLUSH_ENCODER(stream) \
	{ \
		for (UINT i = 0; i < 4; i++) { \
			_PPMD_E_PUTC(ariLow >> 24, stream); \
			ariLow <<= 8; \
		} \
	}
#define ARI_INIT_DECODER(stream) \
	{ \
		ariLow = ariCode = 0; \
		ariRange = DWORD(-1); \
		for (UINT i = 0; i < 4; i++) \
			ariCode = (ariCode << 8) | _PPMD_D_GETC(stream); \
	}
#define ARI_DEC_NORMALIZE(stream) \
	{ \
		while ((ariLow ^ (ariLow + ariRange)) < TOP || ariRange < BOT && ((ariRange = -ariLow & (BOT - 1)), 1)) { \
			ariCode = (ariCode << 8) | _PPMD_D_GETC(stream); \
			ariRange <<= 8; \
			ariLow <<= 8; \
		} \
	}

inline UINT ariGetCurrentCount() {
	return (ariCode - ariLow) / (ariRange /= ariSubRange.scale);
}

inline UINT ariGetCurrentShiftCount(UINT SHIFT) {
	return (ariCode - ariLow) / (ariRange >>= SHIFT);
}

inline void ariRemoveSubrange() {
	ariLow += ariRange * ariSubRange.LowCount;
	ariRange *= ariSubRange.HighCount - ariSubRange.LowCount;
}

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
#include "PPMdType.h"

struct Coder {
	enum { TOP = 1 << 24, BOT = 1 << 15 };
	struct SUBRANGE {
		DWORD LowCount, HighCount, scale;
	} ariSubRange;
	DWORD ariLow = 0;
	DWORD ariCode = 0; 
	DWORD ariRange = DWORD(-1);
};

struct Encoder : Coder {
	Encoder();
	void Normalize(FILE* stream);
	void EncodeSymbol();
	void ShiftEncodeSymbol(UINT SHIFT);
	void Flush(FILE* stream);
};

struct Decoder : Coder {
	Decoder(FILE* stream);
	void Normalize(FILE* stream);
	UINT GetCurrentCount();
	UINT GetCurrentShiftCount(UINT SHIFT);
	void RemoveSubrange();
};
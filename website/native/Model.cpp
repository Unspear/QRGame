/****************************************************************************
 *  This file is part of PPMd project                                       *
 *  Written and distributed to public domain by Dmitry Shkarin 1997,        *
 *  1999-2001, 2010                                                         *
 *  Contents: PPMII model description and encoding/decoding routines        *
 ****************************************************************************/
#include <string.h>
#include "PPMdType.h"
#include "Coder.hpp"
#include "SubAlloc.hpp"
#include "api.hpp"

enum MR_METHOD { MRM_RESTART, MRM_CUT_OFF, MRM_FREEZE };

enum {
	UP_FREQ = 5,
	INT_BITS = 7,
	PERIOD_BITS = 7,
	TOT_BITS = INT_BITS + PERIOD_BITS,
	INTERVAL = 1 << INT_BITS,
	BIN_SCALE = 1 << TOT_BITS,
	MAX_FREQ = 124,
	O_BOUND = 9
};

#pragma pack(1)

struct SEE2_CONTEXT {// SEE-contexts for PPM-contexts with masked symbols
	WORD Summ;
	BYTE Shift, Count;

	void init(UINT InitVal) {
		Summ = InitVal << (Shift = PERIOD_BITS - 4);
		Count = 7;
	}

	UINT getMean() {
		UINT RetVal = (Summ >> Shift);
		Summ -= RetVal;
		return RetVal + (RetVal == 0);
	}

	void update() {
		if (Shift < PERIOD_BITS && --Count == 0) {
			Summ += Summ;
			Count = 3 << Shift++;
		}
	}
} _PACK_ATTR;

struct PPM_CONTEXT;

struct PPM_STATE {
	BYTE Symbol, Freq;
	PPM_CONTEXT* Successor;
} _PACK_ATTR;

struct PPM_CONTEXT {// Notes:
	BYTE NumStats, Flags;// 1. NumStats & NumMasked contain
	WORD SummFreq;//  number of symbols minus 1
	PPM_STATE* Stats;
	PPM_CONTEXT* Suffix;
	void refresh(int OldNU, BOOL Scale);
	// When only one stat is needed, reinterpret SummFreq and the pointer as a PPM_STATE
	PPM_STATE& oneState() const {
		return (PPM_STATE&)SummFreq;
	}
} _PACK_ATTR;
// Expected size for allocations
static_assert(sizeof(PPM_CONTEXT) == 12);
// Make sure there is enough room for oneState()
static_assert(sizeof(WORD) + sizeof(PPM_STATE*) >= sizeof(PPM_STATE));

#pragma pack()

// Constants
static BYTE NS2BSIndx[256], QTable[260];
static SEE2_CONTEXT DummySEE2Cont;


struct Model {
	Model(int MaxOrder, MR_METHOD MRMethod);
	void StartModelRare();
	void RestoreModelRare(PPM_CONTEXT* pc1, PPM_CONTEXT* MinContext, PPM_CONTEXT* FSuccessor);
	PPM_CONTEXT* ReduceOrder(PPM_STATE* p, PPM_CONTEXT* pc);
	PPM_CONTEXT* CreateSuccessors(BOOL Skip, PPM_STATE* p, PPM_CONTEXT* pc);
	void UpdateModel(PPM_CONTEXT* MinContext);
	void ClearMask(_PPMD_FILE* EncodedFile, _PPMD_FILE* DecodedFile);
	// PPM Context
	inline void encodeBinSymbol(PPM_CONTEXT* context, Encoder& encoder, int symbol);//   BCDE   successor
	inline void encodeSymbol1(PPM_CONTEXT* context, Encoder& encoder, int symbol);// other orders:
	inline void encodeSymbol2(PPM_CONTEXT* context, Encoder& encoder, int symbol);//   BCD    context
	inline void decodeBinSymbol(PPM_CONTEXT* context, Decoder& decoder);//    CD    suffix
	inline void decodeSymbol1(PPM_CONTEXT* context, Decoder& decoder);//   BCDE   successor
	inline void decodeSymbol2(PPM_CONTEXT* context, Decoder& decoder);
	inline void update1(PPM_CONTEXT* context, PPM_STATE* p);
	inline void update2(PPM_CONTEXT* context, PPM_STATE* p);
	inline SEE2_CONTEXT* makeEscFreq2(PPM_CONTEXT* context, Coder& coder);
	void rescale(PPM_CONTEXT* context);
	PPM_CONTEXT* cutOff(PPM_CONTEXT* context, int Order);
	PPM_CONTEXT* removeBinConts(PPM_CONTEXT* context, int Order);
	// Vars
	PPM_CONTEXT* MaxContext;
	PPM_STATE* FoundState;// found next state transition
	int InitEsc, OrderFall, RunLength, InitRL, MaxOrder;
	BYTE CharMask[256], NumMasked, PrevSuccess, EscCount, PrintCount;
	MR_METHOD MRMethod;
	SEE2_CONTEXT SEE2Cont[24][32];
	WORD BinSumm[25][64];// binary SEE-contexts
};

inline void SWAP(PPM_STATE& s1, PPM_STATE& s2) {
	PPM_STATE temp = s1;
	s1 = s2;
	s2 = temp;
}

struct PPMD_STARTUP {
	inline PPMD_STARTUP();
} PPMd_StartUp;

inline PPMD_STARTUP::PPMD_STARTUP()// constants initialization
{
	UINT i, k, m, Step;
	for (i = 0, k = 1; i < N1; i++, k += 1) {
		Indx2Units[i] = k;
	}
	for (k++; i < N1 + N2; i++, k += 2) {
		Indx2Units[i] = k;
	}
	for (k++; i < N1 + N2 + N3; i++, k += 3) {
		Indx2Units[i] = k;
	}
	for (k++; i < N1 + N2 + N3 + N4; i++, k += 4) {
		Indx2Units[i] = k;
	}
	for (k = i = 0; k < 128; k++) {
		i += (Indx2Units[i] < k + 1);
		Units2Indx[k] = i;
	}
	NS2BSIndx[0] = 2 * 0;
	NS2BSIndx[1] = 2 * 1;
	memset(NS2BSIndx + 2, 2 * 2, 9);
	memset(NS2BSIndx + 11, 2 * 3, 256 - 11);
	for (i = 0; i < UP_FREQ; i++) {
		QTable[i] = i;
	}
	for (m = i = UP_FREQ, k = Step = 1; i < 260; i++) {
		QTable[i] = m;
		if (!--k) {
			k = ++Step;
			m++;
		}
	}
	(DWORD&)DummySEE2Cont = PPMdSignature;
	
}

Model::Model(int MaxOrder, MR_METHOD MRMethod) : MaxOrder(MaxOrder), MRMethod(MRMethod) {
	StartModelRare();
}

void Model::StartModelRare() {
	UINT i, k, m;
	memset(CharMask, 0, sizeof(CharMask));
	EscCount = PrintCount = 1;
	if (MaxOrder < 2) {// we are in solid mode
		OrderFall = MaxOrder;
		for (PPM_CONTEXT* pc = MaxContext; pc->Suffix != NULL; pc = pc->Suffix) {
			OrderFall--;
		}
		return;
	}
	OrderFall = MaxOrder;
	InitSubAllocator();
	RunLength = InitRL = -((MaxOrder < 12) ? MaxOrder : 12) - 1;
	// Alloc root context and add order 0 for every symbol
	MaxContext = (PPM_CONTEXT*)AllocContext();
	MaxContext->Suffix = NULL;
	MaxContext->SummFreq = (MaxContext->NumStats = 255) + 2;
	MaxContext->Stats = (PPM_STATE*)AllocUnits(256 / 2);
	for (PrevSuccess = i = 0; i < 256; i++) {
		MaxContext->Stats[i].Symbol = i;
		MaxContext->Stats[i].Freq = 1;
		MaxContext->Stats[i].Successor = NULL;
	}
	static const WORD InitBinEsc[] = {0x3CDD, 0x1F3F, 0x59BF, 0x48F3, 0x64A1, 0x5ABC, 0x6632, 0x6051};
	for (i = m = 0; m < 25; m++) {
		while (QTable[i] == m) {
			i++;
		}
		for (k = 0; k < 8; k++) {
			BinSumm[m][k] = BIN_SCALE - InitBinEsc[k] / (i + 1);
		}
		for (k = 8; k < 64; k += 8) {
			memcpy(BinSumm[m] + k, BinSumm[m], 8 * sizeof(WORD));
		}
	}
	for (i = m = 0; m < 24; m++) {
		while (QTable[i + 3] == m + 3) {
			i++;
		}
		SEE2Cont[m][0].init(2 * i + 5);
		for (k = 1; k < 32; k++) {
			SEE2Cont[m][k] = SEE2Cont[m][0];
		}
	}
}

void PPM_CONTEXT::refresh(int OldNU, BOOL Scale) {
	int i = NumStats, EscFreq;
	Scale |= (SummFreq >= 32768);
	PPM_STATE* p = Stats = (PPM_STATE*)ShrinkUnits(Stats, OldNU, (i + 2) >> 1);
	Flags = (Flags & (0x10 + 0x04 * Scale)) + 0x08 * (p->Symbol >= 0x40);
	EscFreq = SummFreq - p->Freq;
	SummFreq = (p->Freq = (p->Freq + Scale) >> Scale);
	do {
		EscFreq -= (++p)->Freq;
		SummFreq += (p->Freq = (p->Freq + Scale) >> Scale);
		Flags |= 0x08 * (p->Symbol >= 0x40);
	} while (--i);
	SummFreq += (EscFreq = (EscFreq + Scale) >> Scale);
}

#define P_CALL(F) (p->Successor = F(p->Successor, Order + 1))

PPM_CONTEXT* Model::cutOff(PPM_CONTEXT* context, int Order) {
	int i, tmp;
	PPM_STATE* p;
	if (!context->NumStats) {
		if ((BYTE*)(p = &context->oneState())->Successor >= UnitsStart) {
			if (Order < MaxOrder) {
				P_CALL(cutOff);
			} else {
				p->Successor = NULL;
			}
			if (!p->Successor && Order > O_BOUND) {
				goto REMOVE;
			}
			return context;
		} else {
		REMOVE:
			SpecialFreeUnit(context);
			return NULL;
		}
	}
	context->Stats = (PPM_STATE*)MoveUnitsUp(context->Stats, tmp = (context->NumStats + 2) >> 1);
	for (p = context->Stats + (i = context->NumStats); p >= context->Stats; p--) {
		if ((BYTE*)p->Successor < UnitsStart) {
			p->Successor = NULL;
			SWAP(*p, context->Stats[i--]);
		} else if (Order < MaxOrder) {
			P_CALL(cutOff);
		} else {
			p->Successor = NULL;
		}
	}
	if (i != context->NumStats && Order) {
		context->NumStats = i;
		p = context->Stats;
		if (i < 0) {
			FreeUnits(p, tmp);
			goto REMOVE;
		} else if (i == 0) {
			context->Flags = (context->Flags & 0x10) + 0x08 * (p->Symbol >= 0x40);
			context->oneState() = *p;
			FreeUnits(p, tmp);
			context->oneState().Freq = (context->oneState().Freq + 11) >> 3;
		} else {
			context->refresh(tmp, context->SummFreq > 16 * i);
		}
	}
	return context;
}

PPM_CONTEXT* Model::removeBinConts(PPM_CONTEXT* context, int Order) {
	PPM_STATE* p;
	if (!context->NumStats) {
		p = &context->oneState();
		if ((BYTE*)p->Successor >= UnitsStart && Order < MaxOrder) {
			P_CALL(removeBinConts);
		} else {
			p->Successor = NULL;
		}
		if (!p->Successor && (!context->Suffix->NumStats || context->Suffix->Flags == 0xFF)) {
			FreeUnits(this, 1);
			return NULL;
		} else {
			return context;
		}
	}
	for (p = context->Stats + context->NumStats; p >= context->Stats; p--) {
		if ((BYTE*)p->Successor >= UnitsStart && Order < MaxOrder) {
			P_CALL(removeBinConts);
		} else {
			p->Successor = NULL;
		}
	}
	return context;
}

void Model::RestoreModelRare(PPM_CONTEXT* pc1, PPM_CONTEXT* MinContext, PPM_CONTEXT* FSuccessor) {
	PPM_CONTEXT* pc;
	PPM_STATE* p;
	for (pc = MaxContext, pText = HeapStart; pc != pc1; pc = pc->Suffix) {
		if (--(pc->NumStats) == 0) {
			pc->Flags = (pc->Flags & 0x10) + 0x08 * (pc->Stats->Symbol >= 0x40);
			p = pc->Stats;
			pc->oneState() = *p;
			SpecialFreeUnit(p);
			pc->oneState().Freq = (pc->oneState().Freq + 11) >> 3;
		} else {
			pc->refresh((pc->NumStats + 3) >> 1, FALSE);
		}
	}
	for (; pc != MinContext; pc = pc->Suffix) {
		if (!pc->NumStats) {
			pc->oneState().Freq -= pc->oneState().Freq >> 1;
		} else if ((pc->SummFreq += 4) > 128 + 4 * pc->NumStats) {
			pc->refresh((pc->NumStats + 2) >> 1, TRUE);
		}
	}
	if (MRMethod > MRM_FREEZE) {
		MaxContext = FSuccessor;
		GlueCount += !(BList[1].Stamp & 1);
	} else if (MRMethod == MRM_FREEZE) {
		while (MaxContext->Suffix) {
			MaxContext = MaxContext->Suffix;
		}
		removeBinConts(MaxContext, 0);
		MRMethod = MR_METHOD(MRMethod + 1);
		GlueCount = 0;
		OrderFall = MaxOrder;
	} else if (MRMethod == MRM_RESTART || GetUsedMemory() < (SubAllocatorSize >> 1)) {
		StartModelRare();
		EscCount = 0;
		PrintCount = 0xFF;
	} else {
		while (MaxContext->Suffix) {
			MaxContext = MaxContext->Suffix;
		}
		do {
			cutOff(MaxContext, 0);
			ExpandTextArea();
		} while (GetUsedMemory() > 3 * (SubAllocatorSize >> 2));
		GlueCount = 0;
		OrderFall = MaxOrder;
	}
}


PPM_CONTEXT* Model::ReduceOrder(PPM_STATE* p, PPM_CONTEXT* pc) {
	PPM_STATE *p1, *ps[MAX_O + 1], **pps = ps;
	PPM_CONTEXT *pc1 = pc, *UpBranch = (PPM_CONTEXT*)pText;
	BYTE tmp, sym = FoundState->Symbol;
	*pps++ = FoundState;
	FoundState->Successor = UpBranch;
	OrderFall++;
	if (p) {
		pc = pc->Suffix;
		goto LOOP_ENTRY;
	}
	for (;;) {
		if (!pc->Suffix) {
			if (MRMethod > MRM_FREEZE) {
			FROZEN:
				do {
					(*--pps)->Successor = pc;
				} while (pps != ps);
				pText = HeapStart + 1;
				OrderFall = 1;
			}
			return pc;
		}
		pc = pc->Suffix;
		if (pc->NumStats) {
			if ((p = pc->Stats)->Symbol != sym) {
				do {
					tmp = p[1].Symbol;
					p++;
				} while (tmp != sym);
			}
			tmp = 2 * (p->Freq < MAX_FREQ - 9);
			p->Freq += tmp;
			pc->SummFreq += tmp;
		} else {
			p = &(pc->oneState());
			p->Freq += (p->Freq < 32);
		}
	LOOP_ENTRY:
		if (p->Successor) {
			break;
		}
		*pps++ = p;
		p->Successor = UpBranch;
		OrderFall++;
	}
	if (MRMethod > MRM_FREEZE) {
		pc = p->Successor;
		goto FROZEN;
	} else if (p->Successor <= UpBranch) {
		p1 = FoundState;
		FoundState = p;
		p->Successor = CreateSuccessors(FALSE, NULL, pc);
		FoundState = p1;
	}
	if (OrderFall == 1 && pc1 == MaxContext) {
		FoundState->Successor = p->Successor;
		pText--;
	}
	return p->Successor;
}

void Model::rescale(PPM_CONTEXT* context) {
	// Frequencies have grown too large so they need to be brought down
	UINT OldNU, Adder, EscFreq, i = context->NumStats;
	PPM_STATE tmp, *p1, *p;
	for (p = FoundState; p != context->Stats; p--) {
		SWAP(p[0], p[-1]);
	}
	p->Freq += 4;
	context->SummFreq += 4;
	EscFreq = context->SummFreq - p->Freq;
	Adder = (OrderFall != 0 || MRMethod > MRM_FREEZE);
	context->SummFreq = (p->Freq = (p->Freq + Adder) >> 1);
	do {
		EscFreq -= (++p)->Freq;
		context->SummFreq += (p->Freq = (p->Freq + Adder) >> 1);
		if (p[0].Freq > p[-1].Freq) {
			tmp = *(p1 = p);
			do {
				p1[0] = p1[-1];
			} while (tmp.Freq > (--p1)[-1].Freq);
			*p1 = tmp;
		}
	} while (--i);
	if (p->Freq == 0) {
		do {
			i++;
		} while ((--p)->Freq == 0);
		EscFreq += i;
		OldNU = (context->NumStats + 2) >> 1;
		if ((context->NumStats -= i) == 0) {
			tmp = *context->Stats;
			tmp.Freq = (2 * tmp.Freq + EscFreq - 1) / EscFreq;
			if (tmp.Freq > MAX_FREQ / 3) {
				tmp.Freq = MAX_FREQ / 3;
			}
			FreeUnits(context->Stats, OldNU);
			context->oneState() = tmp;
			context->Flags = (context->Flags & 0x10) + 0x08 * (tmp.Symbol >= 0x40);
			FoundState = &context->oneState();
			return;
		}
		context->Stats = (PPM_STATE*)ShrinkUnits(context->Stats, OldNU, (context->NumStats + 2) >> 1);
		context->Flags &= ~0x08;
		i = context->NumStats;
		context->Flags |= 0x08 * ((p = context->Stats)->Symbol >= 0x40);
		do {
			context->Flags |= 0x08 * ((++p)->Symbol >= 0x40);
		} while (--i);
	}
	context->SummFreq += (EscFreq -= (EscFreq >> 1));
	context->Flags |= 0x04;
	FoundState = context->Stats;
}

PPM_CONTEXT* Model::CreateSuccessors(BOOL Skip, PPM_STATE* p, PPM_CONTEXT* pc) {
	PPM_CONTEXT ct, *UpBranch = FoundState->Successor;
	PPM_STATE *ps[MAX_O], **pps = ps;
	UINT cf, s0;
	BYTE tmp, sym = FoundState->Symbol;
	if (!Skip) {
		*pps++ = FoundState;
		if (!pc->Suffix) {
			goto NO_LOOP;
		}
	}
	if (p) {
		pc = pc->Suffix;
		goto LOOP_ENTRY;
	}
	do {
		pc = pc->Suffix;
		if (pc->NumStats) {
			if ((p = pc->Stats)->Symbol != sym) {
				do {
					tmp = p[1].Symbol;
					p++;
				} while (tmp != sym);
			}
			tmp = (p->Freq < MAX_FREQ - 9);
			p->Freq += tmp;
			pc->SummFreq += tmp;
		} else {
			p = &(pc->oneState());
			p->Freq += (!pc->Suffix->NumStats & (p->Freq < 24));
		}
	LOOP_ENTRY:
		if (p->Successor != UpBranch) {
			pc = p->Successor;
			break;
		}
		*pps++ = p;
	} while (pc->Suffix);
NO_LOOP:
	if (pps == ps) {
		return pc;
	}
	ct.NumStats = 0;
	ct.Flags = 0x10 * (sym >= 0x40);
	ct.oneState().Symbol = sym = *(BYTE*)UpBranch;
	ct.oneState().Successor = (PPM_CONTEXT*)(((BYTE*)UpBranch) + 1);
	ct.Flags |= 0x08 * (sym >= 0x40);
	if (pc->NumStats) {
		if ((p = pc->Stats)->Symbol != sym) {
			do {
				tmp = p[1].Symbol;
				p++;
			} while (tmp != sym);
		}
		s0 = pc->SummFreq - pc->NumStats - (cf = p->Freq - 1);
		ct.oneState().Freq = 1 + ((2 * cf <= s0) ? (5 * cf > s0) : ((cf + 2 * s0 - 3) / s0));
	} else {
		ct.oneState().Freq = pc->oneState().Freq;
	}
	do {
		PPM_CONTEXT* pc1 = (PPM_CONTEXT*)AllocContext();
		if (!pc1) {
			return NULL;
		}
		((DWORD*)pc1)[0] = ((DWORD*)&ct)[0];
		((DWORD*)pc1)[1] = ((DWORD*)&ct)[1];
		pc1->Suffix = pc;
		(*--pps)->Successor = pc = pc1;
	} while (pps != ps);
	return pc;
}

void Model::UpdateModel(PPM_CONTEXT* MinContext) {
	PPM_STATE* p = NULL;
	PPM_CONTEXT *Successor, *FSuccessor, *pc, *pc1 = MaxContext;
	UINT ns1, ns, cf, sf, s0, FFreq = FoundState->Freq;
	BYTE Flag, sym, FSymbol = FoundState->Symbol;
	FSuccessor = FoundState->Successor;
	pc = MinContext->Suffix;
	if (FFreq < MAX_FREQ / 4 && pc) {
		if (pc->NumStats) {
			if ((p = pc->Stats)->Symbol != FSymbol) {
				do {
					sym = p[1].Symbol;
					p++;
				} while (sym != FSymbol);
				if (p[0].Freq >= p[-1].Freq) {
					SWAP(p[0], p[-1]);
					p--;
				}
			}
			cf = 2 * (p->Freq < MAX_FREQ - 9);
			p->Freq += cf;
			pc->SummFreq += cf;
		} else {
			p = &(pc->oneState());
			p->Freq += (p->Freq < 32);
		}
	}
	if (!OrderFall && FSuccessor) {
		FoundState->Successor = CreateSuccessors(TRUE, p, MinContext);
		if (!FoundState->Successor) {
			goto RESTART_MODEL;
		}
		MaxContext = FoundState->Successor;
		return;
	}
	*pText++ = FSymbol;
	Successor = (PPM_CONTEXT*)pText;
	if (pText >= UnitsStart) {
		goto RESTART_MODEL;
	}
	if (FSuccessor) {
		if ((BYTE*)FSuccessor < UnitsStart) {
			FSuccessor = CreateSuccessors(FALSE, p, MinContext);
		}
	} else {
		FSuccessor = ReduceOrder(p, MinContext);
	}
	if (!FSuccessor) {
		goto RESTART_MODEL;
	}
	if (!--OrderFall) {
		Successor = FSuccessor;
		pText -= (MaxContext != MinContext);
	} else if (MRMethod > MRM_FREEZE) {
		Successor = FSuccessor;
		pText = HeapStart;
		OrderFall = 0;
	}
	s0 = MinContext->SummFreq - (ns = MinContext->NumStats) - FFreq;
	for (Flag = 0x08 * (FSymbol >= 0x40); pc1 != MinContext; pc1 = pc1->Suffix) {
		if ((ns1 = pc1->NumStats) != 0) {
			if ((ns1 & 1) != 0) {
				p = (PPM_STATE*)ExpandUnits(pc1->Stats, (ns1 + 1) >> 1);
				if (!p) {
					goto RESTART_MODEL;
				}
				pc1->Stats = p;
			}
			pc1->SummFreq += (3 * ns1 + 1 < ns);
		} else {
			p = (PPM_STATE*)AllocUnits(1);
			if (!p) {
				goto RESTART_MODEL;
			}
			*p = pc1->oneState();
			pc1->Stats = p;
			if (p->Freq < MAX_FREQ / 4 - 1) {
				p->Freq += p->Freq;
			} else {
				p->Freq = MAX_FREQ - 4;
			}
			pc1->SummFreq = p->Freq + InitEsc + (ns > 2);
		}
		cf = 2 * FFreq * (pc1->SummFreq + 6);
		sf = s0 + pc1->SummFreq;
		if (cf < 6 * sf) {
			cf = 1 + (cf > sf) + (cf >= 4 * sf);
			pc1->SummFreq += 4;
		} else {
			cf = 4 + (cf > 9 * sf) + (cf > 12 * sf) + (cf > 15 * sf);
			pc1->SummFreq += cf;
		}
		p = pc1->Stats + (++pc1->NumStats);
		p->Successor = Successor;
		p->Symbol = FSymbol;
		p->Freq = cf;
		pc1->Flags |= Flag;
	}
	MaxContext = FSuccessor;
	return;
RESTART_MODEL:
	RestoreModelRare(pc1, MinContext, FSuccessor);
}

// Tabulated escapes for exponential symbol distribution
static const BYTE ExpEscape[16] = {25, 14, 9, 7, 5, 5, 4, 4, 4, 3, 3, 3, 2, 2, 2, 2};
#define GET_MEAN(SUMM, SHIFT, ROUND) ((SUMM + (1 << (SHIFT - ROUND))) >> (SHIFT))

void Model::encodeBinSymbol(PPM_CONTEXT* context, Encoder& encoder, int symbol) {
	BYTE indx = NS2BSIndx[context->Suffix->NumStats] + PrevSuccess + context->Flags;
	PPM_STATE& rs = context->oneState();
	WORD& bs = BinSumm[QTable[rs.Freq - 1]][indx + ((RunLength >> 26) & 0x20)];
	if (rs.Symbol == symbol) {
		FoundState = &rs;
		rs.Freq += (rs.Freq < 196);
		encoder.subRange.LowCount = 0;
		encoder.subRange.HighCount = bs;
		bs += INTERVAL - GET_MEAN(bs, PERIOD_BITS, 2);
		PrevSuccess = 1;
		RunLength++;
	} else {
		encoder.subRange.LowCount = bs;
		bs -= GET_MEAN(bs, PERIOD_BITS, 2);
		encoder.subRange.HighCount = BIN_SCALE;
		InitEsc = ExpEscape[bs >> 10];
		CharMask[rs.Symbol] = EscCount;
		NumMasked = PrevSuccess = 0;
		FoundState = NULL;
	}
}

void Model::decodeBinSymbol(PPM_CONTEXT* context, Decoder& decoder) {
	BYTE indx = NS2BSIndx[context->Suffix->NumStats] + PrevSuccess + context->Flags;
	PPM_STATE& rs = context->oneState();
	WORD& bs = BinSumm[QTable[rs.Freq - 1]][indx + ((RunLength >> 26) & 0x20)];
	if (decoder.GetCurrentShiftCount(TOT_BITS) < bs) {
		FoundState = &rs;
		rs.Freq += (rs.Freq < 196);
		decoder.subRange.LowCount = 0;
		decoder.subRange.HighCount = bs;
		bs += INTERVAL - GET_MEAN(bs, PERIOD_BITS, 2);
		PrevSuccess = 1;
		RunLength++;
	} else {
		decoder.subRange.LowCount = bs;
		bs -= GET_MEAN(bs, PERIOD_BITS, 2);
		decoder.subRange.HighCount = BIN_SCALE;
		InitEsc = ExpEscape[bs >> 10];
		CharMask[rs.Symbol] = EscCount;
		NumMasked = PrevSuccess = 0;
		FoundState = NULL;
	}
}

void Model::update1(PPM_CONTEXT* context, PPM_STATE* p) {
	// Set FoundState to the current symbol
	(FoundState = p)->Freq += 4;
	context->SummFreq += 4;
	// Not sure what this is doing
	if (p[0].Freq > p[-1].Freq) {
		SWAP(p[0], p[-1]);
		FoundState = --p;
		if (p->Freq > MAX_FREQ) {
			rescale(context);
		}
	}
}

void Model::encodeSymbol1(PPM_CONTEXT* context, Encoder& encoder, int symbol) {
	UINT LoCnt, i = context->Stats->Symbol;
	PPM_STATE* p = context->Stats;
	encoder.subRange.scale = context->SummFreq;
	if (i == symbol) {
		PrevSuccess = (2 * (encoder.subRange.HighCount = p->Freq) >= encoder.subRange.scale);
		(FoundState = p)->Freq += 4;
		context->SummFreq += 4;
		RunLength += PrevSuccess;
		if (p->Freq > MAX_FREQ) {
			rescale(context);
		}
		encoder.subRange.LowCount = 0;
		return;
	}
	// Iterate and sum frequencies to determine the probability slice for this symbol
	LoCnt = p->Freq;
	i = context->NumStats;
	PrevSuccess = 0;
	while ((++p)->Symbol != symbol) {
		LoCnt += p->Freq;
		if (--i == 0) {// Reached end of stats array
			encoder.subRange.LowCount = LoCnt;
			// Fill CharMask with EscCount for every Symbol in Stats
			CharMask[p->Symbol] = EscCount;
			i = NumMasked = context->NumStats;
			FoundState = NULL;
			do {
				CharMask[(--p)->Symbol] = EscCount;
			} while (--i);
			encoder.subRange.HighCount = encoder.subRange.scale;
			return;
		}
	}
	// The LowCount and HighCount are a the range that represents the symbol 
	encoder.subRange.HighCount = (encoder.subRange.LowCount = LoCnt) + p->Freq;
	update1(context, p);
}

void Model::decodeSymbol1(PPM_CONTEXT* context, Decoder& decoder) {
	UINT i, count, HiCnt = context->Stats->Freq;
	PPM_STATE* p = context->Stats;
	decoder.subRange.scale = context->SummFreq;
	if ((count = decoder.GetCurrentCount()) < HiCnt) {
		PrevSuccess = (2 * (decoder.subRange.HighCount = HiCnt) >= decoder.subRange.scale);
		(FoundState = p)->Freq = (HiCnt += 4);
		context->SummFreq += 4;
		RunLength += PrevSuccess;
		if (HiCnt > MAX_FREQ) {
			rescale(context);
		}
		decoder.subRange.LowCount = 0;
		return;
	}
	i = context->NumStats;
	PrevSuccess = 0;
	while ((HiCnt += (++p)->Freq) <= count) {
		if (--i == 0) {
			decoder.subRange.LowCount = HiCnt;
			CharMask[p->Symbol] = EscCount;
			i = NumMasked = context->NumStats;
			FoundState = NULL;
			do {
				CharMask[(--p)->Symbol] = EscCount;
			} while (--i);
			decoder.subRange.HighCount = decoder.subRange.scale;
			return;
		}
	}
	decoder.subRange.LowCount = (decoder.subRange.HighCount = HiCnt) - p->Freq;
	update1(context, p);
}

void Model::update2(PPM_CONTEXT* context, PPM_STATE* p) {
	(FoundState = p)->Freq += 4;
	context->SummFreq += 4;
	if (p->Freq > MAX_FREQ) {
		rescale(context);
	}
	EscCount++;
	RunLength = InitRL;
}

SEE2_CONTEXT* Model::makeEscFreq2(PPM_CONTEXT* context, Coder& coder) {
	UINT t = 2 * context->NumStats;
	SEE2_CONTEXT* psee2c;
	if (context->NumStats != 0xFF) {
		t = context->Suffix->NumStats;
		psee2c = SEE2Cont[QTable[context->NumStats + 2] - 3] + (context->SummFreq > 11 * (context->NumStats + 1));
		psee2c += 2 * (2 * context->NumStats < t + NumMasked) + context->Flags;
		coder.subRange.scale = psee2c->getMean();
	} else {
		psee2c = &DummySEE2Cont;
		coder.subRange.scale = 1;
	}
	return psee2c;
}

void Model::encodeSymbol2(PPM_CONTEXT* context, Encoder& encoder, int symbol) {
	SEE2_CONTEXT* psee2c = makeEscFreq2(context, encoder);
	UINT Sym, LoCnt = 0, i = context->NumStats - NumMasked;
	PPM_STATE *p1, *p = context->Stats - 1;
	do {
		do {
			Sym = p[1].Symbol;
			p++;
		} while (CharMask[Sym] == EscCount);
		CharMask[Sym] = EscCount;
		if (Sym == symbol) {
			goto SYMBOL_FOUND;
		}
		LoCnt += p->Freq;
	} while (--i);
	encoder.subRange.HighCount = (encoder.subRange.scale += (encoder.subRange.LowCount = LoCnt));
	psee2c->Summ += encoder.subRange.scale;
	NumMasked = context->NumStats;
	return;
SYMBOL_FOUND:
	encoder.subRange.LowCount = LoCnt;
	encoder.subRange.HighCount = (LoCnt += p->Freq);
	for (p1 = p; --i;) {
		do {
			Sym = p1[1].Symbol;
			p1++;
		} while (CharMask[Sym] == EscCount);
		LoCnt += p1->Freq;
	}
	encoder.subRange.scale += LoCnt;
	psee2c->update();
	update2(context, p);
}

inline void Model::decodeSymbol2(PPM_CONTEXT* context, Decoder& decoder) {
	SEE2_CONTEXT* psee2c = makeEscFreq2(context, decoder);
	UINT Sym, count, HiCnt = 0, i = context->NumStats - NumMasked;
	PPM_STATE *ps[256], **pps = ps, *p = context->Stats - 1;
	do {
		do {
			Sym = p[1].Symbol;
			p++;
		} while (CharMask[Sym] == EscCount);
		HiCnt += p->Freq;
		*pps++ = p;
	} while (--i);
	decoder.subRange.scale += HiCnt;
	count = decoder.GetCurrentCount();
	p = *(pps = ps);
	if (count < HiCnt) {
		HiCnt = 0;
		while ((HiCnt += p->Freq) <= count) {
			p = *++pps;
		}
		decoder.subRange.LowCount = (decoder.subRange.HighCount = HiCnt) - p->Freq;
		psee2c->update();
		update2(context, p);
	} else {
		decoder.subRange.LowCount = HiCnt;
		decoder.subRange.HighCount = decoder.subRange.scale;
		i = context->NumStats - NumMasked;
		NumMasked = context->NumStats;
		do {
			CharMask[(*pps)->Symbol] = EscCount;
			pps++;
		} while (--i);
		psee2c->Summ += decoder.subRange.scale;
	}
}

void Model::ClearMask(_PPMD_FILE* EncodedFile, _PPMD_FILE* DecodedFile) {
	EscCount = 1;
	memset(CharMask, 0, sizeof(CharMask));
	if (++PrintCount == 0) {
		//PrintInfo(DecodedFile, EncodedFile);
	}
}

void _STDCALL EncodeFile(_PPMD_FILE* EncodedFile, _PPMD_FILE* DecodedFile, int MaxOrder, MR_METHOD MRMethod) {
	Encoder encoder;
	Model model(MaxOrder, MRMethod);
	for (PPM_CONTEXT* MinContext;;) {
		BYTE ns = (MinContext = model.MaxContext)->NumStats;
		int c = _PPMD_E_GETC(DecodedFile);
		if (ns) {
			model.encodeSymbol1(MinContext, encoder, c);
			encoder.EncodeSymbol();
		} else {
			model.encodeBinSymbol(MinContext, encoder, c);
			encoder.ShiftEncodeSymbol(TOT_BITS);
		}
		while (!model.FoundState) {
			encoder.Normalize(EncodedFile);
			do {
				model.OrderFall++;
				MinContext = MinContext->Suffix;
				if (!MinContext) {
					goto STOP_ENCODING;
				}
			} while (MinContext->NumStats == model.NumMasked);
			model.encodeSymbol2(MinContext, encoder, c);
			encoder.EncodeSymbol();
		}
		if (!model.OrderFall && (BYTE*)model.FoundState->Successor >= UnitsStart) {
			model.MaxContext = model.FoundState->Successor;
		} else {
			model.UpdateModel(MinContext);
			if (model.EscCount == 0) {
				model.ClearMask(EncodedFile, DecodedFile);
			}
		}
		encoder.Normalize(EncodedFile);
	}
STOP_ENCODING:
	encoder.Flush(EncodedFile);
	//PrintInfo(DecodedFile, EncodedFile);
}

void _STDCALL DecodeFile(_PPMD_FILE* DecodedFile, _PPMD_FILE* EncodedFile, int MaxOrder, MR_METHOD MRMethod) {
	Decoder decoder(EncodedFile);
	Model model(MaxOrder, MRMethod);
	PPM_CONTEXT* MinContext = model.MaxContext;
	for (BYTE ns = MinContext->NumStats;;) {
		if (ns) {
			model.decodeSymbol1(MinContext, decoder);
		} else {
			model.decodeBinSymbol(MinContext, decoder);
		}
		decoder.RemoveSubrange();
		while (!model.FoundState) {
			decoder.Normalize(EncodedFile);
			do {
				model.OrderFall++;
				MinContext = MinContext->Suffix;
				if (!MinContext) {
					goto STOP_DECODING;
				}
			} while (MinContext->NumStats == model.NumMasked);
			model.decodeSymbol2(MinContext, decoder);
			decoder.RemoveSubrange();
		}
		_PPMD_D_PUTC(model.FoundState->Symbol, DecodedFile);
		if (!model.OrderFall && (BYTE*)model.FoundState->Successor >= UnitsStart) {
			model.MaxContext = model.FoundState->Successor;
		} else {
			model.UpdateModel(MinContext);
			if (model.EscCount == 0) {
				model.ClearMask(EncodedFile, DecodedFile);
			}
		}
		ns = (MinContext = model.MaxContext)->NumStats;
		decoder.Normalize(EncodedFile);
	}
STOP_DECODING:
	return;
	//PrintInfo(DecodedFile, EncodedFile);
}

extern "C" {
void encode(const char* inputPath, const char* outputPath) {
	FILE* inputFile = fopen(inputPath, "rb");
	FILE* outputFile = fopen(outputPath, "w+b");
	StartSubAllocator(10);
	EncodeFile(outputFile, inputFile, 4, MRM_RESTART);
	StopSubAllocator();
	fclose(inputFile);
	fclose(outputFile);
}

void decode(const char* inputPath, const char* outputPath) {
	FILE* inputFile = fopen(inputPath, "rb");
	FILE* outputFile = fopen(outputPath, "w+b");
	StartSubAllocator(10);
	DecodeFile(outputFile, inputFile, 4, MRM_RESTART);
	StopSubAllocator();
	fclose(inputFile);
	fclose(outputFile);
}
}
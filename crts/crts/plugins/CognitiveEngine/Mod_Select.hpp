#ifndef _MOD_SELECT_H_
#define _MOD_SELECT_H_

#include <liquid/liquid.h>

static inline int mod_select(float SNR_dB) {
  if (SNR_dB > 24.4)
    return LIQUID_MODEM_BPSK;
  else if (SNR_dB > 22.7)
    return LIQUID_MODEM_QPSK;
  else if (SNR_dB > 18.2)
    return LIQUID_MODEM_QAM16;
  else if (SNR_dB > 16.4)
    return LIQUID_MODEM_QAM64;
  else
    return LIQUID_MODEM_QAM256;
}

#endif

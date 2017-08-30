#include <liquid/liquid.h>
#include <sys/time.h>
#include "extensible_cognitive_radio.hpp"
#include "cognitive_engine.hpp"
#include "timer.h"
#include <complex.h>
#include <complex>

class CE_Simultaneous_RX_And_Sensing : public CognitiveEngine {

private:
  // sensing parameters
  static constexpr float sensing_delay_ms = 1e3;
  static constexpr int fft_length = 512;
  static constexpr int fft_averaging = 10;

  // timer to start and stop sensing
  timer t;
  long int sense_time_s;
  long int sense_time_us;

  // counter for fft averaging
  int fft_counter;

  // USRP, FFT output, and average FFT  sample buffers
  float _Complex buffer[fft_length];
  float _Complex buffer_F[fft_length];
  float fft_avg[fft_length];

  // fft plan for spectrum sensing
  fftplan fft;

public:
  CE_Simultaneous_RX_And_Sensing(int argc, char ** argv, ExtensibleCognitiveRadio *_ECR);
  ~CE_Simultaneous_RX_And_Sensing();
  virtual void execute();
};


// constructor
CE_Simultaneous_RX_And_Sensing::CE_Simultaneous_RX_And_Sensing(
    int argc, char **argv, ExtensibleCognitiveRadio *_ECR) {
  
  ECR = _ECR;

  // initialize counter to 0
  fft_counter = 0;

  // create timer to enable/disable sensing
  t = timer_create();
  timer_tic(t);

  struct timeval tv;
  gettimeofday(&tv, NULL);
  sense_time_s = tv.tv_sec;
  sense_time_us = tv.tv_usec;

  // initialize buffers to 0
  memset(buffer, 0, fft_length * sizeof(float _Complex));
  memset(buffer_F, 0, fft_length * sizeof(float _Complex));
  memset(fft_avg, 0, fft_length * sizeof(float));

  // create fft plan to be used for spectrum sensing
  fft = fft_create_plan(fft_length,
                        reinterpret_cast<liquid_float_complex *>(buffer),
                        reinterpret_cast<liquid_float_complex *>(buffer_F),
                        LIQUID_FFT_FORWARD, 0);
}

// destructor
CE_Simultaneous_RX_And_Sensing::~CE_Simultaneous_RX_And_Sensing() {}

// execute function
void CE_Simultaneous_RX_And_Sensing::execute() {

  struct timeval tv;
  gettimeofday(&tv, NULL);

  // turn on sensing after once the required time has past
  if ((tv.tv_sec > sense_time_s) ||
      ((tv.tv_sec == sense_time_s) && (tv.tv_usec >= sense_time_us))) {
    printf("Turning on sensing\n");
    ECR->set_ce_sensing(1);

    // calculate next sense time
    sense_time_s = tv.tv_sec + (long int)floorf(sensing_delay_ms / 1e3);
    sense_time_us = tv.tv_usec + (long int)floorf(sensing_delay_ms * 1e3);
  }

  // handle samples
  if (ECR->CE_metrics.CE_event == ExtensibleCognitiveRadio::USRP_RX_SAMPS) {

    fft_counter++;
    memcpy(buffer, ECR->ce_usrp_rx_buffer,
           ECR->ce_usrp_rx_buffer_length * sizeof(float _Complex));
    fft_execute(fft);

    for (int i = 0; i < fft_length; i++) {
      fft_avg[i] += cabsf(buffer_F[i]) / (float)fft_averaging;
    }

    // reset once averaging has finished
    if (fft_counter == fft_averaging) {
      // stop forwarding usrp samples to CE
      ECR->set_ce_sensing(0);

      // display FFT result
      for (int i = 0; i < fft_length; i++)
        printf("FFT value %i: %f\n", i, fft_avg[i]);
      printf("\n");

      // reset counter and average fft buffer
      memset(fft_avg, 0, fft_length * sizeof(float));
      fft_counter = 0;
    }
  }
}


// Note no semi-colon (;) is used after this CPP macro function:
MAKE_CE_MODULE_FACTORY(CE_Simultaneous_RX_And_Sensing)


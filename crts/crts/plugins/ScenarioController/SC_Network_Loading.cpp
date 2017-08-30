#include <stdio.h>
#include <liquid/liquid.h>
#include "scenario_controller.hpp"
#include "timer.h"

class SC_Network_Loading : public ScenarioController {

private:
  // internal members used by this CE
  int state;
  timer t;
  static constexpr float period = 15.0;
  double throughput_1;
  double throughput_2;

public:
  SC_Network_Loading(int argc, char **argv);
  ~SC_Network_Loading();
  virtual void execute();
  virtual void initialize_node_fb();
};


// constructor
SC_Network_Loading::SC_Network_Loading(int argc, char **argv) {
  state = 0;
  throughput_1 = 4e6;
  throughput_2 = 1e4;
  t = timer_create(); 
}

// destructor
SC_Network_Loading::~SC_Network_Loading() {
  timer_destroy(t);
}

// setup feedback enables for each node
void SC_Network_Loading::initialize_node_fb() {
  // get feedback for receiver statistics of each node
  int fb_enables = CRTS_RX_STATS_FB_EN; 
  set_node_parameter(1, CRTS_FB_EN, (void*) &fb_enables);
  set_node_parameter(2, CRTS_FB_EN, (void*) &fb_enables);
  
  double rx_stats_tracking_period = 1.0;
  set_node_parameter(1, CRTS_RX_STATS, (void*) &rx_stats_tracking_period);
  set_node_parameter(2, CRTS_RX_STATS, (void*) &rx_stats_tracking_period);
  
  double rx_stats_fb_period = 1.0;
  set_node_parameter(1, CRTS_RX_STATS_FB, (void*) &rx_stats_fb_period);
  set_node_parameter(2, CRTS_RX_STATS_FB, (void*) &rx_stats_fb_period);
}

// execute function
void SC_Network_Loading::execute() {

  static bool first_execution = true;
  if (first_execution) {
    timer_tic(t);
    first_execution = false;
  }

  // update network throughputs
  if (timer_toc(t) > period) {
    
    printf("Updating network throughputs\n");
    
    if (state) {
      state = 0;
      set_node_parameter(0, CRTS_NET_THROUGHPUT, (void*)&throughput_1);
      set_node_parameter(1, CRTS_NET_THROUGHPUT, (void*)&throughput_2);
    } else {
      state = 1;
      set_node_parameter(0, CRTS_NET_THROUGHPUT, (void*)&throughput_2);
      set_node_parameter(1, CRTS_NET_THROUGHPUT, (void*)&throughput_1);
    }
    timer_tic(t);
  }

  // print out receiver statistics
  if ((sc_event == FEEDBACK) && (fb.fb_type == CRTS_RX_STATS)) {
    struct ExtensibleCognitiveRadio::rx_statistics rx_stats = 
      *(struct ExtensibleCognitiveRadio::rx_statistics*) fb.arg;
    printf("Node %i has sent updated receive statistics:\n", fb.node);
    printf("  Number of frames received: %i\n", rx_stats.frames_received);
    printf("  Average EVM:               %.3f\n", rx_stats.evm_dB);
    printf("  Average RSSI:              %.3f\n", rx_stats.rssi_dB);
    printf("  Average PER:               %.3f\n", rx_stats.per);
    printf("  Average throughput:        %.3e\n", rx_stats.throughput);
  }

}


// Note no semi-colon (;) is used after this CPP macro function:
MAKE_SC_MODULE_FACTORY(SC_Network_Loading)


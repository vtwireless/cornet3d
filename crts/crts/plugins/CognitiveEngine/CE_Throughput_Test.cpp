#include <stdio.h>
#include <timer.h>
#include <sys/time.h>
#include "extensible_cognitive_radio.hpp"
#include "cognitive_engine.hpp"

class CE_Throughput_Test : public CognitiveEngine {

private:
  int first_execution;
public:
  CE_Throughput_Test(int argc, char ** argv, ExtensibleCognitiveRadio *_ECR);
  ~CE_Throughput_Test();
  virtual void execute();
};


// constructor
CE_Throughput_Test::CE_Throughput_Test(int argc, char ** argv, ExtensibleCognitiveRadio *_ECR) {
  ECR = _ECR;
  first_execution = 1;
}

// destructor
CE_Throughput_Test::~CE_Throughput_Test() {}

// execute function
void CE_Throughput_Test::execute() {
  
  if (first_execution) {
    // Print the estimated network throughput (assuming perfect reception).
	  // The 256/288 factor is to account for the header added by the TUN interface.
    float phy_data_rate = ECR->get_tx_data_rate();
	  printf("Estimated network throughput: %e\n", (256.0/288.0)*phy_data_rate);
	  ECR->set_ce_timeout_ms(200.0);
	  first_execution = 0; 
  }
}


// Note no semi-colon (;) is used after this CPP macro function:
MAKE_CE_MODULE_FACTORY(CE_Throughput_Test)


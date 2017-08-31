# This is a GNU make file that uses GNU make make extensions


BIN = $(PREFIX)/bin

# There to install files built in this directory
INSTALL_DIR = $(BIN)


CXXFLAGS := -std=c++11 -g -Wall
CPPFLAGS := -I old_include -I ../liquid-dsp/src

# The C++ compiled programs need to find shared libraries when they are
# run from this source directory.  They find these libraries using RPATH
# which we set using this compiler option.

LIQUID_SRC := $(abspath $(CURDIR)/../liquid-dsp/src)
LIBFEC_SRC := $(abspath $(CURDIR)/../libfec/src)

SRC_RPATH = -Wl,-rpath,$(LIQUID_SRC):$(LIBFEC_SRC)

LIQUID_LDFLAGS = -lliquid -L$(LIQUID_SRC)
LIBFEC_LDFLAGS = -lfec -L$(LIBFEC_SRC)


BUILD_NO_INSTALL := crts_interferer crts_cognitive_radio crts_controller convert_logs_bin_to_octave

# crts_interferer
crts_interferer_SOURCES =\
 src/crts_interferer.cpp\
 src/crts.cpp\
 src/interferer.cpp\
 src/timer.cpp
crts_interferer_LDFLAGS = $(SRC_RPATH) $(LIQUID_LDFLAGS) -luhd -lconfig -lpthread


# crts_cognitive_radio
crts_cognitive_radio_SOURCES =\
 src/crts.cpp\
 src/tun.cpp\
 src/timer.cpp\
 src/extensible_cognitive_radio.cpp\
 src/crts_cognitive_radio.cpp\
 src/cognitive_engine.cpp\
 cognitive_engines/CE_Template/CE_Template.cpp\
 cognitive_engines/test_engines/CE_Subcarrier_Alloc/CE_Subcarrier_Alloc.cpp\
 cognitive_engines/example_engines/CE_Mod_Adaptation/src/Mod_Select.cpp\
 cognitive_engines/example_engines/CE_FEC_Adaptation/src/FEC_Select.cpp\
 cognitive_engines/test_engines/CE_Throughput_Test/CE_Throughput_Test.cpp\
 cognitive_engines/test_engines/CE_Control_and_Feedback_Test/CE_Control_and_Feedback_Test.cpp\
 cognitive_engines/test_engines/CE_Simultaneous_RX_And_Sensing/CE_Simultaneous_RX_And_Sensing.cpp\
 cognitive_engines/example_engines/CE_Two_Channel_DSA_Spectrum_Sensing/CE_Two_Channel_DSA_Spectrum_Sensing.cpp\
 cognitive_engines/example_engines/CE_Mod_Adaptation/CE_Mod_Adaptation.cpp\
 cognitive_engines/example_engines/CE_Network_Loading/CE_Network_Loading.cpp\
 cognitive_engines/example_engines/CE_FEC_Adaptation/CE_FEC_Adaptation.cpp\
 cognitive_engines/example_engines/CE_Two_Channel_DSA_Link_Reliability/CE_Two_Channel_DSA_Link_Reliability.cpp\
 cognitive_engines/primary_user_engines/CE_Two_Channel_DSA_PU/CE_Two_Channel_DSA_PU.cpp
crts_cognitive_radio_LDFLAGS = $(SRC_RPATH) $(LIQUID_LDFLAGS) -luhd -lconfig -lpthread


# crts_controller
crts_controller_SOURCES =\
 src/crts.cpp\
 src/timer.cpp\
 src/crts_controller.cpp\
 src/scenario_controller.cpp\
 scenario_controllers/SC_Performance_Sweep_Utility/SC_Performance_Sweep_Utility.cpp\
 scenario_controllers/SC_BER_Sweep/SC_BER_Sweep.cpp\
 scenario_controllers/SC_Template/SC_Template.cpp\
 scenario_controllers/SC_Network_Loading/SC_Network_Loading.cpp\
 scenario_controllers/SC_CORNET_Display/SC_CORNET_Display.cpp\
 scenario_controllers/SC_Control_and_Feedback_Test/SC_Control_and_Feedback_Test.cpp\
 scenario_controllers/SC_CORNET_Tutorial/SC_CORNET_Tutorial.cpp
crts_controller_LDFLAGS = $(SRC_RPATH) $(LIQUID_LDFLAGS) -lconfig -lboost_system -lpthread


# convert_logs_bin_to_octave
convert_logs_bin_to_octave_SOURCES =\
 src/convert_logs_bin_to_octave.cpp
convert_logs_bin_to_octave_LDFLAGS = -luhd



# After we install the programs we reset the RPATH so that the programs
# can find the libliquid and libfec shared libraries using patchelf.
INSTALL_RPATH = patchelf --set-rpath '$(PREFIX)/lib'

#POST_INSTALL_COMMAND =\
 $(INSTALL_RPATH) $(BIN)/crts_interferer &&\
 $(INSTALL_RPATH) $(BIN)/crts_cognitive_radio &&\
 $(INSTALL_RPATH) $(BIN)/crts_controller



CLEANERDIRS := logs


logs/convert_logs_bin_to_octave: convert_logs_bin_to_octave
	mkdir -p logs
	cp $< $@


include ../../quickbuild.make

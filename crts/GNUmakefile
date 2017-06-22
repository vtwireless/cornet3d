# This is a GNU make file that uses GNU make make extensions

# Where is this make file?
top_srcdir := ..

BIN = $(PREFIX)/bin

# There to install files built in this directory
INSTALL_DIR = $(BIN)


CPPFLAGS = -I include -std=c++11
CXXFLAGS = $(CPPFLAGS) -g

# The C++ compiled programs need to find shared libraries when they are
# run from this source directory.  They find these libraries using RPATH
# which we set using this compiler option.
SRC_RPATH = -Wl,-rpath,$(CURDIR)/liquid-dsp/src:$(CURDIR)/libfec/src

LIQUID_LDFLAGS = -lliquid -L$(CURDIR)/../1_liquid-dsp/src
LIBFEC_LDFLAGS = -lfec -L$(CURDIR)/../0_libfec/src



# config_scenario_controllers
config_scenario_controllers_SOURCES =\
 src/config_scenario_controllers.cpp\
 src/crts.cpp
config_scenario_controllers_LDFLAGS = $(SRC_RPATH) $(LIQUID_LDFLAGS) -lconfig -lboost_system -lpthread


# config_cognitive_engines
config_cognitive_engines_SOURCES =\
 src/config_cognitive_engines.cpp\
 src/crts.cpp
config_cognitive_engines_LDFLAGS = $(SRC_RPATH) $(LIQUID_LDFLAGS) -lconfig -lboost_system


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
 cognitive_engines/src/AMC.cpp\
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

POST_INSTALL_COMMAND =\
 $(INSTALL_RPATH) $(BIN)/config_scenario_controllers &&\
 $(INSTALL_RPATH) $(BIN)/config_cognitive_engines &&\
 $(INSTALL_RPATH) $(BIN)/crts_interferer &&\
 $(INSTALL_RPATH) $(BIN)/crts_cognitive_radio &&\
 $(INSTALL_RPATH) $(BIN)/crts_controller



################################################################################
# butt ugly from here down

cpp_programs = $(patsubst %_SOURCES,%,$(filter %_SOURCES, $(.VARIABLES)))

dependfiles :=
id :=
objects :=
cppbins :=

# GNU make function to make dependency (*.d) files and object (*.o) files.
define Mkdepend
 # $(1) = program_name
 # $(2) = C++ source filename without .cpp suffix
 # name needs to be unique
 name := build/$$(notdir $(2)-$$(id)-$(1))
 id := $(words $(counter))
 counter := $$(counter) x
 $$(name).d $$(name).o: $(2).cpp
 $$(name).d_target := $$(name).o
 $$(warn $$(name).d $$(name).o: $(2).cpp)
 dependfiles := $(dependfiles) $$(name).d
 objects := $$(objects) $$(name).o
endef

# GNU make function to make C++ program dependencies.
define Mkcpprules
  # $(1) = program_name
  counter := x
  # list os object files for this program
  objects :=
  srcfiles :=  $$(patsubst %.cpp,%,$$(filter %.cpp,$$($(1)_SOURCES)))
  $$(foreach src,$$(srcfiles),$$(eval $$(call Mkdepend,$(1),$$(src))))
  # programs depend on object files
  $(1): $$(objects)
  $(1)_objects := $$(objects)
  cppbins := $$(cppbins) $(1)
  CLEANFILES := $$(CLEANFILES) $(1)
endef

# GNU make for loop sets up make dependencies.
$(foreach prog,$(cpp_programs),$(eval $(call Mkcpprules,$(prog))))

# We are done with these variables:
undefine objects
undefine id
undefine counter
undefine srcfiles
undefine Mkdepend
undefine Mkcpprules


# Add the compiled C++ programs to the list of things to build and
# install:
BUILD := $(cppbins)

# Rules to build C++ programs

# How to build object files
%.o:
	$(CXX) $(CXXFLAGS) -c $< -o $@

# How to build depend files that track dependencies so that the objects
# and programs get automatically rebuilt when a depending source file
# changes.  By auto-generating dependencies we can come closer to
# guaranteeing things are rebuilt when they need to be.
%.d:
	$(CXX) $(CPPFLAGS) -MM $< -MF $@ -MT $($@_target)

# How to build a C++ program.
$(cppbins):
	$(CXX) $(CXXFLAGS) $($@_objects) -o $@ $($@_LDFLAGS)


# We do not build depend files *.d if we have a command line target with
# clean or config in it.
nodepend := $(strip\
 $(findstring clean, $(MAKECMDGOALS))\
 $(findstring config, $(MAKECMDGOALS))\
)

ifeq ($(nodepend),)
BUILD_NO_INSTALL := $(dependfiles)
ifneq ($(strip $(wildcard $(dependfiles))),)
# include with no error if we need to build them
-include $(dependfiles)
endif
endif

BUILD_NO_INSTALL := $(BUILD_NO_INSTALL) logs/convert_logs_bin_to_octave

build: $(dependfiles)

clean: localclean

localclean:
	rm -f build/*.o build/*.d


logs/convert_logs_bin_to_octave: convert_logs_bin_to_octave
	cp $< $@


# Add this directory to the recursive build system.  This make file is the
# only compiled code in this project, so this make file is larger than
# others.  If more compiled C/C++ program are added to other directories
# this file should spill into common.make
include $(top_srcdir)/common.make


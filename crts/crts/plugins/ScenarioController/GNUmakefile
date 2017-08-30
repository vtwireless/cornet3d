# This is a GNU make file that uses GNU make make extensions


CXXFLAGS := -std=c++11 -g -Wall -Werror
CPPFLAGS := $(CXXFLAGS) -I../../include -I../../../liquid-dsp/src -DDEBUG

INSTALL_DIR = $(PREFIX)/plugins/ScenarioController


# Make every *.cpp file into a DSO (dynamic shared object) plugin that is
# installed.

# TODO: This will not build from a build directory that is
# not the same as the source directory.
srcs := $(patsubst %.cpp,%,$(wildcard *.cpp))

define MkSource
  $(1).so_SOURCES := $(1).cpp
endef
$(foreach src,$(srcs),$(eval $(call MkSource,$(src))))
undefine MkSource
undefine srcs


#SC_Performance_Sweep_Utility.so_SOURCES := SC_Performance_Sweep_Utility.cpp

#SC_BER_Sweep.so_SOURCES := SC_BER_Sweep.cpp

#SC_Control_and_Feedback_Test.so_SOURCES := SC_Control_and_Feedback_Test.cpp




include ../../../../quickbuild.make

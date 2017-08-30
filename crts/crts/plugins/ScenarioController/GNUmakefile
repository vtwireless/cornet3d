# This is a GNU make file that uses GNU make make extensions


CXXFLAGS := -std=c++11 -g -Wall -Werror
CPPFLAGS := -I../../include -I../../../liquid-dsp/src -DDEBUG

INSTALL_DIR = $(PREFIX)/plugins/ScenarioController


# Make every *.cpp file into a DSO (dynamic shared object) plugin that is
# installed.

# TODO: This will not work in a build tree that is not the same as the
# source tree.  *.cpp is in the source.  That may explain why GNU automake
# never uses wildcards.
srcs = $(patsubst %.cpp,%,$(wildcard *.cpp))

define MkSource
  $(1).so_SOURCES := $(1).cpp
endef
$(foreach src,$(srcs),$(eval $(call MkSource,$(src))))
undefine MkSource
undefine srcs

# above we auto generate lines like this:
#SC_Performance_Sweep_Utility.so_SOURCES := SC_Performance_Sweep_Utility.cpp


include ../../../../quickbuild.make

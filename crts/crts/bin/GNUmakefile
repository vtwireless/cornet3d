# This is a GNU make file that uses GNU make make extensions


CXXFLAGS := -std=c++11 -g -Wall -Werror
CPPFLAGS := $(CXXFLAGS) -I../include -I ../../liquid-dsp/src -DDEBUG


BIN = $(PREFIX)/bin

# There to install files built in this directory
INSTALL_DIR = $(BIN)


# These two variables are used when building debug.c and debug.h
DEBUG_SYMBOL_PREFIX := crts_
MACRO_API_PREFIX :=
# Tell quickbuild to sub @DEBUG_SYMBOL_PREFIX@ @MACRO_API_PREFIX@ (and so
# on) with the values from the make variables given here:
IN_VARS := DEBUG_SYMBOL_PREFIX MACRO_API_PREFIX


crts_controller_SOURCES :=\
 crts.cpp\
 timer.cpp\
 crts_controller.cpp\
 scenario_controller.cpp
# The -Wl,--export-dynamic compiler/linker option is needed so that when
# we load and run DSO (dymamic shared objects) plugins the DSOs can access
# some parts of the program that loaded it.
crts_controller_LDFLAGS =\
 $(SRC_RPATH) $(LIQUID_LDFLAGS) -Wl,--export-dynamic -ldl -lconfig -lpthread



LIQUID_SRC := $(abspath $(CURDIR)/../../liquid-dsp/src)
LIBFEC_SRC := $(abspath $(CURDIR)/../../libfec/src)

SRC_RPATH := -Wl,-rpath,$(LIQUID_SRC):$(LIBFEC_SRC)

LIQUID_LDFLAGS := -lliquid -L$(LIQUID_SRC)
LIBFEC_LDFLAGS := -lfec -L$(LIBFEC_SRC)



# TODO: make quickbuild.make do this patchelf thing:
#
# After we install the programs we reset the RPATH so that the programs
# can find the installed libliquid and libfec shared libraries at run-time.
INSTALL_RPATH = patchelf --set-rpath '$(PREFIX)/lib'

#POST_INSTALL_COMMAND =\
 $(INSTALL_RPATH) $(BIN)/crts_controller


include ../../../quickbuild.make

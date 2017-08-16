# This is a GNU make file that uses GNU make make extensions

# Where is this make file?
top_srcdir := ..

# We require that these be built in this order:
subdirs := liquid-dsp libfec crts

# Add this directory to the recursive build system.  This make file is the
# only compiled code in this project, so this make file is larger than
# others.  If more compiled C/C++ program are added to other directories
# this file should spill some into common.make
include $(top_srcdir)/common.make

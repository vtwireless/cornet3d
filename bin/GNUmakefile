# This is a GNU make file that uses GNU make make extensions

# Where is this make file?
top_srcdir := ..

# There to install selected files in this directory
INSTALL_DIR = $(PREFIX)/bin

# What files are built and installed
BUILD := cornet3d_webServer cornet3d_spectrumServer


# How to make those files
cornet3d_webServer cornet3d_spectrumServer:
	ln -s ../lib/$@ $@


include $(top_srcdir)/common.make


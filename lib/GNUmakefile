# This is a GNU make file that uses GNU make make extensions


# There to install selected files in this directory
INSTALL_DIR = $(PREFIX)/lib

# What files are installed
#
# We add key.pem to the list of install files and
# cert.pem is automatically added as it has a build
# script with file name cert.pem with .bl added.
#
INSTALLED := key.pem cornet3d_webServer cornet3d_spectrumServer

cornet3d_webServer_MODE := 755

CLEANERFILES := package-lock.json cornet3d_spectrumServer_log

# cert.pem.bl will make both key.pem and cert.pem
# but we must add key.pem to the clean files and
# cert.pem is automatically added to cleanfiles
# because it's built with a script with it's name
# cert.pem with .bl added.
CLEANFILES := key.pem

cornet3d_webServer_GEN_COMMENT :=\
 // This is a generated file

include ../quickbuild.make

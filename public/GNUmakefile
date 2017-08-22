# This is a GNU make file that uses GNU make make extensions

# There to install selected files in this directory
INSTALL_DIR = $(PREFIX)/public

# We generate index.html and it depends on these files.  The recipe to
# build index.html is stated implicitly in common.make using
# index.html.bl
index.html: $(top_srcdir)/lib/configure.js\
 $(top_srcdir)/lib/configDefaults.js\
 $(sort $(wildcard $(srcdir)/index.html.*.src))


include ../quickbuild.make


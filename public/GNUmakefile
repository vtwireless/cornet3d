# This is a GNU make file that uses GNU make make extensions

top_srcdir := ..

# There to install selected files in this directory
INSTALL_DIR = $(SERVER_DOC_ROOT)

# We generate index.html and it depends on these files.  The recipe to
# build index.html is stated implicitly in common.make using
# index.html.bl
index.html: $(top_srcdir)/lib/configure.js\
 $(top_srcdir)/lib/configDefaults.js\
 $(sort $(wildcard index.html.*.src))


include $(top_srcdir)/common.make


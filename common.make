# This is a GNU make file it uses GNU make make extensions
#
# This file is included in other make files named GNUmakefile.
# This make file builds stuff based on file suffix rules.
# This make file does directory recursive makes.
#
# Keep in mind this file needs to work in any directory, so
# you can't refer to any specific targets in this file unless
# they are files that are used in all directories.


# We use some bash regex stuff in this make file so this
# replaces the default shell "sh".
SHELL = bash


# include builder/installers (users) particular configuration file
include $(top_srcdir)/config.make


##################################################################
# the user may override based on config.make configuration file
#
# These are the default configuration values
##################################################################


# Installation prefix directory
PREFIX ?= $(HOME)/cornet3d

# How to convert .jsp to .js
# yui-compressor --line-break 60 --type js
JS_COMPRESS ?= cat

# How to convert .cs to .css
# yui-compressor --line-break 60 --type css
CSS_COMPRESS ?= cat

# How to run node js with the system #! at the top of the
# file that is being run
NODEJS_SHABANG ?= /usr/bin/env node


##################################################################


# .ONESHELL = all the lines in the recipe be passed to a single invocation
# of the shell
.ONESHELL:

.SUFFIXES: # Delete the default suffixes
# Define our suffix list
.SUFFIXES: .js .css .html .js .css .jsp .cs .dl .bl

# .jsp is javaScript before compressing to .js
# .cs is CSS before compress to .css
# *.in makes * from sed replace command
# *.dl is a script that downloads *
# *.bl is a script that makes *
# .js, .css, .html are all installed and served


.DEFAULT_GOAL := build

ifndef top_srcdir
    $(error top_srcdir was not defined)
endif


subdirs := $(sort $(patsubst %/GNUmakefile,%,$(wildcard */GNUmakefile)))

config_vars :=\
 PREFIX\
 JS_COMPRESS\
 CSS_COMPRESS\
 NODEJS_SHABANG

# Strings we replace all *.in files.  For example: we replace
# @SERVER_PORT@ with the value of $(SERVER_PORT) in "foo.in" to make
# file "foo".
seds :=\
 NODEJS_SHABANG

sed_commands :=
define Seds
  sed_commands := $$(sed_commands) -e 's!@$(1)@!$$(strip $$($(1)))!g'
endef
$(foreach cmd,$(seds),$(eval $(call Seds,$(cmd))))
undefine Seds
undefine seds
# now we have the sed_commands for making * from *.in files

define Dependify
  $(1): $(1).$(2)
endef

# download (dl) scripts FILE.dl that download FILE
# dl_scripts is the things downloaded
dl_scripts := $(patsubst %.dl,%,$(wildcard *.dl))
$(foreach targ,$(dl_scripts),$(eval $(call Dependify,$(targ),dl)))

# In files, FILE.in, that build files named FILE
# in_files is the things built
in_files := $(patsubst %.in,%,$(wildcard *.in))
$(foreach targ,$(in_files),$(eval $(call Dependify,$(targ),in $(top_srcdir)/config.make)))

# build (bl) scripts FILE.bl that build files named FILE
# bl_scripts is the files built
bl_scripts := $(sort\
 $(patsubst %.bl,%,$(wildcard *.bl))\
 $(patsubst %.bl.in,%,$(wildcard *.bl.in))\
)
$(foreach targ,$(bl_scripts),$(eval $(call Dependify,$(targ),bl)))

undefine Dependify


downloaded := $(sort\
 $(dl_scripts)\
 $(DOWNLOADED)\
)

# We tally up all the files that are built
# including all possible intermediate files:
built := $(sort\
 $(patsubst %.jsp,%.js,$(wildcard *.jsp))\
 $(patsubst %.cs,%.css,$(wildcard *.cs))\
 $(patsubst %.in,%,$(wildcard *.in))\
 $(patsubst %.bl.in,%.bl,$(wildcard *.bl.in))\
 $(patsubst %.jsp.in,%.jsp,$(wildcard *.jsp.in))\
 $(patsubst %.cs.in,%.cs,$(wildcard *.cs.in))\
 $(patsubst %.jsp.bl,%.jsp,$(wildcard *.jsp.bl))\
 $(patsubst %.cs.bl,%.cs,$(wildcard *.cs.bl))\
 $(bl_scripts)\
)

# built and installed
built := $(sort $(built) $(BUILD))

# We could build intermediate files, so we filter them out
installed := $(sort\
 $(built)\
 $(INSTALLED)\
 $(downloaded)\
 $(wildcard *.js *.css *.html *.gif *.jpg *.png)\
 $(filter-out %.jsp,$(filter-out %.cs,$(filter-out %.in,$(built))))\
)

# now add the stuff not installed
built := $(sort $(built) $(BUILD_NO_INSTALL))


cleanfiles := $(built) $(CLEANFILES)
cleanerfiles := $(sort $(CLEANERFILES) $(wildcard *.pyc))



# default target
build: $(downloaded) $(built)

# this will make config.make automatically
config:


ifneq ($(subdirs),)
# directory recursive makes
define Rec
  $$(patsubst rec_%,%,$(1)): $(1)
endef
rec := rec_build rec_clean rec_cleaner\
 rec_distclean rec_install rec_download\
 rec_config rec_debug
$(foreach targ,$(rec),$(eval $(call Rec,$(targ))))
undefine Rec

$(rec):
	for d in $(subdirs) ; do\
 $(MAKE) -C $$d $(patsubst rec_%,%,$(@)) || exit 1 ;\
 done
endif


# run 'make debug' to just spew this stuff:
debug:
	@echo "cleanerfiles=$(cleanerfiles)"
	@echo "INSTALL_DIR=$(INSTALL_DIR)"
	@echo "built=$(built)"
	@echo "downloaded=$(downloaded)"
	@echo "installed=$(installed)"

help:
	@echo -e "  $(MAKE) [TARGET]\n"
	@echo -e "  Common TRAGETs are:"
	@echo -e '$(foreach \
	    var,build install download clean distclean,\n   $(var))' 

# some suffix recipes

# download script to targets
# *.dl -> *
$(dl_scripts):
	./$@.dl || (rm -rf $@ ; exit 1)

$(bl_scripts):
	./$@.bl || (rm -rf $@ ; exit 1)

# It's very important to say: "This is a generated file" in the upper
# comments of generated files, hence this messy 'bash/sed' code just
# below.
# *.in -> *
$(in_files):
	if head -1 $@.in | grep -E '^#!' ; then\
	     sed -n '1,1p' $@.in | sed $(sed_commands) > $@ &&\
	     echo -e "// This is a generated file\n" >> $@ &&\
	     sed '1,1d' $@.in | sed $(sed_commands) >> $@ ;\
	   elif [[ "$@" =~ \.jsp$$|\.js$$|\.cs$$|\.css$$ ]] ; then\
	     echo -e "/* This is a generated file */\n" > $@ &&\
	     sed $@.in $(sed_commands) >> $@ ;\
	   else\
	     sed $@.in $(sed_commands) > $@ ;\
	   fi
	if [[ $@ == *.bl ]] ; then chmod 755 $@ ; fi
	if [ -n "$($@_MODE)" ] ; then chmod $($@_MODE) $@ ; fi

# *.jsp -> *.js
%.js: %.jsp
	echo "/* This is a generated file */" > $@
	$(JS_COMPRESS) $< >> $@

# *.cs -> *.css
%.css: %.cs
	echo "/* This is a generated file */" > $@
	$(CSS_COMPRESS) $< >> $@


# We have just one install directory for a given source directory
install: build
ifneq ($(INSTALL_DIR),)
	mkdir -p $(INSTALL_DIR)
ifneq ($(installed),)
	cp -r $(installed) $(INSTALL_DIR)
endif
endif


$(top_srcdir)/config.make:
	echo -e "# This is a generated file\n" > $@
	echo -e '$(foreach \
	    var,$(config_vars),\n$(var) := $(strip $($(var))\n))' |\
	    sed -e 's/^ $$//' >> $@

download: $(downloaded)

clean:
ifneq ($(cleanfiles),)
	rm -f $(cleanfiles)
endif

distclean cleaner: clean
ifneq ($(downloaded),)
	rm -rf $(downloaded)
endif
ifneq ($(cleanerfiles),)
	rm -f $(cleanerfiles)
endif

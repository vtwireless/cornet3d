# This is a GNU make file that is particular to this cornet3d
# package.


# PREFIX is there from quickbuild

# CSS_COMPRESS is used in quickbuild.make to make
# *.css from *.cs files.
#CSS_COMPRESS ?= yui-compressor --line-break 70 --type css
# if not compressing
CSS_COMPRESS ?= cat

# JS_COMPRESS is used in quickbuild.make to make
# *.js from *.jsp files.
#JS_COMPRESS ?= yui-compressor --line-break 70 --type js
# if not compressing
JS_COMPRESS ?= cat

# How to run node js with the system #! at the top of the
# file that is being run.  This is the default that may
# be overridden in config.make.
NODEJS_SHABANG ?= /usr/bin/env node

IN_VARS := NODEJS_SHABANG

# This is a GNU make file that uses GNU make make extensions


# src/ is built with src.dl

build: src/libliquid.so

# src/ must be built before stuff in it
# but since the time stamp of src/ changes
# with all files in it we can't have
# src/libliquid.so have dependent on src/.
src/libliquid.so: src
	cd src
	./bootstrap.sh
	CFLAGS="-march=native -g -O2 -Wall" ./configure --prefix=$(PREFIX)
	($(MAKE) -f makefile -j $(shell nproc || echo '3'))


install: $(PREFIX)/lib/libliquid.so

$(PREFIX)/lib/libliquid.so: src
	cd src
	($(MAKE) -f makefile install)


include ../../quickbuild.make

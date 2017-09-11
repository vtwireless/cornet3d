# This is a GNU make file that uses GNU make make extensions


build: src/libfec.so


# src/ must be built before stuff in it
# but since the time stamp of src/ changes
# with all files in it we can't have
# src/libfec.so dependent on src/.

src/libfec.so: src
	cd src
	CFLAGS="-fPIC -march=native -g -O2 -Wall" ./configure --prefix=$(PREFIX)
	($(MAKE) -j $(shell nproc || echo '3'))


install: $(PREFIX)/lib/libfec.so

$(PREFIX)/lib/libfec.so:
	cd src
	($(MAKE) install)


include ../../quickbuild.make

files := $(wildcard *.cc)

all: $(files)
	g++ -O3 -DNDEBUG=1 -Wall -Wextra -std=c++11 -shared -o libLTPV.so -fPIC $(files) -lOpenCL
clean:
	rm -f libLTPV.so

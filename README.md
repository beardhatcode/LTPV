LTPV: Light Temporal Performance Viewer
---------------------------------------
**This project is not actively maintained**

LTPV is a light and generic profiler for High Performance Computing applications. It can be used as an OpenCL profiler.

[**Click here to see an online demonstration (only compatible with recent versions of Firefox, Chrome/Chromium)**](https://cdn.rawgit.com/LTPV/LTPV/master/share/ltpv/index.html?file=https://cdn.rawgit.com/LTPV/LTPV/master/demos/example.xml)

LTPV is a light and generic profiler for High Performance Computing applications. It aims at easily profile C/C++ application using or not the OpenCL library. It results from the lack of an easy-to-use profiler for OpenCL applications.

![https://raw.githubusercontent.com/wiki/LTPV/LTPV/inc/workflow_simple.png](https://raw.githubusercontent.com/wiki/LTPV/LTPV/inc/workflow_simple.png)

Download
--------

- as a zip archive: [https://github.com/LTPV/LTPV/archive/master.zip](https://github.com/LTPV/LTPV/archive/master.zip)
- with git: git clone https://github.com/LTPV/LTPV.git

Installation
------------

Until now, this project was only used on Unix platform. Any help to make this profiler work with other architectures is welcomed.

### Unix

**Note that you will need administrator privileges to complete the installation.**

* Open a terminal in ltpv/:

```
    cd ltpv/src
    make
```
the library will be installed in /usr/local/ folder.


Usage
-----


### Profile OpenCL kernels and data transfer


Since LTPV overwrite OpenCL function calls,
you have nothing particular to do appart launching your program with :

```bash
LD_PRELOAD=/path/to/src/libltpv.so ./my_gpu_program
```

### Profile CPU functions

In order to profile CPU function you have to include ltpv header into your project :
```c
#include <ltpv.h>
```
and compile you code with the libdl library
```bash
gcc ... -ldl ...
```
Now, you can track CPU function by surrounding your code with:
```c
LTPV(my_function_to_track());
```
or
```c
LTPV(my_function_to_track(), "My GPU function");
```
or
```c
LTPV(my_function_to_track(), "My GPU function", [id of the displayed queue on the viewer] );
```
Note : ltpv.h contains only macros and functions relying on dynamic linking mecanisms.
you don't need to link your program with libltpv at compilation time. however you should link with -ldl.

### Gather OpenCL profiling data before the end of the program.

If you want to gather profiling infos. before the program ends (for example to get profiling information from intel OpenCL implementation)
```c
LTPV_OPENCL_FINISH();
```
### Viewer

Once your program terminate, a firefox window would popup with all profiling informations inside.
Here some key features.

#### Zoom in
You can zoom in with **[F2]** key or with a left click-and-drag:
<img src="inc/zoom_in_click_and_drag.png">

#### Zoom out
You can zoom in with **[F1] key** or by right-clicking.

#### go left/go right
  * Zoom out, then zoom in somewhere else
  * Use arrow keys: ⇦/⇨

#### Get information about a task
You can either:
  * Move you mouse over the task
  * Click on it
Furthermore, the advanced view gives you more detailed informations and a raw array of the XML provided informations.

Other resources
---------------
- [Technical structure](https://github.com/LTPV/LTPV/wiki/Technical-structure)
- [Known limitations and bugs](https://github.com/LTPV/LTPV/wiki/Known-limitations-and-bugs)
- [Frequently Asked Question](https://github.com/LTPV/LTPV/wiki/FAQ:-Frequently-Asked-Questions)


License
-------

This project is under GNU LGPL 2.1 See LICENSE for more information.

Contributor
-----------
(Alphabetic order)

* Simon Denel (Thales SA)
* ixeft
* Robbert Gurdeep Singh

You can contact us by filling in a new issue ! (nobody bites ;) )


LICENCE
-------

See LICENCE (GNU LESSER GENERAL PUBLIC LICENSE)

Quick and dirty changes in this version:

- Load files via input field,
- do away with waf files
- create enough colours

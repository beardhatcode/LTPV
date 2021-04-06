let
  pkgs = import <nixpkgs> { };
in
pkgs.mkShell {
  buildInputs = [
    pkgs.gcc
    pkgs.opencl-clhpp # for cl2.hpp
    pkgs.opencl-info
    pkgs.ocl-icd # for -lOpenCL

  ];
}

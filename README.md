# DEPRECATION NOTICE

This repository has been deprecated. Please use the latest Docker image at https://hub.docker.com/r/katalonstudio/katalon.

# Katalon Studio Docker

An image that contains all of the requirements to run Katalon Studio
[Console Mode Execution](https://docs.katalon.com/display/KD/Console+Mode+Execution).

The image is based on [openjdk:slim](https://hub.docker.com/_/openjdk/), installs [Xvfb](https://www.x.org/archive/X11R7.6/doc/man/man1/Xvfb.1.xhtml) (X virtual frame buffer) and [SWT JNI](https://www.eclipse.org/swt/). Additionally the OpenJDK "Assistive Technology" option is being disabled.

## Usage

```sh
docker run --rm katalon -runMode=console ...
```

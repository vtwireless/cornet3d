# Server Public Document Root

This directory and all it's sub-directories contains files that are:

   1. directly used by web browsers, or

   2. are project build files that manage the files here-in.


This web app (CORNET3D) depends on other software that is not necessarily
distributed with these files, so we have a build/management process for the
files in this directory.  At the time of this writing we are of the
opinion that software build systems do not appear to have caught up to
be standardized for web apps.  We are not interested into buying into an
integrated development environment, which we feel would restrict the
usability of this software project.

**Put simply** we do not want to distribute dependent packages, so we
automate how to make this usable.


## Development Notes


### Keep it so we can browse with a local copy 

For example we can run

```console
firefox index.html
```

or

```console
firefox http:/host.com/index.html
```

there the web server document root is this directory.


### File suffixes


#### Served Files

.png .jpg .gif .js .html .css


### Source Files And What They Build

 .jsp (javaScript)                    -> .js  (compressed javaScript)
 .jsc (concatenation file list)       -> .js
 .cs  (CSS)                           -> .css (compressed CSS)
 .csc (concatenation CSS file list)   -> .css
 .jsd (download javaScript)           -> .js
 .cssd (download CSS)                 -> .css


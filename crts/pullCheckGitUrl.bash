#!/bin/bash


# Usage: PullCheckGitUrl URL TAG REPO_DIR SRC_DIR
#                        $1  $2  $3       $4
# global topsrcdir must be defined
# This function sets up all the source files.
# TODO: consider what branch we use.  It's usually master.
function PullCheckGitUrl()
{
    [ -n "$4" ] || exit 1
    local url=$1
    local cwd="$PWD"
    local repo_dir=$cwd/$3
    local src_dir=$cwd/$4

    if [ ! -f "$repo_dir/.git/config" ] ; then
        git clone --recursive "$url" "$repo_dir"
    fi

    cd $repo_dir

    url="$(git config --get remote.origin.url)"
    set +x
    if [ "$url" != "$1" ] ; then
        echo "git cloned repo in \"$PWD\" is not from $1 it's from $url"
        exit 1
    fi
    echo -e "\ngit clone of \"$1\" in \"$PWD\" was found.\n"
    echo -e "pulling latest changes from $url\n"
    set -x
    #git pull --recurse-submodules
    git pull

    # pull the version of the source we want into the src_dir note: We are
    # not counting on the authors of this liquid-dsp code to not modify
    # the source code as they build the code.  Most package build systems
    # are notorious for polluting source code as they build, so we start
    # with clean copy of source files at the beginning of the build for
    # each build attempt; hence we do the following:
    git archive\
 --format=tar "$2" | $(cd "$src_dir" && tar -xf -)
    cd "$cwd"
}


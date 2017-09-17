# This is sourced by other files in the build process

function Usage()
{
    echo "Usage: Download target url [sha512sum] [--header HEADER]"
    exit 1
}


function Download()
{
    [ -z "$2" ] && Usage

    local target=$1
    local url=$2
    local header=
    local sha512=
    local noCheck=
    

    if [ "$3" == "--header" ] ; then
        header="$4"
    elif [ -n "$3" ] ; then
        sha512sum="$3"
    fi

    [ -n "$sha512sum" ] && noCheck="--no-check-certificate"

    # fail on error and verbose
    #trap "rm -f $1" ERR

    set -x

    rm -f $target

    [ -n "$header" ] && echo -e "$header" > $target

    tmpfile=$(mktemp --suffix="_download_tmp") || return 1

    if ! wget $url -O $tmpfile --no-use-server-timestamps $noCheck ; then
        rm -f $tmpfile $target
        return 1
    fi

    if [ -n "$sha512sum" ] ; then
        # Check that the sha512 hash is correct for this downloaded file:
        if ! echo "$sha512sum  $tmpfile" | sha512sum -c ; then
            rm -f $tmpfile $target
            return 1
        fi
    else
        sha512sum $tmpfile
    fi

    cat $tmpfile >> $target

    rm -f $tmpfile

    set +x

    return 0 # success
}

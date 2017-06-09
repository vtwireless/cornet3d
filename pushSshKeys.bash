#!/bin/bash


prog="$(basename $0)"


# gnome-keyring BUG:
# gnome-keyring was trying to handle all SSH key usage, preventing
# the keys from working.
# see: https://chrisjean.com/ubuntu-ssh-fix-for-agent-admitted-failure-to-sign-using-the-key/
# Setting evn: SSH_AUTH_SOCK=0 can stop ssh from using the gnome-keyring



function usage()
{
    cat << EOF || exit $?

   Usage: $prog TO_HOST [-f FROM_HOST] [ssh_options]

    Generate ssh public/private rsa key pair (if needed) and put
    the public key on the machine at TO_HOST, so that you may ssh to
    TO_HOST from the current machine FROM_HOST without a password.

    If FROM_HOST is not given the output of 'hostname -s' will be
    used as the host name we ssh from.

    If ssh_options are given they will be the first arguments to the
    ssh calls.  Example:

               $prog workhorse -f rider -p 4554
 

  References:

    This follows something like what you see at:
    
        http://www.linuxproblem.org/art_9.html

    Or google search:
    
        ssh without password

  BUGS:

    The gnome-keyring can interfer with ssh in general.  You can
    disable the gnome-keyring by setting environment variable
    SSH_AUTH_SOCK=0, so for example in a bash shell run:

        unset SSH_AUTH_SOCK

    Security-Enhanced Linux (SELinux) can do a good job of keeping
    sshing with keys from working by limiting access to .ssh/ files.


EOF

    exit 1
}

[ -z "$1" ] && usage

tohost=
sshoptions=" "
fromhost="$(hostname -s)" || exit 1
who="$(whoami)"

tohost="$1"
shift 1

while [ -n "$1" ] ; do
    case "$1" in
        --help|-h)
	    usage
	    ;;
	-f)
	    shift 1
 	    [ -z "$1" ] && usage
	    fromhost="$1"
	    ;;
        *)
            sshoptions="${sshoptions}$1 "
            ;;
    esac
    shift 1
done



function checkLocalKeys()
{
    set +x 
    if [ ! -f "${HOME}/.ssh/id_rsa" ] ; then
        echo
        echo "generating ssh keys ..."
        set -x
        echo -e "\n\n\n\n\n\n\n\n" |\
            ssh-keygen -t rsa -N '' || exit $?
        set +x
    else
        echo
        echo "Your local ssh keys exist in ${HOME}/.ssh/id_rsa, which is fine."
    fi

    if [ ! -f "${HOME}/.ssh/id_rsa" ] ; then
        echo
        echo "failed to generate ssh keys"
        echo
        exit 1
    fi
}

function success()
{
    set +x
    echo "$prog was successful"
    exit 0
}


function checkWorksAlready()
{
    set -x
    if ssh ${sshoptions}-o 'StrictHostKeyChecking no' -o\
 'PreferredAuthentications=publickey' $1 'echo "It worked"'
        set +x
        echo -e "\nLooks like you can ssh to $1 without a password already\n" ; then
        success
    fi
}
        

function rmHostFromKnown()
{
    set -x
    if ! ssh-keygen -R $1 ; then
        set +x
        echo "failed to remove host $1 from .ssh/known_hosts"
        echo "but that may be because you do not know them yet"
        echo
    else
        set +x
    fi
}

function pushPublicKeyToHyHost()
{
    set -x
    cat ${HOME}/.ssh/id_rsa.pub | ssh ${sshoptions}-o 'StrictHostKeyChecking no' $1\
 'mkdir -p ${HOME}/.ssh && cat >> ${HOME}/.ssh/authorized_keys && chmod 600 ${HOME}/.ssh/authorized_keys && chmod 700 ${HOME}/.ssh'\
 || exit $?
    set +x
}

# disable the gnome-keyring 
export SSH_AUTH_SOCK=0

checkLocalKeys "${fromhost}"
checkWorksAlready ${tohost}
rmHostFromKnown ${tohost}
pushPublicKeyToHyHost ${tohost}
success


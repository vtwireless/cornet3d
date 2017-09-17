#include <stdio.h>
#include <signal.h>
#include <sys/types.h>
#include <unistd.h>
#include <stdarg.h>
#include <string.h>

#include "debug.h"

#define SPEW_FILE stdout


static void _vspew(const char *pre, const char *file,
        int line, const char *func,
        const char *fmt, va_list ap)
{
    fprintf(SPEW_FILE, "%s%s:%d %s(): ", pre, file, line, func);
    vfprintf(SPEW_FILE, fmt, ap);
}

void _spew(const char *pre, const char *file,
        int line, const char *func, const char *fmt, ...)
{
    va_list ap;
    va_start(ap, fmt);
    _vspew(pre, file, line, func, fmt, ap);
    va_end(ap);
}

void _assertAction()
{
    pid_t pid;
    pid = getpid();
#ifdef ASSERT_ACTION_EXIT
    fprintf(SPEW_FILE, "Will exit due to error\n");
    exit(1); // atexit() calls are called
    // See `man 3 exit' and `man _exit'
#else // ASSERT_ACTION_SLEEP
    int i = 1; // User debugger controller, unset to effect running code.
    fprintf(SPEW_FILE, "  Consider running: \n\n  gdb -pid %u\n\n  "
        "pid=%u will now SLEEP ...\n", pid, pid);
    while(i) { sleep(1); }
#endif
}

static void segSaultCatcher(int sig)
{
    ERROR("caught signal %d SIGSEGV\n", sig);
    _assertAction();
}

// Add this to the start of your code so you may see where your code is
// seg faulting.
void crts_catchSigFault(void)
{
    struct sigaction s;
    memset(&s, 0, sizeof(s));
    s.sa_handler = segSaultCatcher;
    s.sa_flags = SA_RESETHAND;
    ASSERT(0 == sigaction(SIGSEGV, &s, 0), "");
}

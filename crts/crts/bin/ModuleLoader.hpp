#ifndef _GNU_SOURCE
#  define _GNU_SOURCE
#endif
#include <dlfcn.h>
#include <stdio.h>

template <class Base, class Create>
class ModuleLoader
{
    public:
        ModuleLoader(void);
        virtual ~ModuleLoader(void);
        // Returns false on success, true otherwise
        bool loadFile(const char *dso_path, int addLD_flags = 0);
        // create is a function pointer.
        Create create;
        // destroy is a function pointer.
        void *(*destroy)(Base *base);

    private:
        void *dhandle;
};


template <class Base, class Create>
ModuleLoader<Base, Create>::ModuleLoader():create(0),destroy(0)
{
}


template <class Base, class Create>
bool ModuleLoader<Base, Create>::loadFile(const char *dso_path, int addLD_flags)
{
    dhandle = dlopen(dso_path, RTLD_LAZY|addLD_flags);
    if(!dhandle)
    {
        WARN("dlopen() failed: %s\n", dlerror());
        return true;
    }

    dlerror(); // clear the error.
    void *(*loader)(void **, void **) =
         (void *(*)(void **, void **)) dlsym(dhandle, "loader");
    char *error = dlerror();
    if(error != 0)
    {
        WARN("dlsym() failed: %s\n", error);
        dlclose(dhandle);
        dhandle = 0;
        return true; // failed
    }

    loader((void **) &create, (void **) &destroy);

    if(!create)
    {
        WARN("failed to get create factory function\n");
        destroy = 0;
        dlclose(dhandle);
        dhandle = 0;
        return true; // failed
    }
    DSPEW();
    return false; // success
}

template <class Base, class Create>
ModuleLoader<Base, Create>::~ModuleLoader(void)
{
    dlerror(); // clear the error.
    if(dhandle && dlclose(dhandle))
        ERROR("dlclose(%p) failed: %s\n", dhandle, dlerror());
    DSPEW();
}

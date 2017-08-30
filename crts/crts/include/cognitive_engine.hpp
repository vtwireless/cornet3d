#ifndef _CE_HPP_
#define _CE_HPP_

// forward declare ECR class
class ExtensibleCognitiveRadio;

///////////////////////////////////////////
// Cognitive Engine base class
/// \brief The base class for the custom
/// cognitive engines built using the ECR
/// (Extensible Cognitive Radio).
///
/// This class is used as the base for the custom
/// (user-defined) cognitive engines (CEs) placed
/// in the cognitive_engines/ directory of the
/// source tree.  The CEs following
/// this model are event-driven: While the radio is running,
/// if certain events occur as defined in
/// ExtensibZZleCognitiveRadio::Event, then the custom-defined
/// execute function (Cognitive_Engine::execute()) will be called.
class CognitiveEngine {
public:
  CognitiveEngine();
  virtual ~CognitiveEngine();
  ExtensibleCognitiveRadio *ECR;
  /// \brief Executes the custom cognitive engine
  /// as defined by the user.
  ///
  /// When writing a custom cognitive engine (CE) using
  /// the Extensible Cognitive Radio (ECR), this
  /// function should be defined to contain the
  /// main processing of the CE.
  /// An ECR CE is event-driven:
  /// When the radio is running,
  /// this Cognitive_Engine::execute() function is
  /// called if certain events, as defined in
  /// ExtensibleCognitiveRadio::Event, occur.
  ///
  /// For more information on how to write a custom CE using
  /// using the ECR, see TODO:Insert refence here.
  /// Or, for direct examples, refer to the source code of
  /// the reimplementations listed below
  /// (in the cognitive_engines/ directory of the source tree).
  virtual void execute();
};


// A CognitiveEngine module must define the two CognitiveEngine object
// factory functions: createCE() and destroyCE() and loader() by using
// this MACRO function.   The exposed symbol is loader() which we get with
// the dynamic shared object loading API functions dlopen(3), dlsym(3),
// and dlclose(3).  The argument derived_class_name is the derived
// class name which must publicly inherit CognitiveEngine.
// Call this macro outside all code blocks without a tailing semi-colon.
//
#define MAKE_CE_MODULE_FACTORY(derived_class_name)\
    static CognitiveEngine *createCE(int argc, char **argv, ExtensibleCognitiveRadio *ECR)\
    {\
        return new derived_class_name(argc, argv, ECR);\
    }\
    static void destroyCE(CognitiveEngine *ce)\
    {\
        delete ce;\
    }\
    extern "C"\
    {\
        void loader(void **c, void **d)\
        {\
            *c = (void *) createCE;\
            *d = (void *) destroyCE;\
        }\
    }


#endif //#ifndef _CE_HPP_

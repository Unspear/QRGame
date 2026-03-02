set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED On)

if (DEFINED EMSCRIPTEN)
    add_executable(ppmd Model.cpp Coder.cpp)

    target_link_options(
      ppmd
      PRIVATE
      "SHELL:-sENVIRONMENT='web'"
      -sEXPORT_ES6
      -sEXPORT_NAME=PPMd
      -sALLOW_MEMORY_GROWTH=1
      -sINVOKE_RUN=0
      -sMODULARIZE=1
      -sFORCE_FILESYSTEM=1
      -sEXPORTED_FUNCTIONS=_encode,_decode
      # RelWithDebInfo build flags, enable separate dwarf
      # to reduce wasm file size
      $<$<CONFIG:RELWITHDEBINFO>:-gseparate-dwarf=${CMAKE_CURRENT_BINARY_DIR}/ppmd.dwarf>
      $<$<CONFIG:RELWITHDEBINFO>:-g>
      $<$<CONFIG:RELWITHDEBINFO>:-O2>
      # Debug build flags
      $<$<CONFIG:DEBUG>:-fwasm-exceptions>
      $<$<CONFIG:DEBUG>:-g>
      $<$<CONFIG:DEBUG>:-O0>
      # Exported Emscripten runtime methods
      "SHELL:-sEXPORTED_RUNTIME_METHODS=FS,ccall")

    # Custom command and target to copy our compiled WASM and JS
    # files from the C++ build directory into the web app's source
    # directory under src/compiled

    set(WEB_OUT_DIR ${PROJECT_SOURCE_DIR}/src/compiled)

    add_custom_command(
      DEPENDS ppmd
      OUTPUT ${WEB_OUT_DIR}/ppmd.js ${WEB_OUT_DIR}/ppmd.wasm
      COMMAND cmake -E make_directory ${WEB_OUT_DIR}
      COMMAND cmake -E copy_if_different ${CMAKE_CURRENT_BINARY_DIR}/ppmd.js
              ${CMAKE_CURRENT_BINARY_DIR}/ppmd.wasm ${WEB_OUT_DIR})

    add_custom_target(
      copy_wasm_to_website ALL
      DEPENDS ${WEB_OUT_DIR}/ppmd.js ${WEB_OUT_DIR}/ppmd.wasm
      COMMENT "Copying wasm build to ${WEB_OUT_DIR}")
else()
    add_library(ppmd STATIC Model.cpp Coder.cpp)
    add_executable(unit unit.cpp)
    target_link_libraries(unit PRIVATE ppmd)
endif()
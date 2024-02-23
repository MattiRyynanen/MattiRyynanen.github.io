# Introduction

My name is Matti Ryynänen and I am Doctor of Science (Tech.) in signal processing. I have 15+ years of experience in algorithm and software development, machine learning applications, and gaming industry on various platforms (mobile devices, web, gaming consoles).

For more detailed information on my work career, please see my LinkedIn [profile](https://www.linkedin.com/in/mattiryynanen/).

# Projects

This is a short collection of projects which I have worked for fun on my free time. The purpose of these projects is to try out various technologies and learn on the go.


#### [Sudoku detector](webcam-sudoku/) from web camera

* Detection is running and updating in real-time on browsers, including mobile devices.
* Try the detector on your browser [here](webcam-sudoku/). Start the camera and point it to a Sudoku puzzle, for example, on your newspaper.
* Image processing, including Sudoku placement detection, blurring, and warping written in TypeScript.
* Digit recognition neural network trained with a small, custom-collected dataset with Keras / Tensorflow in python.
* Real-time digit recognition inference is done **in browser on the device** with tensorflow.js

An example of the Sudoku detector running on a mobile phone browser.

<img src="readme-images/webcam-sudoku-mobile-browser.jpeg" alt="drawing" width="40%">

* The red rectangular area shows the detected Sudoku puzzle from the web camera image.
* The lower part shows the warped and segmented Sudoku puzzle with inferred digits with red and the numbers solving the puzzle with green.

#### Shortest path finding with A* or Dijkstra ([3D demo](a-star-vs-dijkstra-3d/), [2D demo](a-star-vs-dijkstra/))

* The A* and Dijkstra algorithm for the shortest path finding implemented in C++.
* Converted to [WebAssembly](https://webassembly.org/) with [Emscripten](https://emscripten.org/) toolchain.
* A [3D version](a-star-vs-dijkstra-3d) created using [GLFW](https://www.glfw.org/) and [Dear ImGui](https://github.com/ocornut/imgui), targeting toward OpenGL ES 3.0.
<img src="readme-images/a-star-3d.png" alt="drawing" width="70%">
* A humble [2D visualization](a-star-vs-dijkstra/) implemented with [SDL2](https://www.libsdl.org/).
<img src="readme-images/a-star-dijkstra.png" alt="drawing" width="70%">

#### Drum chop tool

I enjoy playing drums (and guitar, too) a lot so I implemented a small rehearsal tool for myself to explore drum chops and polyrhythmic sequences in a web browser.

<img src="readme-images/drum-chop-tool.png" alt="drawing" width="80%">

Try it out on your browser [here](drum-chops/).

* Written in TypeScript with React
* Using [tone.js](https://tonejs.github.io/) for sound synthesis


#### Step-by-step [Sudoku solver](scala-sudoku/)

* Written in Scala and running on web via [scala.js](https://www.scala-js.org/)
* Shows individual steps for the solution.
* Try it out [here](scala-sudoku/index.html)

<img src="readme-images/step-by-step-sudoku.png" alt="drawing" width="60%">


#### Haskell Sudoku step-by-step solver

I enjoy utilising functional programming concepts so I wrote a small command-line application for Sudoku puzzle solving using Haskell (a purely functional programming language).

* The source code is available on my GitHub [repository](https://github.com/MattiRyynanen/haskell-sudoku)
* Using [QuickCheck](https://hackage.haskell.org/package/QuickCheck) for property-based testing
* Using [doctest](https://hackage.haskell.org/package/doctest) for interactive testing

<img src="readme-images/haskell-sudoku-view.png" alt="drawing" width="80%">


# Research

My old research demo pages, PhD thesis, and publications can be found [here](research/research.html).
# Up There - WebVR edition

Up There is a three-dimensional VR planetarium, which contains true 3D positions of over 100,000k nearby stars. You can fly through them at warp speeds, and each star rendered with proportional scaling and coloring based on its magnitude (apparent) and surface temperature.

# Where's the code from?

I forked the wonderful [A-Painter](https://blog.mozvr.com/a-painter/) from Mozilla when I started porting this project over from Unreal Engine 4. It is wonderful boilerplate, and is a good structure to start with. They get a lot done with not a lot of code.

## Usage

- Grab a [WebVR-enabled browser](https://webvr.info/get-chrome/). Currently only the experimental Chromium build on Windows supports the Vive controllers. (You will need to enable these flags for WebVR and Gamepad Extensions: `chrome://flags#enable-webvr` and `chrome://flags#enable-gamepad-extensions`.)
- Head to [https://aframe.io/a-painter/](https://aframe.io/a-painter/) and start painting. See the [blog post](https://blog.mozvr.com/a-painter/) for some instructions.
- Painted something beautiful? Share it on [this GitHub issue](https://github.com/aframevr/a-painter/issues/99)!

## Local Development

```bash
git clone git@github.com:aframevr/a-painter && cd a-painter
npm install
npm start
```

Then, load [`http://localhost:8080`](http://localhost:8080) in your browser.

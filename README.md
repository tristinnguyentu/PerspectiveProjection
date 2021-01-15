# Perspective Projection
This is a demo of a popular visualization technique for rendering 3D objects. Although the visualizations are relatively realistic, you cannot accurately judge distances and angles from objects drawn using this technique. 

One restriction of this project was that no graphics library functions could be used except for the one to color in a single pixel. The p5.js library was used to easily accomplish this on the HTML canvas, although this meant that an algorithm for efficiently drawing each line needed to be implemented first. 

The transformations available are not exhaustive because the focus of the demo is to show how 3D coordinates can be mapped to 2 dimensions, and seeing the transformations helps prove this idea. Also, the demo assumes that the 3D coordinates are already in the eye/camera-coordinate system, so improvements can be made to first convert the coordinates from the world-coordinate system to the eye-coordinate system in order to improve the rendering of the object. 

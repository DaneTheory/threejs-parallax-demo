$(document).ready(function() {
  var stats, scene, renderer, composer;
  var camera, cameraControl, screen_range_x, screen_range_y;

  var particles, material, particleSystem, screen_range_x, screen_range_y;
  var VIEW_ANGLE = 45,
      NEAR = 1,
      FAR = 100,
      CAMERA_Z = 100,
      PARTICLE_COUNT = 500;


  // init the scene
  function init(){
    if( Detector.webgl ){
      renderer = new THREE.WebGLRenderer({
        antialias: true, // to get smoother output
        preserveDrawingBuffer: true // to allow screenshot
      });
      renderer.setClearColorHex( 0x000000, 1 );
    }else{
      Detector.addGetWebGLMessage();
      return true;
    }
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.getElementById('container').appendChild(renderer.domElement);

    // add Stats.js - https://github.com/mrdoob/stats.js
    stats = new Stats();
    stats.domElement.style.position  = 'absolute';
    stats.domElement.style.bottom  = '0px';
    document.body.appendChild( stats.domElement );

    // create a scene
    scene = new THREE.Scene();

    // put a camera in the scene
    camera  = new THREE.PerspectiveCamera(VIEW_ANGLE, window.innerWidth / window.innerHeight, NEAR, FAR);
    camera.position.set(0, 0, CAMERA_Z);
    camera.velocity = new THREE.Vector3((Math.random() - 0.5) / 2, (Math.random() - 0.5), 0);
    scene.add(camera);

    $(window).keydown(function(evt) {
      switch (evt.keyCode) {
        case 37:
          if (camera.velocity.x > -0.5) {
            camera.velocity.x -= 0.05;
          };
          return;
        case 39:
          if (camera.velocity.x < 0.5) {
            camera.velocity.x += 0.05;
          };
          return;
        case 40:
          if (camera.velocity.y > -0.5) {
            camera.velocity.y -= 0.05;
          };
          return;
        case 38:
          if (camera.velocity.y < 0.5) {
            camera.velocity.y += 0.05;
          };
          return;
      }
    });

    // transparently support window resize
    THREEx.WindowResize.bind(renderer, camera);
    // allow 'p' to make screenshot
    THREEx.Screenshot.bindKey(renderer);
    // allow 'f' to go fullscreen where this feature is supported
    if( THREEx.FullScreen.available() ){
      THREEx.FullScreen.bindKey();
      document.getElementById('inlineDoc').innerHTML  += "- <i>f</i> for fullscreen";
    }

    // find max range of screen
    screen_range_x = Math.tan(camera.fov * Math.PI / 180 * 0.5) * camera.position.z * 2;
    screen_range_y = screen_range_x * camera.aspect;

    // create particles at random locations
    particles = new THREE.Geometry();
    for (var p = 0; p < PARTICLE_COUNT; p++) {
      var pX, pY, pZ, depthMagnitude, particle, color;

      depthMagnitude = Math.random();
      pX = Math.random() * (2 * screen_range_x) - screen_range_x;
      pY = Math.random() * (2 * screen_range_y) - screen_range_y;
      pZ = depthMagnitude * CAMERA_Z;

      particle = new THREE.Vertex(new THREE.Vector3(pX, pY, pZ));
      particles.vertices.push(particle);

      // set the brightness based upon distance, closer particles are brighter
      color = new THREE.Color();
      color.setRGB(depthMagnitude * 2, depthMagnitude * 2, depthMagnitude * 2);
      particles.colors.push(color);
    }

    // create a really basic material
    material = new THREE.ParticleBasicMaterial({
      size: 2,
      sizeAttenuation: false,
      vertexColors: true
    });

    particleSystem = new THREE.ParticleSystem(particles, material);
    particleSystem.sortParticles = true;
    scene.add(particleSystem);
  }

  // animation loop
  function animate() {

    // loop on request animation loop
    // - it has to be at the begining of the function
    // - see details at http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
    requestAnimationFrame( animate );

    // do the render
    render();

    // update stats
    stats.update();
  }

  // render the scene
  function render() {
    for (var p = 0; p < PARTICLE_COUNT; p++) {
      var particle = particles.vertices[p];

      if (particle.position.x - camera.position.x < -screen_range_x)
      {
        particle.position.x = camera.position.x + screen_range_x;
      }
      else if (particle.position.x - camera.position.x > screen_range_x)
      {
        particle.position.x = camera.position.x - screen_range_x;
      }

      if (particle.position.y - camera.position.y < -screen_range_y)
      {
        particle.position.y = camera.position.y + screen_range_y;
      }
      else if (particle.position.y - camera.position.y > screen_range_y)
      {
        particle.position.y = camera.position.y - screen_range_y;
      }
    }

    camera.position.addSelf(camera.velocity);

    // actually render the scene
    renderer.render( scene, camera );
  }

  if( !init() )  animate();
});

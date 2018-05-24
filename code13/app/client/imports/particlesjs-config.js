// Heads Up!
//
// Keep in sync with config in code13/landing/src/js/main.js
const particleConfig = {
  retina_detect: true,
  particles: {
    number: {
      value: 100,
      density: { enable: true, value_area: 800 },
    },
    color: { value: '#e6ffff' },
    shape: {
      type: 'circle',
      stroke: { width: 0, color: '#000000' },
    },
    opacity: {
      value: 0.7,
      random: true,
      anim: { enable: true, speed: 1, opacity_min: 0 },
    },
    size: {
      value: 3,
      random: true,
      anim: { enable: true, speed: 1, size_min: 1 },
    },
    line_linked: { enable: true, distance: 15, color: '#ffffff', opacity: 0.7, width: 1 },
    move: { enable: true, speed: 1, direction: 'top', random: true, out_mode: 'out' },
  },
  interactivity: {
    detect_on: 'canvas',
    events: {
      onhover: { enable: true, mode: 'grab' },
      onclick: { enable: true, mode: 'repulse' },
      resize: true,
    },
    modes: {
      grab: {
        distance: 150,
        line_linked: { opacity: 0.4 },
      },
      repulse: { distance: 200, duration: 0.4 },
    },
  },
}

export default particleConfig

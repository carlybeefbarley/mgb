const particleConfig = {
  retina_detect: true,
  particles: {},
  interactivity: {},
}

// ============================================================
// Particles
// ============================================================

particleConfig.particles.number = {
  value: 100,
  density: {
    enable: true,
    value_area: 800,
  },
}

particleConfig.particles.color = {
  value: '#e6ffff',
}

particleConfig.particles.shape = {
  type: 'circle',
  stroke: {
    width: 0,
    color: '#000000',
  },
}

particleConfig.particles.opacity = {
  value: 0.7,
  random: true,
  anim: {
    enable: true,
    speed: 1,
    opacity_min: 0,
    sync: false,
  },
}

particleConfig.particles.size = {
  value: 3,
  random: true,
  anim: {
    enable: true,
    speed: 1,
    size_min: 1,
    sync: false,
  },
}

particleConfig.particles.line_linked = {
  enable: true,
  distance: 15,
  color: '#ffffff',
  opacity: 0.7,
  width: 1,
}

particleConfig.particles.move = {
  enable: true,
  speed: 1,
  direction: 'top',
  random: true,
  straight: false,
  out_mode: 'out',
  bounce: false,
  attract: {
    enable: false,
    rotateX: 600,
    rotateY: 1200,
  },
}

// ============================================================
// Interactivity
// ============================================================

particleConfig.interactivity.detect_on = 'canvas'

particleConfig.interactivity.events = {
  onhover: {
    enable: true,
    mode: 'grab',
  },
  onclick: {
    enable: true,
    mode: 'repulse',
  },
  resize: true,
}

particleConfig.interactivity.modes = {
  grab: {
    distance: 150,
    line_linked: {
      opacity: 0.4,
    },
  },
  repulse: {
    distance: 194.89853095232283,
    duration: 0.4,
  },
  push: {
    particles_nb: 4,
  },
  remove: {
    particles_nb: 2,
  },
}

export default particleConfig

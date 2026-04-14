export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

export const getInitials = (name = 'User') => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const isLightColor = (color) => {
  if (!color || typeof color !== 'string') return false;
  
  // Handle gradients (simplified: check if it contains light color keywords or assumes light for simplicity, 
  // but better check start color)
  if (color.includes('gradient')) {
    // Check if it's one of the known "light" gradients
    const lightGradients = ['E0C3FC', 'F093FB', 'F8FAFC', 'FFFFFF'];
    return lightGradients.some(lg => color.toUpperCase().includes(lg));
  }

  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155;
};

export const hexToRgba = (hex, alpha = 1) => {
  if (!hex || typeof hex !== 'string') return `rgba(0,0,0,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

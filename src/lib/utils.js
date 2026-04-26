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
  
  if (color.includes('gradient')) {
    const lightGradients = ['E0C3FC', 'F093FB', 'F8FAFC', 'FFFFFF'];
    return lightGradients.some(lg => color.toUpperCase().includes(lg));
  }

  // Defensive check for URLs/Patterns
  if (!color.startsWith('#')) return false;

  const hex = color.replace('#', '');
  if (hex.length !== 6 && hex.length !== 3) return false;

  const cleanHex = hex.length === 3 ? hex.split('').map(c => c+c).join('') : hex;
  const r = parseInt(cleanHex.substr(0, 2), 16);
  const g = parseInt(cleanHex.substr(2, 2), 16);
  const b = parseInt(cleanHex.substr(4, 2), 16);
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

export const darkenHexColor = (hex, percent) => {
  if (!hex || typeof hex !== 'string') return hex;
  
  // Clean hex string
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  
  if (cleanHex.length !== 6) return hex;

  const num = parseInt(cleanHex, 16);
  const amt = Math.round(2.55 * percent);
  
  let R = (num >> 16) + amt;
  let G = (num >> 8 & 0x00FF) + amt;
  let B = (num & 0x0000FF) + amt;

  // Clamp values
  R = Math.max(0, Math.min(255, R));
  G = Math.max(0, Math.min(255, G));
  B = Math.max(0, Math.min(255, B));

  return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
};

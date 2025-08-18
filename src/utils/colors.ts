/**
 * Utility function to adjust color luminance
 * @param hexColor - Hex color string (e.g., "#FF0000")
 * @param luminance - Target luminance value (0-1)
 * @returns Adjusted hex color string
 */
export function adjustLuminance(hexColor: string, luminance: number): string {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Convert to HSL for easier luminance adjustment
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return [h, s, l];
  };
  
  const hslToRgb = (h: number, s: number, l: number) => {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return [
      Math.round(r * 255),
      Math.round(g * 255),
      Math.round(b * 255)
    ];
  };
  
  const [h, s] = rgbToHsl(r, g, b);
  const [newR, newG, newB] = hslToRgb(h, s, luminance);
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

/**
 * Convert hex color to HSL values
 * @param hexColor - Hex color string (e.g., "#FF0000")
 * @returns [hue, saturation, lightness] values
 */
export function hexToHsl(hexColor: string): [number, number, number] {
  const r = parseInt(hexColor.slice(1, 3), 16) / 255;
  const g = parseInt(hexColor.slice(3, 5), 16) / 255;
  const b = parseInt(hexColor.slice(5, 7), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  return [h, s, l];
}

/**
 * Sort poems by color spectrum (hue)
 * @param poems - Array of poem entries
 * @returns Sorted poems by color hue
 */
export function sortPoemsBySpectrum<T extends { data: { color?: { hex: string } } }>(poems: T[]): T[] {
  return poems
    .filter(poem => poem.data.color?.hex)
    .sort((a, b) => {
      const [hueA] = hexToHsl(a.data.color!.hex);
      const [hueB] = hexToHsl(b.data.color!.hex);
      
      // Adjust hue values so red (close to 1.0) appears first
      const adjustedHueA = hueA > 0.9 ? hueA - 1 : hueA;
      const adjustedHueB = hueB > 0.9 ? hueB - 1 : hueB;
      
      return adjustedHueA - adjustedHueB;
    });
}


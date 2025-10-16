/**
 * Shape Renderer Usage Examples
 * 
 * This file demonstrates how to use the ShapeRenderer class
 * for rendering different geometric shapes for enhanced bubbles.
 */

import { ShapeRenderer } from '../utils/shapeRenderer';
import { EnhancedBubble, ShapeType, IconType } from '../types/enhancedBubble';

// Create shape renderer instance
const shapeRenderer = new ShapeRenderer();

// Example enhanced bubbles with different shapes
const createExampleBubbles = (): EnhancedBubble[] => {
  const baseStyle = {
    primaryColor: '#FF6B9D',
    secondaryColor: '#FFB3D1',
    gradientDirection: 135,
    strokeWidth: 2,
    strokeColor: '#FF1744',
    shadowColor: 'rgba(0,0,0,0.3)',
    shadowBlur: 10
  };

  return [
    {
      id: 'circle-bubble',
      type: 'song',
      name: '夜に駆ける',
      x: 100,
      y: 100,
      size: 100,
      vx: 1,
      vy: 1,
      color: '#FF6B9D',
      opacity: 1,
      lifespan: 1000,
      relatedCount: 10,
      visualType: 'song',
      iconType: IconType.MUSIC_NOTE,
      shapeType: ShapeType.CIRCLE,
      isMultiRole: false,
      style: { ...baseStyle, iconType: IconType.MUSIC_NOTE, shapeType: ShapeType.CIRCLE }
    },
    {
      id: 'square-bubble',
      type: 'lyricist',
      name: 'Ayase',
      x: 250,
      y: 100,
      size: 90,
      vx: -1,
      vy: 1,
      color: '#4ECDC4',
      opacity: 1,
      lifespan: 1000,
      relatedCount: 8,
      visualType: 'person',
      iconType: IconType.PEN,
      shapeType: ShapeType.ROUNDED_SQUARE,
      isMultiRole: false,
      style: {
        ...baseStyle,
        primaryColor: '#4ECDC4',
        secondaryColor: '#A7E6E1',
        iconType: IconType.PEN,
        shapeType: ShapeType.ROUNDED_SQUARE
      }
    },
    {
      id: 'hexagon-bubble',
      type: 'tag',
      name: 'ポップス',
      x: 400,
      y: 100,
      size: 80,
      vx: 1,
      vy: -1,
      color: '#B8A9FF',
      opacity: 1,
      lifespan: 1000,
      relatedCount: 15,
      visualType: 'tag',
      iconType: IconType.HASHTAG,
      shapeType: ShapeType.HEXAGON,
      isMultiRole: false,
      style: {
        ...baseStyle,
        primaryColor: '#B8A9FF',
        secondaryColor: '#D6CCFF',
        iconType: IconType.HASHTAG,
        shapeType: ShapeType.HEXAGON
      }
    },
    {
      id: 'diamond-bubble',
      type: 'composer',
      name: 'ikura',
      x: 100,
      y: 250,
      size: 96,
      vx: -1,
      vy: -1,
      color: '#A8E6CF',
      opacity: 1,
      lifespan: 1000,
      relatedCount: 12,
      visualType: 'person',
      iconType: IconType.MUSIC_SHEET,
      shapeType: ShapeType.DIAMOND,
      isMultiRole: false,
      style: {
        ...baseStyle,
        primaryColor: '#A8E6CF',
        secondaryColor: '#D4F1E4',
        iconType: IconType.MUSIC_SHEET,
        shapeType: ShapeType.DIAMOND
      }
    },
    {
      id: 'star-bubble',
      type: 'composer',
      name: 'Multi-Role Artist',
      x: 250,
      y: 250,
      size: 104,
      vx: 1,
      vy: 1,
      color: '#FFD93D',
      opacity: 1,
      lifespan: 1000,
      relatedCount: 20,
      visualType: 'person',
      iconType: IconType.MULTI_ROLE,
      shapeType: ShapeType.STAR,
      isMultiRole: true,
      roles: [
        { type: 'lyricist', songCount: 5 },
        { type: 'composer', songCount: 8 }
      ],
      style: {
        ...baseStyle,
        primaryColor: '#FFD93D',
        secondaryColor: '#FFEB99',
        iconType: IconType.MULTI_ROLE,
        shapeType: ShapeType.STAR
      }
    }
  ];
};

/**
 * Example: Render all shape types on a canvas
 */
export const renderAllShapes = (canvas: HTMLCanvasElement): void => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Set canvas background
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const bubbles = createExampleBubbles();

  // Render each bubble with its specific shape
  bubbles.forEach(bubble => {
    switch (bubble.shapeType) {
      case ShapeType.CIRCLE:
        shapeRenderer.renderCircle(ctx, bubble);
        break;
      case ShapeType.ROUNDED_SQUARE:
        shapeRenderer.renderRoundedSquare(ctx, bubble);
        break;
      case ShapeType.HEXAGON:
        shapeRenderer.renderHexagon(ctx, bubble);
        break;
      case ShapeType.DIAMOND:
        shapeRenderer.renderDiamond(ctx, bubble);
        break;
      case ShapeType.STAR:
        shapeRenderer.renderStar(ctx, bubble);
        break;
    }
  });

  // Add labels for demonstration
  ctx.fillStyle = '#333';
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  
  ctx.fillText('Circle (Song)', 100, 170);
  ctx.fillText('Rounded Square (Lyricist)', 250, 170);
  ctx.fillText('Hexagon (Tag)', 400, 170);
  ctx.fillText('Diamond (Composer)', 100, 320);
  ctx.fillText('Star (Multi-Role)', 250, 320);
};

/**
 * Example: Render a single shape with custom styling
 */
export const renderCustomShape = (
  canvas: HTMLCanvasElement,
  shapeType: ShapeType,
  x: number,
  y: number,
  size: number,
  primaryColor: string,
  secondaryColor: string
): void => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const customBubble: EnhancedBubble = {
    id: 'custom-bubble',
    type: 'song',
    name: 'Custom',
    x,
    y,
    size,
    vx: 0,
    vy: 0,
    color: primaryColor,
    opacity: 1,
    lifespan: 1000,
    relatedCount: 5,
    visualType: 'song',
    iconType: IconType.MUSIC_NOTE,
    shapeType,
    isMultiRole: false,
    style: {
      primaryColor,
      secondaryColor,
      gradientDirection: 135,
      iconType: IconType.MUSIC_NOTE,
      shapeType,
      strokeWidth: 3,
      strokeColor: '#333',
      shadowColor: 'rgba(0,0,0,0.4)',
      shadowBlur: 15
    }
  };

  // Render the custom shape
  switch (shapeType) {
    case ShapeType.CIRCLE:
      shapeRenderer.renderCircle(ctx, customBubble);
      break;
    case ShapeType.ROUNDED_SQUARE:
      shapeRenderer.renderRoundedSquare(ctx, customBubble);
      break;
    case ShapeType.HEXAGON:
      shapeRenderer.renderHexagon(ctx, customBubble);
      break;
    case ShapeType.DIAMOND:
      shapeRenderer.renderDiamond(ctx, customBubble);
      break;
    case ShapeType.STAR:
      shapeRenderer.renderStar(ctx, customBubble);
      break;
  }
};

/**
 * Example: Animation loop with shape rendering
 */
export const animateShapes = (canvas: HTMLCanvasElement): void => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const bubbles = createExampleBubbles();
  
  const animate = () => {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and render bubbles
    bubbles.forEach(bubble => {
      // Simple animation - move bubbles
      bubble.x += bubble.vx;
      bubble.y += bubble.vy;

      const radius = bubble.size / 2;
      // Bounce off edges
      if (bubble.x - radius <= 0 || bubble.x + radius >= canvas.width) {
        bubble.vx *= -1;
      }
      if (bubble.y - radius <= 0 || bubble.y + radius >= canvas.height) {
        bubble.vy *= -1;
      }

      // Render shape
      switch (bubble.shapeType) {
        case ShapeType.CIRCLE:
          shapeRenderer.renderCircle(ctx, bubble);
          break;
        case ShapeType.ROUNDED_SQUARE:
          shapeRenderer.renderRoundedSquare(ctx, bubble);
          break;
        case ShapeType.HEXAGON:
          shapeRenderer.renderHexagon(ctx, bubble);
          break;
        case ShapeType.DIAMOND:
          shapeRenderer.renderDiamond(ctx, bubble);
          break;
        case ShapeType.STAR:
          shapeRenderer.renderStar(ctx, bubble);
          break;
      }
    });

    requestAnimationFrame(animate);
  };

  animate();
};

/**
 * Example: Performance test for shape rendering
 */
export const performanceTest = (canvas: HTMLCanvasElement, iterations: number = 1000): number => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return 0;

  const testBubble: EnhancedBubble = {
    id: 'perf-test',
    type: 'song',
    name: 'Test',
    x: 100,
    y: 100,
    size: 60,
    vx: 0,
    vy: 0,
    color: '#FF6B9D',
    opacity: 1,
    lifespan: 1000,
    relatedCount: 5,
    visualType: 'song',
    iconType: IconType.MUSIC_NOTE,
    shapeType: ShapeType.CIRCLE,
    isMultiRole: false,
    style: {
      primaryColor: '#FF6B9D',
      secondaryColor: '#FFB3D1',
      gradientDirection: 135,
      iconType: IconType.MUSIC_NOTE,
      shapeType: ShapeType.CIRCLE,
      strokeWidth: 2,
      strokeColor: '#FF1744',
      shadowColor: 'rgba(0,0,0,0.3)',
      shadowBlur: 10
    }
  };

  const startTime = performance.now();

  for (let i = 0; i < iterations; i++) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    shapeRenderer.renderCircle(ctx, testBubble);
  }

  const endTime = performance.now();
  return endTime - startTime;
};

// Export the shape renderer for external use
export { shapeRenderer };
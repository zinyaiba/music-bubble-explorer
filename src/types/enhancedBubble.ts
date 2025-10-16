/**
 * Enhanced Bubble Types and Interfaces
 * 
 * This module defines the enhanced bubble system that provides visual distinction
 * for different types of content (songs, persons, tags) with icons, shapes, and colors.
 */

import { Bubble } from './music';
import { BubbleEntity } from './bubble';

/**
 * Icon types for different content categories
 */
export enum IconType {
  MUSIC_NOTE = 'music-note',     // 楽曲
  PEN = 'pen',                   // 作詞家
  MUSIC_SHEET = 'music-sheet',   // 作曲家
  MIXER = 'mixer',               // 編曲家
  HASHTAG = 'hashtag',           // タグ
  MULTI_ROLE = 'multi-role'      // 複数役割
}

/**
 * Shape types for different visual representations
 */
export enum ShapeType {
  CIRCLE = 'circle',
  ROUNDED_SQUARE = 'rounded-square',
  HEXAGON = 'hexagon',
  DIAMOND = 'diamond',
  STAR = 'star'
}

/**
 * Person role types for consolidation
 */
export interface PersonRole {
  type: 'lyricist' | 'composer' | 'arranger';
  songCount: number;
}

/**
 * Visual style configuration for bubbles
 */
export interface BubbleStyle {
  primaryColor: string;
  secondaryColor: string;
  gradientDirection: number;
  iconType: IconType;
  shapeType: ShapeType;
  strokeWidth: number;
  strokeColor: string;
  shadowColor: string;
  shadowBlur: number;
}

/**
 * Complete visual theme configuration
 */
export interface VisualTheme {
  song: BubbleStyle;
  lyricist: BubbleStyle;
  composer: BubbleStyle;
  arranger: BubbleStyle;
  tag: BubbleStyle;
  multiRole: BubbleStyle;
}

/**
 * Enhanced bubble interface extending the base Bubble interface
 * This represents the data structure, not the class
 */
export interface EnhancedBubbleData extends Bubble {
  visualType: 'song' | 'person' | 'tag';
  roles?: PersonRole[]; // 人物の場合の役割配列
  iconType: IconType;
  shapeType: ShapeType;
  isMultiRole: boolean;
  style: BubbleStyle;
  songs?: string[]; // For consolidated persons - related song IDs
}

/**
 * Enhanced bubble type that combines BubbleEntity class with enhanced data
 * This is what we actually work with in the application
 */
export type EnhancedBubble = BubbleEntity & EnhancedBubbleData;

/**
 * Content item for bubble registry
 */
export interface ContentItem {
  id: string;
  type: 'song' | 'person' | 'tag';
  name: string;
  roles?: PersonRole[];
  relatedCount: number;
}

/**
 * Consolidated person with multiple roles
 */
export interface ConsolidatedPerson {
  name: string;
  roles: PersonRole[];
  totalRelatedCount: number;
  songs: string[]; // 関連楽曲ID配列
}
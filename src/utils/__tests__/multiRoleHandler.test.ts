/**
 * Multi-Role Handler Tests
 * 
 * Tests for multi-role detection, integration, and special display logic.
 * Requirements: 2.1, 2.2, 2.3, 2.4, 5.6
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MultiRoleHandler } from '../multiRoleHandler';
import { ConsolidatedPerson, PersonRole } from '../../types/consolidatedPerson';
import { ShapeType, IconType } from '../../types/enhancedBubble';

describe('MultiRoleHandler', () => {
  let handler: MultiRoleHandler;
  let singleRolePerson: ConsolidatedPerson;
  let multiRolePerson: ConsolidatedPerson;
  let complexMultiRolePerson: ConsolidatedPerson;

  beforeEach(() => {
    handler = new MultiRoleHandler();

    // Single role person (lyricist only)
    singleRolePerson = {
      name: 'Single Role Person',
      roles: [{ type: 'lyricist', songCount: 5 }],
      totalRelatedCount: 5,
      songs: ['song1', 'song2', 'song3', 'song4', 'song5']
    };

    // Multi-role person (lyricist + composer)
    multiRolePerson = {
      name: 'Multi Role Person',
      roles: [
        { type: 'lyricist', songCount: 3 },
        { type: 'composer', songCount: 4 }
      ],
      totalRelatedCount: 6, // Some songs have both roles
      songs: ['song1', 'song2', 'song3', 'song4', 'song5', 'song6']
    };

    // Complex multi-role person (all three roles)
    complexMultiRolePerson = {
      name: 'Complex Multi Role Person',
      roles: [
        { type: 'lyricist', songCount: 2 },
        { type: 'composer', songCount: 3 },
        { type: 'arranger', songCount: 2 }
      ],
      totalRelatedCount: 5,
      songs: ['song1', 'song2', 'song3', 'song4', 'song5']
    };
  });

  describe('Multi-role detection', () => {
    it('should detect single role person correctly', () => {
      expect(handler.isMultiRole(singleRolePerson)).toBe(false);
    });

    it('should detect multi-role person correctly', () => {
      expect(handler.isMultiRole(multiRolePerson)).toBe(true);
    });

    it('should detect complex multi-role person correctly', () => {
      expect(handler.isMultiRole(complexMultiRolePerson)).toBe(true);
    });
  });

  describe('Multi-role complexity', () => {
    it('should return simple for single role', () => {
      expect(handler.getMultiRoleComplexity(singleRolePerson.roles)).toBe('simple');
    });

    it('should return complex for two roles', () => {
      expect(handler.getMultiRoleComplexity(multiRolePerson.roles)).toBe('complex');
    });

    it('should return advanced for three or more roles', () => {
      expect(handler.getMultiRoleComplexity(complexMultiRolePerson.roles)).toBe('advanced');
    });
  });

  describe('Special shape determination', () => {
    it('should return rounded square for single role', () => {
      expect(handler.determineMultiRoleShape(singleRolePerson.roles)).toBe(ShapeType.ROUNDED_SQUARE);
    });

    it('should return star for two roles', () => {
      expect(handler.determineMultiRoleShape(multiRolePerson.roles)).toBe(ShapeType.STAR);
    });

    it('should return diamond for three or more roles', () => {
      expect(handler.determineMultiRoleShape(complexMultiRolePerson.roles)).toBe(ShapeType.DIAMOND);
    });
  });

  describe('Composite colors', () => {
    it('should create composite colors for multi-role person', () => {
      const colors = handler.createCompositeColors(multiRolePerson.roles);
      
      expect(colors.primary).toBe('#4ECDC4'); // lyricist color
      expect(colors.secondary).toBe('#A8E6CF'); // composer color
      expect(colors.colors).toHaveLength(2);
      expect(colors.colors).toContain('#4ECDC4');
      expect(colors.colors).toContain('#A8E6CF');
    });

    it('should handle complex multi-role colors', () => {
      const colors = handler.createCompositeColors(complexMultiRolePerson.roles);
      
      expect(colors.colors).toHaveLength(3);
      expect(colors.colors).toContain('#4ECDC4'); // lyricist
      expect(colors.colors).toContain('#A8E6CF'); // composer
      expect(colors.colors).toContain('#FFD93D'); // arranger
    });
  });

  describe('Composite style generation', () => {
    it('should generate composite style for multi-role person', () => {
      const style = handler.generateCompositeStyle(multiRolePerson.roles);
      
      expect(style.primaryColor).toBe('#4ECDC4');
      expect(style.secondaryColor).toBe('#A8E6CF');
      expect(style.shapeType).toBe(ShapeType.STAR);
      expect(style.iconType).toBe(IconType.MULTI_ROLE);
      expect(style.strokeWidth).toBe(3);
      expect(style.shadowBlur).toBe(12);
    });

    it('should generate diamond shape for complex multi-role', () => {
      const style = handler.generateCompositeStyle(complexMultiRolePerson.roles);
      
      expect(style.shapeType).toBe(ShapeType.DIAMOND);
      expect(style.iconType).toBe(IconType.MULTI_ROLE);
    });
  });

  describe('Total related count calculation', () => {
    it('should calculate total related count correctly', () => {
      expect(handler.calculateTotalRelatedCount(multiRolePerson)).toBe(6);
      expect(handler.calculateTotalRelatedCount(complexMultiRolePerson)).toBe(5);
    });
  });

  describe('Role distribution', () => {
    it('should calculate role distribution percentages', () => {
      const distribution = handler.getRoleDistribution(multiRolePerson.roles);
      
      expect(distribution.lyricist).toBe(43); // 3/7 ≈ 43%
      expect(distribution.composer).toBe(57); // 4/7 ≈ 57%
    });

    it('should handle complex role distribution', () => {
      const distribution = handler.getRoleDistribution(complexMultiRolePerson.roles);
      
      expect(distribution.lyricist).toBe(29); // 2/7 ≈ 29%
      expect(distribution.composer).toBe(43); // 3/7 ≈ 43%
      expect(distribution.arranger).toBe(29); // 2/7 ≈ 29%
    });
  });

  describe('Dominant role', () => {
    it('should identify dominant role correctly', () => {
      const dominant = handler.getDominantRole(multiRolePerson.roles);
      expect(dominant.type).toBe('composer');
      expect(dominant.songCount).toBe(4);
    });

    it('should handle ties by returning first role', () => {
      const tiedRoles: PersonRole[] = [
        { type: 'lyricist', songCount: 3 },
        { type: 'composer', songCount: 3 }
      ];
      const dominant = handler.getDominantRole(tiedRoles);
      expect(dominant.type).toBe('lyricist'); // First one wins in tie
    });
  });

  describe('Role checking', () => {
    it('should check if person has specific role', () => {
      expect(handler.hasRole(multiRolePerson, 'lyricist')).toBe(true);
      expect(handler.hasRole(multiRolePerson, 'composer')).toBe(true);
      expect(handler.hasRole(multiRolePerson, 'arranger')).toBe(false);
    });
  });

  describe('Role combination', () => {
    it('should create role combination string', () => {
      const combination = handler.getRoleCombination(multiRolePerson.roles);
      expect(combination).toBe('composer+lyricist'); // Sorted alphabetically
    });

    it('should handle complex combinations', () => {
      const combination = handler.getRoleCombination(complexMultiRolePerson.roles);
      expect(combination).toBe('arranger+composer+lyricist');
    });
  });

  describe('Validation', () => {
    it('should validate valid multi-role person', () => {
      expect(handler.validateMultiRolePerson(multiRolePerson)).toBe(true);
    });

    it('should reject single role person', () => {
      expect(handler.validateMultiRolePerson(singleRolePerson)).toBe(false);
    });

    it('should reject invalid data', () => {
      const invalidPerson: ConsolidatedPerson = {
        name: 'Invalid',
        roles: [
          { type: 'lyricist', songCount: 0 }, // Invalid: no songs
          { type: 'composer', songCount: 2 }
        ],
        totalRelatedCount: 2,
        songs: ['song1', 'song2']
      };
      
      expect(handler.validateMultiRolePerson(invalidPerson)).toBe(false);
    });
  });

  describe('Display summary', () => {
    it('should create display summary for multi-role person', () => {
      const summary = handler.createDisplaySummary(multiRolePerson);
      
      expect(summary.name).toBe('Multi Role Person');
      expect(summary.roleCount).toBe(2);
      expect(summary.totalSongs).toBe(6);
      expect(summary.roleTypes).toEqual(['lyricist', 'composer']);
      expect(summary.dominantRole).toBe('composer');
      expect(summary.complexity).toBe('complex');
    });

    it('should create display summary for complex multi-role person', () => {
      const summary = handler.createDisplaySummary(complexMultiRolePerson);
      
      expect(summary.roleCount).toBe(3);
      expect(summary.complexity).toBe('advanced');
      expect(summary.dominantRole).toBe('composer');
    });
  });
});
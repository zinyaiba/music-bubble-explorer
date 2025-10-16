/**
 * Multi-Role Integration Tests
 * 
 * Tests the complete integration of multi-role special display features
 * across all systems: detection, visual styling, and logic integration.
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 5.6
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MultiRoleHandler } from '../multiRoleHandler';
import { VisualThemeManager, defaultVisualTheme } from '../visualTheme';
import { ConsolidatedPerson } from '../../types/consolidatedPerson';
import { ShapeType, IconType } from '../../types/enhancedBubble';

describe('Multi-Role Integration', () => {
  let multiRoleHandler: MultiRoleHandler;
  let visualTheme: VisualThemeManager;

  // Test data
  let twoRolePerson: ConsolidatedPerson;
  let threeRolePerson: ConsolidatedPerson;

  beforeEach(() => {
    multiRoleHandler = new MultiRoleHandler();
    visualTheme = new VisualThemeManager(defaultVisualTheme);

    // Test persons
    twoRolePerson = {
      name: 'Two Role Person',
      roles: [
        { type: 'lyricist', songCount: 5 },
        { type: 'composer', songCount: 7 }
      ],
      totalRelatedCount: 10,
      songs: Array.from({ length: 10 }, (_, i) => `song${i + 1}`)
    };

    threeRolePerson = {
      name: 'Three Role Person',
      roles: [
        { type: 'lyricist', songCount: 3 },
        { type: 'composer', songCount: 8 },
        { type: 'arranger', songCount: 4 }
      ],
      totalRelatedCount: 12,
      songs: Array.from({ length: 12 }, (_, i) => `song${i + 1}`)
    };
  });

  describe('Complete Multi-Role Detection and Integration', () => {
    it('should detect and integrate two-role person correctly', () => {
      // Detection
      expect(multiRoleHandler.isMultiRole(twoRolePerson)).toBe(true);
      expect(multiRoleHandler.getMultiRoleComplexity(twoRolePerson.roles)).toBe('complex');
      
      // Shape determination
      const shape = multiRoleHandler.determineMultiRoleShape(twoRolePerson.roles);
      expect(shape).toBe(ShapeType.STAR);
      
      // Style generation
      const style = multiRoleHandler.generateCompositeStyle(twoRolePerson.roles);
      expect(style.shapeType).toBe(ShapeType.STAR);
      expect(style.iconType).toBe(IconType.MULTI_ROLE);
      expect(style.strokeWidth).toBe(3);
      expect(style.shadowBlur).toBe(12);
    });

    it('should detect and integrate three-role person correctly', () => {
      // Detection
      expect(multiRoleHandler.isMultiRole(threeRolePerson)).toBe(true);
      expect(multiRoleHandler.getMultiRoleComplexity(threeRolePerson.roles)).toBe('advanced');
      
      // Shape determination
      const shape = multiRoleHandler.determineMultiRoleShape(threeRolePerson.roles);
      expect(shape).toBe(ShapeType.DIAMOND);
      
      // Style generation
      const style = multiRoleHandler.generateCompositeStyle(threeRolePerson.roles);
      expect(style.shapeType).toBe(ShapeType.DIAMOND);
      expect(style.iconType).toBe(IconType.MULTI_ROLE);
    });
  });

  describe('Composite Gradient Generation', () => {
    it('should create composite gradient for two-role person', () => {
      const colors = multiRoleHandler.createCompositeColors(twoRolePerson.roles);
      
      expect(colors.colors).toHaveLength(2);
      expect(colors.colors).toContain('#4ECDC4'); // lyricist
      expect(colors.colors).toContain('#A8E6CF'); // composer
      expect(colors.primary).toBe('#4ECDC4');
      expect(colors.secondary).toBe('#A8E6CF');
    });

    it('should create composite gradient for three-role person', () => {
      const colors = multiRoleHandler.createCompositeColors(threeRolePerson.roles);
      
      expect(colors.colors).toHaveLength(3);
      expect(colors.colors).toContain('#4ECDC4'); // lyricist
      expect(colors.colors).toContain('#A8E6CF'); // composer
      expect(colors.colors).toContain('#FFD93D'); // arranger
    });

    it('should integrate with visual theme manager', () => {
      const roleTypes = twoRolePerson.roles.map(role => role.type);
      const style = visualTheme.getMultiRoleStyle(roleTypes);
      
      expect(style.primaryColor).toBe('#4ECDC4');
      expect(style.secondaryColor).toBe('#A8E6CF');
      expect(style.shapeType).toBe(ShapeType.STAR);
    });
  });

  describe('Icon and Shape Logic Integration', () => {
    it('should determine correct icon and shape for two-role person', () => {
      const roleTypes = twoRolePerson.roles.map(role => role.type);
      const style = multiRoleHandler.generateCompositeStyle(twoRolePerson.roles);
      
      expect(style.iconType).toBe(IconType.MULTI_ROLE);
      expect(style.shapeType).toBe(ShapeType.STAR);
      expect(roleTypes).toEqual(['lyricist', 'composer']);
    });

    it('should determine correct icon and shape for three-role person', () => {
      const roleTypes = threeRolePerson.roles.map(role => role.type);
      const style = multiRoleHandler.generateCompositeStyle(threeRolePerson.roles);
      
      expect(style.iconType).toBe(IconType.MULTI_ROLE);
      expect(style.shapeType).toBe(ShapeType.DIAMOND);
      expect(roleTypes).toEqual(['lyricist', 'composer', 'arranger']);
    });

    it('should handle role type mapping correctly', () => {
      const twoRoleTypes = twoRolePerson.roles.map(role => role.type);
      const threeRoleTypes = threeRolePerson.roles.map(role => role.type);
      
      expect(twoRoleTypes).toContain('lyricist');
      expect(twoRoleTypes).toContain('composer');
      expect(threeRoleTypes).toContain('lyricist');
      expect(threeRoleTypes).toContain('composer');
      expect(threeRoleTypes).toContain('arranger');
    });
  });

  describe('End-to-End Multi-Role Logic', () => {
    it('should create complete multi-role bubble configuration for two-role person', () => {
      // 1. Detect multi-role
      const isMultiRole = multiRoleHandler.isMultiRole(twoRolePerson);
      expect(isMultiRole).toBe(true);

      // 2. Generate composite style
      const style = multiRoleHandler.generateCompositeStyle(twoRolePerson.roles);
      
      // 3. Verify bubble configuration
      expect(style.iconType).toBe(IconType.MULTI_ROLE);
      expect(style.shapeType).toBe(ShapeType.STAR);
      expect(style.strokeWidth).toBe(3);
      expect(style.shadowBlur).toBe(12);
      expect(style.primaryColor).toBe('#4ECDC4');
      expect(style.secondaryColor).toBe('#A8E6CF');

      // 4. Verify role data
      const roleTypes = twoRolePerson.roles.map(role => role.type);
      expect(roleTypes).toEqual(['lyricist', 'composer']);
      expect(twoRolePerson.totalRelatedCount).toBe(10);
    });

    it('should create complete multi-role bubble configuration for three-role person', () => {
      // Complete workflow for three-role person
      const isMultiRole = multiRoleHandler.isMultiRole(threeRolePerson);
      expect(isMultiRole).toBe(true);

      const style = multiRoleHandler.generateCompositeStyle(threeRolePerson.roles);
      
      // Verify advanced multi-role properties
      expect(style.shapeType).toBe(ShapeType.DIAMOND);
      expect(style.iconType).toBe(IconType.MULTI_ROLE);
      expect(multiRoleHandler.getMultiRoleComplexity(threeRolePerson.roles)).toBe('advanced');
      
      // Verify color composition
      const colors = multiRoleHandler.createCompositeColors(threeRolePerson.roles);
      expect(colors.colors).toHaveLength(3);
      expect(colors.primary).toBe('#4ECDC4');
      expect(colors.secondary).toBe('#FFD93D');
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle empty roles gracefully', () => {
      expect(() => {
        multiRoleHandler.createCompositeColors([]);
      }).not.toThrow();
      
      const emptyColors = multiRoleHandler.createCompositeColors([]);
      expect(emptyColors.colors).toHaveLength(0);
    });

    it('should handle single role in multi-role functions', () => {
      const singleRole = [{ type: 'lyricist' as const, songCount: 5 }];
      
      const colors = multiRoleHandler.createCompositeColors(singleRole);
      expect(colors.colors).toHaveLength(1);
      
      const shape = multiRoleHandler.determineMultiRoleShape(singleRole);
      expect(shape).toBe(ShapeType.ROUNDED_SQUARE);
    });

    it('should validate multi-role data integrity', () => {
      expect(multiRoleHandler.validateMultiRolePerson(twoRolePerson)).toBe(true);
      expect(multiRoleHandler.validateMultiRolePerson(threeRolePerson)).toBe(true);
      
      // Invalid case
      const invalidPerson: ConsolidatedPerson = {
        name: 'Invalid',
        roles: [{ type: 'lyricist', songCount: 0 }],
        totalRelatedCount: 0,
        songs: []
      };
      expect(multiRoleHandler.validateMultiRolePerson(invalidPerson)).toBe(false);
    });

    it('should integrate with visual theme manager correctly', () => {
      const twoRoleTypes = twoRolePerson.roles.map(role => role.type);
      const threeRoleTypes = threeRolePerson.roles.map(role => role.type);
      
      const twoRoleStyle = visualTheme.getMultiRoleStyle(twoRoleTypes);
      const threeRoleStyle = visualTheme.getMultiRoleStyle(threeRoleTypes);
      
      expect(twoRoleStyle.shapeType).toBe(ShapeType.STAR);
      expect(threeRoleStyle.shapeType).toBe(ShapeType.DIAMOND);
      
      expect(twoRoleStyle.primaryColor).toBe('#4ECDC4');
      expect(threeRoleStyle.primaryColor).toBe('#4ECDC4');
    });
  });
});
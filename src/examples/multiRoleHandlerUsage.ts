/**
 * Multi-Role Handler Usage Examples
 * 
 * Demonstrates how to use the MultiRoleHandler for detecting and handling
 * multi-role persons with special display features.
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 5.6
 */

import { MultiRoleHandler } from '../utils/multiRoleHandler';
import { ConsolidatedPerson } from '../types/consolidatedPerson';
import { EnhancedBubble, ShapeType, IconType } from '../types/enhancedBubble';

// Initialize the multi-role handler
const multiRoleHandler = new MultiRoleHandler();

// Example consolidated persons with different role combinations
const examplePersons: ConsolidatedPerson[] = [
  {
    name: '中島らも',
    roles: [
      { type: 'lyricist', songCount: 8 }
    ],
    totalRelatedCount: 8,
    songs: ['song1', 'song2', 'song3', 'song4', 'song5', 'song6', 'song7', 'song8']
  },
  {
    name: '久石譲',
    roles: [
      { type: 'composer', songCount: 12 },
      { type: 'arranger', songCount: 8 }
    ],
    totalRelatedCount: 15, // Some songs have both roles
    songs: ['song9', 'song10', 'song11', 'song12', 'song13', 'song14', 'song15', 'song16', 'song17', 'song18', 'song19', 'song20', 'song21', 'song22', 'song23']
  },
  {
    name: '坂本龍一',
    roles: [
      { type: 'lyricist', songCount: 3 },
      { type: 'composer', songCount: 15 },
      { type: 'arranger', songCount: 10 }
    ],
    totalRelatedCount: 20,
    songs: Array.from({ length: 20 }, (_, i) => `song${i + 24}`)
  }
];

console.log('=== Multi-Role Handler Usage Examples ===\n');

// Example 1: Basic multi-role detection
console.log('1. Multi-Role Detection:');
examplePersons.forEach(person => {
  const isMulti = multiRoleHandler.isMultiRole(person);
  const complexity = multiRoleHandler.getMultiRoleComplexity(person.roles);
  
  console.log(`  ${person.name}: ${isMulti ? 'Multi-role' : 'Single-role'} (${complexity})`);
  console.log(`    Roles: ${person.roles.map(r => `${r.type}(${r.songCount})`).join(', ')}`);
});

console.log('\n2. Special Shape Determination:');
examplePersons.forEach(person => {
  if (multiRoleHandler.isMultiRole(person)) {
    const shape = multiRoleHandler.determineMultiRoleShape(person.roles);
    console.log(`  ${person.name}: ${shape} shape`);
  }
});

console.log('\n3. Composite Color Generation:');
examplePersons.forEach(person => {
  if (multiRoleHandler.isMultiRole(person)) {
    const colors = multiRoleHandler.createCompositeColors(person.roles);
    console.log(`  ${person.name}:`);
    console.log(`    Primary: ${colors.primary}`);
    console.log(`    Secondary: ${colors.secondary}`);
    console.log(`    All colors: ${colors.colors.join(', ')}`);
  }
});

console.log('\n4. Composite Style Generation:');
examplePersons.forEach(person => {
  if (multiRoleHandler.isMultiRole(person)) {
    const style = multiRoleHandler.generateCompositeStyle(person.roles);
    console.log(`  ${person.name}:`);
    console.log(`    Shape: ${style.shapeType}`);
    console.log(`    Icon: ${style.iconType}`);
    console.log(`    Colors: ${style.primaryColor} → ${style.secondaryColor}`);
    console.log(`    Stroke: ${style.strokeWidth}px, Shadow: ${style.shadowBlur}px`);
  }
});

console.log('\n5. Role Distribution Analysis:');
examplePersons.forEach(person => {
  if (multiRoleHandler.isMultiRole(person)) {
    const distribution = multiRoleHandler.getRoleDistribution(person.roles);
    const dominant = multiRoleHandler.getDominantRole(person.roles);
    
    console.log(`  ${person.name}:`);
    console.log(`    Distribution: ${Object.entries(distribution).map(([role, pct]) => `${role}: ${pct}%`).join(', ')}`);
    console.log(`    Dominant role: ${dominant.type} (${dominant.songCount} songs)`);
  }
});

console.log('\n6. Role Combination Identification:');
examplePersons.forEach(person => {
  const combination = multiRoleHandler.getRoleCombination(person.roles);
  console.log(`  ${person.name}: ${combination}`);
});

console.log('\n7. Display Summary Generation:');
examplePersons.forEach(person => {
  const summary = multiRoleHandler.createDisplaySummary(person);
  console.log(`  ${summary.name}:`);
  console.log(`    ${summary.roleCount} roles, ${summary.totalSongs} total songs`);
  console.log(`    Complexity: ${summary.complexity}, Dominant: ${summary.dominantRole}`);
  console.log(`    Role types: ${summary.roleTypes.join(', ')}`);
});

console.log('\n8. Validation Examples:');
examplePersons.forEach(person => {
  const isValid = multiRoleHandler.validateMultiRolePerson(person);
  const isMulti = multiRoleHandler.isMultiRole(person);
  
  if (isMulti) {
    console.log(`  ${person.name}: ${isValid ? 'Valid' : 'Invalid'} multi-role person`);
  }
});

// Example 9: Integration with Enhanced Bubble
console.log('\n9. Enhanced Bubble Integration Example:');

// Simulate creating enhanced bubbles for multi-role persons
examplePersons.forEach(person => {
  if (multiRoleHandler.isMultiRole(person)) {
    const style = multiRoleHandler.generateCompositeStyle(person.roles);
    const shape = multiRoleHandler.determineMultiRoleShape(person.roles);
    
    // Simulate enhanced bubble properties
    const bubbleProps = {
      name: person.name,
      visualType: 'person' as const,
      roles: person.roles,
      iconType: IconType.MULTI_ROLE,
      shapeType: shape,
      isMultiRole: true,
      style: style,
      relatedCount: person.totalRelatedCount
    };
    
    console.log(`  Enhanced Bubble for ${person.name}:`);
    console.log(`    Visual Type: ${bubbleProps.visualType}`);
    console.log(`    Shape: ${bubbleProps.shapeType}, Icon: ${bubbleProps.iconType}`);
    console.log(`    Multi-role: ${bubbleProps.isMultiRole}`);
    console.log(`    Related Count: ${bubbleProps.relatedCount}`);
  }
});

// Example 10: Canvas Rendering Preparation
console.log('\n10. Canvas Rendering Preparation:');

examplePersons.forEach(person => {
  if (multiRoleHandler.isMultiRole(person)) {
    const roleTypes = person.roles.map(role => role.type);
    const colors = multiRoleHandler.createCompositeColors(person.roles);
    
    console.log(`  ${person.name} rendering info:`);
    console.log(`    Role types for composite icon: [${roleTypes.join(', ')}]`);
    console.log(`    Gradient colors: [${colors.colors.join(', ')}]`);
    console.log(`    Shape complexity: ${multiRoleHandler.getMultiRoleComplexity(person.roles)}`);
  }
});

console.log('\n=== Multi-Role Handler Examples Complete ===');

export {
  multiRoleHandler,
  examplePersons
};
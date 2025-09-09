// File: IconPicker.tsx

import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// A pre-selected list of icons relevant to shopping
export const iconList = [
  'cart',
  'food-apple',
  'bottle-soda',
  'carrot',
  'cheese',
  'cow',
  'fish',
  'cupcake',
  'ice-cream',
  'rice',
  'toilet-paper',
  'pill',
  'flower',
  'hanger',
  'shopping',
];

// The component itself
const IconPicker = ({ selectedIcon, onSelectIcon }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
    >
      {iconList.map(iconName => (
        <TouchableOpacity
          key={iconName}
          style={[
            styles.iconWrapper,
            selectedIcon === iconName && styles.selectedIcon, // Highlight if selected
          ]}
          onPress={() => onSelectIcon(iconName)}
        >
          <Icon
            name={iconName}
            size={30}
            color={selectedIcon === iconName ? '#fff' : '#6200ee'}
          />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  selectedIcon: {
    backgroundColor: '#6200ee',
  },
});

export default IconPicker;

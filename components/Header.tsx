import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

// Define prop types
interface HeaderProps {
  title?: string;
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ title = 'Budget Tracker', subtitle }) => {
  return React.createElement(
    View,
    { style: styles.headerContainer },
    React.createElement(Text, { style: styles.title }, title),
    subtitle
      ? React.createElement(Text, { style: styles.subtitle }, subtitle)
      : null
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#6200ee',
    padding: 16,
    paddingTop: 32,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  } as TextStyle,
  subtitle: {
    color: '#bb86fc',
    fontSize: 16,
    marginTop: 4,
  } as TextStyle,
});

export default Header;

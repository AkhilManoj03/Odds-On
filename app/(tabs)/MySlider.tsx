import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

interface SliderProps {
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  onValueChange: (value: number) => void;
  sliderValue: number;
}

const MySlider: React.FC<SliderProps> = ({
  minimumValue = 0,
  maximumValue = 100,
  step = 1,
  onValueChange,
  sliderValue,
}) => {

  const handleValueChange = (value: number) => {
    onValueChange(value);
  };

  return (
    <View>
      <Slider
        style={styles.slider}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        value={sliderValue}
        onValueChange={handleValueChange}
        minimumTrackTintColor="#007AFF"
        maximumTrackTintColor="#CED4DA"
        thumbTintColor="#007AFF"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  slider: {
    width: 300,
    height: 40,
  },
  text: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default MySlider;
declare module '@miblanchard/react-native-slider' {
    import { Component } from 'react';
    import { ViewStyle } from 'react-native';

    interface SliderProps {
      minimumValue?: number;
      maximumValue?: number;
      step?: number;
      value?: number;
      style?: ViewStyle;
      minimumTrackTintColor?: string;
      maximumTrackTintColor?: string;
      thumbTintColor?: string;
    }

    export default class Slider extends Component<SliderProps> {}
  }
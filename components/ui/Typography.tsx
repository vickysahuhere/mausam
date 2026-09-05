import React from 'react';
import { Text, TextProps } from 'react-native';
import { colors } from '../../theme/colors';
import { typography as t } from '../../theme/typography';

interface Props extends TextProps {
  variant?: keyof typeof t;
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export function Typography({ variant = 'body', color = colors.text, align = 'left', style, ...props }: Props) {
  return (
    <Text style={[t[variant], { color, textAlign: align }, style]} {...props} />
  );
}

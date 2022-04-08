import React from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import { colors } from '../../styles/colors'

type Props = {
  disabled?: boolean
  label: string
  testID: string
  variant?: 'default' | 'error' | 'success'
  onPress: () => void
}

export const DialButton: React.FC<Props> = ({
  disabled,
  label,
  testID,
  variant = 'default',
  onPress,
}) => {
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={{ ...styles.root, ...styles[variant] }}
      testID={testID}>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    borderRadius: 100,
    borderStyle: 'solid',
    borderWidth: 2,
    height: 70,
    justifyContent: 'center',
    width: 70,
  },
  default: {
    borderColor: 'rgba(255, 255, 255, 0.23)',
  },
  error: {
    borderColor: 'rgba(248, 159, 132, 1)',
  },
  success: {
    borderColor: 'rgba(113, 245, 174, 0.23)',
  },
  label: {
    color: colors.white,
  },
})
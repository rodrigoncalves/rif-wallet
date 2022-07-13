import React from 'react'
import SwipeUpDownModal from 'react-native-swipe-modal-up-down'
import { useKeyboard } from '@react-native-community/hooks'

import {
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'

import { colors } from '../../styles'
import { RegularText } from '../typography'

interface Interface {
  title: string
  children: React.ReactNode
  showSelector: boolean
  onModalClosed: () => void
  animateModal: boolean
  onAnimateModal: () => void
  backgroundColor: string
  headerFontColor: string
  isKeyboardVisible: boolean
}

const SlideUpModal: React.FC<Interface> = ({
  title,
  children,
  showSelector,
  onModalClosed,
  animateModal,
  onAnimateModal,
  backgroundColor,
  headerFontColor,
  isKeyboardVisible,
}) => {
  const keyboard = useKeyboard()

  const containerStyle = !isKeyboardVisible
    ? styles.containerContent
    : { ...styles.containerContent, marginBottom: keyboard.keyboardHeight - 50 }

  const initialYScroll = isKeyboardVisible ? keyboard.keyboardHeight - 50 : 0
  return (
    <SwipeUpDownModal
      modalVisible={showSelector}
      PressToanimate={animateModal}
      //if you don't pass HeaderContent you should pass marginTop in view of ContentModel to Make modal swipeable
      ContentModal={
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={containerStyle}>
            <ScrollView contentOffset={{ x: 0, y: initialYScroll }}>
              {children}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      }
      HeaderStyle={styles.headerContent}
      ContentModalStyle={{ ...styles.Modal, backgroundColor }}
      HeaderContent={
        <View style={{ ...styles.containerHeader, backgroundColor }}>
          <View style={styles.handlerContainer}>
            <View
              style={{ ...styles.handler, backgroundColor: headerFontColor }}
            />
          </View>
          <View style={styles.actionsContainer}>
            <View>
              <RegularText style={{ ...styles.action, color: headerFontColor }}>
                {title}
              </RegularText>
            </View>
            <View>
              <TouchableOpacity
                onPress={() => {
                  onAnimateModal()
                }}>
                <RegularText
                  style={{ ...styles.action, color: headerFontColor }}>
                  hide
                </RegularText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      }
      onClose={() => {
        onModalClosed()
      }}
    />
  )
}

export default SlideUpModal

const styles = StyleSheet.create({
  containerContent: { marginRight: 40, marginLeft: 40 },
  containerHeader: {
    borderTopRightRadius: 40,
    borderTopLeftRadius: 40,
    height: 70,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  handlerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  handler: {
    height: 2,
    borderRadius: 5,
    width: 50,
    marginTop: 15,
  },
  action: {
    marginLeft: 40,
    marginRight: 40,
    marginTop: 10,
    color: 'white',
  },
  swapper: {
    borderColor: colors.darkBlue,
    borderTopColor: colors.white,
    borderWidth: 2,
  },
  headerContent: {
    marginTop: 100,
  },
  Modal: {
    marginTop: 170,
  },
})
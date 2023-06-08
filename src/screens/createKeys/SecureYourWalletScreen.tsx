import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { KeyManagementSystem } from 'lib/core'

import { SecondaryButton } from 'components/button/SecondaryButton'
import { Arrow } from 'components/icons'
import { PrimaryButton } from 'components/button/PrimaryButton'
import {
  createKeysRouteNames,
  CreateKeysScreenProps,
} from 'navigation/createKeysNavigator/types'
import { RegularText, SemiBoldText } from 'src/components'
import { createWallet } from 'store/slices/settingsSlice'
import { useAppDispatch } from 'store/storeUtils'
import { sharedColors, sharedStyles } from 'shared/constants'
import { saveKeyVerificationReminder } from 'storage/MainStorage'
import { WINDOW_HEIGHT } from 'src/ux/slides/Dimensions'

export const SecureYourWalletScreen = ({
  navigation,
}: CreateKeysScreenProps<createKeysRouteNames.SecureYourWallet>) => {
  const { top } = useSafeAreaInsets()
  const dispatch = useAppDispatch()
  const secureLater = async () => {
    saveKeyVerificationReminder(true)
    dispatch(
      createWallet({
        mnemonic: KeyManagementSystem.create().mnemonic,
      }),
    )
  }
  return (
    <View style={[styles.parent, { paddingTop: top }]}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        accessibilityLabel="back">
        <View style={styles.returnButtonView}>
          <Arrow
            color={sharedColors.white}
            rotate={270}
            width={30}
            height={30}
          />
        </View>
      </TouchableOpacity>
      <View style={styles.itemContainer}>
        <Image
          style={styles.securitySafeImage}
          source={require('../../images/safe.png')}
        />
        <View style={[sharedStyles.row, styles.section]}>
          <RegularText style={styles.title}>Secure your wallet</RegularText>
        </View>
        <View style={[sharedStyles.row, styles.section]}>
          <RegularText style={styles.subTitle}>
            Before you create your wallet, we advise you to generate and store
            your
            <SemiBoldText> unique Master Key.</SemiBoldText>
          </RegularText>
        </View>
        <View style={[sharedStyles.row, styles.section]}>
          <RegularText style={styles.subTitle}>
            This key will help you restore your wallet and access your funds on
            a new devise, in case the old one was lost or stolen
          </RegularText>
        </View>
      </View>

      <View style={[sharedStyles.row, styles.section]}>
        <PrimaryButton
          onPress={() =>
            navigation.navigate(createKeysRouteNames.SecurityExplanation)
          }
          accessibilityLabel="secureNow"
          title={'secure now'}
          style={styles.button}
        />
      </View>
      <View style={[sharedStyles.row, styles.section]}>
        <SecondaryButton
          onPress={secureLater}
          accessibilityLabel="secureLater"
          title={'secure later'}
          style={styles.button}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  parent: {
    backgroundColor: sharedColors.lightPurple,
    height: '100%',
  },
  returnButtonView: {
    width: 30,
    height: 30,
    borderRadius: 30,
    margin: 15,
    marginBottom: 0,
    backgroundColor: sharedColors.blue,
  },
  title: {
    color: sharedColors.black,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subTitle: {
    color: sharedColors.black,
    marginHorizontal: 32,
    marginBottom: 5,
  },
  itemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: sharedColors.lightPurple,
    marginBottom: 30,
  },

  securitySafeImage: {
    resizeMode: 'contain',
    height: Math.round(WINDOW_HEIGHT * 0.27),
    marginBottom: 10,
  },
  section: {
    alignSelf: 'center',
    marginVertical: 5,
  },
  button: {
    width: 150,
  },
})

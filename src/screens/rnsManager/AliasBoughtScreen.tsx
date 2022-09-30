import React, { useState, useEffect } from 'react'

import { View, StyleSheet, Image, Linking, Clipboard } from 'react-native'
import { rnsManagerStyles } from './rnsManagerStyles'

import {
  OutlineButton,
  PurpleButton,
} from '../../components/button/ButtonVariations'

import { ScreenProps } from '../../RootNavigation'
import { ScreenWithWallet } from '../types'
import { MediumText } from '../../components'
import { IProfileStore } from '../../storage/ProfileStore'

type Props = {
  profile: IProfileStore
  setProfile: (p: IProfileStore) => void
  route: any
}

export const AliasBoughtScreen: React.FC<
  ScreenProps<'AliasBought'> & ScreenWithWallet & Props
> = ({ profile, setProfile, navigation, route }) => {
  const { alias, tx } = route.params

  const [registerDomainInfo, setRegisterDomainInfo] = useState(
    'Transaction for your alias is being processed',
  )

  const copyHashAndOpenExplorer = (hash: string) => {
    Clipboard.setString(hash)
    Linking.openURL(`https://explorer.testnet.rsk.co/tx/${hash}`)
  }

  useEffect(() => {
    setProfile({
      ...profile,
      alias,
    })
    const fetchData = async () => {
      await tx.wait()
      setRegisterDomainInfo('Your alias has been registered successfully')
    }
    fetchData()
      // make sure to catch any error
      .catch(console.error)
  }, [])

  return (
    <>
      <View style={rnsManagerStyles.container}>
        <View style={rnsManagerStyles.marginBottom}>
          <View style={styles.imageContainer}>
            <Image
              style={styles.image}
              source={require('../../images/AliasBought.png')}
            />
            <View>
              <MediumText style={rnsManagerStyles.aliasRequestInfo}>
                Congratulations
              </MediumText>
              <MediumText style={rnsManagerStyles.aliasRequestInfo}>
                {registerDomainInfo}
              </MediumText>
            </View>
          </View>
        </View>

        <View style={rnsManagerStyles.bottomContainer}>
          <View style={styles.buttonContainer}>
            <PurpleButton
              onPress={() => copyHashAndOpenExplorer(tx.hash)}
              accessibilityLabel="Copy Hash & Open Explorer"
              title={'Copy Hash & Open Explorer'}
            />
          </View>
          <OutlineButton
            onPress={() =>
              navigation.navigate('ProfileDetailsScreen', {
                navigation,
              })
            }
            accessibilityLabel="close"
            title={'Close'}
          />
        </View>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  imageContainer: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 10,
  },
  image: {
    paddingTop: 50,
    paddingBottom: 10,
  },
  buttonContainer: {
    marginBottom: 15,
  },
})

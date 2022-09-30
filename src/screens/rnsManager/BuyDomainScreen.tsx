import React, { useState, useEffect } from 'react'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import { BigNumber, utils } from 'ethers'
import { RSKRegistrar } from '@rsksmart/rns-sdk'
import moment from 'moment'

import { View, StyleSheet, Image, TouchableOpacity } from 'react-native'
import { colors } from '../../styles'
import { rnsManagerStyles } from './rnsManagerStyles'

import { PurpleButton } from '../../components/button/ButtonVariations'

import { ScreenProps } from '../../RootNavigation'
import { ScreenWithWallet } from '../types'
import { MediumText } from '../../components'
import addresses from './addresses.json'
import TitleStatus from './TitleStatus'
import { TokenImage } from '../home/TokenImage'

type Props = {
  route: any
}

export const BuyDomainScreen: React.FC<
  ScreenProps<'BuyDomain'> & ScreenWithWallet & Props
> = ({ wallet, navigation, route }) => {
  const { alias, domainSecret, duration } = route.params

  const expiryDate = moment(moment(), 'MM-DD-YYYY').add(duration, 'years')

  const [registerDomainInfo, setRegisterDomainInfo] = useState('')
  const [registerInProcess, setRegisterInProcess] = useState(false)
  const [domainPrice, setDomainPrice] = useState<BigNumber>()
  const [domainFiatPrice, setDomainFiatPrice] = useState<number>(0.0)

  const rskRegistrar = new RSKRegistrar(
    addresses.rskOwnerAddress,
    addresses.fifsAddrRegistrarAddress,
    addresses.rifTokenAddress,
    wallet,
  )

  useEffect(() => {
    setDomainPrice(undefined)
    if (duration) {
      rskRegistrar.price(alias, BigNumber.from(duration)).then(price => {
        setDomainPrice(price)
        const rifPrice: number = parseFloat(utils.formatUnits(price, 18))
        const rifMockPrice = 0.05632
        setDomainFiatPrice(rifMockPrice * rifPrice)
      })
    }
  }, [])
  const registerDomain = async (domain: string) => {
    try {
      const durationToRegister = BigNumber.from(2)

      const tx = await rskRegistrar.register(
        domain,
        wallet.smartWallet.address,
        domainSecret,
        durationToRegister,
        domainPrice!,
      )

      setRegisterDomainInfo('Transaction sent. Please wait...')
      setRegisterInProcess(true)

      navigation.navigate('AliasBought', {
        navigation,
        alias: alias,
        tx,
      })
    } catch (e: any) {
      setRegisterInProcess(false)
      setRegisterDomainInfo(e.message)
    }
  }

  return (
    <>
      <View style={rnsManagerStyles.profileHeader}>
        {/*@ts-ignore*/}
        <TouchableOpacity onPress={() => navigation.navigate('SearchDomain')}>
          <View style={rnsManagerStyles.backButton}>
            <MaterialIcon name="west" color="white" size={10} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={rnsManagerStyles.container}>
        <TitleStatus
          title={'Buy alias'}
          subTitle={'next: Confirm'}
          progress={0.66}
          progressText={'3/4'}
        />
        <View style={rnsManagerStyles.marginBottom}>
          {domainPrice && (
            <>
              <MediumText style={styles.fiatPriceLabel}>
                ${domainFiatPrice}
              </MediumText>
              <MediumText style={styles.priceLabel}>
                <TokenImage symbol={'RIF'} height={17} width={17} />{' '}
                {utils.formatUnits(domainPrice, 18)}
              </MediumText>
            </>
          )}
          <View style={rnsManagerStyles.profileImageContainer}>
            <Image
              style={rnsManagerStyles.profileImage}
              source={require('../../images/image_place_holder.jpeg')}
            />
            <View>
              <MediumText style={rnsManagerStyles.aliasRequestInfo}>
                {alias}.rsk
              </MediumText>
              <MediumText style={rnsManagerStyles.aliasRequestInfo2}>
                expiry date: {expiryDate.format('MM.DD.YYYY').toString()}
              </MediumText>
            </View>
          </View>
        </View>

        <MediumText style={rnsManagerStyles.profileDisplayAlias}>
          {registerDomainInfo}
        </MediumText>

        <View style={rnsManagerStyles.bottomContainer}>
          {!registerInProcess && (
            <PurpleButton
              onPress={() => registerDomain(alias)}
              accessibilityLabel="buy"
              title={`buy for $${domainFiatPrice}`}
            />
          )}
        </View>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  priceLabel: {
    color: colors.white,
    alignSelf: 'center',
    fontSize: 25,
  },
  fiatPriceLabel: {
    color: colors.white,
    alignSelf: 'center',
    fontSize: 45,
  },
})
import { useEffect, useMemo } from 'react'
import { View } from 'react-native'

import { shortAddress } from 'lib/utils'

import { AccountBox } from 'components/accounts/AccountBox'
import { headerLeftOption } from 'navigation/profileNavigator'
import { sharedStyles } from 'shared/constants'
import { useWalletState } from 'shared/wallet'
import {
  RootTabsScreenProps,
  rootTabsRouteNames,
} from 'src/navigation/rootNavigator'
import { selectBitcoin, selectChainId } from 'store/slices/settingsSlice'
import { useAppSelector } from 'store/storeUtils'

type WalletScreenProps = RootTabsScreenProps<rootTabsRouteNames.WalletScreen>

export const WalletScreen = ({ navigation }: WalletScreenProps) => {
  const { wallet, walletIsDeployed } = useWalletState()

  const chainId = useAppSelector(selectChainId)
  const bitcoinCore = useAppSelector(selectBitcoin)
  const publicKeys = useMemo(
    () =>
      bitcoinCore
        ? bitcoinCore.networksArr.map(network => ({
            publicKey: network.bips[0].accountPublicKey,
            shortedPublicKey: shortAddress(network.bips[0].accountPublicKey, 8),
            networkName: network.networkName,
          }))
        : [],
    [bitcoinCore],
  )

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => headerLeftOption(navigation.goBack),
    })
  }, [navigation])

  return (
    <View style={sharedStyles.screen}>
      <AccountBox
        walletIsDeployed={walletIsDeployed}
        address={wallet.address}
        smartWalletAddress={wallet.smartWalletAddress}
        chainId={chainId}
        publicKeys={publicKeys}
      />
    </View>
  )
}

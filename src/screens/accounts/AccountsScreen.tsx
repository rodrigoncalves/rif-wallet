import React, { useContext } from 'react'
import { StyleSheet, View, FlatList } from 'react-native'
import { colors } from '../../styles'
import { AppContext } from '../../Context'
import { shortAddress } from '../../lib/utils'
import AddAccountBox from '../../components/accounts/AddAccountBox'
import AccountBox from '../../components/accounts/AccountBox'

export type AccountsScreenType = {
  addNewWallet: any
  switchActiveWallet?: any
}

const AccountsScreen: React.FC<AccountsScreenType> = ({ addNewWallet }) => {
  const { wallets } = useContext(AppContext)
  const walletsArr = React.useMemo(() => {
    return Object.keys(wallets).map((key, id) => ({
      ...wallets[key],
      address: key,
      addressShort: shortAddress(key, 8),
      smartWalletAddress: wallets[key].smartWalletAddress,
      smartWalletAddressShort: shortAddress(wallets[key].smartWalletAddress, 8),
      id,
    }))
  }, [wallets])
  return (
    <FlatList
      data={walletsArr}
      initialNumToRender={10}
      keyExtractor={item => item.id.toString()}
      renderItem={({ item }) => <AccountBox {...item} />}
      style={styles.container}
      ListFooterComponent={() => <AddAccountBox addNewWallet={addNewWallet} />}
      ItemSeparatorComponent={() => <View style={styles.walletView} />}
      ListFooterComponentStyle={styles.viewBottomFix}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.blue,
    paddingHorizontal: 40,
    paddingTop: '8%',
  },
  viewBottomFix: {
    marginTop: 40,
    marginBottom: 150,
  },
  walletView: {
    marginBottom: 40,
  },
})

export default AccountsScreen
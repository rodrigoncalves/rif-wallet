import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { ITokenWithBalance } from '../../lib/rifWalletServices/RIFWalletServicesTypes'
import { BalanceRowComponent } from './BalanceRowComponent'

interface Interface {
  selected: ITokenWithBalance
  setSelected: (token: ITokenWithBalance) => void
  balances: ITokenWithBalance[]
  visible: boolean
  setPanelActive: () => void
}

const PortfolioComponent: React.FC<Interface> = ({
  balances,
  selected,
  setSelected,
  visible,
  setPanelActive,
}) => {
  return (
    <View style={styles.portfolio}>
      <TouchableOpacity onPress={setPanelActive} disabled={visible}>
        <Text style={styles.heading}>portfolio</Text>
      </TouchableOpacity>
      {visible &&
        balances.map((token: any) => (
          <BalanceRowComponent
            key={token.contractAddress}
            selected={selected.contractAddress === token.contractAddress}
            token={token}
            onPress={() => setSelected(token)}
          />
        ))}
    </View>
  )
}

const styles = StyleSheet.create({
  heading: {
    paddingVertical: 15,
    fontSize: 16,
    color: '#66777E',
  },
  portfolio: {
    paddingHorizontal: 25,
    borderRadius: 25,
  },
})

export default PortfolioComponent
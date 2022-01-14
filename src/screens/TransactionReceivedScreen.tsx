import React from 'react'
import { StyleSheet, View, ScrollView, Button, Linking } from 'react-native'

import { Paragraph } from '../components/typography'

export const TransactionReceivedScreen: React.FC<{ route: any }> = ({
  route,
}) => {
  const { txHash, amount, to, token } = route.params
  return (
    <ScrollView>
      <View style={styles.section}>
        <Paragraph>Token: {token}</Paragraph>
        <Paragraph>amount: {amount}</Paragraph>

        <Paragraph>To: {to}</Paragraph>

        <Paragraph>Transaction Hash: {txHash}</Paragraph>
      </View>

      <View>
        <Button
          title="View in explorer"
          onPress={() => {
            Linking.openURL(`https://explorer.testnet.rsk.co/tx/${txHash}`)
          }}
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  safeView: {
    height: '100%',
  },
  screen: {
    paddingRight: 15,
    paddingLeft: 15,
  },
  section: {
    paddingTop: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
})
import { useMemo, useEffect } from 'react'
import BIP39 from '../../lib/bitcoin/BIP39'
import useBitcoinNetworks from '../../components/bitcoin/useBitcoinNetworks'
import BitcoinNetwork from '../../lib/bitcoin/BitcoinNetwork'
import bitcoinNetworkStore from '../../storage/BitcoinNetworkStore'
export type useBitcoinCoreResultType = {
  networks: Array<BitcoinNetwork>
  networksMap: {
    [key: string]: BitcoinNetwork
  }
  refreshStoredNetworks: () => void
}
const useBitcoinCore = (mnemonic: string): useBitcoinCoreResultType => {
  const [networks, refreshStoredNetworks] = useBitcoinNetworks()
  const memoizedNetworks = useMemo(() => {
    if (!mnemonic) {
      return { networksArr: [], networksObj: {} }
    }
    const BIP39Instance = new BIP39(mnemonic)
    const networksObj: any = {}
    const networksArr = Object.values(networks).map(network => {
      const bitcoinNetwork = new BitcoinNetwork(
        network.name,
        network.bips,
        BIP39Instance,
      )
      networksObj[network.name] = bitcoinNetwork
      return bitcoinNetwork
    })

    return { networksArr, networksObj }
  }, [mnemonic, networks])

  useEffect(() => {
    if (memoizedNetworks.networksArr.length < 1) {
      bitcoinNetworkStore
        .addNewNetwork('BITCOIN_TESTNET', ['BIP84'])
        .then(refreshStoredNetworks)
    }
  }, [memoizedNetworks])
  return {
    networks: memoizedNetworks.networksArr,
    networksMap: memoizedNetworks.networksObj,
    refreshStoredNetworks,
  }
}

export default useBitcoinCore
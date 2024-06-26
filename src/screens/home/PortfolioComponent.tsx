import { BitcoinNetwork } from '@rsksmart/rif-wallet-bitcoin'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleProp, View, ViewStyle } from 'react-native'

import { PortfolioCard } from 'components/Porfolio/PortfolioCard'
import { getTokenColor } from 'screens/home/tokenColor'
import { sharedColors } from 'shared/constants'
import { ITokenWithoutLogo } from 'store/slices/balancesSlice/types'

interface Props {
  setSelectedAddress: (token: string | undefined) => void
  balances: Array<ITokenWithoutLogo | BitcoinNetwork>
  totalUsdBalance: string
  selectedAddress?: string
  showTotalCard?: boolean
  style?: StyleProp<ViewStyle>
}
export const PortfolioComponent = ({
  selectedAddress,
  setSelectedAddress,
  balances,
  totalUsdBalance,
  showTotalCard = true,
  style,
}: Props) => {
  const { t } = useTranslation()
  const [isTotalCardSelected, setIsTotalCardSelected] = useState<boolean>(
    showTotalCard && !selectedAddress,
  )

  const handleSelectedAddress = useCallback(
    (contractAddress: string) => {
      setIsTotalCardSelected(false)
      setSelectedAddress(contractAddress)
    },
    [setSelectedAddress],
  )

  const onTotalTap = useCallback(() => {
    setIsTotalCardSelected(true)
    setSelectedAddress(undefined)
  }, [setSelectedAddress])

  return (
    <View style={style}>
      {/*TODO: This View above is a temporal fix to keep the ScrollView height*/}
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        {showTotalCard && (
          <PortfolioCard
            onPress={onTotalTap}
            color={
              isTotalCardSelected
                ? sharedColors.borderColor
                : sharedColors.inputInactive
            }
            primaryText={t('TOTAL')}
            secondaryText={totalUsdBalance}
            isSelected={isTotalCardSelected}
          />
        )}
        {balances.map(
          (
            {
              contractAddress,
              symbol,
              balance,
            }: ITokenWithoutLogo | BitcoinNetwork,
            i: number,
          ) => {
            const isSelected =
              selectedAddress === contractAddress && !isTotalCardSelected
            const color = isSelected
              ? getTokenColor(symbol)
              : sharedColors.inputInactive
            return (
              <PortfolioCard
                key={i}
                onPress={() => handleSelectedAddress(contractAddress)}
                color={color}
                primaryText={symbol}
                secondaryText={balance.toString()}
                isSelected={isSelected}
                icon={symbol}
              />
            )
          },
        )}
      </ScrollView>
    </View>
  )
}

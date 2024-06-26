import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleProp, ViewStyle } from 'react-native'
import { RIFWallet } from '@rsksmart/rif-wallet-core'
import { ZERO_ADDRESS } from '@rsksmart/rif-relay-light-sdk'

import { roundBalance, shortAddress } from 'lib/utils'

import { StatusEnum } from 'components/BasicRow'
import { BasicRowWithContact } from 'components/BasicRow/BasicRowWithContact'
import { AppTouchable } from 'components/appTouchable'
import { rootTabsRouteNames } from 'navigation/rootNavigator/types'
import { TransactionSummaryScreenProps } from 'screens/transactionSummary'
import { ActivityMainScreenProps } from 'shared/types'
import { isMyAddress } from 'src/components/address/lib'
import { useAppSelector } from 'src/redux/storeUtils'
import { getContactByAddress } from 'store/slices/contactsSlice'
import { ActivityRowPresentationObject } from 'store/slices/transactionsSlice'

const getStatus = (status: string) => {
  switch (status) {
    case 'pending':
      return StatusEnum.PENDING
    case 'failed':
      return StatusEnum.FAILED
    default:
      return undefined
  }
}

interface Props {
  index?: number
  wallet: RIFWallet
  activityDetails: ActivityRowPresentationObject
  navigation: ActivityMainScreenProps['navigation']
  backScreen?: rootTabsRouteNames
  style?: StyleProp<ViewStyle>
}

export const ActivityBasicRow = ({
  index,
  wallet,
  navigation,
  activityDetails,
  backScreen,
  style,
}: Props) => {
  const {
    symbol,
    value,
    status,
    fee,
    timeHumanFormatted,
    from = '',
    to = '',
    price,
    id,
  } = activityDetails

  const { t } = useTranslation()

  // Contact
  const amIReceiver = activityDetails.amIReceiver ?? isMyAddress(wallet, to)
  const address = amIReceiver ? from : to
  const contact = useAppSelector(getContactByAddress(address.toLowerCase()))

  // Label
  const firstLabel = amIReceiver ? t('received_from') : t('sent_to')
  const secondLabel = contact?.name || shortAddress(address)
  let label = `${firstLabel} ${secondLabel}`
  if (
    to === ZERO_ADDRESS &&
    from.toLowerCase() === wallet.smartWalletFactory.address.toLowerCase()
  ) {
    label = t('wallet_deployment_label')
  }

  // USD Balance
  const usdBalance = roundBalance(price, 2)

  const txSummary: TransactionSummaryScreenProps = useMemo(
    () => ({
      transaction: {
        tokenValue: {
          symbol,
          symbolType: 'icon',
          balance: value,
        },
        usdValue: {
          symbol: usdBalance ? '$' : '<',
          symbolType: 'usd',
          balance: usdBalance ? usdBalance.toFixed(2) : '0.01',
        },
        status,
        fee,
        amIReceiver,
        from,
        to,
        time: timeHumanFormatted,
        hashId: id,
      },
      contact: contact || { address },
    }),
    [
      address,
      amIReceiver,
      contact,
      fee,
      from,
      to,
      status,
      symbol,
      timeHumanFormatted,
      usdBalance,
      value,
      id,
    ],
  )

  const amount = useMemo(() => {
    if (symbol.startsWith('BTC')) {
      return value
    }
    const num = Number(value)
    let rounded = roundBalance(num, 4)
    if (!rounded) {
      rounded = roundBalance(num, 8)
    }
    return rounded.toString()
  }, [value, symbol])

  const handlePress = useCallback(() => {
    if (txSummary) {
      navigation.navigate(rootTabsRouteNames.TransactionSummary, {
        ...txSummary,
        backScreen,
      })
    }
  }, [navigation, txSummary, backScreen])

  return (
    <AppTouchable width={'100%'} onPress={handlePress} style={style}>
      <BasicRowWithContact
        index={index}
        label={label}
        amount={amount}
        symbol={symbol}
        status={getStatus(status)}
        avatar={{ name: 'A' }}
        secondaryLabel={timeHumanFormatted}
        usdAmount={price === 0 ? undefined : usdBalance}
        contact={contact}
      />
    </AppTouchable>
  )
}

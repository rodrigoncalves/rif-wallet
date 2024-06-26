import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { RIFWallet } from '@rsksmart/rif-wallet-core'
import { isBitcoinAddressValid } from '@rsksmart/rif-wallet-bitcoin'

import { displayRoundBalance } from 'lib/utils'

import { TokenBalance } from 'components/token'
import { sharedColors, sharedStyles } from 'shared/constants'
import { castStyle } from 'shared/utils'
import { AppButton, AppTouchable, Typography } from 'components/index'
import { WINDOW_HEIGHT, WINDOW_WIDTH } from 'src/ux/slides/Dimensions'
import { useAppSelector } from 'store/storeUtils'
import { isMyAddress } from 'components/address/lib'
import { DollarIcon } from 'components/icons/DollarIcon'
import { FullScreenSpinner } from 'components/fullScreenSpinner'
import { getContactByAddress } from 'store/slices/contactsSlice'
import { getWalletSetting } from 'src/core/config'
import { SETTINGS } from 'src/core/types'
import { chainTypesById } from 'src/shared/constants/chainConstants'
import { selectChainId } from 'src/redux/slices/settingsSlice'

import { TokenImage } from '../home/TokenImage'
import {
  TransactionStatus,
  transactionStatusDisplayText,
  transactionStatusToIconPropsMap,
} from './transactionSummaryUtils'

import { TransactionSummaryScreenProps } from '.'

interface Props {
  wallet: RIFWallet
  goBack?: () => void
}

type TransactionSummaryComponentProps = Omit<
  TransactionSummaryScreenProps,
  'backScreen'
> &
  Props

export const TransactionSummaryComponent = ({
  wallet,
  transaction,
  buttons,
  functionName,
  goBack,
  isLoaded,
  FeeComponent,
}: TransactionSummaryComponentProps) => {
  const chainId = useAppSelector(selectChainId)
  const { bottom } = useSafeAreaInsets()
  const { t } = useTranslation()
  const { status, tokenValue, fee, usdValue, time, hashId, to, from } =
    transaction

  const iconObject = transactionStatusToIconPropsMap.get(status)
  const transactionStatusText = transactionStatusDisplayText.get(status)

  const amIReceiver = transaction.amIReceiver ?? isMyAddress(wallet, to)
  const contactAddress = amIReceiver ? from || '' : to
  const contact = useAppSelector(
    getContactByAddress(contactAddress.toLowerCase()),
  )
  const contactToUse = contact || { address: contactAddress }

  const title = useMemo(() => {
    if (amIReceiver) {
      if (status === TransactionStatus.SUCCESS) {
        return t('transaction_summary_received_title_success')
      } else if (status === TransactionStatus.PENDING) {
        return t('transaction_summary_received_title_pending')
      }
      return t('transaction_summary_receive_title')
    }
    if (status === TransactionStatus.SUCCESS) {
      return t('transaction_summary_sent_title_success')
    } else if (status === TransactionStatus.PENDING) {
      return t('transaction_summary_sent_title_pending')
    }
    return t('transaction_summary_send_title')
  }, [amIReceiver, t, status])

  const totalToken = useMemo(() => {
    if (tokenValue.symbol === fee.symbol) {
      return Number(tokenValue.balance) + Number(fee.tokenValue)
    }
    return Number(tokenValue.balance)
  }, [tokenValue, fee])

  const totalUsd = useMemo(
    () =>
      amIReceiver
        ? usdValue.balance
        : (Number(usdValue.balance) + Number(fee.usdValue)).toFixed(2),
    [amIReceiver, usdValue.balance, fee.usdValue],
  )

  const openTransactionHash = () => {
    let explorerUrl = ''

    if (isBitcoinAddressValid(to)) {
      explorerUrl = getWalletSetting(
        SETTINGS.BTC_EXPLORER_ADDRESS_URL,
        chainTypesById[chainId],
      )
    } else {
      explorerUrl = getWalletSetting(
        SETTINGS.EXPLORER_ADDRESS_URL,
        chainTypesById[chainId],
      )
    }

    Linking.openURL(`${explorerUrl}/tx/${hashId}`)
  }

  return (
    <View style={[styles.screen, { paddingBottom: bottom }]}>
      {isLoaded === false && <FullScreenSpinner />}
      <ScrollView
        style={sharedStyles.flex}
        contentContainerStyle={styles.contentPadding}
        showsVerticalScrollIndicator={false}>
        <Typography
          style={styles.title}
          type={'h4'}
          color={sharedColors.inputLabelColor}>
          {title}
        </Typography>
        <TokenBalance
          firstValue={tokenValue}
          secondValue={usdValue}
          contact={contactToUse}
          amIReceiver={amIReceiver}
        />
        {functionName && (
          <Typography
            style={styles.title}
            type={'body1'}
            color={sharedColors.inputLabelColor}>
            {t('transaction_summary_function_type')}: {functionName}
          </Typography>
        )}
        <View />
        {transactionStatusText || status ? (
          <View
            style={[
              styles.summaryAlignment,
              styles.statusContainer,
              status ? { backgroundColor: sharedColors.inputInactive } : null,
            ]}>
            <Typography type={'h4'}>
              {status ? t('transaction_summary_status') : ''}
            </Typography>
            <View style={sharedStyles.row}>
              <Typography type={'h4'}>
                {transactionStatusText ? t(transactionStatusText) : ''}
              </Typography>
              {iconObject ? (
                <Icon
                  style={styles.statusIcon}
                  solid
                  size={18}
                  name={iconObject.iconName}
                  color={iconObject.iconColor}
                />
              ) : null}
            </View>
          </View>
        ) : null}
        <View style={styles.summaryView}>
          {/* fee values */}
          {status !== TransactionStatus.PENDING && (
            <>
              <View style={styles.summaryAlignment}>
                <Typography type={'body2'} style={[sharedStyles.textLeft]}>
                  {t('transaction_summary_fees')}
                </Typography>

                <View style={sharedStyles.row}>
                  <TokenImage
                    symbol={fee.symbol || tokenValue.symbol}
                    transparent
                    size={12}
                  />
                  <Typography type={'body2'} style={[sharedStyles.textCenter]}>
                    {displayRoundBalance(Number(fee.tokenValue))} {fee.symbol}
                  </Typography>
                </View>
              </View>

              <View style={styles.dollarAmountWrapper}>
                <DollarIcon size={14} color={sharedColors.labelLight} />
                <Typography
                  type={'body2'}
                  style={[
                    sharedStyles.textRight,
                    { color: sharedColors.labelLight },
                  ]}>
                  {fee.usdValue}
                </Typography>
              </View>
            </>
          )}
          {FeeComponent}
          {/* Total values */}
          <View style={[styles.summaryAlignment]}>
            <Typography type={'body2'} style={[sharedStyles.textLeft]}>
              {amIReceiver
                ? status === TransactionStatus.SUCCESS
                  ? t('transaction_summary_i_received_text')
                  : t('transaction_summary_i_receive_text')
                : status === TransactionStatus.SUCCESS
                ? t('transaction_summary_total_sent')
                : t('transaction_summary_total_send')}
            </Typography>

            <View style={sharedStyles.row}>
              <TokenImage symbol={tokenValue.symbol} size={12} transparent />
              <Typography type={'body2'} style={[sharedStyles.textCenter]}>
                {displayRoundBalance(totalToken, tokenValue.symbol)}{' '}
                {tokenValue.symbol}{' '}
                {tokenValue.symbol !== fee.symbol &&
                  !amIReceiver &&
                  t('transaction_summary_plus_fees')}
              </Typography>
            </View>
          </View>
          <View style={styles.dollarAmountWrapper}>
            {usdValue.symbol === '<' && (
              <Typography type="body1" color={sharedColors.labelLight}>
                {'<'}
              </Typography>
            )}
            <DollarIcon size={14} color={sharedColors.labelLight} />
            <Typography
              type={'body2'}
              style={[
                sharedStyles.textRight,
                { color: sharedColors.labelLight },
              ]}>
              {totalUsd}
            </Typography>
          </View>
          {/* arrive value */}
          <View style={[styles.summaryAlignment]}>
            <Typography type={'body2'} style={[sharedStyles.textLeft]}>
              {status === TransactionStatus.SUCCESS
                ? t('transaction_summary_arrived_text')
                : t('transaction_summary_arrives_in_text')}
            </Typography>

            <Typography type={'body2'} style={[sharedStyles.textRight]}>
              {time}
            </Typography>
          </View>
          {/* separator */}
          <View style={styles.separator} />
          {/* address value */}
          {contactToUse?.name && (
            <View style={[styles.summaryAlignment]}>
              <Typography
                type={'body2'}
                style={[sharedStyles.textLeft, sharedStyles.flex]}>
                {t('transaction_summary_address_text')}
              </Typography>
              <Typography
                type={'h5'}
                style={[sharedStyles.textRight, styles.fullAddress]}
                numberOfLines={1}
                ellipsizeMode={'middle'}>
                {contactToUse.address}
              </Typography>
            </View>
          )}
          {/* transaction hash */}
          {hashId && (
            <View style={[styles.summaryAlignment]}>
              <Typography
                type={'body2'}
                style={[sharedStyles.textLeft, sharedStyles.flex]}>
                {t('transaction_summary_transaction_hash')}
              </Typography>
              <AppTouchable
                width="100%"
                onPress={openTransactionHash}
                style={styles.fullAddress}>
                <Typography
                  type={'h5'}
                  style={[sharedStyles.textRight, styles.underline]}
                  numberOfLines={1}
                  ellipsizeMode={'middle'}
                  accessibilityLabel="Hash">
                  {hashId}
                </Typography>
              </AppTouchable>
            </View>
          )}
        </View>
      </ScrollView>
      <View style={styles.buttons}>
        {buttons ? (
          buttons.map(b => <AppButton {...b} key={b.title} />)
        ) : (
          <AppButton
            onPress={goBack}
            title={t('transaction_summary_default_button_text')}
            color={sharedColors.white}
            textColor={sharedColors.black}
            accessibilityLabel="Close"
          />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: castStyle.view({
    flex: 1,
    backgroundColor: sharedColors.black,
    paddingHorizontal: 22,
  }),
  contentPadding: castStyle.view({ paddingBottom: 114 }),
  title: castStyle.text({
    marginTop: 22,
  }),
  statusContainer: castStyle.view({
    height: 54,
    marginTop: 27,
    borderRadius: 10,
    alignItems: 'center',
    paddingHorizontal: 18,
  }),
  summaryView: castStyle.view({
    marginTop: 100,
  }),
  summaryAlignment: castStyle.view({
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  }),
  summaryWrapper: castStyle.view({
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: sharedColors.white,
    paddingBottom: 16,
  }),
  separator: castStyle.view({
    marginTop: 16,
    height: 1,
    width: '100%',
    backgroundColor: sharedColors.white,
    opacity: 0.4,
  }),
  fullAddress: castStyle.view({
    flex: 3,
    alignSelf: 'flex-end',
  }),
  underline: castStyle.text({
    textDecorationLine: 'underline',
  }),
  buttons: castStyle.view({
    justifyContent: 'space-between',
    minHeight: 114,
  }),
  statusIcon: castStyle.text({ marginLeft: 10 }),
  nextButton: castStyle.view({ marginTop: 10 }),
  spinnerView: castStyle.view({
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    position: 'absolute',
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
  }),
  dollarAmountWrapper: castStyle.view({
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
  }),
})

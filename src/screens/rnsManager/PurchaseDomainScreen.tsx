import { useEffect, useMemo, useState, useCallback, useContext } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

import {
  DomainRegistrationEnum,
  RnsProcessor,
  useRifToken,
  useRnsDomainPriceInRif as calculatePrice,
} from 'lib/rns'

import { AvatarIcon } from 'components/icons/AvatarIcon'
import {
  AppButton,
  AppButtonBackgroundVarietyEnum,
  AppSpinner,
  Input,
  Typography,
} from 'components/index'
import { headerLeftOption } from 'navigation/profileNavigator'
import {
  profileStackRouteNames,
  ProfileStackScreenProps,
  ProfileStatus,
} from 'navigation/profileNavigator/types'
import { sharedColors, sharedStyles } from 'shared/constants'
import { castStyle } from 'shared/utils'
import {
  purchaseUsername,
  selectProfile,
  selectProfileStatus,
  deleteProfile,
} from 'store/slices/profileSlice'
import { useAppDispatch, useAppSelector } from 'store/storeUtils'
import { rootTabsRouteNames } from 'navigation/rootNavigator'
import { handleDomainTransactionStatusChange } from 'screens/rnsManager/utils'
import { selectChainId } from 'store/slices/settingsSlice'
import { RNS_ADDRESSES_BY_CHAIN_ID } from 'screens/rnsManager/types'
import { WalletContext } from 'shared/wallet'

import { rnsManagerStyles } from './rnsManagerStyles'

type Props = ProfileStackScreenProps<profileStackRouteNames.PurchaseDomain>

export enum TestID {
  CancelRegistrationButton = 'PurchaseDomainScreen.CancelRegistrationButton',
  PurchaseDomainButton = 'PurchaseDomainScreen.PurchaseDomainButton',
}

export const PurchaseDomainScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch()
  const rifToken = useRifToken()
  const { wallet } = useContext(WalletContext)
  const profile = useAppSelector(selectProfile)
  const chainId = useAppSelector(selectChainId)
  const alias = profile.alias
  const duration = profile.duration || 1
  const profileStatus = useAppSelector(selectProfileStatus)
  const [error, setError] = useState('')
  const rnsProcessor = useMemo(
    () =>
      wallet &&
      new RnsProcessor({
        wallet,
        onSetTransactionStatusChange: handleDomainTransactionStatusChange(
          dispatch,
          wallet,
        ),
        rnsAddresses: RNS_ADDRESSES_BY_CHAIN_ID[chainId],
      }),
    [dispatch, wallet, chainId],
  )

  const methods = useForm()
  const { t } = useTranslation()
  const [selectedDomainPrice, setSelectedDomainPrice] = useState<number>(2)

  const selectedDomainPriceInUsd = (
    rifToken.price * selectedDomainPrice
  ).toFixed(2)

  useEffect(() => {
    calculatePrice(alias, duration).then(setSelectedDomainPrice)
  }, [alias, duration])

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () =>
        headerLeftOption(() => navigation.navigate(rootTabsRouteNames.Home)),
    })
  }, [navigation])

  const registerDomain = useCallback(async () => {
    const domain = alias.split('.')[0]
    setError('')
    if (!rnsProcessor) {
      return setError('No RNS Processor set!')
    }

    try {
      const response = await dispatch(
        purchaseUsername({ rnsProcessor, domain }),
      ).unwrap()
      if (response === DomainRegistrationEnum.REGISTERING_REQUESTED) {
        navigation.navigate(profileStackRouteNames.AliasBought, {
          alias: alias,
        })
      }
    } catch (e) {
      if (typeof e === 'string' || e instanceof Error) {
        const message = e.toString()
        if (
          message.includes('balance too low') ||
          message.includes('gasLimit exceeded')
        ) {
          setError(t('search_domain_error_funds_low'))
        } else {
          setError(e.toString())
        }
      }
    }
  }, [alias, dispatch, rnsProcessor, navigation, t])

  const onCancelDomainTap = useCallback(async () => {
    const domain = alias.split('.')[0]
    rnsProcessor.deleteRnsProcess(domain)
    dispatch(deleteProfile())
  }, [alias, dispatch, rnsProcessor])

  return (
    <ScrollView style={rnsManagerStyles.scrollContainer}>
      <View style={rnsManagerStyles.container}>
        <Typography
          type="h2"
          style={[rnsManagerStyles.subtitle, rnsManagerStyles.marginBottom]}>
          {t('header_purchase')}
        </Typography>
        <View style={rnsManagerStyles.profileImageContainer}>
          <AvatarIcon value={alias} size={100} />

          <Typography type="h3" style={rnsManagerStyles.profileDisplayAlias}>
            {alias}
          </Typography>
        </View>
        <FormProvider {...methods}>
          <Input
            inputName="duration"
            label={t('purchase_username_duration_label')}
            placeholder={`${duration} ${
              duration > 1
                ? t('request_username_years')
                : t('request_username_year')
            }`}
            isReadOnly
          />

          <Input
            inputName="price"
            label={t('purchase_username_price_label')}
            placeholder={`${selectedDomainPrice} ${rifToken?.symbol} ${t(
              'transaction_summary_plus_fees_capitalcase',
            )}`}
            subtitle={`$ ${selectedDomainPriceInUsd}`}
            containerStyle={styles.priceContainer}
            isReadOnly
          />
        </FormProvider>
        {profileStatus === ProfileStatus.READY_TO_PURCHASE && (
          <>
            <AppButton
              style={rnsManagerStyles.button}
              onPress={registerDomain}
              accessibilityLabel={TestID.PurchaseDomainButton}
              title={t('purchase_username_button')}
              color={sharedColors.white}
              textColor={sharedColors.black}
            />
            <AppButton
              style={rnsManagerStyles.button}
              onPress={onCancelDomainTap}
              accessibilityLabel={TestID.CancelRegistrationButton}
              title={t('cancel_username_button')}
              color={sharedColors.white}
              textColor={sharedColors.white}
              backgroundVariety={AppButtonBackgroundVarietyEnum.OUTLINED}
            />
          </>
        )}
        {profileStatus === ProfileStatus.PURCHASING && (
          <>
            <View style={[sharedStyles.contentCenter]}>
              <AppSpinner size={64} thickness={10} />
            </View>
            <Typography type="body1">
              {t('purchase_username_loading')}
            </Typography>
          </>
        )}
        {error !== '' && (
          <Typography type="body1" style={styles.errorTypography}>
            {error}
          </Typography>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: castStyle.view({
    justifyContent: 'space-between',
  }),
  priceContainer: castStyle.view({
    height: 90,
  }),
  errorTypography: castStyle.text({
    paddingHorizontal: 5,
    marginTop: 10,
  }),
})

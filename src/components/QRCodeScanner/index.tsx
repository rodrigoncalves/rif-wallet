import 'react-native-reanimated'
import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import BarcodeMask from 'react-native-barcode-mask'
import {
  Camera,
  useCameraDevices,
  useFrameProcessor,
} from 'react-native-vision-camera'
import {
  BarcodeFormat,
  Barcode,
  scanBarcodes,
} from 'vision-camera-code-scanner'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { useIsFocused } from '@react-navigation/native'
import { runOnJS } from 'react-native-reanimated'
import { useTranslation } from 'react-i18next'

import { useAppDispatch } from 'store/storeUtils'
import { setFullscreen } from 'store/slices/settingsSlice'
import { sharedColors } from 'shared/constants'
import { castStyle } from 'shared/utils'
import { AppSpinner } from 'components/spinner'
import { AppTouchable } from 'components/appTouchable'
import { useCheckCameraPermissions } from 'components/QRCodeScanner/useCheckCameraPermissions'

export interface QRCodeScannerProps {
  onClose: () => void
  onCodeRead: (data: string) => void
}

export const QRCodeScanner = ({ onClose, onCodeRead }: QRCodeScannerProps) => {
  const { t } = useTranslation()
  const devices = useCameraDevices()
  const device = devices.back
  const [barcode, setBarcode] = useState<Barcode | null>(null)
  const dispatch = useAppDispatch()
  const isFocused = useIsFocused()

  useCheckCameraPermissions({ t, isFocused })
  // Do not use the hook that comes with the camera as it'll not work
  const frameProcessor = useFrameProcessor(frame => {
    'worklet'
    const detectedBarcodes = scanBarcodes(frame, [BarcodeFormat.QR_CODE])
    runOnJS(setBarcode)(detectedBarcodes[0])
  }, [])

  useEffect(() => {
    if (barcode && barcode.rawValue) {
      onCodeRead(barcode.rawValue)
      setBarcode(null)
    }
  }, [barcode, onCodeRead])

  useEffect(() => {
    dispatch(setFullscreen(isFocused))
    return () => {
      dispatch(setFullscreen(false))
    }
  }, [dispatch, isFocused])

  return (
    <View style={styles.container}>
      {!device ? (
        <View>
          <AppSpinner size={174} />
        </View>
      ) : (
        <Camera
          isActive={isFocused}
          frameProcessor={frameProcessor}
          frameProcessorFps={5}
          device={device}
          style={StyleSheet.absoluteFill}
          torch="off"
        />
      )}
      <BarcodeMask
        showAnimatedLine={false}
        outerMaskOpacity={0.5}
        width={260}
        height={260}
        edgeColor={sharedColors.white}
        edgeBorderWidth={4}
        edgeHeight={25}
        edgeWidth={25}
        edgeRadius={5}
      />
      <AppTouchable width={48} onPress={onClose} style={styles.floatButton}>
        <Icon
          accessibilityLabel={'closeButton'}
          name={'times'}
          size={24}
          color={sharedColors.white}
        />
      </AppTouchable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: castStyle.view({
    flex: 1,
    alignItems: 'center',
  }),
  floatButton: castStyle.view({
    position: 'absolute',
    bottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: sharedColors.primary,
    height: 52,
    width: 52,
    borderRadius: 26,
  }),
})

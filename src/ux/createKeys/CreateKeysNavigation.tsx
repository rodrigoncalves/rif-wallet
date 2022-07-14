import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import { CreateKeysScreen } from './CreateKeysScreen'
import { NewMasterKeyScreen } from './new/NewMasterKeyScreen'
import { ConfirmNewMasterKeyScreen } from './new/ConfirmNewMasterKeyScreen'
import { ImportMasterKeyScreen } from './import/ImportMasterKeyScreen'
import { StackParamList, CreateKeysProps } from './types'
import { SecurityExplanationScreen } from './SecurityExplanationScreen'
import { SecureYourWalletScreen } from './SecureYourWalletScreen'

const Stack = createStackNavigator<StackParamList>()

const screensOptions = { headerShown: false }

export const CreateKeysNavigation: React.FC<CreateKeysProps> = ({
  generateMnemonic,
  createFirstWallet,
  isKeyboardVisible,
}) => {
  return (
    <Stack.Navigator initialRouteName="CreateKeys">
      <Stack.Screen
        name="CreateKeys"
        component={CreateKeysScreen}
        options={screensOptions}
      />
      <Stack.Group>
        <Stack.Group>
          <Stack.Screen name="NewMasterKey" options={screensOptions}>
            {props => (
              <NewMasterKeyScreen
                {...props}
                generateMnemonic={generateMnemonic}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="SecureYourWallet" options={screensOptions}>
            {props => <SecureYourWalletScreen {...props} />}
          </Stack.Screen>
          <Stack.Screen name="SecurityExplanation" options={screensOptions}>
            {props => <SecurityExplanationScreen {...props} />}
          </Stack.Screen>
          <Stack.Screen name="ConfirmNewMasterKey" options={screensOptions}>
            {props => (
              <ConfirmNewMasterKeyScreen
                {...props}
                createFirstWallet={createFirstWallet}
                isKeyboardVisible={isKeyboardVisible}
              />
            )}
          </Stack.Screen>
        </Stack.Group>
        <Stack.Screen name="ImportMasterKey" options={screensOptions}>
          {props => (
            <ImportMasterKeyScreen
              {...props}
              createFirstWallet={createFirstWallet}
              isKeyboardVisible={isKeyboardVisible}
            />
          )}
        </Stack.Screen>
      </Stack.Group>
    </Stack.Navigator>
  )
}

import { Provider } from 'react-redux'
import { render } from '@testing-library/react-native'

import { store } from 'store/index'

import { ShowMnemonicScreen, TestID } from './ShowMnemonicScreen'
import { Awaited, getTextFromTextNode } from '../../../testLib/utils'

const createTestInstance = async () => {
  const testMnemonic = 'MNEMONIC'

  const container = render(
    <Provider store={store}>
      <ShowMnemonicScreen />
    </Provider>,
  )

  return { container, testMnemonic }
}

// eslint-disable-next-line jest/no-disabled-tests
describe.skip('Keys Info Screen', function (this: {
  testInstance: Awaited<ReturnType<typeof createTestInstance>>
}) {
  beforeEach(async () => {
    this.testInstance = await createTestInstance()
  })
  // TODO: understand if we need to test the case at all
  // cause it looks like we are testing @redux/toolkit ability
  // to give the correct state

  describe('initial screen', () => {
    test('shows mnemonic', async () => {
      const {
        container: { getByTestId },
        testMnemonic,
      } = this.testInstance

      expect(getTextFromTextNode(getByTestId(TestID.Mnemonic))).toEqual(
        testMnemonic,
      )
    })
  })
})

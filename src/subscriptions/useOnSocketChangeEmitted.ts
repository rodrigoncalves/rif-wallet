import { useOnNewTransactionEventEmitted } from './useOnNewTransactionEventEmitted'
import { Action, ISocketsChangeEmitted } from './types'
import { resetSocketState } from 'store/shared/actions/resetSocketState'
import {
  addOrUpdateBalances,
  addOrUpdateNewBalance,
} from 'src/redux/slices/balancesSlice/balancesSlice'
import { setIsSetup } from 'store/slices/appStateSlice/appStateSlice'
import {
  addNewEvent,
  addNewTransactions,
} from 'store/slices/transactionsSlice/transactionsSlice'
import { setUsdPrices } from 'store/slices/usdPricesSlice'

export const useOnSocketChangeEmitted = ({
  dispatch,
  abiEnhancer,
  wallet,
}: ISocketsChangeEmitted) => {
  const onNewTransactionEventEmitted = useOnNewTransactionEventEmitted({
    abiEnhancer,
    wallet,
    dispatch: dispatch,
  })
  return (action: Action) => {
    if (action.type === 'reset') {
      dispatch(resetSocketState())
    } else {
      const { type, payload } = action
      switch (type) {
        case 'newPrice':
          dispatch(setUsdPrices(payload))
          break
        case 'newTransaction':
          onNewTransactionEventEmitted(payload.originTransaction)
          break
        case 'newTransactions':
          dispatch(addNewTransactions(payload))
          break
        case 'newBalance':
          dispatch(addOrUpdateNewBalance(payload))
          break
        case 'init':
          dispatch(
            addNewTransactions({
              next: null,
              prev: null,
              activityTransactions: payload.transactions,
            }),
          )
          dispatch(addOrUpdateBalances(payload.balances))
          dispatch(setIsSetup(true))
          break
        case 'newTokenTransfer':
          // This is not being used anywhere
          dispatch(addNewEvent(payload))
          break
        default:
          throw new Error(`${type} not implemented`)
      }
    }
  }
}

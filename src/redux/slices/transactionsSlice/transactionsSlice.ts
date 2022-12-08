import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ITransactionsState } from 'store/slices/transactionsSlice/types'
import {
  filterEnhancedTransactions,
  sortEnhancedTransactions,
} from 'src/subscriptions/utils'
import {
  IActivityTransaction,
  IEvent,
  TransactionsServerResponseWithActivityTransactions,
} from 'src/subscriptions/types'
import { resetSocketState } from 'store/shared/actions/resetSocketState'

const initialState: ITransactionsState = {
  next: '',
  prev: '',
  transactions: [],
  events: [],
}

const deserializeTransactions = (transactions: IActivityTransaction[]) =>
  transactions.sort(sortEnhancedTransactions).filter(filterEnhancedTransactions)

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    addNewTransactions: (
      state,
      {
        payload,
      }: PayloadAction<TransactionsServerResponseWithActivityTransactions>,
    ) => {
      state.transactions = deserializeTransactions(
        state.transactions.concat(payload.activityTransactions || []),
      )
      state.next = payload.next || null
      state.prev = payload.prev || null
      return state
    },
    addNewTransaction: (
      state,
      { payload }: PayloadAction<IActivityTransaction>,
    ) => {
      state.transactions.push(payload)
      state.transactions = deserializeTransactions(state.transactions || [])
      return state
    },
    addNewEvent: (state, { payload }: PayloadAction<IEvent>) => {
      state.events.push(payload)
      return state
    },
  },
  extraReducers: builder => {
    builder.addCase(resetSocketState, () => initialState)
  },
})

export const { addNewTransactions, addNewTransaction, addNewEvent } =
  transactionsSlice.actions
export const transactionsReducer = transactionsSlice.reducer
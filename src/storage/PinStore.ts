import { createStore } from './SecureStore'

const key = 'PIN'
const PINStore = createStore(key)

export const hasPin = PINStore.has
export const getPin = PINStore.get
export const removePin = PINStore.remove
export const savePin = PINStore.save
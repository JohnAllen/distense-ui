import { combineReducers } from 'redux'

export const RECEIVE_ACCOUNTS = 'RECEIVE_ACCOUNTS'
export const USER_AUTHENTICATED = 'USER_AUTHENTICATED'

const accountByAddress = (state = {}, action) => {
  switch (action.type) {
    case RECEIVE_ACCOUNTS:
      return {
        ...state,
        ...(action.accounts || []).reduce((obj, account) => {
          obj[account.address] = account
          return obj
        }, {})
      }
      default:
        return state
  }
}

const allAccounts = (state = [], action) => {
  switch (action.type) {
    case RECEIVE_ACCOUNTS:
      return (action.accounts || []).map(account => account.address)
    default:
      return state
  }
}

export default combineReducers({
  accountByAddress,
  allAccounts,
})

export const getAccount = (state, address) => {
  return state.accountByAddress[address]
}

export const getAllAccounts = state => {
  return state.accounts.map(address => getAccount(state, address))
}

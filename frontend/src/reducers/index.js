import { combineReducers } from 'redux'

import accounts from './accounts'
import tasks from './tasks'
import pullRequests from './pullRequests'

export const SET_ADDRESS = 'SET_ADDRESS'


const setAddress = (state = null, action) => {
  switch (action.type) {
    case SET_ADDRESS:
      return action.address
    default:
      return state
  }
}

export default combineReducers({
  setAddress,
  accounts,
  pullRequests,
  tasks
})
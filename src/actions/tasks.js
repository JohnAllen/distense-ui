import _ from 'lodash'
import * as contracts from '../contracts'

import { receiveUserNotAuthenticated } from './user'
import { setDefaultStatus, updateStatusMessage } from './status'
import {
  REQUEST_TASK,
  RECEIVE_TASK,
  REQUEST_TASKS,
  RECEIVE_TASKS,
  SET_NUM_TASKS,
  SELECT_TASK,
  SUBMIT_TASK,
  REQUEST_TASKS_INSTANCE,
  RECEIVE_TASKS_INSTANCE
} from '../constants/constants'
import { constructClientTask } from '../helpers/tasks/constructClientTask'
import { encodeTaskMetaDataToBytes32 } from '../helpers/tasks/encodeTaskMetaDataToBytes32'
import { convertIntToSolidityInt } from '../utils'

const requestTasks = () => ({
  type: REQUEST_TASKS
})

const receiveTasks = tasks => ({
  type: RECEIVE_TASKS,
  tasks
})

const requestTask = id => ({
  type: REQUEST_TASK,
  id
})

const receiveTask = task => ({
  type: RECEIVE_TASK,
  task
})

export const selectTask = id => ({
  type: SELECT_TASK,
  id
})

export const requestTasksInstance = () => ({
  type: REQUEST_TASKS_INSTANCE
})

export const receiveTasksInstance = () => ({
  type: RECEIVE_TASKS_INSTANCE
})

export const setNumTasks = numTasks => ({
  type: SET_NUM_TASKS,
  numTasks
})

const submitTask = task => ({
  type: SUBMIT_TASK,
  task
})

export const fetchTasks = () => async dispatch => {
  // Have to get numTasks from chain to know how many to query by index
  dispatch(requestTasksInstance())
  const { getNumTasks } = await contracts.Tasks

  dispatch(receiveTasksInstance())
  const numTasks = +await getNumTasks()
  console.log(`found ${numTasks} tasks in blockchain`)
  dispatch(setNumTasks(numTasks))
  dispatch(requestTasks())

  const tasks = await Promise.all(_.range(numTasks).map(getTaskByIndex))
  dispatch(receiveTasks(tasks.filter(_.identity)))
  dispatch(setDefaultStatus())
}

const getTaskByIndex = async index => {
  let taskId
  try {
    const { taskIds } = await contracts.Tasks
    taskId = await taskIds(index)
  } catch (error) {
    console.log(`getTaskByIndex error: ${getTaskByIndex}`)
  }

  return getTaskByID(taskId)
}

export const getTaskByID = async taskId => {
  try {
    const { getTaskById } = await contracts.Tasks

    const contractTask = await getTaskById(taskId)

    return constructClientTask(taskId, contractTask)
  } catch (error) {
    console.error(error)
  }
}

export const fetchTask = id => async dispatch => {
  dispatch(requestTask(id))
  const task = await getTaskByID(id)
  dispatch(receiveTask(task))
  dispatch(setDefaultStatus())
}

export const addTask = ({ title, tagsString, issueNum, repo }) => async (
  dispatch,
  getState
) => {
  const coinbase = getState().user.accounts[0]
  if (!coinbase) {
    dispatch(receiveUserNotAuthenticated())
    return
  }

  dispatch(requestTasksInstance())
  const { addTask } = await contracts.Tasks // Get Tasks contract instance
  dispatch(receiveTasksInstance())

  //  Create a full task here, as it will be optimistically loaded into the client/redux

  const originalTask = {
    createdBy: coinbase,
    title,
    tagsString,
    issueNum,
    repoString: repo === 'ui' ? 'distense-ui' : 'contracts'
  }
  const encodedTaskId = encodeTaskMetaDataToBytes32(originalTask)
  originalTask._id = encodedTaskId
  dispatch(submitTask(originalTask))

  const addedTask = await addTask(encodedTaskId, title, {
    from: coinbase
  })

  if (addedTask) console.log(`blockchain/contact addTask() successful`)
  else console.log(`FAILED to add task`)

  dispatch(receiveTask(originalTask))
  dispatch(setDefaultStatus())

  return originalTask
}

export const voteOnTaskReward = ({ taskId, reward }) => async (
  dispatch,
  getState
) => {
  const coinbase = getState().user.accounts[0]
  if (!coinbase) {
    dispatch(receiveUserNotAuthenticated())
    return
  }

  dispatch(requestTasksInstance())
  const { taskRewardVote } = await contracts.Tasks // Get contract function from Tasks contract instance
  dispatch(receiveTasksInstance())

  updateStatusMessage('submitting task reward vote to blockchain')

  let receipt
  if (taskId && reward) {
    receipt = await taskRewardVote(taskId, convertIntToSolidityInt(reward), {
      from: coinbase,
      gasPrice: 3000000000 // TODO use ethgasstation for this
    })

    if (receipt) console.log(`got tx receipt`)
    if (receipt.tx) {
      console.log(`vote on task reward success`)
      updateStatusMessage('task reward vote confirmed')
    } else console.error(`vote on task reward ERROR`)
  }

  dispatch(setDefaultStatus())

  return receipt
}

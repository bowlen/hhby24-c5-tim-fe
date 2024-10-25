import { createSlice, configureStore } from '@reduxjs/toolkit'

const initialState = { disabledMessageIds: []}

function messageReducer(state = initialState, action) {
  switch (action.type) {
    case 'disableMessage':
      return {
        ...state,
        disabledMessageIds: [...state.disabledMessageIds, action.payload]
      }
    default:
      return state
  }
}

const store = configureStore({ reducer: messageReducer })

export { store }

import { writable } from 'svelte/store'

function isAgent(nick) {
  return nick.startsWith('agent:')
}

function isTrigger(nick) {
  return nick.startsWith('agent:trigger')
}

function chatStore() {
  const { subscribe, update } = writable({
    connection: 'closed',
    account_status: 'offline',
    departments: {},
    visitor: {},
    agents: {},
    chats: {},
    last_timestamp: 0,
    last_rating_request_timestamp: 0,
    has_rating: false,
    is_chatting: false,
  })

  function dispatch({ type, payload }) {
    console.log(`TYPE: ${type}`, { payload })
    switch (type) {
      case 'connection_update':
        return update(state => ({
          ...state,
          connection: payload,
        }))

      case 'account_status':
        return update(state => ({
          ...state,
          account_status: payload,
        }))

      case 'department_update':
        return update(state => ({
          ...state,
          departments: {
            ...state.departments,
            [payload.id]: payload,
          },
        }))

      case 'visitor_update':
        return update(state => ({
          ...state,
          visitor: {
            ...state.visitor,
            ...payload,
          },
        }))

      case 'agent_update':
        return update(state => ({
          ...state,
          agents: {
            ...state.agents,
            [payload.nick]: {
              ...action.detail,
              nick: payload.nick, // To be removed after standardization
              typing: (state.agents[payload.nick] || { typing: false }).typing,
            },
          },
        }))

      case 'chat':
        switch (payload.type) {
          /* Web SDK events */
          case 'chat.memberjoin':
            return update(state => {
              if (isAgent(payload.nick)) {
                if (!state.agents[payload.nick]) {
                  state.agents[payload.nick] = {}
                }
                state.agents[payload.nick].nick = payload.nick
              } else {
                state.visitor.nick = payload.nick
              }

              if (!isAgent(payload.nick)) {
                state.is_chatting = true
              }

              // Concat this event to chats to be displayed
              state.chats = state.chats.concat({
                [payload.timestamp]: {
                  ...payload,
                },
              })

              return {
                ...state,
                chats: { ...state.chats, [payload.timestamp]: payload },
              }
            })

          case 'chat.memberleave':
            return update(state => {
              if (!isAgent(payload.nick)) {
                state.is_chatting = false
              }

              return {
                ...state,
                chats: { ...state.chats, [payload.timestamp]: payload },
              }
            })

          case 'chat.queue_position':
            return update(state => ({
              ...state,
              queue_position: payload.queue_position,
            }))

          case 'chat.request.rating':
            return update(state => {
              return {
                ...state,
                chats: { ...state.chats, [payload.timestamp]: payload },
                last_rating_request_timestamp: payload.timestamp,
              }
            })

          case 'chat.rating':
            return update(state => {
              return {
                ...state,
                chats: { ...state.chats, [payload.timestamp]: payload },
                has_rating: payload.new_rating ? true : false,
              }
            })
          case 'chat.file':
          case 'chat.msg':
            // Ensure that triggers are uniquely identified by their display names
            return update(state => {
              if (isTrigger(payload.nick)) {
                payload.nick = `agent:trigger:${payload.display_name}`
              }

              return {
                ...state,
                chats: {
                  ...state.chats,
                  [payload.timestamp]: {
                    ...payload,
                    member_type: isAgent(payload.nick) ? 'agent' : 'visitor',
                  },
                },
              }
            })
          case 'typing':
            update(state => {
              let agent = state.agents[payload.nick]
              // Ensure that triggers are uniquely identified by their display names
              if (isTrigger(payload.nick)) {
                agent = {
                  nick: `agent:trigger:${payload.display_name}`,
                  display_name: payload.display_name,
                }
              }
              return {
                ...state,
                agents: {
                  ...state.agents,
                  [agent.nick]: {
                    ...agent,
                    typing: payload.typing,
                  },
                },
              }
            })
          default:
            break
        }

      default:
        break
    }
  }

  return {
    subscribe,
    dispatch,
  }
}

export const ChatService = chatStore()

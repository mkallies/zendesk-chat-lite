<script>
  import zChat from './zendesk'
  import { onMount } from 'svelte'
  import StatusContainer from './status-container.svelte'
  import MessageList from './message-list.svelte'
  import ChatInput from './chat-input.svelte'
  import { ChatService } from './store.js'

  console.log({ zChat })

  let status = ''
  let accountStatus
  let showContainer = false
  let messageValue = ''

  onMount(() => {
    console.log('the component has mounted')
    zChat.init({
      account_key: 'pQV3emfLo4MQPzEUGhiZ7QvhnRAFMpwC',
    })
  })

  function toggleContainer() {
    console.log('clicked me')
    showContainer = !showContainer
  }

  function handleMessageSubmit() {
    console.log('submit!', messageValue)

    messageValue = ''
  }

  const events = [
    'account_status',
    'connection_update',
    'department_update',
    'visitor_update',
    'agent_update',
    'chat',
    'error',
  ]

  events.forEach(evt => {
    zChat.on(evt, data => {
      ChatService.dispatch({
        type: evt,
        payload: data,
      })
    })
  })

  console.log($ChatService)
</script>

<style>
  .container {
    background: red;
  }

  .chat-container {
    opacity: 0;
  }

  .chat-btn {
    opacity: 0;
  }

  .is-visible {
    opacity: 1;
  }
</style>

<div class="container">
  <div class="chat-container" class:is-visible={showContainer}>
    <StatusContainer
      status={$ChatService.account_status}
      on:click={toggleContainer} />

    <MessageList />

    <ChatInput on:submit={handleMessageSubmit} bind:value={messageValue} />
  </div>

  <button
    class="chat-btn"
    class:is-visible={!showContainer}
    on:click={toggleContainer}>
    Chat
  </button>

</div>

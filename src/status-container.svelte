<script>
  export let status

</script>

<style>
	.status-container {
    display: flex;
    background: darkgray;
    align-items: center;
  }
</style>


<div class='status-container'>
  <div>
    {#if status === 'online'}
      We're Online
    {:else if status === 'offline'}
      Leave us a message
    {:else if status === 'away'}
      We're away
    {:else}
      Connecting...
    {/if}
  </div>

  <button on:click>
    X
  </button>
</div>




<script>
  import { ChatService } from './store.js'
</script>

<style>
  .message-container {
    background: darkslategrey;
  }
</style>

<div class="message-container">
  {console.log('test', $ChatService)}
  {#if $ChatService.queue_position}
    <span>Queue position: {$ChatService.queue_position}</span>
  {/if}
</div>

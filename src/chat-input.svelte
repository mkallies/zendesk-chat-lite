<script>
	import { createEventDispatcher } from 'svelte';

  export let value = ''

  const dispatch = createEventDispatcher()

</script>

<style>
	input {
    background: red;
  }
</style>


<form on:submit|preventDefault>
  <input placeholder="Enter message here" bind:value />
  <button type='submit'>
    Submit
  </button>
</form>


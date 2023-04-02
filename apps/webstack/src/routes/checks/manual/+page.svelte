<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div id="start">
    <div>
      <h1>Manual verification required</h1>
      <p>Please post a message with a screenshot of this page in #verification-requests.</p>
      <p>Reason: { data.reason }</p>
    </div>
  </div>

<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div id="start">
    <div>
      <h1>Manual verification required</h1>
      <p>Please ping the @Moderators role in the verification channel with a screenshot of this page.</p>
      <p>Reason: { data.reason }</p>
    </div>
  </div>
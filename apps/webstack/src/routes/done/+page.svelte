<script lang="ts">
	import type { ITournamentConfig } from "config";
	import type { PageData } from './$types';

	export let data: PageData;
	export let config: ITournamentConfig = data.config;
</script>


<div class="start">
	<div>
		<h1>Welcome to {config.name}</h1>
	</div>
	<div>
		<p>Your account is now verified. Welcome to the server!</p>
		<p>You can now close this browser tab.</p>
	</div>
</div>
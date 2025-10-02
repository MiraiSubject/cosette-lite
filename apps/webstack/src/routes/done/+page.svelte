<script lang="ts">
	import type { ITournamentConfig } from "config";
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
		config?: ITournamentConfig;
	}

	let { data, config = data.config }: Props = $props();
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
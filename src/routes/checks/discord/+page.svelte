<script lang="ts">
	import type { ITournamentConfig } from '$lib/config.interface';
	import type { PageData } from './$types';

	export let data: PageData;
	export let config: ITournamentConfig = data.config;
</script>

<div class="start">
	<div class="user-info">
		<p class="right-align">
			Currently verifying {data.username || ''} ({data.osuId || ''}). <a href="/logout"><strong>Log out?</strong></a>
		</p>
	</div>
	<div>
		<h1>Connect your Discord account</h1>
	</div>
	<div>
		<p>In this last step, we will need some information about your discord account.</p>
		<p>This information will be used to:</p>
		<ul>
			<li>Join your account to the server, if you haven't yet.</li>
			<li>Change the nickname on the discord server to your osu! username.</li>
			<li>Add the following roles to your account on the server:</li>
		</ul>
		<ul>
			{#each config.discord.roles as role}
				<li>{role.name}</li>
			{/each}
		</ul>
		<p>
			<strong
				>Make sure you're on the correct Discord account before accepting the prompt on their side.</strong
			>
		</p>
	</div>
	<a href="/auth/discord" class="flex button discord"> Log in with Discord! </a>
</div>

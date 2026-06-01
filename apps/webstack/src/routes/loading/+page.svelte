<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let errorMessage: string = '';

	onMount(async () => {
		await new Promise((r) => setTimeout(r, 450));
		try {
			const res = await fetch('/api/discord/setup', {
				method: 'POST'
			});
			if (res.ok) {
				const data = await res.json();
				if (data.result === 'success') {
					await new Promise((r) => setTimeout(r, 350));
					goto('/done');
					return;
				}
				if (data.result === 'full') {
					errorMessage =
						'You have joined the maximum number of servers. Please leave one and try again.';
					return;
				}
				errorMessage = data.message || 'An unknown error occurred. Please try again.';
				return;
			}
			errorMessage = 'Unable to contact the server. Please refresh this page.';
		} catch {
			errorMessage = 'Network error. Please check your connection and try again.';
		}
	});
</script>

<div class="start">
	<div class="text-centered">
		<div class="spinner"></div>
		<h1>Finishing up your Discord setup…</h1>
		<p>Please wait while we set up your roles and join you to the server.</p>
		{#if errorMessage}
			<p style="color:#FF4C4C; font-weight:bold;">{errorMessage}</p>
		{/if}
	</div>
</div>

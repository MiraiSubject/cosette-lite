<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="start">
	<div class="user-info">
		<p class="right-align">
			Currently verifying {data.osuUsername || ''} ({data.osuId || ''}).
			<a href="/logout"><strong>Log out?</strong></a>
		</p>
	</div>
	<div>
		<h1>Connect your Reddit account</h1>
	</div>
	<div>
		<p>In this step, we will need some information about your Reddit account.</p>
		<p>This information will be used to:</p>
		<ul>
			<li>Make sure your Reddit account was made before this year's event began.</li>
			<li>Change the nickname on the Discord server to your Reddit username.</li>
		</ul>
		<p>
			<strong
				>Make sure you're on the correct Reddit account before accepting the prompt on their side.</strong
			>
		</p>
	</div>
	<a href="/auth/reddit" class="flex button reddit"> Log in with Reddit! </a>
</div>

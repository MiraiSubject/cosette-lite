<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
</script>

<div class="start">
	<div>
		<h1>Welcome to {data.name} verification.</h1>
	</div>
	<div>
		<p>First we need to verify your account!</p>
		<p>
			You will be asked to login with your osu! account first, and then with your Discord account.
		</p>
		<p>Your osu! account information will be used to:</p>
		<ul>
			<li>Verify that you own this account, to prevent impersonation of others</li>
			<li>Attach your osu! username as a nickname in the discord server</li>
		</ul>
		<p>Your Discord account information will be used to:</p>
		<ul>
			<li>Join your account to the server, if you haven't yet</li>
			<li>Change the nickname on the discord server to your osu! username</li>
			<li>Add role(s) to your user on the server on behalf of the host.</li>
		</ul>
	</div>
	<div>
		<p>
			This web site is not endorsed by, directly affiliated with, maintained, authorized, or
			sponsored by osu!, ppy, or Discord. All product and company names are the registered
			trademarks of their original owners.
		</p>
		<p>This is an <strong>unofficial</strong> server.</p>
		<p>By proceeding you will agree to the <strong>functional</strong> use of cookies.</p>
	</div>
	<a href="/auth/osu" class="flex button osu"> Log in with osu! </a>
	<!-- <p v-if="error !== ''" style="color:#FF4C4C; font-weight:bold; font-size: 1.2rem">{{error}}</p> -->
</div>

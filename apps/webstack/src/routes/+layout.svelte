<script lang="ts">
	import '../main.css';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	if (typeof window !== 'undefined' && import.meta.env.PROD) {
		const flagKey = '__withTimestamp';
		const c = console as any;
		if (!c[flagKey]) {
			c[flagKey] = true;
			const methodNames = ['log', 'info', 'warn', 'error', 'debug'] as const;
		}
	}
</script>

<div class="start">
	<div class="grid-container container">
		<div class="flex center-align row">
			{@render children?.()}
		</div>
	</div>
</div>

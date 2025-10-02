<script lang="ts">
	import '../main.css';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="start">
	<div class="grid-container container">
		<div class="flex center-align row">
			{@render children?.()}
		</div>
	</div>
</div>

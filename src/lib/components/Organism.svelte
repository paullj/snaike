<script lang="typescript">
  import { Organism, NodeType} from '$lib/neat';
  import Network from '$lib/components/Network.svelte';

  export let organism: Organism;
  
  let inputs: number[] = [];
  let outputs: number[] = [];
  
  // Won't reactivly update when the inputs change
  const checkInputs = (i) =>{
    if(i !== inputs.length)
      inputs = Array.from({ length: i }, () => 0)
    };

  $: checkInputs(organism.inputCount);

  $: if(outputs.length !== organism.outputCount) {
    outputs = Array.from({ length: organism.outputCount }, () => 0);
  }

  $: nodes = organism?.nodes.map(({id, type, activationType})=> ({
    id,
    group: type,
    activationType,
    y: type === NodeType.Hidden ? undefined : (type === NodeType.Output ? 0 : 500)
  }));

  $: links = organism?.connections.map(({from, to, enabled, weight})=> ({
    source: from.id,
    target: to.id,
    enabled,
    weight
  }))
  
</script>

{#if organism}
  <div class="p-1">  
    <div class="border">
      <Network graph={{nodes, links}}></Network>
    </div>
        {#each inputs as i}
    <div>
      <input type="range" bind:value={i} step=".1" min="-1" max="1" />
      <span class="mx-2 font-mono">
        {i}
      </span>
    </div>
    {/each}
    <div class="py-1">
      <button class="px-2 py-1 bg-gray-200 rounded"
      on:click={() => {
        outputs = organism.activate(inputs);
      }}>Activate</button>
      <span class="mx-2 font-mono">
        {outputs.map(x => x.toFixed(2)).join(", ")}
      </span>
    </div>
  </div>
{/if}
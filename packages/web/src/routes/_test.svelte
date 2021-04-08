<script lang="typescript">
  import { onMount } from "svelte";
  import { Node, NodeType, Connection, Organism } from "@snaike/neat";
  
  import Network from '$lib/components/Network.svelte';

  const n = [
    new Node(NodeType.Input, 'i1'),
    new Node(NodeType.Input, 'i2'),
    new Node(NodeType.Bias, 'b1'),
    new Node(NodeType.Output, 'o1'),
  ];
  
  const c = [
    new Connection(n[0], n[3]),
    new Connection(n[1], n[3]),
    new Connection(n[2], n[3]),

  ];

  let organism: Organism;
  
  onMount(() => {
    organism = new Organism(n, c);
  })

  let inputs: number[] = [0, 0];
  let outputs: number[] = [];

  $: nodes = organism?.nodes.map(({id, type})=> ({
    id,
    group: type,
    y: type === NodeType.Hidden ? 100 : (type === NodeType.Output ? 0 : 200)
  }));
  $: links = organism?.connections.map(({from, to, enabled, weight})=> ({
    source: from.id,
    target: to.id,
    enabled,
    weight
    // strength: enabled ? undefined : 0
  }))
</script>

{#if organism}
  <div class="p-5">
    <div class="py-1">

    <button class="px-2 py-1 bg-gray-200 rounded"
      on:click={() =>{
        organism.mutateAddConnection();
        organism.generateNetwork()
        organism = organism;
      }
      }>
      Add connection</button>
    <button class="px-2 py-1 bg-gray-200 rounded"
      on:click={() => {
        organism.mutateAddNode();
        organism.generateNetwork()
        organism = organism;
      }}>Add node</button>
    <button class="px-2 py-1 bg-gray-200 rounded"
      on:click={() => {
        organism.mutateConnectionsWeights();
        organism.generateNetwork()
        organism = organism;
      }}>Mutate weight</button>
    <button class="px-2 py-1 bg-gray-200 rounded"
      on:click={() => {
        organism.mutateSetConnection();
        organism.generateNetwork()
        organism = organism;
      }}>Toggle connection</button>
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
      on:click={() => outputs = organism.activate(inputs)}>Activate</button>
      <span class="mx-2 font-mono">
        {outputs.map(x => x.toFixed(2)).join(", ")}
      </span>
    </div>
    
    <div class="border">
      <Network graph={{nodes, links}}></Network>
    </div>
<!--<div class="flex">
      <div class="mx-4">
        <ul class="font-mono list-disc list-inside">
          {#each organism.nodes as node}
            <li>
              {node.id.slice(0, 4)}
            </li>
          {/each}
        </ul>
        <ul class="mt-4 font-mono list-disc list-inside" >
          {#each organism.connections as connection}
            <li class:line-through={!connection.enabled}>
              {connection.from.id.slice(0, 4)} to {connection.to.id.slice(0, 4)} 
              <span class="text-gray-400">
                ({connection.weight.toFixed(2)})
              </span>
            </li>
          {/each}
        </ul>
      </div>
    </div> -->
  </div>
{/if}
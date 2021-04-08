<script lang="ts">
  import { onMount } from "svelte";
  import type { FitnessFunction, Organism } from "@snaike/neat";
  import { Population, Node, NodeType, Connection } from "@snaike/neat";
  import OrganismComp from "$lib/components/OrganismVis.svelte";

  let population: Population;
  let best: Organism;
  const xorData: Array<[[number, number], number]> = [
    [[0, 0], 0],
    [[0, 1], 1],
    [[1, 1], 0],
    [[1, 0], 1],
  ];

  const fitnessCallback: FitnessFunction = (organism) => {
    let fitness = 4;
    xorData.sort(() => Math.random() - 0.5);

    xorData.forEach(([inputs, expected]) => {
      const [output] = organism.activate(inputs);
      fitness -= Math.abs(output - expected);
    });
    return fitness ** 2;
  };
  onMount(() => {
    const initialNodes = [
      new Node(NodeType.Input, "IN1"),
      new Node(NodeType.Input, "IN2"),
      // new Node(NodeType.Input, "BI0"),
      new Node(NodeType.Output, "OUT"),
    ];
    const initialConnections = [
      new Connection(initialNodes[0], initialNodes[2]),
      new Connection(initialNodes[1], initialNodes[2]),
      // new Connection(initialNodes[2], initialNodes[3]),
    ];
    population = new Population(
        initialNodes,
        initialConnections,
    );
  });
</script>

{#if population}
  <button class="p-2 bg-blue-300 rounded-md"
    on:click={() => {
      best = population.run(15.8,fitnessCallback, 200);
    }}>Run</button>
    
    {#if best}
        <OrganismComp organism={best}></OrganismComp>
    {/if}
{/if}

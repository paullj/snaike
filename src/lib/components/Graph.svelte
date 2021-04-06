<script lang="ts">
  import { onMount } from "svelte";
  import { NodeType } from "$lib/neat";

  import {
    forceSimulation,
    forceLink,
    forceManyBody,
    forceCenter,
    forceCollide,
  } from "d3-force";

  
  export let nodes = [];
  export let connections = [];
  let svg;
  let width, height;
  const colors = ["red", "magenta", "blue", "green"];
  
  interface Point {
    id?: string,
    type?: number,
    fx?: number,
    fy?: number,
    x?: number,
    y?: number,
  };
  let simulation;

  $: if (simulation) {
    //TODO: Find a way so positions dont get reset ever time the graph changes
    simulation.nodes(nodes);
    simulation.force("link").links(links);
    simulation.restart();
  }
  
  let points = nodes.map(({ id, type }): Point => ({
    id,
    type,
    fx: type !== NodeType.Hidden ? (type === NodeType.Output ? 475 : 25) : undefined
  }));
    
  let links = connections.map(({ enabled, weight, from, to, innovation }) => ({
      enabled,
      weight,
      innovation,
      source: from.id,
      target: to.id,
    }));
  onMount(() => {
    resize();
    simulation = forceSimulation(points)
      .force(
        "link",
        forceLink(links).id((d) => d.id)
      )
      .force("collide", forceCollide(40))
      .force("charge", forceManyBody())
      .force("center", forceCenter(svg.clientWidth / 2, svg.clientHeight / 2))
      .on("tick", simulationUpdate);
  });

  function simulationUpdate() {
    simulation.tick();
    points = [...points];
    links = [...links];
  }

  function resize() {
    ({ width, height } = svg.getBoundingClientRect());
  }
</script>

<svelte:window on:resize={resize} />
<svg bind:this={svg} class="bg-gray-100 w-96">
  {#each points as {x, y, type, id}}
      <circle
        class="node"
        r="7"
        cx={x}
        cy={y}
        fill={colors[type]}>
        <title>{id}</title>
      </circle>
      <text x={x - 15} y={y + 20}>{id.slice(0, 5)}</text>
    {/each}
</svg>
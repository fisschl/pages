<script setup lang="ts">
import { use } from "echarts/core";
import { GridComponent, TitleComponent } from "echarts/components";
import { BarChart } from "echarts/charts";
import { SVGRenderer } from "echarts/renderers";
import { UniversalTransition } from "echarts/features";
import { useEcharts } from "~/composables/echarts";
import type { EChartsOption } from "echarts";

onMounted(() => {
  use([
    TitleComponent,
    GridComponent,
    BarChart,
    SVGRenderer,
    UniversalTransition,
  ]);
});

const { data } = useFetch("/api/chat/chart");

const { container } = useEcharts(
  {
    title: {
      text: "服务总体调用次数统计",
      left: 30,
      top: 20,
    },
    grid: {
      top: 80,
      containLabel: true,
    },
  },
  computed(() => {
    if (!data.value) return {};
    return {
      xAxis: [
        {
          type: "category",
          data: data.value.xAxis,
        },
      ],
      yAxis: [
        {
          type: "value",
        },
      ],
      series: data.value.series.map((series) => ({
        name: series.name,
        type: "bar",
        stack: "Total",
        emphasis: {
          focus: "series",
        },
        data: series.data,
      })),
    } satisfies EChartsOption;
  }),
);
</script>

<template>
  <UContainer class="my-6">
    <div ref="container" style="height: 30rem"></div>
  </UContainer>
</template>

<style module></style>

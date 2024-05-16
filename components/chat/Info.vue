<script setup lang="ts">
import { use } from "echarts/core";
import { TitleComponent, GridComponent } from "echarts/components";
import { LineChart } from "echarts/charts";
import { UniversalTransition } from "echarts/features";
import { SVGRenderer } from "echarts/renderers";
import { useEcharts } from "~/composables/echarts";

use([
  TitleComponent,
  GridComponent,
  LineChart,
  SVGRenderer,
  UniversalTransition,
]);

const { data, refresh } = useFetch("/api/chat/chart", { immediate: false });

const { container } = useEcharts(
  {
    title: {
      text: "服务总体调用次数统计",
      left: 30,
      top: 20,
    },
    grid: {
      top: 80,
    },
  },
  computed(() => ({
    xAxis: [
      {
        type: "category",
        boundaryGap: false,
        data: data.value?.xAxis,
      },
    ],
    yAxis: [
      {
        type: "value",
      },
    ],
    series: data.value?.counts.map((list) => ({
      type: "line",
      stack: "Total",
      areaStyle: {},
      data: list,
    })),
  })),
);
</script>

<template>
  <UPopover>
    <UButton
      color="orange"
      icon="i-tabler-info-octagon"
      variant="soft"
      title="使用统计"
      @click="refresh"
    />
    <template #panel>
      <div ref="container" style="height: 30rem; width: 50rem"></div>
    </template>
  </UPopover>
</template>

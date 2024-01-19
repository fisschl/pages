<script setup lang="ts">
import { useSseStore } from "@/composables/sse";
import { parseISO } from "date-fns";
import type { AnalysisData } from "~/server/api/sse";
import { use, init, type ECharts } from "echarts/core";
import { GridComponent } from "echarts/components";
import { LineChart } from "echarts/charts";
import { UniversalTransition } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";

const times = ref<Date[]>([]);

const length = ref(100);
const checkLength = <T,>(list: T[]) => {
  if (list.length <= length.value) return list;
  return list.slice(list.length - length.value);
};

const GB = (value: number) => {
  return value / 1024 ** 3;
};

const memContainer = ref<HTMLElement>();
const memChart = ref<ECharts>();
const memData = ref<number[]>([]);

const { listen } = useSseStore();
listen("analysis", (data: AnalysisData) => {
  times.value.push(parseISO(data.time));
  times.value = checkLength(times.value);
  memData.value.push(GB(data.mem.used));
  memData.value = checkLength(memData.value);
  memChart.value?.setOption({
    xAxis: {
      data: times.value,
    },
    series: [
      {
        name: "内存",
        data: memData.value,
      },
    ],
  });
});

onMounted(() => {
  use([GridComponent, LineChart, CanvasRenderer, UniversalTransition]);
  memChart.value = init(memContainer.value);
  memChart.value.setOption({
    xAxis: {
      type: "category",
      boundaryGap: false,
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "内存",
        type: "line",
      },
    ],
  });
});
</script>

<template>
  <div>
    <div ref="memContainer" class="h-60"></div>
  </div>
</template>

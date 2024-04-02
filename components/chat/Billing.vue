<script setup lang="ts">
import { BarChart, LineChart } from "echarts/charts";
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from "echarts/components";
import { init, use } from "echarts/core";
import { UniversalTransition } from "echarts/features";
import { SVGRenderer } from "echarts/renderers";
import type { EChartsOption } from "echarts";

const headers = useRequestHeaders(["cookie"]);
const { data } = await useFetch("/api/chat/billing", { headers });

const isOpen = ref(false);
const chartElement = ref<HTMLElement>();

onMounted(() => {
  use([
    TooltipComponent,
    GridComponent,
    LegendComponent,
    BarChart,
    LineChart,
    SVGRenderer,
    UniversalTransition,
  ]);
});

const chart = shallowRef<ReturnType<typeof init>>();
const colorMode = useColorMode();

whenever(chartElement, () => {
  if (chart.value) {
    chart.value.off();
    chart.value.dispose();
  }
  chart.value = init(
    chartElement.value,
    colorMode.value === "dark" ? "dark" : undefined,
  );
  const { list } = data.value!;
  chart.value.setOption({
    tooltip: {
      trigger: "axis",
    },
    legend: {
      top: 20,
    },
    grid: {
      top: 80,
      left: 100,
      right: 100,
    },
    xAxis: [
      {
        type: "category",
        data: list.map((item) => item.date),
        axisLabel: {
          formatter: (value) => value.slice(5),
        },
        axisPointer: {
          type: "shadow",
        },
      },
    ],
    yAxis: [
      {
        type: "value",
        name: "消耗量",
      },
      {
        type: "value",
        name: "剩余量",
      },
    ],
    series: [
      {
        name: "消耗量",
        type: "bar",
        barMaxWidth: 25,
        data: list.map((item) => item.usage),
      },
      {
        name: "剩余量",
        type: "line",
        smooth: true,
        yAxisIndex: 1,
        data: list.map((item) => item.residual),
      },
    ],
  } satisfies EChartsOption);
});

onBeforeUnmount(() => {
  if (!chart.value) return;
  chart.value.off();
  chart.value.dispose();
});

const today_data = computed(() => {
  if (!data.value) return;
  const { usage, residual } = data.value.today;
  return ((usage / residual) * 100).toFixed(2);
});
</script>

<template>
  <div>
    <UButton color="gray" @click="isOpen = true">
      <i> 今日用量 </i>
      <strong class="font-medium"> {{ today_data }}% </strong>
    </UButton>
    <UModal v-if="data" v-model="isOpen" :ui="{ width: $style.modal }">
      <article
        ref="chartElement"
        class="overflow-hidden rounded-lg"
        style="height: 30rem"
      />
    </UModal>
  </div>
</template>

<style module>
.modal {
  max-width: 50rem;
}
</style>

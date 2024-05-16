import type { EChartsOption } from "echarts";
import type { MaybeRefOrGetter } from "vue";
import { init } from "echarts/core";

export type ECharts = ReturnType<typeof init>;

export const useEcharts = (...options: MaybeRefOrGetter<EChartsOption>[]) => {
  const container = ref<HTMLElement>();
  const chart = ref<ECharts>();
  const colorMode = useColorMode();
  watch(container, (element) => {
    if (!element) {
      chart.value?.dispose();
      return (chart.value = undefined);
    }
    chart.value = init(
      element,
      colorMode.value === "dark" ? "dark" : undefined,
    );
    for (const option of options) {
      chart.value?.setOption(toValue(option));
    }
  });
  for (const option of options) {
    watch(
      () => toValue(option),
      (option) => {
        chart.value?.setOption(option);
      },
    );
  }
  onBeforeUnmount(() => {
    chart.value?.dispose();
  });
  return { container, chart };
};

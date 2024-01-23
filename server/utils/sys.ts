import { cpus, freemem, totalmem } from "node:os";

/**
 * user CPU 在用户模式下花费的毫秒数。
 * nice CPU 在良好模式下花费的毫秒数。
 * sys CPU 在系统模式下花费的毫秒数。
 * idle CPU 在空闲模式下花费的毫秒数。
 * irq CPU 在中断请求模式下花费的毫秒数。
 */
export const cpuUseRatio = async () => {
  const c1 = { total: 0, used: 0 };
  cpus().forEach(({ times }) => {
    const used = times.user + times.nice + times.sys + times.irq;
    c1.used += used;
    c1.total += used + times.idle;
  });
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const c2 = { total: 0, used: 0 };
  cpus().forEach(({ times }) => {
    const used = times.user + times.nice + times.sys + times.irq;
    c2.used += used;
    c2.total += used + times.idle;
  });
  return (c2.used - c1.used) / (c2.total - c1.total);
};

export const memUseRatio = () => {
  return (totalmem() - freemem()) / totalmem();
};

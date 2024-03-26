import { type Component, type FunctionalComponent } from "vue";

export interface Column {
  /**
   * 列的英文名
   */
  name: string;
  /**
   * 列的中文名
   */
  title: string;
  /**
   * 列宽
   */
  width: number;

  headerComponent?: Component | FunctionalComponent;

  /**
   * 自定义单元格
   */
  component?: Component | FunctionalComponent;
}

export class Table {
  /**
   * 表格包围元素，同时也是滚动元素
   */
  container: HTMLElement | null | undefined;
  /**
   * 行数据
   */
  rows: Record<string, string>[] = [];
  /**
   * 列数据
   */
  columns: Column[] = [];
  /**
   * 行高
   */
  ITEM_HEIGHT = 35;

  readonly row_style: Record<string, string> = {};

  readonly cell_style: Record<string, Record<string, string>> = {};
}

import * as changeCase from "change-case";

export { changeCase };

export type CaseLabel = keyof typeof changeCase;

export const changeCaseOptions: {
  value: CaseLabel;
  label: string;
}[] = [
  {
    value: "pascalCase",
    label: "PascalCase",
  },
  {
    value: "camelCase",
    label: "camelCase",
  },
  {
    value: "kebabCase",
    label: "kebab-case",
  },
  {
    value: "snakeCase",
    label: "snake_case",
  },
  {
    value: "capitalCase",
    label: "Capital Case",
  },
  {
    value: "constantCase",
    label: "CONSTANT_CASE",
  },
  {
    value: "dotCase",
    label: "dot.case",
  },
  {
    value: "pathCase",
    label: "path/case",
  },
  {
    value: "noCase",
    label: "no case",
  },
];

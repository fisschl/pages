import {
  camelCase,
  capitalCase,
  constantCase,
  dotCase,
  kebabCase,
  noCase,
  pascalCase,
  pathCase,
  snakeCase,
} from "change-case";

export const changeCaseOptions: {
  value: string;
  label: string;
  action: (value: string) => string;
}[] = [
  {
    value: "pascalCase",
    label: "PascalCase",
    action: pascalCase,
  },
  {
    value: "camelCase",
    label: "camelCase",
    action: camelCase,
  },
  {
    value: "kebabCase",
    label: "kebab-case",
    action: kebabCase,
  },
  {
    value: "snakeCase",
    label: "snake_case",
    action: snakeCase,
  },
  {
    value: "capitalCase",
    label: "Capital Case",
    action: capitalCase,
  },
  {
    value: "constantCase",
    label: "CONSTANT_CASE",
    action: constantCase,
  },
  {
    value: "dotCase",
    label: "dot.case",
    action: dotCase,
  },
  {
    value: "pathCase",
    label: "path/case",
    action: pathCase,
  },
  {
    value: "noCase",
    label: "no case",
    action: noCase,
  },
];

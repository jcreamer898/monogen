import path from "path";
import { fileURLToPath } from "url";
import { createMonorepo } from "./index.js";

export default function (plop) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // controller generator
  plop.setGenerator("monorepo", {
    description: "Create a monorepo",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Monorepo name?",
        default: "monorepo-demo",
      },
      {
        type: "input",
        name: "howMany",
        message: "How many packages?",
        default: 50,
      },
      {
        type: "input",
        name: "scope",
        message: "Packege scope? e.g. @foo",
        default: "@foo",
      },
      {
        type: "input",
        name: "kind",
        message: "What kind of monorepo?",
        default: "yarn"
      },
      {
        type: "input",
        name: "outputDirectory",
        message: "Output directory?",
        default: "./monorepo",
      },
    ],
    actions: (answers) => {
      const actions = [];

      answers.cwd = process.cwd();

      actions.push(createMonorepo(plop));

      return actions;
    },
  });
}

import fs from "fs";
import path from "path";
import { humanId } from "human-id";

/**
 * Call cb <count> number of times times
 * @param {number} count
 * @param {*} cb
 * @returns
 */
const times = async function (count, cb) {
  var i = -1;

  while (++i < count) {
    await cb(i);
  }

  return;
};

/**
 * @typedef {Object} Config
 * @property {string} name
 * @property {string} cwd
 * @property {string} outputDirectory
 * @property {string} packageJsonTemplate
 * @property {string} rootPackageJsonTemplate
 * @property {string} srcTemplate
 * @property {number} howMany
 */

const rootPackageJsonTemplates = {
  yarn: "./templates/yarnRootPackageJson.hbs",
  pnpm: "./templates/pnpmRootPackageJson.hbs",
  npm: "./templates/npmRootPackageJson.hbs",
};

const monorepoPackageTemplate = "./templates/package.json.hbs";
const sourceFileTemplate = "./templates/index.ts.hbs";
const pnpmWorkspsaceFile = "./templates/pnpm-workspace.yaml.hbs";

/**
 * @param {Config} config
 */
export const createMonorepo = (plop) => async (config) => {
  const cwd = config.cwd || process.cwd();
  const outputDir = path.join(cwd, config.outputDirectory);

  try {
    await fs.promises.mkdir(path.join(outputDir, "packages"), {
      recursive: true,
    });

    const packageJsonTemplate = rootPackageJsonTemplates[config.kind];    

    const templateContents = await fs.promises.readFile(
      path.resolve(monorepoPackageTemplate)
    );

    const rootPackageJsonTemplate = await fs.promises.readFile(
      path.resolve(packageJsonTemplate)
    );
    const srcIndexContents = await fs.promises.readFile(
      path.resolve(sourceFileTemplate)
    );
    const rootPackageJson = plop.renderString(
      rootPackageJsonTemplate.toString(),
      {
        name: config.name,
      }
    );

    await fs.promises.writeFile(
      path.join(outputDir, "package.json"),
      rootPackageJson
    );

    if (config.kind === "pnpm") {
      const pnpmWorkspaceFile = await fs.promises.readFile(
        path.resolve(pnpmWorkspsaceFile)
      );
      await fs.promises.writeFile(
        path.join(outputDir, "pnpm-workspace.yaml"),
        pnpmWorkspaceFile
      );
    }

    times(config.howMany, async () => {
      const name = humanId({
        separator: "-",
      }).toLowerCase();
      const packagePath = path.join(outputDir, "packages", name);

      const packageJson = plop.renderString(templateContents.toString(), {
        scope: config.scope.replace(/^@/, ""),
        humanId: name,
      });

      await fs.promises.mkdir(path.resolve(packagePath, "src"), {
        recursive: true,
      });
      await fs.promises.writeFile(
        path.join(packagePath, "package.json"),
        packageJson
      );
      await fs.promises.writeFile(
        path.join(packagePath, "src", "index.ts"),
        srcIndexContents
      );
    });
  } catch (e) {
    console.log(e);
  }
};

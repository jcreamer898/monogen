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

/**
 * @param {Config} config
 */
export const createMonorepo = (plop) => async (config) => {
  const cwd = config.cwd || process.cwd();
  const outputDir = path.join(cwd, config.outputDirectory);
  await fs.promises.mkdir(path.join(outputDir, "packages"), {
    recursive: true,
  });

  const templateContents = await fs.promises.readFile(
    path.resolve(config.packageJsonTemplate)
  );
  const rootPackageJsonTemplate = await fs.promises.readFile(
    path.resolve(config.rootPackageJsonTemplate)
  );
  const srcIndexContents = await fs.promises.readFile(
    path.resolve(config.srcTemplate)
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

  times(config.howMany, async () => {
    const name = humanId({
      separator: "-",
    }).toLowerCase();
    const packagePath = path.join(outputDir, "packages", name);

    const packageJson = plop.renderString(templateContents.toString(), {
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
};

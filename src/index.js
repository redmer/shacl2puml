#!/usr/bin/env node
//@ts-check
import { QueryEngine } from "@comunica/query-sparql-file";
import { Store, StreamParser } from "n3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { Constraint } from "./constraints.js";

/**
 * @argument {String} file
 * @returns {Promise<Store>}
 */
async function importIntoStore(file) {
  return new Promise((resolve, reject) => {
    const reader = fs.createReadStream(file);
    const format = { ".ttl": "text/turtle", ".nt": "application/n-triples" }[
      path.extname(file)
    ];
    const parser = new StreamParser({ format });
    const store = new Store();

    const stream = store.import(reader.pipe(parser));
    stream.once("end", () => resolve(store));
    stream.once("error", reject);
  });
}

await yargs(hideBin(process.argv))
  .strict()
  .scriptName("shacl2puml")
  .usage(
    "$0 <file>",
    "parse a SHACL file and output PlantUML",
    (yargs) => {
      return yargs
        .options({
          output: {
            alias: "o",
            describe: "output path",
            default: "out/ecm.puml",
            type: "string",
            normalize: true,
          },
          prefix: {
            alias: "p",
            describe: "prefix:namespace pairs",
            type: "array",
          },
        })
        .positional("file", {
          describe: "the SHACL file that will be parsed",
          type: "string",
          normalize: true,
        });
    },
    async (argv) => {
      const store = await importIntoStore(argv.file);
      const engine = new QueryEngine();

      // We use a Set to cancel out duplicate lines from each property run
      const /** @type {Set<string>} */ lines = new Set();

      const resourcesDir = path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        "..",
        "res",
      );

      for (let fn of ["constraints.rq", "unconstrained-classes.rq"]) {
        fn = path.join(resourcesDir, fn);
        const query = fs.readFileSync(fn, { encoding: "utf-8" });

        let bindingsStream = await engine.queryBindings(query, {
          sources: [store],
        });

        const /** @type {Record<string, string>} */ prefixes = {};

        for (const pfx of argv.prefix) {
          const i0 = pfx.indexOf(":");
          prefixes[pfx.slice(0, i0)] = pfx.slice(i0 + 1);
        }

        for await (const binding of bindingsStream) {
          const info = new Constraint(
            binding.get("classIri").value,
            binding.get("className")?.value,
            binding.get("propertyIri")?.value,
            binding.get("propertyName")?.value,
            binding.get("rangeIri")?.value,
            binding.get("rangeName")?.value,
            binding.get("minCount")?.value,
            binding.get("maxCount")?.value,
            binding.get("superclassIri")?.value,
            binding.get("superclassName")?.value,
          );
          info.bind(prefixes);
          for (const l of info.puml()) lines.add(l);
        }
      }

      const preamble = fs.readFileSync(
        path.join(resourcesDir, "preamble.puml"),
        {
          encoding: "utf-8",
        },
      );

      const sortedLines = [...lines].sort().join("\n");

      fs.writeFileSync(argv.output, preamble + sortedLines, {
        encoding: "utf-8",
      });
    },
  )
  .parse();

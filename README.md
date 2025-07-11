# redmer/shacl2puml

Generate a PlantUML diagram from SHACL constraints.

## Installation and usage

This tool requires NodeJS.

```cli
$ npm install -g @rdmr-eu/shacl2puml
```

```cli
$ shacl2puml --help
shacl2puml <file>

parse a SHACL file and output PlantUML

Positionals:
  file  the SHACL file that will be parsed                              [string]

Options:
      --help     Show help                                             [boolean]
      --version  Show version number                                   [boolean]
  -o, --output   output path                  [string] [default: "out/ecm.puml"]
  -p, --prefix   prefix:namespace pairs                                  [array]
```

## Features and Known limitations

- Generates a PUML diagram from SHACL constraints
- Renders classes and subclasses
- Renders datatype properties as class attributes
- Renders object properties as relationships
- Supports prefix (namespace) compression
- Sorts the resulting diagram for rendering and Git stability.
- Renders both the label and the IRI of the property or class, with a clickable IRI for dereferencing.
- The render output may change between major versions.
- Only English or non-language tagged labels are collected. A PR for an extra CLI options is very much welcome.
- Only TTL and NT extensions are recognized at present.

## License

- The file [`constraints.rq`](./res/constraints.rq) was adapted from [`cognizone/semanticz-shaclviz`](https://github.com/cognizone/semanticz-shaclviz) licensed under the Apache-2.0 license.
- The file [`unconstrained-classes.rq`](./res/unconstrained-classes.rq) was adapted from [`cognizone/semanticz-shaclviz`](https://github.com/cognizone/semanticz-shaclviz) licensed under the Apache-2.0 license.
- Other files: Apache-2.0.

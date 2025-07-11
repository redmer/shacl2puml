import namespace from "@rdfjs/namespace";

const XSD = namespace("http://www.w3.org/2001/XMLSchema#");
const RDF = namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");

/**
 * Make CURIE of an IRI from a list of prefixes.
 * @param {Record<string, string>} dict
 * @param {string} iri
 */
function asCURIE(dict, iri) {
  for (const [alias, namespace] of Object.entries(dict))
    if (iri.startsWith(namespace)) return iri.replace(namespace, `${alias}:`);
  return iri;
}

/** For UML package names per prefix in renderIRI(). Results were unsatisfactory. */
function umlPackageName(dict, iri) {
  for (const [alias, namespace] of Object.entries(dict))
    if (iri.startsWith(namespace)) return `${alias}.`;
  return "";
}

function renderIRI(dict, iri) {
  return `""[[${iri} ${asCURIE(dict, iri)}]]""`;
}

function ID(dict, iri, name) {
  return `id_${name}`;
}

export class Constraint {
  constructor(
    /** @type {String} */ classIri,
    /** @type {String=} */ className,
    /** @type {String=} */ propertyIri,
    /** @type {String=} */ propertyName,
    /** @type {String=} */ rangeIri,
    /** @type {String=} */ rangeName,
    /** @type {Int=} */ minCount,
    /** @type {String=} */ maxCount,
    /** @type {String=} */ superclassIri,
    /** @type {String=} */ superclassName,
  ) {
    this.classIri = classIri;
    this.className = className;
    this.propertyIri = propertyIri;
    this.propertyName = propertyName;
    this.rangeIri = rangeIri;
    this.rangeName = rangeName;
    this.minCount = minCount;
    this.maxCount = maxCount;
    this.superclassIri = superclassIri;
    this.superclassName = superclassName;
    this.prefixes = {};
  }

  /**
   * Bind prefixes with namespaces.
   * @param {Record<string, string>} dict
   */
  bind(dict) {
    this.prefixes = { ...this.prefixes, ...dict };
  }

  /**
   * Determine if this sh:Property should be rendered a field or a Relationship.
   * @param {Stringo} rangeIri IRI of the value
   * @returns {Boolean}
   */
  isField(rangeIri) {
    return [
      undefined,
      RDF.HTML.value,
      RDF.langString.value,
      XSD.anyURI.value,
      XSD.boolean.value,
      XSD.date.value,
      XSD.dateTime.value,
      XSD.decimal.value,
      XSD.double.value,
      XSD.duration.value,
      XSD.enumeration.value,
      XSD.int.value,
      XSD.integer.value,
      XSD.positiveInteger.value,
      XSD.string.value,
    ].includes(rangeIri);
  }

  *puml() {
    yield `class "<b>${this.className}</b>\\n${renderIRI(this.prefixes, this.classIri)}" as ${ID(this.prefixes, this.classIri, this.className)} {}`;
    if (this.superclassIri)
      yield `${ID(this.prefixes, this.classIri, this.className)} -[#SlateGray]-|> ${ID(this.prefixes, this.superclassIri, this.superclassName)} : subclass of >`;

    const cardinality = `[${this.minCount}..${this.maxCount}]`;
    if (this.isField(this.rangeIri) && this.propertyName) {
      yield `${ID(this.prefixes, this.classIri, this.className)} : <#transparent,#transparent>| ${this.propertyName} | ${renderIRI(this.prefixes, this.propertyIri)} | <i>${this.rangeName}</i> | ${cardinality} |`;
    } else if (this.propertyName) {
      yield `${ID(this.prefixes, this.classIri, this.className)} --[#Purple]-> ${ID(this.prefixes, this.rangeIri, this.rangeName)} : ${this.propertyName}\\n${renderIRI(this.prefixes, this.propertyIri)} ${cardinality} >`;
    }
  }
}

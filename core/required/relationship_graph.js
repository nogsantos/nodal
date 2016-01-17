module.exports = (() => {

  'use strict';

  const inflect = require('i')();
  let __id__ = 0;

  class RelationshipPath {

    constructor(path) {
      this.path = path;
    }

    toString() {
      return this.path.join(' <-> ');
    }

    add(node, edge) {
      return new this.constructor([node, edge].concat(this.path));
    }

    getModel() {
      return this.path[0].Model;
    }

    multiple() {
      for (let i = 1; i < this.path.length; i += 2) {
        let edge = this.path[i];
        let node = this.path[i - 1];
        if (edge.hasChild(node) && edge.options.multiple) {
          return true;
        }
      }
      return false;
    }

    joins() {

      let node;
      let i = 0;
      return this.path.slice().reverse().reduce((joins, item) => {

        if (item instanceof RelationshipNode) {
          node = item;
          return joins;
        }

        let edge = item;

        let join = {
          joinTable: edge.opposite(node).Model.table(),
          prevTable: joins[joins.length - 1] ? joins[joins.length - 1].joinAlias : null
        };

        join.joinAlias = `${join.joinTable}_${++i}`;

        if (edge.hasChild(node)) {
          join.prevColumn = edge.options.via;
          join.joinColumn = 'id';
        } else {
          join.prevColumn = 'id';
          join.joinColumn = edge.options.via;
        }

        joins.push(join);

        return joins;

      }, []);

    }

  }

  class RelationshipNode {

    constructor(Graph, Model) {
      this.Graph = Graph;
      this.Model = Model;
      this.edges = [];
    }

    toString() {
      return `[Node: ${this.Model.name}]`;
    }

    joinsTo(Model, options) {

      options = options || {};

      options.multiple = !!options.multiple;
      options.as = options.as || (options.multiple ? `${inflect.pluralize(inflect.camelize(this.Model.name, false))}` : `${inflect.camelize(this.Model.name, false)}`);
      options.name = options.name || `${inflect.camelize(Model.name, false)}`;
      options.via = options.via || `${inflect.underscore(options.name)}_id`;

      let parentNode = this.Graph.of(Model);
      let edge = this.edges.filter(e => e.parent === parentNode && e.options.name === options.name).pop();

      if (!edge) {
        edge = new RelationshipEdge(parentNode, this, options);
      }

      return edge;

    }

    find(name) {

      let queue = this.edges
        .slice()
        .map(edge => {
          return {edge: edge, path: new RelationshipPath([this])}
        });

      let traversed = {};

      while (queue.length) {

        let item = queue[0];
        let curEdge = item.edge;
        let path = item.path;
        let node;

        traversed[curEdge.id] = true;

        let curNode = path.path[0];
        node = curEdge.opposite(curNode);

        if ((curEdge.hasChild(curNode) && curEdge.options.name === name) || curEdge.options.as === name) {
          return path.add(node, curEdge);
        }

        queue = queue.slice(1).concat(
          node.edges
            .filter(edge => !traversed[edge.id])
            .map(edge => {
              return {
                edge: edge,
                path: path.add(node, curEdge)
              };
            })
        );

      }

      return null;

    }

  }

  class RelationshipEdge {

    constructor(parent, child, options) {

      this.id = ++__id__;
      this.parent = parent;
      this.child = child;
      this.options = options;

      parent.edges.push(this);
      child.edges.push(this);

    }

    toString() {
      return `[Edge: ${this.parent.Model.name}, ${this.child.Model.name}]`;
    }

    hasChild(child) {
      return this.child === child;
    }

    hasParent(parent) {
      return this.parent === parent;
    }

    opposite(node) {
      let opposite = this.child === node ? this.parent : (this.parent === node ? this.child : null);
      return opposite;
    }

  }

  class RelationshipGraph {

    constructor() {
      this.nodes = [];
      this.edges = [];
    }

    of(Model) {

      let node = this.nodes.filter(n => n.Model === Model).pop();
      if (!node) {
        node = new RelationshipNode(this, Model);
        this.nodes.push(node);
      }

      return node;

    }

  }

  return RelationshipGraph;

})();
import React, { Component } from 'react';
import { Table } from '@jpmorganchase/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}
class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }
//-->componentDidMount() method runs after the component output has been rendered to the DOM
  componentDidMount() {
    // Get element from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;
//-->modify the schema object as that will dictate how we’ll be able to configure the Perspective table view of our grap
    const schema = {
      // stock: 'string',
      // top_ask_price: 'float',
      // top_bid_price: 'float',
      // timestamp: 'date',

      //-->price abc and def are added to get the ratio and its timestamp
      price_abc: 'float',
      price_def: 'float',
      ratio: 'float',
      timestamp: 'date',
      //->bounds bcz we need to track the moments so when they're crossed we use trigger_alert
      upper_bound: 'float',
      lower_bound: 'float',
      trigger_alert: 'float',
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);
      elem.setAttribute('view', 'y_line');
     // elem.setAttribute('column-pivots', '["stock"]');
      elem.setAttribute('row-pivots', '["timestamp"]');
      elem.setAttribute('columns', '["ratio", "lowerbound", "upper_bound", "trigger_alert"]');
      elem.setAttribute('aggregates', JSON.stringify({
        // stock: 'distinctcount',
        // top_ask_price: 'avg',
        // top_bid_price: 'avg',
        // timestamp: 'distinct count',
        price_abc: 'avg',
        price_def: 'avg',
        ratio: 'avg',
        timestamp: 'distinct count',
        //->bounds bcz we need to track the moments so when they're crossed we use trigger_alert
        upper_bound: 'avg',
        lower_bound: 'avg',
        trigger_alert: 'avg',
      }));
    }
  }

  componentDidUpdate() {
    if (this.table) {
      this.table.update([
        DataManipulator.generateRow(this.props.data),
      ]);
    }
  }
}

export default Graph;

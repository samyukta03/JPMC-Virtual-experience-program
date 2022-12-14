import React, { Component } from 'react';
import { Table } from '@jpmorganchase/perspective';
import { ServerRespond } from './DataStreamer';
import './Graph.css';

/**
 * Props declaration for <Graph />
 */
interface IProps {
  data: ServerRespond[],
}

/**
 * Perspective library adds load to HTMLElement prototype.
 * This interface acts as a wrapper for Typescript compiler.
 */
interface PerspectiveViewerElement extends HTMLElement  { //enable the `PerspectiveViewerElement` to behave like an HTML element
  load: (table: Table) => void,
}

/**
 * React component that renders Perspective based on data
 * parsed from its parent through data property.
 */
class Graph extends Component<IProps, {}> {
  // Perspective table
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element to attach the table from the DOM.
    //const elem: PerspectiveViewerElement = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement; 

    const schema = {
      stock: 'string',
      top_ask_price: 'float',
      top_bid_price: 'float',
      timestamp: 'date',
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.

    
      elem.load(this.table);
        // Add more Perspective configurations here.
        elem.setAttribute('view', 'y_line'); //-- ‘view’ is the the kind of graph we wanted to visualize the data as - e grid type.
        elem.setAttribute('column-pivots', '["stock"]'); //‘column-pivots’ is what will allow us to distinguish stock 1 with 2 
        elem.setAttribute('row-pivots', '["timestamp"]'); //row-pivots’ takes care of our x-axis. This allows us to map each datapoint based on the timestamp it has
        elem.setAttribute('columns','["top_ask_price"]'); //‘columns’ is what will allow us to only focus on a particular part of a stock’s data along the y-axis
        elem.setAttribute('aggregates', `
        {"stock": "discount count",
        "top_ask_price":"avg",
        "top_bid_price": "avg",
        "timestamp":"distinct count"}`)
   /*aggregates’ is what will allow us to handle the duplicated data we observed earlier and consolidate them as just one data point.
    In our case we only want to consider a data point unique if it has a unique stock name and timestamp.
Otherwise, if there are duplicates like what we had before, we will average out the top_bid_prices and the top_ask_prices of these ‘similar’ datapoints before treating them as one
    */
      }
  }

  componentDidUpdate() {
    // Everytime the data props is updated, insert the data into Perspective table
    if (this.table) {
      // As part of the task, you need to fix the way we update the data props to
      // avoid inserting duplicated entries into Perspective table again.
      this.table.update(this.props.data.map((el: any) => {
        // Format the data from ServerRespond to the schema
        return {
          stock: el.stock,
          top_ask_price: el.top_ask && el.top_ask.price || 0,
          top_bid_price: el.top_bid && el.top_bid.price || 0,
          timestamp: el.timestamp,
        };
      }));
    }
  }
}

export default Graph;

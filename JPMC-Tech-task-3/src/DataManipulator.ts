import { ServerRespond } from './DataStreamer';
/*-->his task, we have to make some modifications in
the DataManipulator.ts file. This file will be responsible for processing the raw
stock data we’ve received from the server before it throws it back to the Graph
component’s table to render */
export interface Row {
  /*stock: string,
   top_ask_price: number,
   timestamp: Date,*/

  //-->price abc and def are added to get the ratio and its timestamp
  price_abc: number,
  price_def: number,
  ratio: number,
  timestamp: Date,
  //->bounds bcz we need to track the moments so when they're crossed we use trigger_alert
  upper_bound: number,
  lower_bound: number,
  trigger_alert: number | undefined ,
}


export class DataManipulator {
  static generateRow(serverResponds: ServerRespond[]): Row {
    //-> serverRespond as an array where in the first element (0-index) is about stock ABC and the second element (1-index) is about stock DEF
   const ABCprice = (serverResponds[0].top_ask.price + serverResponds[0].top_bid.price)/2;
   const DEFprice = (serverResponds[1].top_ask.price + serverResponds[1].top_bid.price)/2;
   const ratio = ABCprice / DEFprice;
   //-> how we will be able to maintain them as steady upper and lower lines in the graph
   const ubound = 1+0.20;
   const lbound = 1-0.20;
   //->e return value is changed from an array of Row objects to just a single Row object
      return {
        price_abc: ABCprice,
        price_def: DEFprice,
        ratio,
        timestamp: serverResponds[0].timestamp > serverResponds[1].timestamp ? serverResponds[0].timestamp : serverResponds[1].timestamp,
        upper_bound: ubound,
        lower_bound: lbound,
        trigger_alert: (ratio > ubound || ratio < lbound) ? ratio : undefined,
      };
  }
}

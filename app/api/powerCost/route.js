// app/api/route.js
import { BigQuery } from '@google-cloud/bigquery';

const bigQuery = new BigQuery();

export async function GET(request) {
  try {
    // Query to fetch data from BigQuery
    const query = `SELECT * FROM \`bit15-ev-decision-support.EV_Dataset.PowerRate\``;
    const options = {
      query: query,
      location: 'asia-southeast1', // เปลี่ยนเป็น asia-southeast1
    };

    // Execute query
    const [rows] = await bigQuery.query(options);

    // Return the result as JSON
    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (error) {
    console.error('BigQuery error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch data from BigQuery' }), { status: 500 });
  }
}

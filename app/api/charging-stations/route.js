// app/api/charging-stations/route.js
import { NextResponse } from 'next/server';
import { BigQuery } from '@google-cloud/bigquery';

export async function GET(request) {
  try {
    const bigquery = new BigQuery({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      projectId: 'bit15-ev-decision-support', // เปลี่ยนเป็นโปรเจ็กต์ของคุณ
    });

    const query = `
      SELECT 
        ID,
        Name,
        Address,
        Subdistrict,
        District,
        Province,
        Latitude,
        Longitude,
        \`25kW\` AS power25,
        \`50kW\` AS power50,
        \`120kW\` AS power120,
        \`300kW\` AS power300,
        \`360kW\` AS power360,
        \`AC Type 2\` AS acType2,
        CCS2,
        CHAdeMO
      FROM \`bit15-ev-decision-support.EV_Dataset.PEA_VOLTA\`
    `;

    const options = {
      query: query,
      location: 'asia-southeast1',
    };

    const [job] = await bigquery.createQueryJob(options);
    console.log(`Job ${job.id} started.`);

    const [rows] = await job.getQueryResults();
    console.log(`Job ${job.id} completed with ${rows.length} records.`);

    return NextResponse.json(rows);
  } catch (error) {
    console.error('BigQuery Error:', error);
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลจาก BigQuery ได้' }, { status: 500 });
  }
}
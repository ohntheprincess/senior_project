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
            Model.Model_ID,
            Model.Brand,
            Model.Model,
            Model.Battery,
            Model.Real_Range,
            Model.Range,
            Model.Accelarate,
            Model.Top_Speed,
            Model.Efficiency,
            Model.Fastcharge,
            Model.Towing_capacity,
            Model.Seats,
            Model.Estimated_THB_Value,
            Model.Drive_Configuration,
            Model.Tow_Hitch,
            Model.Segment,
            Model.EV_Image_URL,
            Model.Website,
            COUNT(UserProfiles.selected_model) AS count
      FROM \`bit15-ev-decision-support.EV_Dataset.UserProfiles\` 
      AS UserProfiles
        INNER JOIN
        \`bit15-ev-decision-support.EV_Dataset.Model\`  AS MODEL
        ON
        UserProfiles.selected_model = Model.Model
        GROUP BY
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18
        ORDER BY
        count DESC
        LIMIT
        3
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
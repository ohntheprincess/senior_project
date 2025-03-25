import { BigQuery } from "@google-cloud/bigquery"
import { NextResponse } from "next/server"

// Modify the GET function to support query parameters for filtering on the server side
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const province = searchParams.get("province")
    const district = searchParams.get("district")
    const subdistrict = searchParams.get("subdistrict")
    const connectionType = searchParams.get("connectionType")
    const power = searchParams.get("power")
    const distributor = searchParams.get("distributor")

    const bigquery = new BigQuery({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      projectId: "bit15-ev-decision-support",
    })

    // Build WHERE clause based on filters
    let whereClause = ""
    const conditions = []

    if (province) conditions.push(`Province = '${province}'`)
    if (district) conditions.push(`District = '${district}'`)
    if (subdistrict) conditions.push(`Subdistrict = '${subdistrict}'`)
    if (distributor) conditions.push(`Distributor = '${distributor}'`)

    // Handle connection type filter
    if (connectionType) {
      if (connectionType === "AC Type 2") {
        conditions.push(`\`AC Type 2\` > 0`)
      } else if (connectionType === "CCS2") {
        conditions.push(`CCS2 > 0`)
      } else if (connectionType === "CHAdeMO") {
        conditions.push(`CHAdeMO > 0`)
      }
    }

    // Handle power filter
    if (power) {
      const powerValue = power.replace("kW", "")
      conditions.push(`\`${powerValue}kW\` > 0`)
    }

    if (conditions.length > 0) {
      whereClause = `WHERE ${conditions.join(" AND ")}`
    }

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
        CHAdeMO,
        Distributor,
        logo_url
      FROM \`bit15-ev-decision-support.EV_Dataset.ChargingStation\`
      ${whereClause}
      LIMIT 1000
    `

    const options = {
      query: query,
      location: "asia-southeast1",
    }

    const [job] = await bigquery.createQueryJob(options)
    console.log(`Job ${job.id} started.`)

    const [rows] = await job.getQueryResults()
    console.log(`Job ${job.id} completed with ${rows.length} records.`)

    return NextResponse.json(rows)
  } catch (error) {
    console.error("BigQuery Error:", error)
    return NextResponse.json({ error: "ไม่สามารถดึงข้อมูลจาก BigQuery ได้" }, { status: 500 })
  }
}


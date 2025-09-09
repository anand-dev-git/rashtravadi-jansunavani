import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getEnglishProblem } from "@/lib/translation-dictionary";

export async function GET(request: NextRequest) {
  try {
    // Get user from headers (set by middleware if available)
    const username = request.headers.get("x-username");

    // For now, we'll use dbuser01 as specified in the requirements
    // In a real application, you'd validate the user and their permissions
    const targetUsername = "dbuser01";

    // Get total tickets count
    const [totalResult] = await query<{ count: number }>(
      "SELECT COUNT(*) as count FROM complaint_records"
    );
    const totalTickets = totalResult[0]?.count || 0;

    // Get status counts
    const [statusResult] = await query<{ status: string; count: number }>(
      `SELECT 
        COALESCE(status, 'No Status') as status, 
        COUNT(*) as count 
       FROM complaint_records 
       GROUP BY status 
       ORDER BY count DESC`
    );

    const statusCounts: { [key: string]: number } = {};
    statusResult.forEach((row) => {
      statusCounts[row.status] = row.count;
    });

    // Get age group counts with proper categorization
    const [ageResult] = await query<{ age: string; count: number }>(
      `SELECT 
        COALESCE(age, 'No Age') as age, 
        COUNT(*) as count 
       FROM complaint_records 
       GROUP BY age 
       ORDER BY count DESC`
    );

    // Categorize age groups properly
    const ageCounts: { [key: string]: number } = {
      "18-25": 0,
      "26-35": 0,
      "36-50": 0,
      "51-65": 0,
      "65+": 0,
      Other: 0,
    };

    ageResult.forEach((row) => {
      const age = row.age;
      const count = row.count;

      if (age === "18-25" || age === "१८–२५") {
        ageCounts["18-25"] += count;
      } else if (age === "26-35" || age === "२६–३५") {
        ageCounts["26-35"] += count;
      } else if (age === "36-50" || age === "३६–५०") {
        ageCounts["36-50"] += count;
      } else if (age === "51-65") {
        ageCounts["51-65"] += count;
      } else if (age === "65+" || age === "६५+") {
        ageCounts["65+"] += count;
      } else if (age !== "No Age") {
        ageCounts["Other"] += count;
      }
    });

    // Get department counts
    const [deptResult] = await query<{ problem: string; count: number }>(
      `SELECT 
        COALESCE(problem, 'No Department') as problem, 
        COUNT(*) as count 
       FROM complaint_records 
       GROUP BY problem 
       ORDER BY count DESC`
    );

    const departmentCounts: { [key: string]: number } = {};
    deptResult.forEach((row) => {
      // Convert problem to English version using translation dictionary
      const englishProblem = getEnglishProblem(row.problem);
      departmentCounts[englishProblem] =
        (departmentCounts[englishProblem] || 0) + row.count;
    });

    // Get additional statistics
    const [recentTickets] = await query<{ count: number }>(
      `SELECT COUNT(*) as count 
       FROM complaint_records 
       WHERE createdDate >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
    );

    const [resolvedTickets] = await query<{ count: number }>(
      `SELECT COUNT(*) as count 
       FROM complaint_records 
       WHERE status IN ('Problem Solved', 'Closed')`
    );

    const stats = {
      totalTickets,
      statusCounts,
      ageCounts,
      departmentCounts,
      recentTickets: recentTickets[0]?.count || 0,
      resolvedTickets: resolvedTickets[0]?.count || 0,
      resolutionRate:
        totalTickets > 0
          ? (((resolvedTickets[0]?.count || 0) / totalTickets) * 100).toFixed(1)
          : "0.0",
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

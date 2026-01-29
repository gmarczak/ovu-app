"use client";

import { jsPDF } from "jspdf";
import type { PeriodLog } from "../../types/feed";
import { Button } from "../ui/Button";

interface PDFReportProps {
    logs: PeriodLog[];
    cycleLength: number;
    periodLength: number;
    lastPeriodStart: string | null;
    userName?: string;
}

export function PDFReportGenerator({
    logs,
    cycleLength,
    periodLength,
    lastPeriodStart,
    userName = "Patient",
}: PDFReportProps) {
    const generatePDF = () => {
        const doc = new jsPDF();

        // Get last 3 months of data
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const recentLogs = logs.filter((log) => {
            const logDate = new Date(log.date + "T00:00:00");
            return logDate >= threeMonthsAgo;
        });

        // Title
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text("Period Tracker Medical Report", 105, 20, { align: "center" });

        // Patient Info
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`Patient: ${userName}`, 20, 40);
        doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 20, 48);
        doc.text(`Report Period: Last 3 Months`, 20, 56);

        // Section: Cycle Information
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Cycle Information", 20, 70);

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text(`Average Cycle Length: ${cycleLength} days`, 20, 80);
        doc.text(`Average Period Duration: ${periodLength} days`, 20, 88);
        doc.text(
            `Last Period Start: ${lastPeriodStart ? new Date(lastPeriodStart + "T00:00:00").toLocaleDateString() : "N/A"}`,
            20,
            96
        );

        // Section: Symptom Summary
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Symptom Summary", 20, 110);

        const symptomCounts: Record<string, number> = {};
        recentLogs.forEach((log) => {
            if (log.symptoms) {
                log.symptoms.forEach((symptom) => {
                    symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
                });
            }
        });

        const topSymptoms = Object.entries(symptomCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        let yPos = 120;
        if (topSymptoms.length > 0) {
            topSymptoms.forEach(([symptom, count]) => {
                doc.text(
                    `• ${symptom.replace(/([A-Z])/g, " $1").trim()}: ${count} occurrences`,
                    25,
                    yPos
                );
                yPos += 8;
            });
        } else {
            doc.text("No symptoms logged during this period.", 25, yPos);
            yPos += 8;
        }

        // Section: Mood Analysis
        yPos += 5;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Mood Analysis", 20, yPos);

        yPos += 10;
        const moodCounts = { good: 0, neutral: 0, bad: 0 };
        recentLogs.forEach((log) => {
            if (log.mood) {
                moodCounts[log.mood]++;
            }
        });

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text(`• Good: ${moodCounts.good} days`, 25, yPos);
        doc.text(`• Neutral: ${moodCounts.neutral} days`, 25, yPos + 8);
        doc.text(`• Bad: ${moodCounts.bad} days`, 25, yPos + 16);

        // Section: Recent Entries
        yPos += 30;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Recent Log Entries", 20, yPos);

        yPos += 10;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        const recentEntries = recentLogs.slice(0, 10);
        recentEntries.forEach((log) => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }

            const logDate = new Date(log.date + "T00:00:00").toLocaleDateString();
            doc.text(`${logDate}:`, 25, yPos);
            yPos += 6;

            if (log.mood) {
                doc.text(`  Mood: ${log.mood}`, 30, yPos);
                yPos += 5;
            }
            if (log.bleedingIntensity) {
                doc.text(`  Bleeding: ${log.bleedingIntensity}`, 30, yPos);
                yPos += 5;
            }
            if (log.symptoms && log.symptoms.length > 0) {
                doc.text(`  Symptoms: ${log.symptoms.join(", ")}`, 30, yPos);
                yPos += 5;
            }
            yPos += 3;
        });

        // Footer
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(9);
            doc.setFont("helvetica", "italic");
            doc.text(
                "This report is generated for medical consultation purposes.",
                105,
                285,
                { align: "center" }
            );
            doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: "center" });
        }

        // Save
        doc.save(`period-tracker-report-${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    return (
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-base font-semibold text-zinc-900">
                📄 Medical Report
            </h3>
            <p className="mb-4 text-sm text-zinc-600">
                Download a comprehensive PDF report for your doctor with cycle data, symptoms, and mood analysis from the last 3 months.
            </p>
            <Button onClick={generatePDF} variant="primary" size="lg">
                Download Report for Doctor
            </Button>
        </div>
    );
}

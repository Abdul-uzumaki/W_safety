const PDFDocument = require('pdfkit');
const Report = require('../models/Report');
const bnsData = require('../config/bns_model.json');

// Map incident IDs to labels
const getLabels = (ids) => {
    return ids.map(id => {
        const item = bnsData.find(b => b.id === id);
        return item ? `${item.label} (Section ${item.section})` : id;
    });
};

const createReport = async (req, res, next) => {
    try {
        const report = new Report(req.body);
        await report.save();
        res.status(201).json({
            success: true,
            message: 'Report submitted successfully',
            referenceId: report.referenceId,
            reportId: report._id
        });
    } catch (error) {
        next(error);
    }
};

const path = require('path');

const getReportPDF = async (req, res, next) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

        const doc = new PDFDocument({
            margin: 50,
            size: 'A4',
            info: {
                Title: `Incident Report - ${report.referenceId}`,
                Author: 'W-Safety Platform',
            }
        });

        // Stream the PDF to the response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Report_${report.referenceId}.pdf`);
        doc.pipe(res);

        // --- Header Section ---
        const logoPath = path.join(__dirname, '../assets/logo.png');
        try {
            doc.image(logoPath, 50, 45, { width: 50 });
        } catch (e) {
            // Fallback if logo is missing
            doc.fillColor('#be185d').fontSize(20).text('W', 50, 45, { baseline: 'top' });
        }

        doc.fillColor('#333333').fontSize(20).text('W-Safety Platform', 110, 50);
        doc.fontSize(10).fillColor('#666666').text('Empowering Women, Ensuring Safety', 110, 75);

        doc.moveTo(50, 100).lineTo(550, 100).strokeColor('#be185d').lineWidth(2).stroke();
        doc.moveDown(2);

        // --- Report Info ---
        doc.fillColor('#333333').fontSize(16).text('OFFICIAL INCIDENT REPORT', { align: 'center', characterSpacing: 1 });
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('#666666').text(`Reference ID: ${report.referenceId}`, { align: 'center' });
        doc.text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown(2);

        // --- Main Content (Grid Layout) ---
        const startY = doc.y;

        // Column 1: Victim Information
        doc.fillColor('#be185d').fontSize(12).text('VICTIM INFORMATION', 50, startY);
        doc.moveTo(50, doc.y + 2).lineTo(250, doc.y + 2).strokeColor('#e5e7eb').lineWidth(1).stroke();
        doc.moveDown(0.8);

        doc.fillColor('#444444').fontSize(10).font('Helvetica-Bold').text('Full Name: ', { continued: true }).font('Helvetica').text(report.fullName);
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').text('Contact: ', { continued: true }).font('Helvetica').text(report.phoneNumber || 'N/A');

        // Column 2: Incident Metadata
        doc.fillColor('#be185d').fontSize(12).text('INCIDENT DETAILS', 300, startY);
        doc.moveTo(300, doc.y + 2).lineTo(550, doc.y + 2).strokeColor('#e5e7eb').lineWidth(1).stroke();
        doc.moveDown(0.8);

        doc.fillColor('#444444').fontSize(10).font('Helvetica-Bold').text('Date: ', { continued: true }).font('Helvetica').text(report.date, 300);
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').text('Time: ', { continued: true }).font('Helvetica').text(report.time || 'Not specified', 300);
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').text('Location: ', { continued: true }).font('Helvetica').text(report.location, 300);

        doc.moveDown(3);

        // --- Identified BNS Sections ---
        const labels = getLabels(report.incidentType);
        if (labels.length > 0) {
            doc.fillColor('#be185d').fontSize(12).text('LEGAL CLASSIFICATION (BNS)', 50);
            doc.moveTo(50, doc.y + 2).lineTo(550, doc.y + 2).strokeColor('#e5e7eb').lineWidth(1).stroke();
            doc.moveDown(1);

            doc.fillColor('#444444').fontSize(10);
            labels.forEach(label => {
                doc.text(`• ${label}`, { indent: 15 });
                doc.moveDown(0.3);
            });
            doc.moveDown(2);
        }

        // --- Description ---
        doc.fillColor('#be185d').fontSize(12).text('INCIDENT DESCRIPTION', 50);
        doc.moveTo(50, doc.y + 2).lineTo(550, doc.y + 2).strokeColor('#e5e7eb').lineWidth(1).stroke();
        doc.moveDown(1);

        doc.fillColor('#444444').fontSize(10).font('Helvetica').text(report.description, {
            align: 'justify',
            lineGap: 4
        });

        // --- Footer ---
        const pages = doc.bufferedPageRange();
        for (let i = pages.start; i < pages.start + pages.count; i++) {
            doc.switchToPage(i);

            // Footer Line
            doc.moveTo(50, doc.page.height - 70).lineTo(550, doc.page.height - 70).strokeColor('#e5e7eb').lineWidth(0.5).stroke();

            doc.fontSize(8).fillColor('#999999').text(
                'CONFIDENTIAL DOCUMENT - FOR OFFICIAL USE ONLY',
                50,
                doc.page.height - 60,
                { align: 'center', width: 500 }
            );

            doc.text(
                'This report was generated via the W-Safety encrypted platform. All data is protected under privacy regulations.',
                50,
                doc.page.height - 50,
                { align: 'center', width: 500 }
            );

            doc.text(`Page ${i + 1} of ${pages.count}`, 50, doc.page.height - 40, { align: 'right', width: 500 });
        }

        doc.end();
    } catch (error) {
        next(error);
    }
};

module.exports = { createReport, getReportPDF };

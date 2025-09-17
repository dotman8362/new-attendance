import Attendance from "../models/attendance.js";
import User from "../models/user.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { PassThrough } from "stream";

/**
 * Admin: Get attendance report
 * Query params:
 *   - date (YYYY-MM-DD, optional)
 *   - studentId (optional)
 *   - export = excel | pdf (optional)
 */
export const getAttendanceReport = async (req, res) => {
  try {
    const { date, studentId, export: exportType } = req.query;

    const filter = {};
    if (date) filter.date = date;
    if (studentId) filter.studentId = studentId;

    const records = await Attendance.find(filter).populate(
      "studentId",
      "fullname studentId"
    );

    if (!records.length) {
      return res.status(404).json({ msg: "No attendance records found" });
    }

    // ======================
    // EXPORT AS EXCEL
    // ======================
    if (exportType === "excel") {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Attendance Report");

      // Header
      sheet.columns = [
        { header: "Student ID", key: "studentId", width: 15 },
        { header: "Full Name", key: "fullname", width: 25 },
        { header: "Date", key: "date", width: 15 },
        { header: "Sign In", key: "signInTime", width: 20 },
        { header: "Sign Out", key: "signOutTime", width: 20 },
        { header: "IP Address", key: "ipAddress", width: 20 }
      ];

      // Data
      records.forEach(r => {
        sheet.addRow({
          studentId: r.studentId.studentId,
          fullname: r.studentId.fullname,
          date: r.date,
          signInTime: r.signInTime ? r.signInTime.toLocaleString() : "N/A",
          signOutTime: r.signOutTime ? r.signOutTime.toLocaleString() : "N/A",
          ipAddress: r.ipAddress
        });
      });

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=attendance_report.xlsx");

      return workbook.xlsx.write(res).then(() => res.end());
    }

    // ======================
    // EXPORT AS PDF
    // ======================
    if (exportType === "pdf") {
      const doc = new PDFDocument({ margin: 30, size: "A4" });
      const stream = new PassThrough();
      doc.pipe(stream);

      doc.fontSize(18).text("Attendance Report", { align: "center" }).moveDown(1);

      records.forEach((r, index) => {
        doc.fontSize(12).text(
          `${index + 1}. ${r.studentId.fullname} (${r.studentId.studentId})
           Date: ${r.date}
           Sign In: ${r.signInTime ? r.signInTime.toLocaleString() : "N/A"}
           Sign Out: ${r.signOutTime ? r.signOutTime.toLocaleString() : "N/A"}
           IP: ${r.ipAddress}
          `
        ).moveDown(0.5);
      });

      doc.end();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=attendance_report.pdf");
      stream.pipe(res);
      return;
    }

    // ======================
    // DEFAULT JSON RESPONSE
    // ======================
    return res.json({
      msg: "Attendance report fetched successfully",
      count: records.length,
      records,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

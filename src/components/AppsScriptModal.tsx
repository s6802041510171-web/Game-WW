import React, { useState } from 'react';
import { X, Copy, Check, Code, ExternalLink, HelpCircle, FileText, Server } from 'lucide-react';
import { DEFAULT_GAS_URL } from '../services/sheetsService';

interface AppsScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  gasUrl: string;
  onUpdateGasUrl: (url: string) => void;
}

export const APPS_SCRIPT_CODE = `/**
 * Google Apps Script for "Cyber Nightmare: Protocol Survival"
 * ==========================================================
 * วัตถุประสงค์: รับข้อมูลคะแนนจากเกม Cyber Nightmare และบันทึกลง Google Sheets
 * คำแนะนำการใช้งาน:
 * 1. เปิด Google Sheets ใหม่ -> ไปที่เมนู Extensions (ส่วนขยาย) -> Apps Script
 * 2. วางโค้ดนี้ทั้งหมดลงในไฟล์ Code.gs (แทนที่ของเดิม)
 * 3. กด Deploy (ทำให้ใช้งานได้) -> New Deployment (การทำให้ใช้งานได้ใหม่)
 * 4. เลือกประเภท: Web App (เว็บแอป)
 * 5. ตั้งค่า:
 *    - Execute as: Me (ฉัน)
 *    - Who has access: Anyone (ทุกคน) **สำคัญมาก!**
 * 6. กด Deploy แล้วคัดลอก Web App URL มาใส่ในแอปพลิเคชันเกม
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = getOrCreateSheet("GameResults");
    var data = {};

    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      data = e.parameter;
    }

    var timestamp = new Date();
    var badges = Array.isArray(data.badgesEarned) ? data.badgesEarned.join(", ") : (data.badgesEarned || "-");

    var newRow = [
      timestamp,
      data.studentId || "-",
      data.fullName || "-",
      data.classGroup || "-",
      data.nickname || "-",
      data.startTime || "-",
      data.endTime || "-",
      data.timeSpentSeconds || 0,
      data.difficulty || "normal",
      data.score || 0,
      data.maxScore || 1650,
      (data.percentage || 0) + "%",
      data.correctCount || 0,
      data.incorrectCount || 0,
      data.levelReached || "-",
      badges,
      data.finalStatus || "-"
    ];

    sheet.appendRow(newRow);
    
    // Auto format header if first row
    if (sheet.getLastRow() === 2) {
      sheet.getRange(1, 1, 1, newRow.length).setFontWeight("bold").setBackground("#0f172a").setFontColor("#38bdf8");
    }

    updateDashboardSummary();

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success", row: sheet.getLastRow() }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  var sheet = getOrCreateSheet("GameResults");
  var data = sheet.getDataRange().getValues();
  return ContentService
    .createTextOutput(JSON.stringify({ result: "success", data: data }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    var headers = [
      "บันทึกเวลา (Timestamp)",
      "รหัสนักศึกษา (Student ID)",
      "ชื่อ-นามสกุล (Full Name)",
      "กลุ่มเรียน (Class)",
      "Agent Nickname",
      "เวลาเริ่ม (Start)",
      "เวลาจบ (End)",
      "ใช้เวลา (วินาที)",
      "โหมด (Mode)",
      "คะแนน (Score)",
      "คะแนนเต็ม (Max)",
      "ร้อยละ (%)",
      "ข้อถูก (Correct)",
      "ข้อผิด (Incorrect)",
      "Zone ที่ไปถึง",
      "เหรียญรางวัล (Badges)",
      "สถานะการเอาชีวิตรอด"
    ];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#1e293b").setFontColor("#38bdf8");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function updateDashboardSummary() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var resultsSheet = ss.getSheetByName("GameResults");
  var summarySheet = ss.getSheetByName("LeaderboardSummary");

  if (!summarySheet) {
    summarySheet = ss.insertSheet("LeaderboardSummary");
  }

  summarySheet.clear();
  
  summarySheet.getRange("A1").setValue("CYBER NIGHTMARE: DYNAMIC DASHBOARD SUMMARY").setFontWeight("bold").setFontSize(14);
  summarySheet.getRange("A3:B7").setValues([
    ["จำนวนผู้เข้าสอบทั้งหมด (Total Agents)", "=COUNTA(GameResults!B2:B)"],
    ["คะแนนเฉลี่ยรวม (Average Score)", "=AVERAGE(GameResults!J2:J)"],
    ["คะแนนสูงสุดในระบบ (Top Score)", "=MAX(GameResults!J2:J)"],
    ["อัตราการสอบผ่าน >70% (Pass Rate)", '=COUNTIF(GameResults!L2:L, ">=70%") / COUNTA(GameResults!B2:B)'],
    ["อัปเดตล่าสุดเมื่อ (Last Updated)", new Date()]
  ]);

  summarySheet.getRange("A3:A7").setFontWeight("bold").setBackground("#0f172a").setFontColor("#f8fafc");
  summarySheet.getRange("B6").setNumberFormat("0.0%");
  summarySheet.autoResizeColumns(1, 2);
}
`;

export const AppsScriptModal: React.FC<AppsScriptModalProps> = ({
  isOpen,
  onClose,
  gasUrl,
  onUpdateGasUrl
}) => {
  const [copied, setCopied] = useState(false);
  const [inputUrl, setInputUrl] = useState(gasUrl);
  const [testStatus, setTestStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSaveUrl = () => {
    onUpdateGasUrl(inputUrl.trim());
    setTestStatus('บันทึก Web App URL สำเร็จแล้ว!');
    setTimeout(() => setTestStatus(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-mono">
      <div className="bg-[#0a0a0a] border border-red-900/50 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#080808] border-b border-red-900/40">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#0f0f0f] border border-red-600/60 text-red-500">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-tight font-['JetBrains_Mono',monospace]">
                GOOGLE APPS SCRIPT ENGINE // BACKEND INTEGRATION
              </h2>
              <p className="text-xs text-gray-400 font-['Kanit',sans-serif]">
                โค้ดสำหรับนำไปวางใน Google Sheets เพื่อบันทึกข้อมูลและสร้าง Dynamic Dashboard
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white hover:bg-red-950/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Web App URL Config Box */}
          <div className="p-4 bg-[#080808] border border-red-900/40 space-y-3">
            <label className="block text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
              <Server className="w-4 h-4 text-red-500" />
              GOOGLE APPS SCRIPT WEB APP ENDPOINT URL:
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-1 px-3.5 py-2.5 bg-[#0f0f0f] border border-red-900/40 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-red-600 transition-colors"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveUrl}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-colors whitespace-nowrap"
                >
                  SAVE ENDPOINT
                </button>
                <button
                  onClick={() => setInputUrl(DEFAULT_GAS_URL)}
                  className="px-3 py-2.5 bg-[#0f0f0f] hover:bg-red-950/20 text-gray-300 border border-red-900/40 text-xs uppercase font-mono transition-colors whitespace-nowrap"
                >
                  RESTORE DEFAULT
                </button>
              </div>
            </div>
            {testStatus && (
              <p className="text-xs font-mono text-emerald-400 animate-fade-in">{testStatus}</p>
            )}
          </div>

          {/* Step Guide */}
          <div className="p-4 bg-[#080808] border border-red-900/30 text-xs text-gray-300 space-y-2 font-['Kanit',sans-serif]">
            <h3 className="font-bold text-red-500 uppercase tracking-widest flex items-center gap-2 text-xs font-mono">
              <HelpCircle className="w-4 h-4 text-red-500" />
              SETUP GUIDE (4 STEPS):
            </h3>
            <ol className="list-decimal list-inside space-y-1 pl-1 text-gray-300 leading-relaxed">
              <li>สร้าง <strong>Google Sheets</strong> ใหม่ที่ <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-red-400 hover:underline">sheets.new</a></li>
              <li>ไปที่เมนู <strong>Extensions (ส่วนขยาย) → Apps Script</strong></li>
              <li>คัดลอกโค้ดสคริปต์ด้านล่างทั้งหมด นำไปวางในไฟล์ <code>Code.gs</code> แล้วกดบันทึก</li>
              <li>กดปุ่ม <strong>Deploy (ทำให้ใช้งานได้) → New deployment</strong> เลือกประเภทเป็น <strong>Web App</strong> กำหนด <i>Who has access</i> เป็น <strong>Anyone</strong> แล้วคัดลอก URL นำมาใส่ในกล่องข้างบนนี้!</li>
            </ol>
          </div>

          {/* Code Viewer Box */}
          <div className="relative bg-[#080808] border border-red-900/40 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-[#0f0f0f] border-b border-red-900/40 text-xs font-mono">
              <span className="text-gray-400 flex items-center gap-2 uppercase">
                <FileText className="w-3.5 h-3.5 text-red-500" />
                Code.gs (Google Apps Script Engine)
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1.5 px-3 py-1 bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800 transition-colors text-xs font-bold uppercase"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">COPIED!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-red-400" />
                    <span>COPY SCRIPT CODE</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 text-[11px] font-mono text-emerald-400/90 leading-relaxed overflow-x-auto max-h-72 select-all">
              {APPS_SCRIPT_CODE}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#080808] border-t border-red-900/40 flex justify-end font-mono">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#0f0f0f] hover:bg-red-950/20 text-gray-300 border border-red-900/40 text-xs uppercase font-bold tracking-wider transition-colors"
          >
            CLOSE
          </button>
        </div>

      </div>
    </div>
  );
};

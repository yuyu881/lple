/**
 * 學習歷程排版編輯器 MVP
 * 核心邏輯：對話解析與學習歷程生成
 */

// ===== DOM Elements =====

// Landing Page Guide Constant
const LEARNING_PORTFOLIO_PROMPT = `你是一個專業的工程學習歷程檔案撰寫助手。

請協助我將上傳的「對話紀錄」整理成一份學習歷程檔案。
為了確保內容準確且符合我的實際情況，請**務必分兩個階段**進行，不要一次生成完畢。

---

### 第一階段：分析與確認

請先閱讀對話紀錄，從中提取以下關鍵資訊，並列點顯示供我確認：

1.  **研究主題 (Topic)**：(請用一句話總結這份對話在解決什麼核心問題)
2.  **遭遇困難 (Problem)**：(使用者一開始遇到了什麼具體阻礙或異常？)
3.  **核心元件/技術 (Key Tech)**：(列出對話中提到的關鍵硬體型號、軟體工具或理論名稱)
4.  **解決方案 (Solution)**：(最終問題是如何被解決的？關鍵點是什麼？)

**請列出以上資訊後，暫停並詢問我：「以上分析是否正確？有沒有需要修改或補充的地方？」**
待我確認或補充後，再進入第二階段。

---

### 第二階段：撰寫正文

當我回答「沒問題」或提供修正資訊後，請依照以下格式撰寫完整的學習歷程檔案：

# [請根據分析結果設定一個專業標題]

## 前言
(100字內，摘要動機、使用工具、發現與反思)

## 第一章：研究動機
(300字內，詳細描述問題發生的場景、遭遇的困難，以及為何決定尋求 AI 協助)

## 第二章：研究相關知識
(不限字數，請針對第一階段確認的「核心元件/技術」進行技術說明。例如元件原理、接腳定義、程式語法或物理定律。請分小節撰寫。如有相關原理圖或數據表截圖，請標註「（此處可插入相關圖片：說明圖片內容）」)

## 第三章：研究方法與使用設備
(不限字數，描述實驗或除錯的過程。請列出具體的設備清單/軟體環境，並說明操作步驟。請在關鍵步驟處標註「（此處可插入相關圖片：說明圖片內容）」)

## 第四章：研究結果
(300字，描述問題解決後的結果。如果有數據對比或程式碼修正，請在此說明。請在關鍵結果處標註「（此處可插入相關圖片：實驗結果/測試截圖）」)

## 第五章：研究省思與建議
(300字內，總結從這次經驗中學到的技術觀念、除錯邏輯，以及對未來類似情況的建議。如有相關心得照片，請標註「（此處可插入相關圖片）」)


### 第三階段：圖片需求整理

請在文章最後，根據你生成的內容以及我們對話中實際看過的圖片，列出「圖片準備清單」。格式如下：

【圖片準備清單】
1. [章節]：[建議圖片標題]
   - 說明：(簡單說明這張圖應該是什麼，如果我剛剛有傳圖給你，請特別註明「請使用剛才對話中的xx圖」)

例如：
1. 第三章：實驗架構圖
   - 說明：請手繪或使用電路圖軟體繪製實驗接線圖。
2. 第四章：示波器測量結果
   - 說明：請使用您剛才上傳顯示 5V 波形的那張截圖。

---

【撰寫要求】
1.  **語氣**：使用繁體中文，第一人稱「我」。
2.  **通用性**：請根據對話內容自動判斷是電子電路、程式設計、機械結構或其他工程領域，使用該領域的專業術語。
3.  **真實性**：內容必須基於對話紀錄與我確認後的資訊，不可憑空捏造不存在的實驗數據。
4.  **保留原文**：專有名詞請保留英文原文（例如 component names, function names, error codes）。
5.  **嚴格的 Markdown 格式**：請輸出的標準 Markdown，不要使用跳脫字元來處理粗體（例如使用 \`**粗體**\`，絕對不要寫成 \`\\*\\*粗體\\*\\*\`）。
6.  **圖片佔位符格式**：圖片插入提示必須遵守以下格式，以便後續程式解析：
    - 必須使用全形括號「（」和「）」
    - 禁止使用粗體符號包裹（不可寫成 \`**（...）**\`）
    - 必須包含「此處」和「圖」關鍵字
    - 正確格式範例：\`（此處可插入相關圖片：MOSFET 結構比較圖）\`
7.  **提供下載檔案**：若您具有檔案生成能力，請提供「可直接點擊下載」的 .md 檔案連結。若無法提供真實下載連結，請將完整內容輸出於一個 Markdown 程式碼區塊中，以便我複製。`;

// Landing Page Functions (Global scope for onclick attributes)
window.openModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        if (modalId === 'modal-prompt') {
            document.getElementById('promptText').textContent = LEARNING_PORTFOLIO_PROMPT;
        }
    }
}

window.closeModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Initialize Landing Page Events
document.addEventListener('DOMContentLoaded', () => {
    // Copy Prompt Button
    // Copy Prompt Button
    const copyPromptBtn = document.getElementById('copyPromptBtn');
    if (copyPromptBtn) {
        copyPromptBtn.addEventListener('click', () => {
            const textToCopy = LEARNING_PORTFOLIO_PROMPT;

            // Try modern API first
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(textToCopy).then(() => {
                    showCopySuccess();
                }).catch(() => {
                    fallbackCopyTextToClipboard(textToCopy);
                });
            } else {
                fallbackCopyTextToClipboard(textToCopy);
            }
        });
    }

    function showCopySuccess() {
        const successMsg = document.getElementById('copySuccess');
        if (successMsg) {
            successMsg.classList.remove('hidden');
            setTimeout(() => {
                successMsg.classList.add('hidden');
            }, 2000);
        }
    }

    function fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;

        // Ensure it's not visible but part of DOM
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);

        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            if (successful) {
                showCopySuccess();
            } else {
                alert('複製失敗，請手動選取文字複製。');
            }
        } catch (err) {
            console.error('Fallback copy failed', err);
            alert('複製失敗，請手動選取文字複製。');
        }

        document.body.removeChild(textArea);
    }

    // Start System Button
    const startSystemBtn = document.getElementById('startSystemBtn');
    const guideView = document.getElementById('guide-view');
    const editorView = document.getElementById('editor-view');
    const backToGuideBtn = document.getElementById('backToGuideBtn');

    if (startSystemBtn && guideView && editorView) {
        startSystemBtn.addEventListener('click', () => {
            guideView.classList.add('hidden-view');
            editorView.classList.remove('hidden-view');
            window.scrollTo(0, 0);
        });
    }

    // Back to Guide Button (in footer)
    if (backToGuideBtn) {
        backToGuideBtn.addEventListener('click', () => {
            editorView.classList.add('hidden-view');
            guideView.classList.remove('hidden-view');
            window.scrollTo(0, 0);
        });
    }

    // Close modals on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.add('hidden');
        }
    });
});

const uploadZone = document.getElementById('uploadZone');

const fileInput = document.getElementById('fileInput');
const dialogueInput = document.getElementById('dialogueInput');

const clearBtn = document.getElementById('clearBtn');
const previewReportBtn = document.getElementById('previewReportBtn');
const backToEditBtn = document.getElementById('backToEditBtn');
const reportPreview = document.getElementById('reportPreview');
const reportContent = document.getElementById('reportContent');
const appContainer = document.querySelector('.app-container');

// Basic Info Inputs
const schoolNameInput = document.getElementById('schoolName');
const studentClassInput = document.getElementById('studentClass');
const studentNameInput = document.getElementById('studentName');
const advisorNameInput = document.getElementById('advisorName');

const emptyState = document.getElementById('emptyState');
const portfolioContent = document.getElementById('portfolioContent');
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');

// Portfolio sections
const portfolioTitle = document.getElementById('portfolioTitle');
const sectionIntro = document.getElementById('sectionIntro');
const sectionMotivation = document.getElementById('sectionMotivation');
const sectionKnowledge = document.getElementById('sectionKnowledge');
const sectionMethod = document.getElementById('sectionMethod');
const sectionResult = document.getElementById('sectionResult');
const sectionReflection = document.getElementById('sectionReflection');

// ===== Event Listeners =====

// Drag and drop
uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
});

uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

// File input
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

// Click upload zone to trigger file input (explicit handler for iframe compatibility)
uploadZone.addEventListener('click', (e) => {
    // Prevent double-triggering if the click was on the file input itself
    if (e.target.tagName !== 'INPUT') {
        fileInput.click();
    }
});




// Clear button
clearBtn.addEventListener('click', () => {
    dialogueInput.value = '';
    resetOutput();
});

// Print button
// Preview Report Button
previewReportBtn.addEventListener('click', () => {
    toggleReportMode(true);
});

// Back to Edit Button
backToEditBtn.addEventListener('click', () => {
    toggleReportMode(false);
});

// Image upload handling
const uploadAreas = document.querySelectorAll('.image-upload-area');

uploadAreas.forEach(area => {
    const input = area.querySelector('input[type="file"]');
    const preview = area.querySelector('.image-preview');

    // Handle file input change
    input.addEventListener('change', (e) => {
        const files = e.target.files;
        for (let file of files) {
            addImagePreview(file, preview);
        }
    });

    // Handle drag and drop for image area
    area.addEventListener('dragover', (e) => {
        e.preventDefault();
        area.classList.add('dragover');
    });

    area.addEventListener('dragleave', () => {
        area.classList.remove('dragover');
    });

    area.addEventListener('drop', (e) => {
        e.preventDefault();
        area.classList.remove('dragover');
        const files = e.dataTransfer.files;
        for (let file of files) {
            if (file.type.startsWith('image/')) {
                addImagePreview(file, preview);
            }
        }
    });
});

// ===== Custom Import Confirm Modal =====
let pendingImportContent = null;
let importResolve = null;

window.showImportConfirmModal = function (message) {
    return new Promise((resolve) => {
        importResolve = resolve;
        pendingImportContent = null; // Will be set by caller if needed
        const modal = document.getElementById('modal-import-confirm');
        const msgEl = document.getElementById('importConfirmMessage');
        if (modal && msgEl) {
            msgEl.textContent = message;
            modal.classList.remove('hidden');
        } else {
            // Fallback: if modal doesn't exist, resolve true immediately
            resolve(true);
        }
    });
};

window.closeImportModal = function (result) {
    const modal = document.getElementById('modal-import-confirm');
    if (modal) {
        modal.classList.add('hidden');
    }
    if (importResolve) {
        importResolve(result);
        importResolve = null;
    }
};

// ===== Safe Print Function for Iframe Environments =====
// In iframe environments (like Google Sites), window.print() is blocked.
// This function opens a new window with the report content for printing.
window.safePrint = function () {
    openPrintWindow();
};

function openPrintWindow() {
    // Get the report content
    const reportContent = document.getElementById('reportContent');
    if (!reportContent) {
        alert('找不到報告內容！請先預覽報告。');
        return;
    }

    // Get stylesheets but filter out @media print rules that hide content
    const styles = document.querySelectorAll('style');
    let styleContent = '';
    styles.forEach(s => {
        // Remove @media print blocks that contain visibility:hidden
        let css = s.innerHTML;
        css = css.replace(/@media\s+print\s*\{[^}]*visibility\s*:\s*hidden[^}]*\}[^}]*\}/gi, '');
        styleContent += css;
    });

    // Create a new window with the report content
    const printWin = window.open('', '_blank', 'width=900,height=700');
    if (!printWin) {
        alert('無法開啟列印視窗！請檢查瀏覽器是否封鎖了彈出視窗，或嘗試按 Ctrl+P 手動列印。');
        return;
    }

    // Build HTML with clean print-ready styles (including cover page styles)
    const printStyles = `
        /* Base Styles */
        body { background: white !important; margin: 0; padding: 20px; }
        .preview-toolbar { display: none !important; }
        
        /* Report Page Base */
        .report-page {
            width: 210mm;
            min-height: 297mm;
            background: white !important;
            color: black !important;
            margin: 0 auto 2cm auto;
            padding: 2.5cm;
            box-shadow: none !important;
            font-family: 'KaiTi', 'BiauKai', 'DFKai-SB', '標楷體', serif !important;
        }
        .report-page * {
            color: black !important;
            visibility: visible !important;
        }
        
        /* Cover Page - 封面頁樣式 */
        .cover-page {
            display: flex !important;
            flex-direction: column !important;
            justify-content: flex-start !important;
            align-items: center !important;
            text-align: center !important;
            height: 297mm;
            padding-top: 0 !important;
        }
        
        /* 學校名稱 - 26pt 粗體 置中 標楷體 */
        .cover-school {
            font-size: 26pt !important;
            font-weight: bold !important;
            margin-top: 8.5cm !important;
            margin-bottom: 1rem !important;
            line-height: 1.4 !important;
            text-align: center !important;
            font-family: 'KaiTi', 'BiauKai', 'DFKai-SB', '標楷體', serif !important;
        }
        
        /* 報告名稱 - 26pt 粗體 置中 標楷體 */
        .cover-title {
            font-size: 26pt !important;
            font-weight: bold !important;
            margin-bottom: 6cm !important;
            line-height: 1.4 !important;
            text-align: center !important;
            font-family: 'KaiTi', 'BiauKai', 'DFKai-SB', '標楷體', serif !important;
        }
        
        /* 學生資訊 - 20pt */
        .cover-info {
            font-size: 20pt !important;
            line-height: 2 !important;
            text-align: left !important;
            margin-right: 15% !important;
            font-family: 'KaiTi', 'BiauKai', 'DFKai-SB', '標楷體', serif !important;
        }
        .cover-info p {
            font-size: 20pt !important;
            margin-bottom: 0.5rem !important;
        }
        
        /* ===== 專業論文格式 ===== */
        
        /* 第一層：前言、第N章 (18pt 粗體 置中) */
        .report-page h1 {
            font-size: 18pt !important;
            font-weight: bold !important;
            text-align: center !important;
            margin-top: 2rem !important;
            margin-bottom: 1.5rem !important;
            font-family: 'KaiTi', 'BiauKai', 'DFKai-SB', '標楷體', serif !important;
        }
        
        /* 第二層：節標題 N.N (16pt 粗體 置中) */
        .report-page h2,
        .markdown-content h3 {
            font-size: 16pt !important;
            font-weight: bold !important;
            text-align: center !important;
            margin-top: 1.5rem !important;
            margin-bottom: 1rem !important;
            font-family: 'KaiTi', 'BiauKai', 'DFKai-SB', '標楷體', serif !important;
        }
        
        /* 第三層：小節/步驟 (14pt 左右對齊) */
        .markdown-content h4,
        .markdown-content h5,
        .markdown-content h6 {
            font-size: 14pt !important;
            font-weight: bold !important;
            text-align: justify !important;
            margin-top: 1rem !important;
            margin-bottom: 0.75rem !important;
            font-family: 'KaiTi', 'BiauKai', 'DFKai-SB', '標楷體', serif !important;
        }
        
        /* 內文段落 (14pt 左右對齊) */
        .report-page p,
        .markdown-content p {
            font-size: 14pt !important;
            line-height: 1.8 !important;
            text-align: justify !important;
            text-indent: 2em !important;
            margin-bottom: 1rem !important;
            font-family: 'KaiTi', 'BiauKai', 'DFKai-SB', '標楷體', serif !important;
        }
        
        /* 列表 (14pt 左右對齊) */
        .markdown-content ul, .markdown-content ol {
            padding-left: 2rem;
            margin-bottom: 1rem;
            font-size: 14pt !important;
            text-align: justify !important;
            font-family: 'KaiTi', 'BiauKai', 'DFKai-SB', '標楷體', serif !important;
        }
        .markdown-content li {
            margin-bottom: 0.5rem;
            line-height: 1.6;
            font-size: 14pt !important;
            text-align: justify !important;
            font-family: 'KaiTi', 'BiauKai', 'DFKai-SB', '標楷體', serif !important;
        }
        
        /* 表格 (12pt 標楷體) */
        .markdown-content table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
            font-size: 12pt !important;
            font-family: 'KaiTi', 'BiauKai', 'DFKai-SB', '標楷體', serif !important;
        }
        .markdown-content th,
        .markdown-content td {
            border: 1px solid black;
            padding: 0.5rem;
            font-size: 12pt !important;
            text-align: left;
            font-family: 'KaiTi', 'BiauKai', 'DFKai-SB', '標楷體', serif !important;
        }
        .markdown-content th {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        
        /* 圖片容器 */
        .image-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin: 1.5rem 0;
            page-break-inside: avoid;
        }
        img {
            max-width: 80% !important;
            max-height: 300px !important;
            object-fit: contain !important;
        }
        /* 圖片說明 (14pt 左右對齊) */
        .caption {
            margin-top: 0.5rem;
            font-size: 14pt !important;
            text-align: justify !important;
            font-family: 'KaiTi', 'BiauKai', 'DFKai-SB', '標楷體', serif !important;
        }
        
        /* Print Specific */
        @media print {
            @page { size: A4; margin: 2.5cm; }
            body { padding: 0 !important; }
            .report-page {
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
                min-height: auto !important;
                box-shadow: none !important;
            }
            /* 封面頁後換頁 */
            .cover-page {
                page-break-after: always !important;
                height: auto !important;
                min-height: 20cm !important;
            }
            /* 一般內容頁不強制換頁 */
            .report-page:not(.cover-page) {
                page-break-after: auto !important;
            }
        }
    `;

    // Build HTML using string concatenation to avoid script tag issues
    const htmlContent = '<!DOCTYPE html><html><head>' +
        '<meta charset="UTF-8">' +
        '<title>學習歷程報告 - 列印</title>' +
        '<style>' + styleContent + '</style>' +
        '<style>' + printStyles + '</style>' +
        '</head><body>' +
        reportContent.innerHTML +
        '<scr' + 'ipt>window.onload=function(){setTimeout(function(){window.print();},500)};</scr' + 'ipt>' +
        '</body></html>';

    printWin.document.write(htmlContent);
    printWin.document.close();
}

/**
 * 處理上傳的檔案
 */
function handleFile(file) {
    const validTypes = ['text/plain', 'text/markdown', 'application/octet-stream'];
    const validExtensions = ['.txt', '.md'];
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validExtensions.includes(extension)) {
        alert('請上傳 .txt 或 .md 檔案！');
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        let content = e.target.result;

        // Systemic Fix: Clean common Markdown escaping issues provided by AI
        content = cleanMarkdown(content);

        dialogueInput.value = content;

        // 智能偵測：是「學習歷程報告」還是「對話紀錄」？
        if (isPortfolioContent(content)) {
            const confirmImport = await showImportConfirmModal('偵測到這似乎是一份「學習歷程報告」Markdown 檔。\n是否要直接匯入到右側編輯區？');
            if (confirmImport) {
                importPortfolio(content);
            }
        } else {
            const confirmTry = await showImportConfirmModal('無法自動辨識為標準學習歷程格式。\n是否仍要嘗試將內容匯入到右側報告區？\n(若選擇「取消」，內容將僅顯示於左側供您手動編輯)');
            if (confirmTry) {
                importPortfolio(content);
            }
        }
    };
    reader.readAsText(file, 'UTF-8');
}

/**
 * 判斷是否為學習歷程報告內容
 */
function isPortfolioContent(content) {
    // 檢查是否有特定的章節標題特徵 (更寬鬆的匹配)
    const indicators = [
        /^\s*#\s+/m,           // 一級標題
        /^\s*##\s+前言/m,
        /^\s*##\s+第一章/m,
        /^\s*##\s+研究動機/m,
        /^\s*##\s+研究結果/m
    ];

    return indicators.some(regex => regex.test(content));
}

/**
 * 匯入學習歷程報告
 */
function importPortfolio(content) {
    const parsed = parsePortfolioMarkdown(content);
    displayPortfolio(parsed);

    // Check for image requirements
    const imageRequirements = extractImageRequirements(content, parsed);
    renderImageChecklist(imageRequirements);
    generateSmartUploadUI(imageRequirements);

    if (imageRequirements.length > 0) {
        alert(`匯入完成！偵測到 ${imageRequirements.length} 項圖片需求，請查看上方的「圖片待辦清單」。`);
    } else {
        alert('匯入完成！您現在可以上傳圖片並進行排版。');
    }
}

/**
 * 解析 Markdown 學習歷程報告
 */
function parsePortfolioMarkdown(content) {
    const result = {
        title: '',
        intro: '',
        motivation: '',
        knowledge: '',
        method: '',
        result: '',
        reflection: ''
    };

    // 簡單的 Markdown 解析邏輯
    // 1. 提取標題 (# Title)
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) result.title = titleMatch[1].trim();

    // 2. 提取各章節內容
    // 使用 split 切割章節，需要定義分割點
    // 這裡假設標準格式是 ## 章節名稱

    const sections = content.split(/^##\s+/gm);

    sections.forEach(section => {
        const lines = section.trim().split('\n');
        const header = lines[0].trim();
        const body = lines.slice(1).join('\n').trim();

        if (header.includes('前言')) {
            result.intro = body;
        } else if (header.includes('研究動機') || header.includes('第一章')) {
            result.motivation = body;
        } else if (header.includes('相關知識') || header.includes('第二章')) {
            result.knowledge = body;
        } else if (header.includes('使用設備') || header.includes('研究方法') || header.includes('第三章')) {
            result.method = body;
        } else if (header.includes('研究結果') || header.includes('第四章')) {
            result.result = body;
        } else if (header.includes('省思') || header.includes('建議') || header.includes('第五章')) {
            result.reflection = body;
        }
    });

    return result;
}

/**
 * 分析對話內容並生成學習歷程
 */
function analyzeDialogue(content) {
    if (isPortfolioContent(content)) {
        const doImport = confirm('這看起來像是已經寫好的報告，是否要直接作為「匯入」處理？\n\n按「確定」匯入內容\n按「取消」強制重新分析');
        if (doImport) {
            importPortfolio(content);
            return;
        }
    }

    // 解析對話
    const parsed = parseDialogue(content);

    // 生成學習歷程
    const portfolio = generatePortfolio(parsed);

    // 顯示結果
    displayPortfolio(portfolio);
}

/**
 * 解析對話內容
 * 支援多種格式：
 * - 問/答、Q/A、User/AI、Human/Assistant
 * - Markdown 標題格式（## 我的提问 / ## Gemini 回答）
 */
function parseDialogue(content) {
    const result = {
        questions: [],
        answers: [],
        keywords: [],
        topic: ''
    };

    // 正規化換行
    content = content.replace(/\r\n/g, '\n');

    // 先嘗試 Markdown 標題格式 (## 我的提问 / ## Gemini 回答)
    const markdownPattern = /##\s*(我的提问|我的提問|用戶提問|使用者提問)[：:]?\s*\n([\s\S]*?)(?=##\s*(Gemini|Claude|GPT|AI|ChatGPT|助理)\s*(回答|回覆)[：:]?\s*\n|$)/gi;
    const markdownAnswerPattern = /##\s*(Gemini|Claude|GPT|AI|ChatGPT|助理)\s*(回答|回覆)[：:]?\s*\n([\s\S]*?)(?=##\s*(我的提问|我的提問|用戶提問|使用者提問)[：:]?\s*\n|---\s*\n##|$)/gi;

    let markdownQuestions = [];
    let markdownAnswers = [];
    let match;

    // 提取 Markdown 格式的問題
    const contentCopy1 = content;
    while ((match = markdownPattern.exec(contentCopy1)) !== null) {
        const questionText = match[2].trim()
            .replace(/^!\[.*?\]\(.*?\)\s*/g, '') // 移除圖片連結
            .replace(/---\s*$/g, '') // 移除結尾分隔線
            .trim();
        if (questionText) {
            markdownQuestions.push(questionText);
        }
    }

    // 提取 Markdown 格式的回答
    const contentCopy2 = content;
    while ((match = markdownAnswerPattern.exec(contentCopy2)) !== null) {
        const answerText = match[3].trim()
            .replace(/^顯示思路\s*/g, '') // 移除「顯示思路」
            .replace(/---\s*$/g, '') // 移除結尾分隔線
            .trim();
        if (answerText) {
            markdownAnswers.push(answerText);
        }
    }

    // 如果 Markdown 格式成功解析
    if (markdownQuestions.length > 0 || markdownAnswers.length > 0) {
        result.questions = markdownQuestions;
        result.answers = markdownAnswers;
    } else {
        // 嘗試傳統的問答格式
        const patterns = [
            { q: /^問[：:]\s*/gm, a: /^答[：:]\s*/gm },
            { q: /^Q[：:]\s*/gim, a: /^A[：:]\s*/gim },
            { q: /^User[：:]\s*/gim, a: /^(AI|Assistant|Claude|GPT)[：:]\s*/gim },
            { q: /^Human[：:]\s*/gim, a: /^Assistant[：:]\s*/gim },
            { q: /^使用者[：:]\s*/gm, a: /^(AI|助理|機器人)[：:]\s*/gm }
        ];

        for (const pattern of patterns) {
            const qMatches = content.split(pattern.q).filter(s => s.trim());
            if (qMatches.length > 1) {
                // 找到匹配的模式
                const parts = content.split(/(?=問[：:]|答[：:]|Q[：:]|A[：:]|User[：:]|AI[：:]|Assistant[：:]|Human[：:]|Claude[：:]|GPT[：:]|使用者[：:]|助理[：:]|機器人[：:])/gim);

                for (const part of parts) {
                    const trimmed = part.trim();
                    if (!trimmed) continue;

                    if (/^(問|Q|User|Human|使用者)[：:]/i.test(trimmed)) {
                        const text = trimmed.replace(/^(問|Q|User|Human|使用者)[：:]\s*/i, '');
                        if (text) result.questions.push(text);
                    } else if (/^(答|A|AI|Assistant|Claude|GPT|助理|機器人)[：:]/i.test(trimmed)) {
                        const text = trimmed.replace(/^(答|A|AI|Assistant|Claude|GPT|助理|機器人)[：:]\s*/i, '');
                        if (text) result.answers.push(text);
                    }
                }
                break;
            }
        }
    }

    // 如果還是沒有找到結構化對話，就當作純文字處理
    if (result.questions.length === 0 && result.answers.length === 0) {
        result.questions.push(content);
    }

    // 提取關鍵字
    result.keywords = extractKeywords(content);

    // 推測主題
    result.topic = inferTopic(content, result.keywords);

    return result;
}

/**
 * 提取技術關鍵字（精簡版，只保留重要的主題級關鍵字）
 */
function extractKeywords(content) {
    // 高優先級：主要元件/技術名稱（優先顯示）
    const primaryKeywords = [
        'Arduino', 'Raspberry Pi', 'ESP32', 'ESP8266',
        'MOSFET', 'JFET', 'BJT', 'BS250', 'BS170', '2N7000',
        'LED', 'LCD', 'OLED', '馬達', '感測器',
        'Python', 'JavaScript', 'C++',
        '3D列印', 'PCB'
    ];

    // 低優先級：補充說明用（只有沒有高優先級時才使用）
    const secondaryKeywords = [
        'N-Channel', 'P-Channel', 'E-MOS', 'D-MOS',
        '電阻', '電容', '二極體', '電路',
        'I2C', 'SPI', 'PWM', 'GPIO'
    ];

    const found = [];
    const lowerContent = content.toLowerCase();

    // 先找高優先級關鍵字
    for (const keyword of primaryKeywords) {
        if (lowerContent.includes(keyword.toLowerCase())) {
            found.push(keyword);
        }
    }

    // 如果高優先級不足 3 個，補充低優先級
    if (found.length < 3) {
        for (const keyword of secondaryKeywords) {
            if (lowerContent.includes(keyword.toLowerCase()) && !found.includes(keyword)) {
                found.push(keyword);
            }
        }
    }

    // 最多返回 5 個關鍵字
    return [...new Set(found)].slice(0, 5);
}

/**
 * 推測研究主題
 */
function inferTopic(content, keywords) {
    // 先找出內容中出現次數最多的元件名稱
    const components = ['BS250', 'BS170', '2N7000', 'Arduino', 'Raspberry Pi', 'ESP32'];
    let bestComponent = null;
    let maxCount = 0;

    for (const comp of components) {
        const regex = new RegExp(comp, 'gi');
        const matches = content.match(regex);
        const count = matches ? matches.length : 0;
        if (count > maxCount) {
            maxCount = count;
            bestComponent = comp;
        }
    }

    // 如果找到主要元件，用它作為主題核心
    if (bestComponent && maxCount >= 2) {
        // 嘗試找到相關的研究內容描述
        const topicKeywords = keywords.filter(k => k !== bestComponent).slice(0, 2);
        if (topicKeywords.length > 0) {
            return `${bestComponent} ${topicKeywords.join('、')} 研究`;
        }
        return `${bestComponent} 接腳測試研究`;
    }

    // 嘗試從 Markdown 標題格式提取主題（取第一個問題的核心內容）
    const markdownQuestion = content.match(/##\s*(我的提问|我的提問)[：:]?\s*\n[\s\S]*?(?:這|请|請|你|我|有|是|如何|怎麼|為什麼|什麼)(.{10,60}?)(?:\n|$)/i);
    if (markdownQuestion && markdownQuestion[2]) {
        let topic = markdownQuestion[2].trim()
            .replace(/[？?。.!！，,]$/g, '')
            .replace(/^(.*?)(怎麼|如何|為什麼|是否|可以|能不能|會不會).*$/g, '$1')
            .substring(0, 50);
        if (topic.length > 5) {
            return topic;
        }
    }

    // 嘗試從傳統格式的第一個問題提取主題
    const firstQuestion = content.match(/^(問|Q|User|Human|使用者)[：:]\s*(.+?)(?:\n|$)/im);
    if (firstQuestion) {
        const question = firstQuestion[2].trim();
        return question
            .replace(/[？?。.!！]$/g, '')
            .replace(/怎麼.+$/g, '')
            .replace(/如何.+$/g, '')
            .substring(0, 50);
    }

    // 使用關鍵字組合作為主題
    if (keywords.length > 0) {
        return keywords.slice(0, 3).join(' ') + ' 研究';
    }

    return '專題研究';
}

/**
 * 生成學習歷程內容
 */
function generatePortfolio(parsed) {
    const { questions, answers, keywords, topic } = parsed;

    // 合併所有問題和答案
    const allQuestions = questions.join('\n');
    const allAnswers = answers.join('\n');
    const keywordStr = keywords.join('、') || '（請補充）';

    return {
        title: topic || '專題研究',

        intro: `本研究探討${topic}相關議題。在學習過程中，透過與 AI 助理的互動討論，逐步釐清問題並找到解決方案。研究過程中涉及${keywordStr}等技術知識，最終成功解決所遇到的問題，並從中獲得寶貴的學習經驗。`,

        motivation: `在進行相關實作時，遇到了${topic}的問題。由於課堂上的學習內容有限，無法完全理解問題的成因，因此決定透過自主學習的方式，藉由 AI 工具的輔助來深入探究這個問題。希望透過這次研究，能夠更深入理解${keywordStr}的原理與應用。`,

        knowledge: generateKnowledgeSection(keywords, allAnswers),

        method: `【研究方式】
本研究採用「問題導向學習」(Problem-Based Learning) 方法，透過以下步驟進行：
1. 發現問題：在實作過程中遇到問題
2. 資料蒐集：透過 AI 助理進行技術諮詢
3. 分析理解：整理 AI 回覆的內容，理解問題成因
4. 實際驗證：根據建議進行修正並測試
5. 反思總結：記錄學習心得

【使用設備與材料】
${keywords.length > 0 ? '• ' + keywords.join('\n• ') : '（請根據實際情況補充使用的設備與材料）'}

【軟體工具】
• AI 對話助理（用於技術諮詢）
• （請補充其他使用的軟體工具）`,

        result: `透過與 AI 助理的多次互動討論，成功解決了${topic}的問題。

主要發現：
${generateFindings(questions, answers)}

【請在此處新增實驗結果的圖片，並說明圖片內容】`,

        reflection: `完成這次研究後，我學到了以下幾點：

1. 技術知識方面：更深入理解了${keywordStr}的原理與應用方式。

2. 問題解決能力：學會如何將複雜問題拆解成小問題，逐一尋求解答。

3. 自主學習能力：體會到善用 AI 工具可以大幅提升學習效率，但也需要自己動手實作驗證。

4. 未來改進方向：（請根據個人經驗補充）`
    };
}

/**
 * 生成相關知識章節
 */
function generateKnowledgeSection(keywords, answers) {
    let content = '在本研究中，涉及以下相關知識：\n\n';

    if (keywords.length > 0) {
        keywords.forEach((kw, index) => {
            content += `【${kw}】\n`;
            content += `（請補充 ${kw} 的相關說明，可包含定義、原理、使用方式等）\n\n`;
        });
    } else {
        content += '（請根據研究內容，補充相關的技術知識說明）\n';
    }

    // 如果答案中有技術說明，可以擷取部分
    if (answers && answers.length > 100) {
        content += '\n【AI 助理提供的技術說明摘要】\n';
        content += answers.substring(0, 500) + '...\n';
        content += '\n（請根據以上內容，整理成自己的話）';
    }

    return content;
}

/**
 * 從問答中生成發現
 */
function generateFindings(questions, answers) {
    if (questions.length === 0) {
        return '• （請根據研究過程補充主要發現）';
    }

    let findings = '';
    const maxItems = Math.min(questions.length, 3);

    for (let i = 0; i < maxItems; i++) {
        const q = questions[i].substring(0, 100).replace(/[\n\r]/g, ' '); // Keep questions single line
        findings += `### 發現 ${i + 1}：${q}${questions[i].length > 100 ? '...' : ''}\n`;
        if (answers[i]) {
            // Preserve newlines for Markdown rendering, increase limit
            const a = answers[i].substring(0, 500);
            findings += `**解決方式**：\n${a}${answers[i].length > 500 ? '...' : ''}\n\n`;
        }
    }

    return findings || '• （請補充研究發現）';
}

/**
 * 顯示生成的學習歷程
 */
function displayPortfolio(portfolio) {
    // 隱藏空白狀態，顯示內容
    emptyState.style.display = 'none';
    portfolioContent.style.display = 'flex';

    // 填入內容
    portfolioTitle.value = portfolio.title;
    sectionIntro.value = portfolio.intro;
    sectionMotivation.value = portfolio.motivation;
    sectionKnowledge.value = portfolio.knowledge;
    sectionMethod.value = portfolio.method;
    sectionResult.value = portfolio.result;
    sectionReflection.value = portfolio.reflection;

    // 滾動到頂部
    document.getElementById('outputArea').scrollTop = 0;
}

/**
 * 重置輸出區域
 */
function resetOutput() {
    emptyState.style.display = 'flex';
    portfolioContent.style.display = 'none';
    portfolioTitle.value = '';
    sectionIntro.value = '';
    sectionMotivation.value = '';
    sectionKnowledge.value = '';
    sectionMethod.value = '';
    sectionResult.value = '';
    sectionReflection.value = '';
    sectionReflection.value = '';

    // Clear all image previews
    document.querySelectorAll('.image-preview').forEach(el => el.innerHTML = '');
}

/**
 * 新增圖片預覽 (支援圖片說明)
 */
function addImagePreview(file, previewContainer) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const div = document.createElement('div');
        div.className = 'image-preview-item';

        // 建立圖片與輸入框
        div.innerHTML = `
            <div class="image-wrapper">
                <img src="${e.target.result}" alt="預覽圖片">
                <button class="remove-btn" onclick="this.closest('.image-preview-item').remove()">×</button>
            </div>
            <input type="text" class="image-caption" placeholder="請輸入圖片說明（如：BS250 接腳測試圖）">
        `;

        previewContainer.appendChild(div);
    };
    reader.readAsDataURL(file);
}

/**
 * 清理 Markdown 內容中的常見問題
 * 例如：將 \*\*粗體\*\* 修正為 **粗體**
 */
function cleanMarkdown(content) {
    if (!content) return '';
    return content
        // 移除粗體/斜體前的反斜線
        .replace(/\\\*\*/g, '**')  // \*\* -> **
        .replace(/\\_/g, '_')      // \_ -> _
        // 移除標題前的反斜線 (如果有)
        // 移除標題前的反斜線 (如果有)
        .replace(/^\\# /gm, '# ')
        .replace(/^\\## /gm, '## ')
        // Remove bold markers around images **![alt](url)** -> ![alt](url)
        .replace(/\*\*\s*(!\[.*?\]\(.*?\))\s*\*\*/g, '$1');
}

/**
 * 提取圖片需求摘要
 */
function extractImageRequirements(content, parsed) {
    const requirements = [];

    // 1. 嘗試解析「圖片準備清單」區塊 (特定格式)
    const checklistRegex = /【圖片準備清單】([\s\S]*?)(?=---|$)/;
    const match = content.match(checklistRegex);
    if (match) {
        const listText = match[1];
        const itemRegex = /\d+\.\s+\[?(.*?)\]?：(.*?)(?:\n|$)/g;
        let itemMatch;
        while ((itemMatch = itemRegex.exec(listText)) !== null) {
            requirements.push({
                section: itemMatch[1].trim(),
                desc: itemMatch[2].trim()
            });
        }
    }

    // 2. 如果沒有清單區塊，嘗試從內文中抓取「此處可插入圖片」標記
    if (requirements.length === 0) {
        // 定義各章節內容
        const sections = [
            { name: '第二章', content: parsed.knowledge },
            { name: '第三章', content: parsed.method },
            { name: '第四章', content: parsed.result },
            { name: '第五章', content: parsed.reflection }
        ];

        sections.forEach(sec => {
            // 尋找 （此處可插入...圖片...） 的模式
            // 以全形括號「（ ）」為邊界，允許內容包含半形括號如 (603)
            const placeholderRegex = /（[^）]*圖[^）]*）/g;
            const matches = sec.content.match(placeholderRegex);
            if (matches) {
                matches.forEach(m => {
                    // 清理全形括號
                    const cleanDesc = m.replace(/^（/, '').replace(/）$/, '');
                    requirements.push({
                        section: sec.name,
                        desc: cleanDesc
                    });
                });
            }
        });
    }

    return requirements;
}

/**
 * 渲染圖片待辦清單
 */
function renderImageChecklist(requirements) {
    const checklistContainer = document.getElementById('imageChecklist');
    const checklistItems = document.getElementById('checklistItems');

    if (requirements.length === 0) {
        checklistContainer.style.display = 'none';
        return;
    }

    // Clear existing hints in upload areas
    document.querySelectorAll('.upload-hint-tag').forEach(el => el.remove());

    checklistItems.innerHTML = '';
    requirements.forEach(req => {
        const item = document.createElement('div');
        item.className = 'checklist-item';

        let sectionKey = '';
        if (req.section.includes('二')) sectionKey = 'knowledge';
        else if (req.section.includes('三')) sectionKey = 'method';
        else if (req.section.includes('四')) sectionKey = 'result';
        else if (req.section.includes('五')) sectionKey = 'reflection';

        // Add hint to specific upload area
        if (sectionKey) {
            const uploadArea = document.querySelector(`.image-upload-area[data-section="${sectionKey}"]`);
            if (uploadArea) {
                const hintDiv = document.createElement('div');
                hintDiv.className = 'upload-hint-tag';
                hintDiv.textContent = `建議圖片：${req.desc}`;
                uploadArea.insertBefore(hintDiv, uploadArea.firstChild);
            }
        }

        item.innerHTML = `
            <div class="checklist-item-content">
                <strong>[${req.section}]</strong>
                <span>${req.desc}</span>
            </div>
            ${sectionKey ? `<span class="checklist-action" onclick="scrollToSection('${sectionKey}')">前往上傳</span>` : ''}
        `;
        checklistItems.appendChild(item);
    });

    checklistContainer.style.display = 'block';
}

/**
 * 捲動到指定章節
 */
function scrollToSection(key) {
    const uploadArea = document.querySelector(`.image-upload-area[data-section="${key}"]`);
    if (uploadArea) {
        uploadArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
        uploadArea.classList.add('highlight-section');
        setTimeout(() => uploadArea.classList.remove('highlight-section'), 2000);
    }
}

// ===== Initialize =====
console.log('學習歷程排版編輯器已載入 (v2.1 - Report Mode)');

// ===== Report Generation Functions =====

/**
 * 切換 編輯模式 / 報告預覽模式
 */
function toggleReportMode(show) {
    if (show) {
        renderReportContent();
        reportPreview.classList.remove('hidden');
        appContainer.style.display = 'none'; // 暫時隱藏編輯器，避免雙重捲軸
        document.body.style.overflow = 'hidden'; // 鎖定 Body 捲動，只讓預覽層捲動
    } else {
        reportPreview.classList.add('hidden');
        appContainer.style.display = 'flex';
        document.body.style.overflow = 'auto';
    }
}

/**
 * 渲染報告內容 (將 Input 轉為靜態 HTML)
 */
function renderReportContent() {
    reportContent.innerHTML = ''; // 清空舊內容

    // 1. 生成封面頁
    const coverPage = document.createElement('div');
    coverPage.className = 'cover-page report-page';

    const titleRaw = portfolioTitle.value || '專題研究報告';
    // Remove markdown bold symbols (** or __) for the cover page
    const title = titleRaw.replace(/\*\*/g, '').replace(/__/g, '');

    const school = schoolNameInput.value || '';
    const sClass = studentClassInput.value || '';
    const name = studentNameInput.value || '';
    const advisor = advisorNameInput.value || '';

    coverPage.innerHTML = `
        <div class="cover-school">${school}</div>
        <div class="cover-title">${title}</div>
        <div class="cover-info">
            <p>學生姓名：${sClass} ${name}</p>
            <p>指導老師：${advisor}</p>
            <p>中華民國 ${new Date().getFullYear() - 1911} 年 ${new Date().getMonth() + 1} 月</p>
        </div>
    `;
    reportContent.appendChild(coverPage);

    // 2. 生成各章節
    // 定義章節對應 (ID -> 標題)
    const sections = [
        { id: 'sectionIntro', title: '前言' },
        { id: 'sectionMotivation', title: '第一章 研究動機' },
        { id: 'sectionKnowledge', title: '第二章 研究相關知識', key: 'knowledge' },
        { id: 'sectionMethod', title: '第三章 研究方法與使用設備', key: 'method' },
        { id: 'sectionResult', title: '第四章 研究結果', key: 'result' },
        { id: 'sectionReflection', title: '第五章 研究省思與建議', key: 'reflection' }
    ];

    // 建立一個連續的頁面容器 (或每個章節一頁，視內容而定)
    // 這裡採用流式佈局，內容多了自動換頁 (由 CSS @media print 控制)
    // 為了預覽好看，我們將內容放入 report-page 中
    // 簡單起見，我們將正文全部放在一個新的 report-page 中，或者動態分頁
    // 為了模擬 Word，我們開啟一個新的 page div

    let currentPage = document.createElement('div');
    currentPage.className = 'report-page';
    reportContent.appendChild(currentPage);

    sections.forEach(sec => {
        const textarea = document.getElementById(sec.id);
        const content = textarea.value; // 保留換行

        if (!content && !sec.key) return; // 空章節跳過 (除非有圖片)

        // 章節標題 - 前言和第N章都使用 h1 (18pt 粗體 置中)

        // 渲染標題 - 全部使用 h1
        const titleEl = document.createElement('h1');
        titleEl.textContent = sec.title;
        currentPage.appendChild(titleEl);

        // 準備圖片資料 - 優先讀取 Smart Slots
        let sectionImages = [];
        if (sec.key) {
            const uploadArea = document.querySelector(`.image-upload-area[data-section="${sec.key}"]`);
            if (uploadArea) {
                // 1. 讀取 Smart Slots
                const smartSlots = uploadArea.querySelectorAll('.smart-slot.has-image');
                smartSlots.forEach(slot => {
                    const img = slot.querySelector('img');
                    const captionInput = slot.querySelector('.smart-slot-caption');
                    if (img) {
                        sectionImages.push({
                            src: img.src,
                            caption: captionInput.value || ''
                        });
                    }
                });

                // 2. 讀取手動上傳的額外圖片 (如果有保留的話)
                const manualPreviews = uploadArea.querySelectorAll('.image-preview-item');
                manualPreviews.forEach(item => {
                    const img = item.querySelector('img');
                    const captionInput = item.querySelector('.image-caption');
                    if (img) {
                        sectionImages.push({
                            src: img.src,
                            caption: captionInput.value || ''
                        });
                    }
                });
            }
        }

        // 處理內文與圖片嵌入
        if (content) {
            // 設定 Marked 選項
            if (window.marked) {
                window.marked.setOptions({
                    breaks: true,
                    gfm: true
                });
            }

            let processedContent = content;
            let usedImageIndices = new Set();

            // 尋找並替換圖片佔位符 (包含可能的粗體標記 - 寬鬆匹配)
            // 格式範例：
            //   （此處可插入相關圖片：...）
            //   **（此處可插入相關圖片：請使用「BS250(603)...」...）**
            // 
            // 關鍵改進：
            // 1. 前後可選的 ** 或 __ 粗體標記
            // 2. 以全形括號「（ ）」為邊界，而非半形括號（因為內容可能包含 (603) 等半形括號）
            // 3. 內容必須包含「此處」和「圖」關鍵字
            // 4. 使用 [^）]* 只排除全形右括號，允許半形括號存在於內容中
            const placeholderRegex = /(?:\*{1,2}|_{1,2})?\s*（[^）]*此處[^）]*圖[^）]*）\s*(?:\*{1,2}|_{1,2})?/g;
            let imageIndex = 0;

            processedContent = processedContent.replace(placeholderRegex, (match) => {
                if (imageIndex < sectionImages.length) {
                    const imgData = sectionImages[imageIndex];
                    usedImageIndices.add(imageIndex);
                    imageIndex++;

                    // 生成圖片 HTML (標記為 raw html)
                    // 重要：前後必須有雙空行，確保 Markdown 正確解析：
                    // 1. 前面的空行結束之前的段落/列表
                    // 2. 後面的空行讓下一個標題/列表正確開始
                    return `\n\n<div class="image-container"><img src="${imgData.src}"><div class="caption">${imgData.caption}</div></div>\n\n`;
                }
                // 如果沒有圖片了，也需要雙空行以維護 Markdown 段落結構
                // 這樣可以確保下一行的標題/列表正確解析
                return '\n\n';
            });

            const contentDiv = document.createElement('div');
            contentDiv.className = 'markdown-content';

            if (window.marked) {
                // Ensure marked options
                window.marked.setOptions({
                    breaks: true,
                    gfm: true
                });

                // Parse markdown
                contentDiv.innerHTML = window.marked.parse(processedContent);
            } else {
                console.error('Marked library not loaded!');
                alert('系統錯誤：Markdown 解析庫未載入，報告格式可能不正確。\n請檢查網路連線或使用最新的 one-click-run.html 檔。');
                contentDiv.innerText = processedContent;
            }

            currentPage.appendChild(contentDiv);

            // 渲染 LaTeX
            if (window.renderMathInElement) {
                window.renderMathInElement(contentDiv, {
                    delimiters: [
                        { left: '$$', right: '$$', display: true },
                        { left: '$', right: '$', display: false },
                        { left: '\\(', right: '\\)', display: false },
                        { left: '\\[', right: '\\]', display: true }
                    ],
                    throwOnError: false
                });
            }

            // 渲染剩餘未使用的圖片
            sectionImages.forEach((imgData, idx) => {
                if (!usedImageIndices.has(idx)) {
                    const imgContainer = document.createElement('div');
                    imgContainer.className = 'image-container';
                    imgContainer.innerHTML = `<img src="${imgData.src}"><div class="caption">${imgData.caption}</div>`;
                    currentPage.appendChild(imgContainer);
                }
            });
        } else {
            // 如果沒有內文但有圖片，直接全部顯示
            sectionImages.forEach(imgData => {
                const imgContainer = document.createElement('div');
                imgContainer.className = 'image-container';
                imgContainer.innerHTML = `<img src="${imgData.src}"><div class="caption">${imgData.caption}</div>`;
                currentPage.appendChild(imgContainer);
            });
        }
    });
}

/**
 * 產生智慧上傳介面 (預先建立對應的圖片上傳框)
 */
function generateSmartUploadUI(requirements) {
    // Group requirements by section
    const sectionReqs = {};
    requirements.forEach(req => {
        let sectionKey = '';
        if (req.section.includes('二')) sectionKey = 'knowledge';
        else if (req.section.includes('三')) sectionKey = 'method';
        else if (req.section.includes('四')) sectionKey = 'result';
        else if (req.section.includes('五')) sectionKey = 'reflection';

        if (sectionKey) {
            if (!sectionReqs[sectionKey]) sectionReqs[sectionKey] = [];
            sectionReqs[sectionKey].push(req.desc);
        }
    });

    // Populate Upload Areas
    for (const [key, descs] of Object.entries(sectionReqs)) {
        const uploadArea = document.querySelector(`.image-upload-area[data-section="${key}"]`);
        if (uploadArea) {
            // Clear existing smart slots (keep manual button if we were preserving it, but for now let's rebuild)
            // But wait, user might want to add MORE images manually. 
            // Let's create a container for smart slots if not exists.
            let container = uploadArea.querySelector('.smart-slot-container');
            if (!container) {
                container = document.createElement('div');
                container.className = 'smart-slot-container';
                // Insert before the generic add button (if exists) or at top
                uploadArea.insertBefore(container, uploadArea.firstChild);
            } else {
                container.innerHTML = ''; // Rebuild
            }

            descs.forEach((desc, index) => {
                const slot = document.createElement('div');
                slot.className = 'smart-slot';
                slot.innerHTML = `
                    <div class="smart-slot-header">
                        <span class="smart-slot-label">圖片 ${index + 1}</span>
                        <span>${desc}</span>
                    </div>
                    <div class="smart-slot-preview" onclick="this.nextElementSibling.click()">
                        <div class="smart-slot-placeholder">
                            <span>點擊上傳圖片</span>
                        </div>
                    </div>
                    <input type="file" accept="image/*" style="display: none" onchange="handleSmartUpload(this)">
                    <input type="text" class="smart-slot-caption" placeholder="圖片說明（選填）" value="${desc}">
                `;
                container.appendChild(slot);
            });
        }
    }
}

/**
 * 處理 Smart Slot 圖片上傳
 */
function handleSmartUpload(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();
        const slot = input.closest('.smart-slot');
        const preview = slot.querySelector('.smart-slot-preview');

        reader.onload = function (e) {
            preview.innerHTML = `<img src="${e.target.result}">`;
            slot.classList.add('has-image');
        }
        reader.readAsDataURL(file);
    }
}

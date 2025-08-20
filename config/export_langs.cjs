const fs = require('fs');
const XLSX = require('xlsx');
const path = require('path');

// 读取Excel文件
const excelPath = path.join(__dirname, 'i18n/langs.xlsx');
const workbook = XLSX.readFile(excelPath);
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log(`从Excel文件读取到 ${data.length} 条数据`);

// 准备游戏数据对象
const gameDataZhCN = {};
const gameDataEnUS = {};
const gameDataPtPT = {};


// 处理Excel数据
data.forEach(row => {
    const key = row['Key'];
    const zhValue = row['zh-CN'];
    const enValue = row['en-US'];
    const ptValue = row['pt-BR'];

    
    if (key) {
        if (zhValue) gameDataZhCN[key] = zhValue;
        if (enValue) gameDataEnUS[key] = enValue;
        if (ptValue) gameDataPtPT[key] = ptValue;

    }
});

console.log(`处理完成: zh-CN ${Object.keys(gameDataZhCN).length} 条, en-US ${Object.keys(gameDataEnUS).length} 条, pt-BR ${Object.keys(gameDataPtPT).length} 条`);

// 更新语言文件的函数
function updateLanguageFile(filePath, gameData, language) {
    try {
        // 读取现有的JSON文件
        const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // 更新game属性
        jsonData.game = gameData;
        
        // 写回文件
        fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf8');
        
        console.log(`✓ 已更新 ${language} 文件: ${Object.keys(gameData).length} 条游戏数据`);
    } catch (error) {
        console.error(`✗ 更新 ${language} 文件失败:`, error.message);
    }
}

// 定义语言文件路径
const localesDir = path.join(__dirname, '../src/i18n/locales');

// 更新中文文件
const zhCnPath = path.join(localesDir, 'zh-CN.json');
updateLanguageFile(zhCnPath, gameDataZhCN, 'zh-CN');

// 更新英文文件
const enUsPath = path.join(localesDir, 'en-US.json');
updateLanguageFile(enUsPath, gameDataEnUS, 'en-US');

// 更新葡萄牙语文件
const ptPtPath = path.join(localesDir, 'pt-BR.json');
updateLanguageFile(ptPtPath, gameDataPtPT, 'pt-BR');


console.log('\n游戏翻译数据更新完成！');
console.log('已更新的文件:');
console.log('- zh-CN.json: 中文游戏数据');
console.log('- pt-BR.json: 葡萄牙语游戏数据');
console.log('- en-US.json: 英文游戏数据');
console.log('- 其他语言文件: 如需要已添加默认英文数据');
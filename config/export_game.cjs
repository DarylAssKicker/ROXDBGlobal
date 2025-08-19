const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

/**
 * 通用导表工具
 * 遍历excel目录，将Excel文件转换为JSON格式
 * 忽略langs.xlsx文件和#remark列
 */

class ExcelToJsonExporter {
    constructor() {
        this.excelDir = path.join(__dirname, 'game');
        this.outputDir = path.join(__dirname, '..', 'src', 'data');
        this.excludeFiles = ['langs.xlsx'];
        this.excludeColumns = ['#remark'];
    }

    /**
     * 确保输出目录存在
     */
    ensureOutputDir() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
            console.log(`创建输出目录: ${this.outputDir}`);
        }
    }

    /**
     * 获取Excel目录中的所有xlsx文件
     */
    getExcelFiles() {
        try {
            const files = fs.readdirSync(this.excelDir)
                .filter(file => {
                    const isExcel = file.endsWith('.xlsx');
                    const isNotExcluded = !this.excludeFiles.includes(file);
                    return isExcel && isNotExcluded;
                });
            return files;
        } catch (error) {
            console.error(`读取Excel目录失败: ${error.message}`);
            return [];
        }
    }

    /**
     * 读取Excel文件并转换为JSON数据
     */
    readExcelFile(filePath) {
        try {
            console.log(`正在读取: ${filePath}`);
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0]; // 读取第一个工作表
            const worksheet = workbook.Sheets[sheetName];
            
            // 转换为JSON数组
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            // 过滤掉排除的列
            const filteredData = jsonData.map(row => {
                const filteredRow = {};
                for (const [key, value] of Object.entries(row)) {
                    if (!this.excludeColumns.includes(key)) {
                        filteredRow[key] = value;
                    }
                }
                return filteredRow;
            });
            
            console.log(`  - 读取了 ${filteredData.length} 条数据`);
            return filteredData;
        } catch (error) {
            console.error(`读取Excel文件失败 ${filePath}: ${error.message}`);
            return null;
        }
    }

    /**
     * 将数据写入JSON文件
     */
    writeJsonFile(data, outputPath) {
        try {
            // 每条数据一行的格式
            const jsonLines = data.map(item => JSON.stringify(item)).join(',\n');
            const jsonString = `[\n${jsonLines}\n]`;
            fs.writeFileSync(outputPath, jsonString, 'utf8');
            console.log(`  - 导出成功: ${outputPath}`);
            return true;
        } catch (error) {
            console.error(`写入JSON文件失败 ${outputPath}: ${error.message}`);
            return false;
        }
    }

    /**
     * 执行导出操作
     */
    export() {
        console.log('开始执行Excel到JSON的导出操作...');
        console.log(`Excel目录: ${this.excelDir}`);
        console.log(`输出目录: ${this.outputDir}`);
        console.log(`排除文件: ${this.excludeFiles.join(', ')}`);
        console.log(`排除列: ${this.excludeColumns.join(', ')}`);
        console.log('---');

        // 确保输出目录存在
        this.ensureOutputDir();

        // 获取所有Excel文件
        const excelFiles = this.getExcelFiles();
        if (excelFiles.length === 0) {
            console.log('没有找到需要处理的Excel文件');
            return false;
        }

        console.log(`找到 ${excelFiles.length} 个Excel文件需要处理:`);
        excelFiles.forEach(file => console.log(`  - ${file}`));
        console.log('---');

        let successCount = 0;
        let totalCount = excelFiles.length;

        // 处理每个Excel文件
        for (const excelFile of excelFiles) {
            const excelPath = path.join(this.excelDir, excelFile);
            const baseName = path.basename(excelFile, '.xlsx');
            const jsonPath = path.join(this.outputDir, `${baseName}.json`);

            console.log(`处理文件: ${excelFile}`);
            
            // 读取Excel数据
            const data = this.readExcelFile(excelPath);
            if (data === null) {
                console.log(`  - 跳过文件: ${excelFile}`);
                continue;
            }

            // 写入JSON文件
            const success = this.writeJsonFile(data, jsonPath);
            if (success) {
                successCount++;
            }
            console.log('');
        }

        console.log('---');
        console.log(`导出完成! 成功: ${successCount}/${totalCount}`);
        
        if (successCount > 0) {
            console.log('导出的文件:');
            const outputFiles = fs.readdirSync(this.outputDir)
                .filter(file => file.endsWith('.json'))
                .sort();
            outputFiles.forEach(file => {
                const filePath = path.join(this.outputDir, file);
                const stats = fs.statSync(filePath);
                console.log(`  - ${file} (${Math.round(stats.size / 1024)}KB)`);
            });
        }

        return successCount === totalCount;
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const exporter = new ExcelToJsonExporter();
    const success = exporter.export();
    
    if (success) {
        console.log('\n✅ 所有文件导出成功!');
        process.exit(0);
    } else {
        console.log('\n❌ 部分文件导出失败!');
        process.exit(1);
    }
}

module.exports = ExcelToJsonExporter;
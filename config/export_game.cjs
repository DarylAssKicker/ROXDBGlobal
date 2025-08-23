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
     * 获取Excel目录中的所有xlsx文件和文件夹
     */
    getExcelFilesAndFolders() {
        try {
            const items = fs.readdirSync(this.excelDir, { withFileTypes: true });
            const result = {
                files: [],
                folders: []
            };
            
            items.forEach(item => {
                if (item.isFile() && item.name.endsWith('.xlsx') && !this.excludeFiles.includes(item.name)) {
                    result.files.push(item.name);
                } else if (item.isDirectory()) {
                    result.folders.push(item.name);
                }
            });
            
            return result;
        } catch (error) {
            console.error(`读取Excel目录失败: ${error.message}`);
            return { files: [], folders: [] };
        }
    }

    /**
     * 获取文件夹中的多语言Excel文件
     */
    getMultiLangFiles(folderName) {
        try {
            const folderPath = path.join(this.excelDir, folderName);
            const files = fs.readdirSync(folderPath)
                .filter(file => file.endsWith('.xlsx'))
                .map(file => {
                    // 解析文件名，提取语言代码
                    // 例如: enchant_en-US.xlsx -> { baseName: 'enchant', lang: 'en-US' }
                    const match = file.match(/^(.+)_([a-z]{2}-[A-Z]{2})\.xlsx$/);
                    if (match) {
                        return {
                            fileName: file,
                            baseName: match[1],
                            lang: match[2],
                            fullPath: path.join(folderPath, file)
                        };
                    }
                    return null;
                }).filter(item => item !== null);
            
            return files;
        } catch (error) {
            console.error(`读取文件夹 ${folderName} 失败: ${error.message}`);
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
     * 处理多语言文件夹
     */
    processMultiLangFolder(folderName) {
        console.log(`处理多语言文件夹: ${folderName}`);
        const multiLangFiles = this.getMultiLangFiles(folderName);
        
        if (multiLangFiles.length === 0) {
            console.log(`  - 文件夹 ${folderName} 中没有找到多语言Excel文件`);
            return { success: 0, total: 0 };
        }

        console.log(`  - 找到 ${multiLangFiles.length} 个多语言文件:`);
        multiLangFiles.forEach(file => console.log(`    * ${file.fileName} (${file.lang})`));

        let successCount = 0;
        const totalCount = multiLangFiles.length;

        // 创建对应的输出目录
        const folderOutputDir = path.join(this.outputDir, folderName);
        if (!fs.existsSync(folderOutputDir)) {
            fs.mkdirSync(folderOutputDir, { recursive: true });
            console.log(`  - 创建输出目录: ${folderOutputDir}`);
        }

        // 处理每个多语言文件
        for (const fileInfo of multiLangFiles) {
            console.log(`  处理文件: ${fileInfo.fileName}`);
            
            // 读取Excel数据
            const data = this.readExcelFile(fileInfo.fullPath);
            if (data === null) {
                console.log(`    - 跳过文件: ${fileInfo.fileName}`);
                continue;
            }

            // 生成输出文件路径: src/data/enchant/en-US.json
            const jsonPath = path.join(folderOutputDir, `${fileInfo.lang}.json`);
            
            // 写入JSON文件
            const success = this.writeJsonFile(data, jsonPath);
            if (success) {
                successCount++;
            }
        }

        console.log(`  - 文件夹 ${folderName} 处理完成: ${successCount}/${totalCount}`);
        return { success: successCount, total: totalCount };
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

        // 获取所有Excel文件和文件夹
        const { files: excelFiles, folders } = this.getExcelFilesAndFolders();
        
        if (excelFiles.length === 0 && folders.length === 0) {
            console.log('没有找到需要处理的Excel文件或文件夹');
            return false;
        }

        let totalSuccessCount = 0;
        let totalFileCount = 0;

        // 处理单个Excel文件
        if (excelFiles.length > 0) {
            console.log(`找到 ${excelFiles.length} 个Excel文件需要处理:`);
            excelFiles.forEach(file => console.log(`  - ${file}`));
            console.log('---');

            for (const excelFile of excelFiles) {
                const excelPath = path.join(this.excelDir, excelFile);
                const baseName = path.basename(excelFile, '.xlsx');
                const jsonPath = path.join(this.outputDir, `${baseName}.json`);

                console.log(`处理文件: ${excelFile}`);
                
                // 读取Excel数据
                const data = this.readExcelFile(excelPath);
                if (data === null) {
                    console.log(`  - 跳过文件: ${excelFile}`);
                    totalFileCount++;
                    continue;
                }

                // 写入JSON文件
                const success = this.writeJsonFile(data, jsonPath);
                if (success) {
                    totalSuccessCount++;
                }
                totalFileCount++;
                console.log('');
            }
        }

        // 处理多语言文件夹
        if (folders.length > 0) {
            console.log(`找到 ${folders.length} 个文件夹需要处理:`);
            folders.forEach(folder => console.log(`  - ${folder}/`));
            console.log('---');

            for (const folder of folders) {
                const result = this.processMultiLangFolder(folder);
                totalSuccessCount += result.success;
                totalFileCount += result.total;
                console.log('');
            }
        }

        console.log('---');
        console.log(`导出完成! 成功: ${totalSuccessCount}/${totalFileCount}`);
        
        if (totalSuccessCount > 0) {
            console.log('导出的文件:');
            this.listOutputFiles(this.outputDir, '');
        }

        return totalSuccessCount === totalFileCount;
    }

    /**
     * 递归列出输出文件
     */
    listOutputFiles(dir, prefix) {
        try {
            const items = fs.readdirSync(dir, { withFileTypes: true });
            items.forEach(item => {
                const itemPath = path.join(dir, item.name);
                if (item.isDirectory()) {
                    console.log(`${prefix}  - ${item.name}/`);
                    this.listOutputFiles(itemPath, prefix + '  ');
                } else if (item.name.endsWith('.json')) {
                    const stats = fs.statSync(itemPath);
                    console.log(`${prefix}  - ${item.name} (${Math.round(stats.size / 1024)}KB)`);
                }
            });
        } catch (error) {
            console.error(`列出文件失败 ${dir}: ${error.message}`);
        }
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
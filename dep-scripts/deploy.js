const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

// 将同步 exec 转换为 Promise 形式
const execAsync = util.promisify(exec);

// 1. 定义博客项目路径
const BLOG_DIR = '/home/hexo-blog';

// 2. 定义日志目录和文件名
const LOG_DIR = '/home/logs/blog';
const TIMESTAMP = new Date().toISOString().replace(/[^0-9]/g, '');
const LOG_FILE_PATH = path.join(LOG_DIR, `deploy-${TIMESTAMP}.log`);

// 3. 工具函数：清空日志目录
async function clearLogDirectory() {
  try {
    // 检查目录是否存在
    await fs.access(LOG_DIR);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // 目录不存在则创建
      await fs.mkdir(LOG_DIR, { recursive: true });
    } else {
      throw error;
    }
  }

  // 读取目录内容
  const files = await fs.readdir(LOG_DIR);

  // 删除所有文件
  for (const file of files) {
    const filePath = path.join(LOG_DIR, file);
    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.error(`❌ 删除文件失败: ${filePath}`, err.message);
    }
  }
}

// 4. 工具函数：执行命令并记录日志
async function runCommand(command, cwd) {
  const logEntry = `[执行命令] ${command}\n`;
  await fs.appendFile(LOG_FILE_PATH, logEntry);
  console.log(logEntry.trim());

  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd,
      shell: true,
    });

    const logOutput = `[STDOUT] ${stdout}\n[STDERR] ${stderr}\n`;
    await fs.appendFile(LOG_FILE_PATH, logOutput);
    process.stdout.write(stdout);
    if (stderr) {
      process.stderr.write(stderr);
    }
  } catch (error) {
    const logOutput = `[STDOUT] ${error.stdout || ''}\n[STDERR] ${error.stderr || ''}\n`;
    await fs.appendFile(LOG_FILE_PATH, logOutput);
    process.stdout.write(error.stdout || '');
    process.stderr.write(error.stderr || '');

    throw new Error(`命令失败: ${command} - ${error.message}`);
  }
}

// 5. 主流程
(async () => {
  try {
    // 清空日志目录
    await clearLogDirectory();

    console.log('✅ 正在进入目录 ', BLOG_DIR);
    await runCommand('git pull', BLOG_DIR);
    await runCommand('npm run build', BLOG_DIR);
    console.log('🎉 构建流程完成！\n');
  } catch (error) {
    console.error('❌ 部署失败:', error.message);
    process.exit(1);
  }
})();

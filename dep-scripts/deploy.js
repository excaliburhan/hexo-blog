const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

// 异步封装 exec
const execAsync = util.promisify(exec);

// 1. 定义博客项目路径
const BLOG_DIR = '/home/hexo-blog';

// 2. 定义日志路径和文件名
const LOG_DIR = '/home/logs';
const TIMESTAMP = new Date().toISOString().replace(/[^0-9]/g, '');
const LOG_FILE_PATH = path.join(LOG_DIR, `deploy-${TIMESTAMP}.log`);

// 3. 确保日志目录存在
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// 4. 工具函数：执行命令并记录日志
async function runCommand(command, cwd) {
  const logEntry = `[执行命令] ${command}\n`;
  fs.appendFileSync(LOG_FILE_PATH, logEntry);
  console.log(logEntry.trim());

  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd,
      maxBuffer: 1024 * 1024 * 10, // 增加缓冲区，防止超限
    });

    const logOutput = `[STDOUT] ${stdout}\n[STDERR] ${stderr}\n`;
    fs.appendFileSync(LOG_FILE_PATH, logOutput);
    process.stdout.write(stdout);
    if (stderr) {
      process.stderr.write(stderr);
    }
  } catch (error) {
    const logOutput = `[STDOUT] ${error.stdout || ''}\n[STDERR] ${error.stderr || ''}\n`;
    fs.appendFileSync(LOG_FILE_PATH, logOutput);
    process.stdout.write(error.stdout || '');
    process.stderr.write(error.stderr || '');

    throw new Error(`命令失败: ${command} - ${error.message}`);
  }
}

// 5. 主流程
(async () => {
  try {
    console.log('✅ 正在进入目录 ', BLOG_DIR);
    await runCommand('git pull', BLOG_DIR);
    await runCommand('npm run build', BLOG_DIR);
    console.log('🎉 构建流程完成！\n');
  } catch (error) {
    console.error('❌ 部署失败:', error.message);
    process.exit(1);
  }
})();

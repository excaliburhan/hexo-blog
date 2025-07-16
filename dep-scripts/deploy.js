const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. 定义博客项目路径（变量）
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
function runCommand(command, cwd) {
  let stdout, stderr;

  try {
    stdout = execSync(command, {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'], // 忽略 stdin，捕获 stdout 和 stderr
    });
    stderr = Buffer.alloc(0);
  } catch (error) {
    stdout = error.stdout || Buffer.alloc(0);
    stderr = error.stderr || Buffer.alloc(0);
    throw error; // 抛出错误，保持流程中断
  }

  // 5. 构建日志内容
  const logEntry = `[STDOUT] ${stdout.toString()}\n[STDERR] ${stderr.toString()}\n`;

  // 6. 同时写入文件和输出到终端
  fs.appendFileSync(LOG_FILE_PATH, logEntry);
  process.stdout.write(stdout);
  if (stderr.length > 0) {
    process.stderr.write(stderr);
  }
}

// 7. 主流程
try {
  console.log('✅ 正在进入目录 ', BLOG_DIR);
  runCommand('git pull', BLOG_DIR);
  runCommand('npm run build', BLOG_DIR);
  console.log('🎉 构建流程完成！\n');
} catch (error) {
  console.error('❌ 部署失败:', error.message);
  process.exit(1);
}

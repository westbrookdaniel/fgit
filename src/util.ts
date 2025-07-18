import { execSync } from "child_process";

export const S = {
  Reset: "\x1b[0m",
  Bright: "\x1b[1m",
  Dim: "\x1b[2m",
  Underscore: "\x1b[4m",
  Blink: "\x1b[5m",
  Reverse: "\x1b[7m",
  Hidden: "\x1b[8m",

  // Foreground colors
  Black: "\x1b[30m",
  Red: "\x1b[31m",
  Green: "\x1b[32m",
  Yellow: "\x1b[33m",
  Blue: "\x1b[34m",
  Magenta: "\x1b[35m",
  Cyan: "\x1b[36m",
  White: "\x1b[37m",

  // Background colors
  BgBlack: "\x1b[40m",
  BgRed: "\x1b[41m",
  BgGreen: "\x1b[42m",
  BgYellow: "\x1b[43m",
  BgBlue: "\x1b[44m",
  BgMagenta: "\x1b[45m",
  BgCyan: "\x1b[46m",
  BgWhite: "\x1b[47m",

  // Styles
  Bold: "\x1b[1m",
  Italic: "\x1b[3m",
  Underline: "\x1b[4m",
  Strikethrough: "\x1b[9m",
};

export async function question(prompt: string): Promise<void> {
  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    readline.question(
      `${S.Green}?${S.Reset} ${prompt} ${S.Dim}(y/N)${S.Reset} `,
      (answer: string) => {
        readline.close();
        if (answer.toLowerCase() === "y") {
          resolve();
        } else {
          reject(new Error("User declined"));
        }
      },
    );
  });
}

export function getCurrentBranch(): string {
  return execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
}

export interface CliArgs {
  cliMode: boolean
  input?: string
  to?: string
}

export function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { cliMode: false }

  for (let i = 1; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--cli') args.cliMode = true
    else if (arg === '--input' && argv[i + 1]) args.input = argv[++i]
    else if (arg === '--to' && argv[i + 1]) args.to = argv[++i]
  }

  return args
}

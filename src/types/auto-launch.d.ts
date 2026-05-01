declare module 'auto-launch' {
  interface AutoLaunchOptions {
    name: string
    isHidden?: boolean
    path?: string
  }

  class AutoLaunch {
    constructor(options: AutoLaunchOptions)
    isEnabled(): Promise<boolean>
    enable(): Promise<void>
    disable(): Promise<void>
  }

  export = AutoLaunch
}

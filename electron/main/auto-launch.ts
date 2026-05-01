import AutoLaunch from 'auto-launch'

const autoLauncher = new AutoLaunch({
  name: 'Awesome-Convert',
  isHidden: true,
})

export async function setupAutoLaunch(enable: boolean) {
  try {
    const isEnabled = await autoLauncher.isEnabled()
    if (enable && !isEnabled) {
      await autoLauncher.enable()
    } else if (!enable && isEnabled) {
      await autoLauncher.disable()
    }
  } catch (e) {
    console.error('Auto launch setup error:', e)
  }
}

export async function isAutoLaunchEnabled(): Promise<boolean> {
  try {
    return await autoLauncher.isEnabled()
  } catch {
    return false
  }
}

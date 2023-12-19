import { createNextDescribe } from 'e2e-utils'
import { check } from 'next-test-utils'

createNextDescribe(
  'interception-route-groups',
  {
    files: __dirname,
  },
  ({ next }) => {
    it('should work when navigating to a route group with an interception route', async () => {
      const browser = await next.browser('/')

      await browser.elementByCss('[href="/photos/1"]').click()
      await check(
        () => browser.elementById('slot').text(),
        /Intercepted Photo Page 1/
      )

      await browser.refresh()

      await check(() => browser.elementById('slot').text(), '')
      await check(
        () => browser.elementById('children').text(),
        /Photo Page \(non-intercepted\) 1/
      )

      await browser.elementByCss('[href="/"]').click()

      // perform the same checks as above, but with the other page
      await browser.elementByCss('[href="/photos/2"]').click()
      await check(
        () => browser.elementById('slot').text(),
        /Intercepted Photo Page 2/
      )
      await browser.refresh()

      await check(() => browser.elementById('slot').text(), '')
      await check(
        () => browser.elementById('children').text(),
        /Photo Page \(non-intercepted\) 2/
      )
    })

    describe('without a default route', () => {
      beforeAll(async () => {
        await next.stop()
        await next.renameFile('app/default.tsx', 'app/temp.tsx')
        await next.start()
      })

      afterAll(async () => {
        await next.stop()
        await next.renameFile('app/temp.tsx', 'app/default.tsx')
        await next.start()
      })

      it('should fallback to a 404 if there is no default', async () => {
        await next.stop()
        await next.deleteFile('app/default.tsx')
        await next.start()

        const browser = await next.browser('/')

        await browser.elementByCss('[href="/photos/1"]').click()
        await check(() => browser.elementByCss('body').text(), /404/)
      })
    })
  }
)

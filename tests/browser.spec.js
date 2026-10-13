import {test,expect} from '@playwright/test';
test('onboarding, full table, swaps, undo, banking, replay and persistence',async({page},info)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/?deal=browser-test');await expect(page.locator('#rules')).toBeVisible();await page.locator('#letsPlay').click();
 await page.locator('[data-pick="1"]').click();await page.locator('[data-cell="0"]').click();await page.locator('[data-cell="1"]').click();const first=await page.locator('[data-cell="0"]').getAttribute('aria-label');
 await page.locator('#swap').click();await page.locator('[data-cell="0"]').click();await page.locator('[data-cell="1"]').click();await page.locator('#undo').click();expect(await page.locator('[data-cell="0"]').getAttribute('aria-label')).toBe(first);
 await page.locator('#reroll').click();await expect(page.locator('#reroll')).toContainText('2 left');await page.reload();await expect(page.locator('#rules')).not.toBeVisible();await expect(page.locator('#turnLabel')).toContainText('2 / 25');
 for(let i=2;i<25;i++){await page.locator(`[data-pick="${i%3}"]`).click();await page.locator(`[data-cell="${i}"]`).click();}
 await expect(page.locator('#bank')).toBeVisible();await expect(page.locator('#reroll')).toBeDisabled();await page.locator('#swap').click();await page.locator('[data-cell="0"]').click();await page.locator('[data-cell="24"]').click();await page.locator('#bank').click();await expect(page.locator('#result')).toBeVisible();await expect(page.locator('#resultScore')).toHaveText(await page.locator('#total').textContent());
 await page.screenshot({path:`test-results/${info.project.name}-result.png`,fullPage:true});await page.locator('#replay').click();await expect(page.locator('#turnLabel')).toContainText('0 / 25');
 // Second complete flow, banking without swaps.
 for(let i=0;i<25;i++)await page.locator(`[data-cell="${i}"]`).click();await page.locator('#bank').click();await page.locator('#resultNew').click();await expect(page.locator('#total')).toHaveText('0');expect(errors).toEqual([]);
});
test('keyboard, confirmation, responsive layout and blocked storage',async({page},info)=>{
 await page.addInitScript(()=>{Storage.prototype.setItem=()=>{throw new Error('blocked');};});await page.goto('/?deal=keyboard');await page.locator('#letsPlay').click();await page.keyboard.press('2');await page.keyboard.press('Enter');await page.keyboard.press('ArrowRight');await page.keyboard.press('3');await page.keyboard.press('Enter');await expect(page.locator('#turnLabel')).toContainText('2 / 25');await page.locator('#new').click();await expect(page.locator('#confirm')).toBeVisible();await page.locator('#cancelNew').click();await expect(page.locator('#turnLabel')).toContainText('2 / 25');
 await page.screenshot({path:`test-results/${info.project.name}-table.png`,fullPage:true});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);await page.locator('#new').click();await page.locator('#confirmNew').click();await expect(page.locator('#turnLabel')).toContainText('0 / 25');
});

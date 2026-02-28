import { WaitForElementResult } from './types';

export async function waitForElement(
  selector: string,
  timeout: number = 7000,
  context: Document | Element = document
): Promise<WaitForElementResult> {
  console.log(`waitForElement: Searching for "${selector}" in context:`, context ? context.nodeName : 'document');
  const startTime: number = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const element: Element | null = context.querySelector(selector);
    if (element) {
      console.log(`waitForElement: Found "${selector}"`, element);
      return element as WaitForElementResult;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.error(`waitForElement: Element "${selector}" not found in context after ${timeout}ms.`);
  throw new Error(`Element "${selector}" not found in context after ${timeout}ms`);
}
